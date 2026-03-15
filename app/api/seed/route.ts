import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .single();

  if (existingProfile) {
    return NextResponse.json({ message: "Admin account already exists" });
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
    message: "Test admin created",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
}
