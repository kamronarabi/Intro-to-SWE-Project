-- Tasks system, XP function, and updated RLS


-- Tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  xp_value integer not null default 10,
  is_repeatable boolean not null default false,
  max_completions integer not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;

create policy "Anyone can read tasks"
  on public.tasks for select
  using (auth.uid() is not null);

create policy "Admins can insert tasks"
  on public.tasks for insert
  with check (public.is_admin());

create policy "Admins can update tasks"
  on public.tasks for update
  using (public.is_admin());

create policy "Admins can delete tasks"
  on public.tasks for delete
  using (public.is_admin());


-- Student tasks table (tracks assignments & completions)

create table if not exists public.student_tasks (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'discarded')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index idx_student_tasks_student_id on public.student_tasks(student_id);
create index idx_student_tasks_task_id on public.student_tasks(task_id);

alter table public.student_tasks enable row level security;

create policy "Students can read own tasks"
  on public.student_tasks for select
  using (auth.uid() = student_id);

create policy "Students can insert own tasks"
  on public.student_tasks for insert
  with check (auth.uid() = student_id);

create policy "Students can update own tasks"
  on public.student_tasks for update
  using (auth.uid() = student_id);

create policy "Admins can read all student_tasks"
  on public.student_tasks for select
  using (public.is_admin());


-- Additional RLS policies on profiles (leaderboard + admin)
create policy "Authenticated users can read all profiles"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can delete all profiles"
  on public.profiles for delete
  using (public.is_admin());


-- Atomic XP increment function (prevents race conditions)
create or replace function public.increment_xp(amount integer)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set xp = xp + amount where id = auth.uid();
$$;


-- Enable Realtime on profiles for live leaderboard
alter publication supabase_realtime add table public.profiles;


-- Seed tasks
insert into public.tasks (title, description, xp_value, is_repeatable, max_completions) values
  ('Complete a LeetCode problem', 'Solve any LeetCode problem and log your solution.', 25, true, 50),
  ('Apply to an internship', 'Submit an application to an internship position.', 10, true, 30),
  ('Attend a mock interview', 'Participate in a mock interview session with a peer or mentor.', 50, true, 10),
  ('Review a peer''s resume', 'Provide constructive feedback on a fellow student''s resume.', 15, true, 20),
  ('Network with a professional', 'Have a meaningful conversation with an industry professional.', 50, true, 20),
  ('Receive an internship offer', 'Get a formal internship offer — huge milestone!', 500, false, 1),
  ('Complete a personal project', 'Finish and present a personal or side project.', 200, false, 1),
  ('Get a referral', 'Receive a referral from a professional contact.', 150, false, 1),
  ('Attend a career fair', 'Attend a career fair or recruiting event.', 100, false, 1);
