-- PACKLOG scene templates v2
-- Overwrite/seed system templates from curated scenario data.

with scene_rows(name_zh, name_en, icon, description_zh, description_en, category) as (
  values
    ('徒步', 'Hiking', '🥾', '徒步（日间/多日）', 'Hiking day/multi-day', 'activity'),
    ('露营', 'Camping', '⛺', '露营（车营/徒步营）', 'Camping essentials', 'activity'),
    ('越野跑', 'Trail Running & Race', '🏃', '越野跑与赛事', 'Trail run and race', 'activity'),
    ('潜水', 'Diving / Snorkeling', '🤿', '潜水与浮潜', 'Diving and snorkeling', 'activity'),
    ('音乐节', 'Music Festival', '🎵', '音乐节与露营音乐节', 'Festival packing', 'activity'),
    ('城市漫游', 'City Trip', '🏙️', '城市漫游', 'City trip', 'activity'),
    ('跨国旅行', 'Overseas', '🌍', '跨国旅行基础包', 'Overseas essentials', 'base')
),
upsert_scene as (
  insert into public.scene_templates (name_zh, name_en, icon, description_zh, description_en, category, is_system)
  select name_zh, name_en, icon, description_zh, description_en, category, true
  from scene_rows
  on conflict (name_zh) do update
  set name_en = excluded.name_en,
      icon = excluded.icon,
      description_zh = excluded.description_zh,
      description_en = excluded.description_en,
      category = excluded.category,
      is_system = true
  returning id, name_zh
),
item_rows(template_name, name_zh, name_en, category, priority, qty, note_zh, note_en, sort_order) as (
  values
    -- 徒步 Hiking
    ('徒步','护照','Passport','documents','must',1,'出国必备，有效期6个月以上','Required for overseas',10),
    ('徒步','行程保险凭证','Insurance proof','documents','must',1,'含山地搜救','Include mountain rescue',20),
    ('徒步','防水徒步中帮鞋','Waterproof hiking boots','footwear','must',1,'Salomon X Ultra / Merrell Moab / HOKA Anacapa','GTX recommended',30),
    ('徒步','徒步袜','Hiking socks','footwear','must',3,'Darn Tough / Smartwool','Wool anti-blister',40),
    ('徒步','防风硬壳冲锋衣','Windproof shell','clothing','must',1,'Arc''teryx Beta / Patagonia Torrentshell','Rain/wind protection',50),
    ('徒步','保暖中间层','Insulation mid-layer','clothing','must',1,'Patagonia Nano Puff / Arc''teryx Atom','For altitude gap',60),
    ('徒步','徒步背包 25-40L','Hiking backpack 25-40L','camping','must',1,'Osprey / Gregory / Deuter','With rain cover',70),
    ('徒步','头灯+备用电池','Headlamp + spare battery','electronics','must',1,'Petzl / Black Diamond','Essential at dawn/night',80),
    ('徒步','水袋或水瓶 1.5-2L','Hydration setup','nutrition','must',1,'Platypus / Nalgene','Hydration first',90),
    ('徒步','折叠登山杖','Trekking poles','camping','optional',1,'Black Diamond / Leki','Recommended for descent',100),

    -- 露营 Camping
    ('露营','帐篷','Tent','camping','must',1,'MSR / Big Agnes / Naturehike','Pick by season',10),
    ('露营','睡袋','Sleeping bag','camping','must',1,'按舒适温标选','Comfort temp >= local min',20),
    ('露营','睡垫','Sleeping pad','camping','must',1,'Therm-a-Rest / Klymit','Insulation & comfort',30),
    ('露营','头灯','Headlamp','electronics','must',1,'Petzl','Night navigation',40),
    ('露营','营地灯','Camp lantern','electronics','optional',1,'Black Diamond Moji','Optional light',50),
    ('露营','气罐','Fuel canister','camping','should',1,'飞机禁带，当地购买','Buy locally',60),
    ('露营','餐具套装','Cookware set','camping','must',1,'轻量折叠','Lightweight',70),
    ('露营','垃圾袋','Trash bags','toiletries','must',2,'无痕山林原则','Leave no trace',80),

    -- 越野跑 Trail Running
    ('越野跑','越野跑鞋','Trail running shoes','footwear','must',1,'Salomon/HOKA/Altra','Choose by terrain',10),
    ('越野跑','越野跑背包 8-15L','Running vest 8-15L','camping','must',1,'Salomon / UD / Osprey','Hydration compatible',20),
    ('越野跑','水袋 1.5L','Hydration bladder','nutrition','must',1,null,'Race hydration',30),
    ('越野跑','冲锋衣','Shell jacket','clothing','must',1,'赛事强制装备','Mandatory in many races',40),
    ('越野跑','保暖层','Warm layer','clothing','must',1,'赛事强制装备','Mandatory gear',50),
    ('越野跑','急救毯','Emergency blanket','first_aid','must',1,'赛事强制装备','Mandatory safety gear',60),
    ('越野跑','能量胶','Energy gels','nutrition','must',6,'每45分钟一支','One every 45 minutes',70),
    ('越野跑','电解质盐丸','Electrolyte tabs','nutrition','must',1,'Precision Hydration / Hammer','Avoid cramp',80),

    -- 潜水 Diving
    ('潜水','潜水执照C卡','Dive certification','documents','must',1,'PADI / SSI 电子版可','Bring digital backup',10),
    ('潜水','医疗免责声明','Medical disclaimer','documents','must',1,'部分地点要求','Required by some operators',20),
    ('潜水','防晒水母衣','Rash guard','clothing','must',1,'礁石区防划伤+防晒','Reef-safe sun protection',30),
    ('潜水','速干泳衣','Quick-dry swimwear','clothing','must',2,null,'Bring backup set',40),
    ('潜水','防水袋','Dry bag','camping','must',1,'证件与手机保护','Protect phone/docs',50),
    ('潜水','潜水电脑表','Dive computer','electronics','optional',1,'Garmin / Suunto','Frequent diver recommended',60),
    ('潜水','潜水面镜','Dive mask','other','optional',1,'个人更卫生','Personal hygiene choice',70),

    -- 音乐节 Festival
    ('音乐节','耳塞','Earplugs','other','must',3,'Loop / Flare','Protect hearing and sleep',10),
    ('音乐节','充电宝','Power bank','electronics','must',1,'容量越大越好','High capacity preferred',20),
    ('音乐节','雨衣或雨披','Rain poncho','clothing','must',1,'热带地区午后暴雨','Rain-ready',30),
    ('音乐节','腰包','Waist bag','other','must',1,'贴身携带手机钱包','Anti-theft carry',40),
    ('音乐节','防蚊液','Mosquito repellent','toiletries','must',1,'户外夜间必备','Night outdoor essential',50),
    ('音乐节','帐篷','Tent','camping','must',1,'露营音乐节使用','Festival camping',60),
    ('音乐节','现金','Cash','documents','must',1,'部分摊位只收现金','Some stalls are cash only',70),

    -- 跨国旅行 Overseas
    ('跨国旅行','护照','Passport','documents','must',1,'有效期6个月以上','6+ months validity',10),
    ('跨国旅行','签证/入境材料','Visa & entry docs','documents','must',1,'纸质+电子备份','Paper + digital backup',20),
    ('跨国旅行','海外信用卡','Overseas credit card','documents','must',1,'支持 Visa/MC','Visa/MC recommended',30),
    ('跨国旅行','外币现金','Local cash','documents','must',1,'适量携带','Carry moderate amount',40),
    ('跨国旅行','转换插头','Travel adapter','electronics','must',1,'按目的地国家','Country specific',50),
    ('跨国旅行','eSIM/SIM','eSIM/SIM','electronics','must',1,'提前购买','Buy before departure',60),
    ('跨国旅行','旅行保险','Travel insurance','documents','must',1,'含医疗和行李损失','Medical + luggage cover',70),

    -- 城市漫游 City Trip
    ('城市漫游','舒适步行鞋','Comfort walking shoes','footwear','must',1,'每天1万步以上','10k+ steps/day',10),
    ('城市漫游','便携雨伞','Foldable umbrella','other','must',1,'折叠便携','Compact carry',20),
    ('城市漫游','腰包/斜挎包','Crossbody bag','other','must',1,'防扒手','Anti-theft',30),
    ('城市漫游','交通App离线包','Offline transport app','electronics','must',1,'提前下载','Download before departure',40),
    ('城市漫游','正式场合备用衣物','Smart outfit backup','clothing','optional',1,'剧院/高级餐厅','Optional occasion wear',50)
),
resolved_items as (
  select s.id as template_id, i.*
  from item_rows i
  join public.scene_templates s on s.name_zh = i.template_name
)
insert into public.template_items(template_id, name_zh, name_en, category, priority, default_quantity, note_zh, note_en, sort_order)
select template_id, name_zh, name_en, category, priority, qty, note_zh, note_en, sort_order
from resolved_items
on conflict (template_id, name_zh) do update
set name_en = excluded.name_en,
    category = excluded.category,
    priority = excluded.priority,
    default_quantity = excluded.default_quantity,
    note_zh = excluded.note_zh,
    note_en = excluded.note_en,
    sort_order = excluded.sort_order;
