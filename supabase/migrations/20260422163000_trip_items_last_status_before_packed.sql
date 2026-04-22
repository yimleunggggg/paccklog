alter table public.trip_items
add column if not exists last_status_before_packed text
  check (last_status_before_packed in ('to_pack', 'to_buy', 'optional'));
