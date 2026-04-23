begin;

update public.community_template_items i
set
  note = '来源于 REI 官方清单，建议结合目的地天气和出行时长做二次筛选。',
  note_zh = coalesce(nullif(i.note_zh, ''), '来源于 REI 官方清单，建议结合目的地天气和出行时长做二次筛选。'),
  note_en = coalesce(nullif(i.note_en, ''), 'Sourced from an official REI checklist. Adjust by destination weather and trip duration.')
from public.community_templates t
where i.template_id = t.id
  and coalesce(t.source_name, '') ilike '%rei%'
  and (
    coalesce(i.note, '') ilike '%CDP 提取自 REI 条目清单%'
    or coalesce(i.note_zh, '') ilike '%CDP 提取自 REI 条目清单%'
    or coalesce(i.note_en, '') ilike '%CDP extracted from REI%'
  );

commit;
