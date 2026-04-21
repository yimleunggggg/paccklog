create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  locale text default 'zh-CN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date,
  end_date date,
  cover_image_url text,
  tags text[] default '{}',
  status text not null default 'planning' check (status in ('planning', 'packing', 'traveling', 'completed')),
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.scene_templates (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null,
  name_en text not null,
  icon text,
  description_zh text,
  description_en text,
  category text not null check (category in ('base', 'activity', 'custom')),
  is_system boolean default true,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table if not exists public.template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.scene_templates(id) on delete cascade,
  name_zh text not null,
  name_en text not null,
  category text not null check (category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'camping', 'first_aid', 'other')),
  priority text not null default 'should' check (priority in ('must', 'should', 'nice_to_have', 'optional')),
  default_quantity int not null default 1,
  note_zh text,
  note_en text,
  sort_order int not null default 0
);

create unique index if not exists scene_templates_name_zh_unique on public.scene_templates(name_zh);
create unique index if not exists template_items_template_name_unique on public.template_items(template_id, name_zh);

create table if not exists public.trip_scenes (
  trip_id uuid not null references public.trips(id) on delete cascade,
  template_id uuid not null references public.scene_templates(id) on delete cascade,
  primary key (trip_id, template_id)
);

create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  category text not null check (category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'camping', 'first_aid', 'other')),
  status text not null default 'to_pack' check (status in ('to_pack', 'packed', 'to_buy', 'optional')),
  container text not null default 'undecided' check (container in ('suitcase', 'backpack', 'carry_on', 'wear', 'undecided')),
  quantity int not null default 1,
  brand text,
  brand_alternatives text[] default '{}',
  note text,
  is_checked boolean not null default false,
  source_template_id uuid references public.scene_templates(id),
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trip_references (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('link', 'image', 'note')),
  url text,
  image_url text,
  title text,
  note text,
  related_item_id uuid references public.trip_items(id),
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.scene_templates enable row level security;
alter table public.template_items enable row level security;
alter table public.trip_scenes enable row level security;
alter table public.trip_items enable row level security;
alter table public.trip_references enable row level security;

create policy "users_select_own" on public.users for select using (id = auth.uid());
create policy "users_update_own" on public.users for update using (id = auth.uid());
create policy "users_insert_own" on public.users for insert with check (id = auth.uid());

create policy "trips_owner_all" on public.trips for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "scene_templates_read_system_or_own" on public.scene_templates
for select using (is_system = true or created_by = auth.uid());
create policy "scene_templates_manage_own_custom" on public.scene_templates
for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "template_items_read" on public.template_items
for select using (
  exists (
    select 1 from public.scene_templates st
    where st.id = template_id and (st.is_system = true or st.created_by = auth.uid())
  )
);
create policy "template_items_manage_custom" on public.template_items
for all using (
  exists (
    select 1 from public.scene_templates st
    where st.id = template_id and st.created_by = auth.uid()
  )
) with check (
  exists (
    select 1 from public.scene_templates st
    where st.id = template_id and st.created_by = auth.uid()
  )
);

create policy "trip_scenes_owner_all" on public.trip_scenes
for all using (
  exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
) with check (
  exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
);

create policy "trip_items_owner_all" on public.trip_items
for all using (
  exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
) with check (
  exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
);

create policy "trip_references_owner_all" on public.trip_references
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.scene_templates (name_zh, name_en, icon, description_zh, description_en, category, is_system)
values
  ('出国基础', 'International Basics', '🌍', '护照与跨境必需品', 'Cross-border essentials', 'base', true),
  ('露营', 'Camping', '⛺', '露营常用装备模板', 'Camping essentials', 'activity', true),
  ('徒步', 'Hiking', '🥾', '徒步与山野活动模板', 'Hiking essentials', 'activity', true)
on conflict (name_zh) do nothing;

insert into public.template_items (template_id, name_zh, name_en, category, priority, default_quantity, note_zh, note_en, sort_order)
select st.id, i.name_zh, i.name_en, i.category, i.priority, i.default_quantity, i.note_zh, i.note_en, i.sort_order
from (
  values
    ('出国基础', '护照', 'Passport', 'documents', 'must', 1, '检查有效期', 'Check expiration', 1),
    ('出国基础', '转换插头', 'Travel Adapter', 'electronics', 'must', 1, '确认插头制式', 'Check plug type', 2),
    ('露营', '帐篷', 'Tent', 'camping', 'must', 1, '按人数选规格', 'Pick by group size', 1),
    ('露营', '头灯', 'Headlamp', 'electronics', 'should', 1, null, null, 2),
    ('徒步', '徒步鞋', 'Hiking Shoes', 'footwear', 'must', 1, '建议防水', 'Waterproof preferred', 1),
    ('徒步', '速干衣', 'Quick Dry Shirt', 'clothing', 'should', 2, null, null, 2)
) as i(template_name, name_zh, name_en, category, priority, default_quantity, note_zh, note_en, sort_order)
join public.scene_templates st on st.name_zh = i.template_name;
on conflict (template_id, name_zh) do nothing;
