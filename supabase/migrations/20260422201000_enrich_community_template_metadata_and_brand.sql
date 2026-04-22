alter table public.community_templates
  add column if not exists source_url text,
  add column if not exists source_language text,
  add column if not exists source_type text,
  add column if not exists source_published_at date,
  add column if not exists trip_style text;

alter table public.community_template_items
  add column if not exists image_url text;

update public.community_templates
set
  scenes = array['backpacking'],
  trip_style = 'hostel / budget / multi-city',
  source_url = 'https://www.packhacker.com/packing-list/hostel-essentials-packing-list/',
  source_language = 'en',
  source_type = 'article',
  source_published_at = null
where slug = 'packhacker-hostel-essentials';

with target as (
  select id from public.community_templates where slug = 'packhacker-hostel-essentials'
)
update public.community_template_items i
set brand = case
  when i.name ilike 'Saucony %' then 'Saucony'
  when i.name ilike 'New Balance %' then 'New Balance'
  when i.name ilike 'Brooks %' then 'Brooks'
  when i.name ilike 'Columbia %' then '哥伦比亚 / Columbia'
  when i.name ilike 'lululemon %' then '露露乐蒙 / lululemon'
  when i.name ilike 'Smartwool %' then 'Smartwool'
  when i.name ilike 'Merrell %' then 'MERRELL'
  when i.name ilike 'Osprey %' then '小鹰 / Osprey'
  when i.name ilike 'Belkin %' then 'Belkin'
  when i.name ilike 'Anker %' then 'Anker'
  when i.name ilike 'Apple %' then 'Apple'
  when i.name ilike 'Nalgene %' then 'Nalgene'
  when i.name ilike 'Quechua %' then 'Quechua'
  when i.name ilike 'Maybelline %' then '美宝莲 / Maybelline'
  when i.name ilike 'Revlon %' then 'Revlon'
  when i.name ilike 'Gillette %' then 'Gillette'
  when i.name ilike 'Gap %' then 'GAP'
  else i.brand
end
where i.template_id = (select id from target)
  and (i.brand is null or btrim(i.brand) = '');

update public.gear_locker
set brand = case
  when name ilike 'Saucony %' then 'Saucony'
  when name ilike 'New Balance %' then 'New Balance'
  when name ilike 'Brooks %' then 'Brooks'
  when name ilike 'Columbia %' then '哥伦比亚 / Columbia'
  when name ilike 'lululemon %' then '露露乐蒙 / lululemon'
  when name ilike 'Smartwool %' then 'Smartwool'
  when name ilike 'Merrell %' then 'MERRELL'
  when name ilike 'Osprey %' then '小鹰 / Osprey'
  when name ilike 'Belkin %' then 'Belkin'
  when name ilike 'Anker %' then 'Anker'
  when name ilike 'Apple %' then 'Apple'
  when name ilike 'Nalgene %' then 'Nalgene'
  when name ilike 'Quechua %' then 'Quechua'
  when name ilike 'Maybelline %' then '美宝莲 / Maybelline'
  when name ilike 'Revlon %' then 'Revlon'
  when name ilike 'Gillette %' then 'Gillette'
  when name ilike 'Gap %' then 'GAP'
  else brand
end
where brand is null or btrim(brand) = '';
