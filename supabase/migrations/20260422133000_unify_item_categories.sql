do $$
begin
  update public.template_items
  set category = case
    when lower(coalesce(category, '')) in ('gear', 'bags', 'bag') then 'bags'
    when lower(coalesce(category, '')) in ('health', 'medicine', 'meds') then 'first_aid'
    when lower(coalesce(category, '')) in ('hygienic', 'hygiene') then 'toiletries'
    when lower(coalesce(category, '')) in ('food', 'snack', 'snacks') then 'nutrition'
    when lower(coalesce(category, '')) in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other') then lower(category)
    else 'other'
  end;

  update public.trip_items
  set category = case
    when lower(coalesce(category, '')) in ('gear', 'bags', 'bag') then 'bags'
    when lower(coalesce(category, '')) in ('health', 'medicine', 'meds') then 'first_aid'
    when lower(coalesce(category, '')) in ('hygienic', 'hygiene') then 'toiletries'
    when lower(coalesce(category, '')) in ('food', 'snack', 'snacks') then 'nutrition'
    when lower(coalesce(category, '')) in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other') then lower(category)
    else 'other'
  end;

  update public.community_template_items
  set category = case
    when lower(coalesce(category, '')) in ('gear', 'bags', 'bag') then 'bags'
    when lower(coalesce(category, '')) in ('health', 'medicine', 'meds') then 'first_aid'
    when lower(coalesce(category, '')) in ('hygienic', 'hygiene') then 'toiletries'
    when lower(coalesce(category, '')) in ('food', 'snack', 'snacks') then 'nutrition'
    when lower(coalesce(category, '')) in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other') then lower(category)
    else 'other'
  end;

  update public.gear_locker
  set category = case
    when lower(coalesce(category, '')) in ('gear', 'bags', 'bag') then 'bags'
    when lower(coalesce(category, '')) in ('health', 'medicine', 'meds') then 'first_aid'
    when lower(coalesce(category, '')) in ('hygienic', 'hygiene') then 'toiletries'
    when lower(coalesce(category, '')) in ('food', 'snack', 'snacks') then 'nutrition'
    when lower(coalesce(category, '')) in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other') then lower(category)
    else 'other'
  end;
end
$$;

alter table public.template_items
drop constraint if exists template_items_category_check;

alter table public.template_items
add constraint template_items_category_check
check (category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other'));

alter table public.trip_items
drop constraint if exists trip_items_category_check;

alter table public.trip_items
add constraint trip_items_category_check
check (category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other'));

alter table public.community_template_items
drop constraint if exists community_template_items_category_check;

alter table public.community_template_items
add constraint community_template_items_category_check
check (category is null or category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other'));

alter table public.gear_locker
drop constraint if exists gear_locker_category_check;

alter table public.gear_locker
add constraint gear_locker_category_check
check (category is null or category in ('clothing', 'footwear', 'electronics', 'toiletries', 'documents', 'nutrition', 'first_aid', 'bags', 'accessories', 'disposable', 'camping', 'other'));
