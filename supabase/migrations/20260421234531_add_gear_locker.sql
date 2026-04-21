create table if not exists public.gear_locker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  brand text,
  note text,
  status text not null default 'owned' check (status in ('owned', 'wishlist')),
  times_used int not null default 0,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists gear_locker_user_idx on public.gear_locker(user_id);
create index if not exists gear_locker_user_status_idx on public.gear_locker(user_id, status);
create index if not exists gear_locker_user_name_idx on public.gear_locker(user_id, lower(name));

alter table public.gear_locker enable row level security;

drop policy if exists "gear_locker_owner_all" on public.gear_locker;
create policy "gear_locker_owner_all" on public.gear_locker
for all using (user_id = auth.uid()) with check (user_id = auth.uid());
