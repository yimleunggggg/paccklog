begin;

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: $259.00 | CN reference: ~CNY 1860 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$259.00 | 国内参考：约￥1860（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%aer travel pack 4%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Official/US reference: $99.00 | CN reference: ~CNY 720 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$99.00（品牌/官方） | 国内参考：约￥720（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%bellroy venture ready sling%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Official/US reference: $15.00 | CN reference: ~CNY 108 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$15.00 | 国内参考：约￥108（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%ghost whale organizer pouch%')
   or lower(coalesce(name_en, name, '')) like lower('%tom bihn ghost whale%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Official/US reference: $99.00 | CN reference: ~CNY 720 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$99.00（品牌官网） | 国内参考：约￥720（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%gravel explorer plus toiletry bag%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: $25.00 | CN reference: ~CNY 180 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$25.00 | 国内参考：约￥180（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%stanley classic trigger-action travel mug%');

update public.community_template_items
set
  note_en = concat_ws(
    E'\n',
    coalesce(nullif(note_en, ''), nullif(note, '')),
    'Price reference: Amazon/US reference: $199.99 | CN reference: ~CNY 1440 (Taobao/Tmall search baseline)'
  ),
  note_zh = concat_ws(
    E'\n',
    coalesce(nullif(note_zh, ''), nullif(note, '')),
    '价格参考：海外参考：$199.99 | 国内参考：约￥1440（淘宝/天猫检索基准）'
  )
where lower(coalesce(name_en, name, '')) like lower('%patagonia nano puff%');

commit;
