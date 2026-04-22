alter table public.community_templates
  add column if not exists copy_count int not null default 0;

comment on column public.community_templates.copy_count is 'Rough count of successful full-template copies to trips (incremented server-side).';

create or replace function public.increment_community_template_copy_count(p_template_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_templates
  set copy_count = copy_count + 1
  where id = p_template_id;
end;
$$;

grant execute on function public.increment_community_template_copy_count(uuid) to authenticated;
