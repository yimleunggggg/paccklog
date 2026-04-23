begin;

update public.community_templates
set author_name = ''
where
  (
    lower(coalesce(source_name, '')) like '%pack hacker%'
    and lower(coalesce(author_name, '')) like '%rei%'
  )
  or (
    lower(coalesce(source_name, '')) like '%rei%'
    and lower(coalesce(author_name, '')) like '%pack hacker%'
  )
  or (
    lower(coalesce(source_name, '')) = lower(coalesce(author_name, ''))
  )
  or (
    lower(coalesce(source_name, '')) like '%rei%'
    and lower(coalesce(author_name, '')) ~ '(rei|co-op|official)'
  )
  or (
    lower(coalesce(source_name, '')) like '%pack hacker%'
    and lower(coalesce(author_name, '')) like '%pack hacker%'
  );

commit;
