-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'student')),
  xp integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Helper function to check admin role without triggering RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Policy: users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: admins can read all profiles
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Policy: authenticated students can read all student profiles (for leaderboard)
create policy "Students can read student profiles"
  on public.profiles for select
  using (
    auth.role() = 'authenticated'
    and role = 'student'
  );

-- Policy: users can insert their own profile (on signup via trigger)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy: users can update their own name only (not role, xp, or email)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and email = (select p.email from public.profiles p where p.id = auth.uid())
  );

-- Trigger function: auto-create a profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role, xp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger: fires after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
