alter table public.trip_items
add column if not exists source_locker_id uuid references public.gear_locker(id) on delete set null;

create index if not exists trip_items_source_locker_idx on public.trip_items(source_locker_id);
