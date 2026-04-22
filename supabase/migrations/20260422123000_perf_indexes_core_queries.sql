create index if not exists trips_user_created_idx
  on public.trips (user_id, created_at desc);

create index if not exists trip_items_trip_sort_idx
  on public.trip_items (trip_id, sort_order asc);

create index if not exists trip_items_trip_status_idx
  on public.trip_items (trip_id, status);

create index if not exists gear_locker_user_created_idx
  on public.gear_locker (user_id, created_at desc);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'trip_items'
      and column_name = 'source_locker_id'
  ) then
    execute 'create index if not exists trip_items_source_locker_trip_idx on public.trip_items (source_locker_id, trip_id)';
  end if;
end
$$;
