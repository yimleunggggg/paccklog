begin;

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: $77.98 | CN reference: ~CNY 560 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$77.98 | 国内参考：约￥560（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%tomtoc wander-t26 daily sling 5.5l%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: $13.49 (6-pack) | CN reference: ~CNY 99 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$13.49（6双装） | 国内参考：约￥99（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%saucony performance comfort fit no-show socks%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: Hydro Flask $24.98~$41.00 | CN reference: ~CNY 189~299 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：Hydro Flask $24.98~$41.00 | 国内参考：约￥189~299（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%hydro flask%')
   or lower(coalesce(name_en, name, '')) like lower('%nalgene%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Big Agnes Battle Mountain 3 official reference: $719.96 | CN reference: ~CNY 5200 (cross-border/agent import baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：Big Agnes Battle Mountain 3 官网约 $719.96 | 国内参考：约￥5200（跨境代购检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%big agnes%')
   or lower(coalesce(name_en, name, '')) like lower('%msr%tent%')
   or lower(coalesce(name_en, name, '')) like lower('%tent%');

commit;
