alter table public.community_template_items
  add column if not exists name_zh text,
  add column if not exists name_en text,
  add column if not exists note_zh text,
  add column if not exists note_en text,
  add column if not exists tags_zh text[] default '{}',
  add column if not exists tags_en text[] default '{}';

update public.community_template_items
set
  name_en = coalesce(nullif(name_en, ''), name),
  note_en = coalesce(note_en, note),
  tags_zh = coalesce(tags_zh, '{}'),
  tags_en = coalesce(tags_en, '{}')
where name_en is null
   or note_en is null
   or tags_zh is null
   or tags_en is null;
