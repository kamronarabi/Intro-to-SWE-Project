import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/setup-migrations";

// This route seeds a test admin account.
// Requires SUPABASE_SERVICE_ROLE_KEY in your .env file.
// Hit GET /api/seed once to create the admin, then you can remove or protect this route.

const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASSWORD = "1234";
const ADMIN_NAME = "Test Admin";

export async function GET() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not set in environment" },
      { status: 500 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Run migrations first
  const migrationResult = await runMigrations(supabase);
  console.log("Migration result:", migrationResult);

  // If migrations failed, provide helpful error message
  if (!migrationResult.success && migrationResult.migration_sql) {
    return NextResponse.json({
      warning: "Migrations not applied",
      message: migrationResult.message,
      instructions: migrationResult.instructions,
      migration_sql: migrationResult.migration_sql,
      next_steps: [
        "1. Go to https://supabase.com/dashboard",
        "2. Select your project",
        "3. Click SQL Editor",
        "4. Paste the SQL from 'migration_sql' above",
        "5. Click Run",
        "6. Refresh this page",
      ],
    });
  }

  // Create test company if it doesn't exist
  let companyId: string;
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("name", "Acme Corp")
    .single();

  if (existingCompany) {
    companyId = existingCompany.id;
  } else {
    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({ name: "Acme Corp" })
      .select("id")
      .single();
    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }
    companyId = newCompany.id;
  }

  // --- Admin setup ---
  let adminCreated = false;
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("email", ADMIN_EMAIL)
    .single();

  if (existingProfile) {
    if (!existingProfile.company_id) {
      await supabase
        .from("profiles")
        .update({ company_id: companyId })
        .eq("id", existingProfile.id);
    }
  } else {
    const { data: userList } = await supabase.auth.admin.listUsers();
    const existingUser = userList?.users?.find((u) => u.email === ADMIN_EMAIL);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
        });
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
      userId = authData.user.id;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "admin",
      xp: 0,
      company_id: companyId,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    adminCreated = true;
  }

  // --- Mock students ---
  const MOCK_STUDENTS = [
    { name: "David Chen", email: "david.chen@ufl.edu", xp: 340 },
    { name: "Kamron Arabi", email: "kamron.arabi@ufl.edu", xp: 215 },
    { name: "Daniel Hoffman", email: "daniel.hoffman@ufl.edu", xp: 180 },
    { name: "Jake Qiu", email: "jake.qiu@ufl.edu", xp: 95 },
  ];

  const studentsSeeded: string[] = [];
  const { data: userList } = await supabase.auth.admin.listUsers();

  for (const student of MOCK_STUDENTS) {
    const { data: existingStudentProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", student.email)
      .single();

    if (existingStudentProfile) continue;

    const existingAuthUser = userList?.users?.find((u) => u.email === student.email);
    if (existingAuthUser) {
      await supabase
        .from("profiles")
        .update({ name: student.name, xp: student.xp })
        .eq("id", existingAuthUser.id);
      studentsSeeded.push(student.email);
      continue;
    }

    const { data: newUser, error: studentAuthError } =
      await supabase.auth.admin.createUser({
        email: student.email,
        password: "1234",
        email_confirm: true,
        user_metadata: { name: student.name, role: "student" },
      });

    if (studentAuthError || !newUser) continue;

    await supabase
      .from("profiles")
      .update({ xp: student.xp })
      .eq("id", newUser.user.id);

    studentsSeeded.push(student.email);
  }

  return NextResponse.json({
    message: adminCreated ? "Test admin created and migrations applied" : "Admin already existed",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    company: "Acme Corp",
    students_seeded: studentsSeeded,
    migrations: migrationResult,
  });
}
