-- Migration tracking table
create table if not exists public._migrations (
  id serial primary key,
  name text not null unique,
  executed_at timestamp with time zone default now()
);

alter table public._migrations enable row level security;

create policy "No public access to migrations"
  on public._migrations for all
  using (false);
