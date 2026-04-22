create table if not exists public.community_item_price_refs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.community_template_items(id) on delete cascade,
  amount numeric(12,2),
  currency text not null check (currency in ('CNY', 'USD', 'EUR', 'GBP', 'JPY', 'OTHER')),
  amount_text text,
  source_name text,
  source_url text,
  market text,
  is_estimate boolean not null default true,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists community_item_price_refs_item_captured_idx
  on public.community_item_price_refs (item_id, captured_at desc);

create index if not exists community_item_price_refs_currency_idx
  on public.community_item_price_refs (currency);

alter table public.community_item_price_refs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'community_item_price_refs'
      and policyname = 'community_item_price_refs_select_authed'
  ) then
    create policy community_item_price_refs_select_authed
      on public.community_item_price_refs
      for select
      to authenticated
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'community_item_price_refs'
      and policyname = 'community_item_price_refs_write_service_role'
  ) then
    create policy community_item_price_refs_write_service_role
      on public.community_item_price_refs
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;
