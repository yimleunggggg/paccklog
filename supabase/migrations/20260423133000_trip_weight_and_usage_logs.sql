begin;

alter table public.trip_items
  add column if not exists weight_g integer,
  add column if not exists weight_source text,
  add column if not exists review_utility smallint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trip_items_weight_g_nonnegative'
  ) then
    alter table public.trip_items
      add constraint trip_items_weight_g_nonnegative check (weight_g is null or weight_g >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'trip_items_weight_source_check'
  ) then
    alter table public.trip_items
      add constraint trip_items_weight_source_check
      check (
        weight_source is null
        or weight_source in ('user', 'library', 'estimated')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'trip_items_review_utility_range'
  ) then
    alter table public.trip_items
      add constraint trip_items_review_utility_range
      check (review_utility is null or (review_utility >= 1 and review_utility <= 5));
  end if;
end
$$;

create table if not exists public.gear_trip_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  trip_item_id uuid unique references public.trip_items(id) on delete set null,
  gear_id uuid references public.gear_master(id) on delete set null,
  item_name text not null,
  category text,
  container text,
  weight_g integer,
  review_result text,
  review_utility smallint,
  review_note text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gear_trip_usage_logs_user_idx
  on public.gear_trip_usage_logs (user_id, occurred_at desc);

create index if not exists gear_trip_usage_logs_gear_idx
  on public.gear_trip_usage_logs (gear_id, occurred_at desc);

create index if not exists gear_trip_usage_logs_trip_idx
  on public.gear_trip_usage_logs (trip_id);

alter table public.gear_trip_usage_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_trip_usage_logs'
      and policyname = 'gear_trip_usage_logs_select_own'
  ) then
    create policy gear_trip_usage_logs_select_own
      on public.gear_trip_usage_logs
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_trip_usage_logs'
      and policyname = 'gear_trip_usage_logs_insert_own'
  ) then
    create policy gear_trip_usage_logs_insert_own
      on public.gear_trip_usage_logs
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_trip_usage_logs'
      and policyname = 'gear_trip_usage_logs_update_own'
  ) then
    create policy gear_trip_usage_logs_update_own
      on public.gear_trip_usage_logs
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gear_trip_usage_logs'
      and policyname = 'gear_trip_usage_logs_delete_own'
  ) then
    create policy gear_trip_usage_logs_delete_own
      on public.gear_trip_usage_logs
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

commit;
