alter table public.community_templates
  add column if not exists source_logo_url text,
  add column if not exists source_name text,
  add column if not exists item_add_count int not null default 0;

alter table public.community_template_items
  add column if not exists added_to_trip_count int not null default 0,
  add column if not exists added_to_locker_count int not null default 0;

update public.community_templates
set
  source_name = coalesce(source_name, author_name),
  source_logo_url = coalesce(source_logo_url,
    case
      when source_url ilike '%packhacker.com%' then 'https://www.packhacker.com/favicon.ico'
      when source_url ilike '%rei.com%' then 'https://www.rei.com/favicon.ico'
      else source_logo_url
    end)
where source_logo_url is null or source_name is null;
