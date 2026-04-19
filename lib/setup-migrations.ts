import { createClient } from "@supabase/supabase-js";

const MIGRATIONS_SQL = `
-- Applications table for internship/job applications
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  role text not null,
  application_date date not null,
  status text not null check (status in ('applied', 'interview', 'offer', 'rejected', 'accepted')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_applications_student_id on public.applications(student_id);

alter table public.applications enable row level security;

create policy if not exists "Students can read their own applications"
  on public.applications for select
  using (auth.uid() = student_id);

create policy if not exists "Students can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = student_id);

create policy if not exists "Students can update their own applications"
  on public.applications for update
  using (auth.uid() = student_id);

create policy if not exists "Students can delete their own applications"
  on public.applications for delete
  using (auth.uid() = student_id);
`;

export async function runMigrations(supabase: any) {
  try {
    // Try to query the applications table to see if it exists
    const { error: queryError } = await supabase
      .from("applications")
      .select("id", { count: "exact" })
      .limit(1);

    if (!queryError) {
      return {
        success: true,
        message: "Applications table already exists",
      };
    }

    // If we get a "relation does not exist" error, return the migration SQL
    if (
      queryError.message.includes("relation") ||
      queryError.message.includes("does not exist")
    ) {
      return {
        success: false,
        message: "Applications table not found - please run migrations",
        migration_sql: MIGRATIONS_SQL,
        instructions:
          "Copy the SQL below and run it in your Supabase SQL editor: https://supabase.com/dashboard -> SQL Editor",
      };
    }

    // For other errors, also return migration SQL
    return {
      success: false,
      message: `Could not verify migrations: ${queryError.message}`,
      migration_sql: MIGRATIONS_SQL,
      instructions:
        "Please copy the SQL below and run it manually in your Supabase SQL editor at https://supabase.com/dashboard",
    };
  } catch (err) {
    // If we can't check, return the SQL for manual execution
    return {
      success: false,
      message: `Error checking migrations: ${(err as Error).message}`,
      migration_sql: MIGRATIONS_SQL,
      instructions:
        "Please copy the SQL below and run it manually in your Supabase SQL editor at https://supabase.com/dashboard",
    };
  }
}
