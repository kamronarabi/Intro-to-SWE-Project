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

create index idx_applications_student_id on public.applications(student_id);

alter table public.applications enable row level security;

create policy "Students can read their own applications"
  on public.applications for select
  using (auth.uid() = student_id);

create policy "Students can insert their own applications"
  on public.applications for insert
  with check (auth.uid() = student_id);

create policy "Students can update their own applications"
  on public.applications for update
  using (auth.uid() = student_id);

create policy "Students can delete their own applications"
  on public.applications for delete
  using (auth.uid() = student_id);
