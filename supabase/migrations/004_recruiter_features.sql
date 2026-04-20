-- Companies table for multi-company recruiter support
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default now()
);

-- Link admin profiles to a company
alter table public.profiles add column if not exists company_id uuid references public.companies(id);

-- Link tasks to the company that created them
alter table public.tasks add column if not exists company_id uuid references public.companies(id);

-- Recruiter bookmarks (shortlist)
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(recruiter_id, student_id)
);

create index idx_bookmarks_recruiter_id on public.bookmarks(recruiter_id);

alter table public.bookmarks enable row level security;

create policy "Recruiter manages own bookmarks"
  on public.bookmarks for all
  using (recruiter_id = auth.uid())
  with check (recruiter_id = auth.uid());

-- Recruiter interest signals
create table if not exists public.recruiter_interests (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  message text check (char_length(message) <= 160),
  seen boolean default false,
  created_at timestamp with time zone default now()
);

create index idx_recruiter_interests_student_id on public.recruiter_interests(student_id);
create index idx_recruiter_interests_recruiter_id on public.recruiter_interests(recruiter_id);

alter table public.recruiter_interests enable row level security;

create policy "Recruiter manages own interests"
  on public.recruiter_interests for all
  using (recruiter_id = auth.uid())
  with check (recruiter_id = auth.uid());

create policy "Student reads own interests"
  on public.recruiter_interests for select
  using (student_id = auth.uid());

create policy "Student updates own interests"
  on public.recruiter_interests for update
  using (student_id = auth.uid());
