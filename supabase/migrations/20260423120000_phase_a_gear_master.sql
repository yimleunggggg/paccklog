begin;

create table if not exists public.gear_master (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  display_name text not null,
  category text,
  brand text,
  canonical_note text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gear_master_unique_norm_brand_category_idx
  on public.gear_master (
    normalized_name,
    coalesce(brand, ''),
    coalesce(category, '')
  );

create index if not exists gear_master_display_name_idx
  on public.gear_master (display_name);

alter table public.gear_locker
  add column if not exists gear_id uuid references public.gear_master(id) on delete set null;

alter table public.trip_items
  add column if not exists gear_id uuid references public.gear_master(id) on delete set null;

alter table public.community_template_items
  add column if not exists gear_id uuid references public.gear_master(id) on delete set null;

create index if not exists gear_locker_gear_id_idx on public.gear_locker (gear_id);
create index if not exists trip_items_gear_id_idx on public.trip_items (gear_id);
create index if not exists community_template_items_gear_id_idx on public.community_template_items (gear_id);

alter table public.gear_master enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_master'
      and policyname = 'gear_master_select_authed'
  ) then
    create policy gear_master_select_authed
      on public.gear_master
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_master'
      and policyname = 'gear_master_write_authed'
  ) then
    create policy gear_master_write_authed
      on public.gear_master
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;

commit;
