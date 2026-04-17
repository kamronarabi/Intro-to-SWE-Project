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

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .single();

  if (existingProfile) {
    return NextResponse.json({
      message: "Admin account already exists",
      migrations: migrationResult,
    });
  }

  // Check if the auth user already exists (e.g. from a previous failed seed)
  const { data: userList } = await supabase.auth.admin.listUsers();
  const existingUser = userList?.users?.find((u) => u.email === ADMIN_EMAIL);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Create the auth user
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

  // Create the profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: "admin",
    xp: 0,
  });

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Test admin created and migrations applied",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    migrations: migrationResult,
  });
}
