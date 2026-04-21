alter table public.trip_items
  add column if not exists review_result text check (review_result in ('used', 'unused', 'missed', 'skip')),
  add column if not exists review_note text;

create table if not exists public.trip_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_trip_id uuid references public.trips(id) on delete set null,
  name text not null,
  scenes text[] default '{}',
  is_public boolean default false,
  data jsonb not null,
  created_at timestamptz default now()
);

alter table public.trip_templates enable row level security;

drop policy if exists "trip_templates_owner_all" on public.trip_templates;
create policy "trip_templates_owner_all" on public.trip_templates
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "trip_templates_read_public" on public.trip_templates;
create policy "trip_templates_read_public" on public.trip_templates
for select using (is_public = true or user_id = auth.uid());
