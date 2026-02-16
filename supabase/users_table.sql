-- Users table for TaskFlow Pro
create table if not exists public.users (
  id text primary key,
  username text not null,
  role text not null check (role in ('Admin', 'Moderator', 'User')),
  permissions text[] not null default array['View']::text[],
  color text not null,
  avatar_url text null,
  password text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;

-- Development/demo policies (open access with anon key)
-- Replace with stricter auth-based policies for production.
drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users
for select
using (true);

drop policy if exists users_insert_all on public.users;
create policy users_insert_all on public.users
for insert
with check (true);

drop policy if exists users_update_all on public.users;
create policy users_update_all on public.users
for update
using (true)
with check (true);

drop policy if exists users_delete_all on public.users;
create policy users_delete_all on public.users
for delete
using (true);
