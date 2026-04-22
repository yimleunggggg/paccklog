create table if not exists public.community_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_en text,
  author_name text not null default 'PACKLOG 精选',
  region text,
  country text,
  scenes text[] not null default '{}',
  days_min int,
  days_max int,
  season text,
  difficulty text,
  description text,
  note text,
  is_featured boolean default false,
  likes int default 0,
  is_system boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.community_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.community_templates(id) on delete cascade,
  section text,
  name text not null,
  name_en text,
  category text,
  status text not null default 'must' check (status in ('must', 'opt', 'buy')),
  container text,
  brand text,
  note text,
  sort_order int not null default 0
);

create unique index if not exists community_template_items_template_name_idx
  on public.community_template_items(template_id, name);

alter table public.community_templates enable row level security;
alter table public.community_template_items enable row level security;

drop policy if exists "community_templates_read_authenticated" on public.community_templates;
create policy "community_templates_read_authenticated"
on public.community_templates
for select
using (auth.uid() is not null);

drop policy if exists "community_template_items_read_authenticated" on public.community_template_items;
create policy "community_template_items_read_authenticated"
on public.community_template_items
for select
using (auth.uid() is not null);

insert into public.community_templates (
  slug, title, title_en, author_name, region, country, scenes, days_min, days_max, season, difficulty, description, note, is_featured, likes, is_system
)
values
  ('yakushima-jomon-sugi', '屋久岛 · 縄文杉', 'Yakushima · Jomon Sugi Trek', 'PACKLOG 精选', 'JAPAN', '日本', array['hiking','camping'], 1, 1, 'spring/autumn', 'hard', '全程22km往返，凌晨出发，全日本降雨量最高地区，硬壳防水是底线', '这条路线让不少人改变了对装备重要性的认知。', true, 342, true),
  ('nepal-abc-trek', '尼泊尔 · ABC大本营', 'Nepal · Annapurna Base Camp Trek', 'PACKLOG 精选', 'NEPAL', '尼泊尔', array['hiking','backpacking'], 10, 14, 'spring/autumn', 'moderate', '海拔4130m，高反预案不能少。背包要轻，但关键装备不能省。', 'ABC最常见的后悔是没带够保暖层，以及没准备高反药。', true, 891, true),
  ('wonderfruit-festival', 'Wonderfruit · 泰国', 'Wonderfruit · Thailand', 'PACKLOG 精选', 'THAILAND', '泰国', array['camp_festival','music_festival'], 4, 5, 'winter', 'easy', '泰国冬季，白天30°C热，夜间18°C凉。无塑料政策，自带杯子是必须。', 'Wonderfruit是无现金、无塑料的节庆。', true, 456, true),
  ('trail-race-mandatory-utmb', '越野赛 · 强制装备', 'Trail Race · Mandatory Gear (UTMB Standard)', 'PACKLOG 精选', 'GLOBAL', '全球', array['trail_race'], 1, 2, 'all', 'expert', '基于UTMB系列强制装备清单整理，每场赛事略有差异。', '强制装备缺少任何一件 = 取消资格。', true, 214, true),
  ('okinawa-diving', '冲绳 · 潜水', 'Okinawa · Scuba Diving', 'PACKLOG 精选', 'JAPAN', '日本', array['diving'], 4, 7, 'spring/summer/autumn', 'easy', '冲绳能见度极佳，珊瑚礁生态丰富。', '防晒霜必须选择珊瑚礁安全款。', true, 289, true),
  ('xinjiang-tianshan-hike', '新疆 · 天山徒步', 'Xinjiang · Tianshan Trekking', 'PACKLOG 精选', 'CHINA', '中国', array['hiking','backpacking'], 7, 14, 'summer/autumn', 'moderate', '高海拔紫外线极强，昼夜温差20°C+。', '独库公路沿线补给稀少，建议提前备好干粮。', false, 163, true),
  ('chengdu-weekend-camping', '成都周边 · 周末露营', 'Chengdu · Weekend Camping', 'PACKLOG 精选', 'CHINA', '中国', array['camping'], 1, 2, 'spring/autumn', 'easy', '四川盆地气候多变，阴天多。', '轻装出发，营地配置齐全可精简装备。', false, 128, true),
  ('iceland-winter-aurora', '冰岛 · 极光自驾', 'Iceland · Winter Aurora Road Trip', 'PACKLOG 精选', 'EUROPE', '冰岛', array['city_explore'], 7, 10, 'winter', 'moderate', '冰岛冬季气温-10°C到5°C，风大，防寒是第一要务。', '越往东部人越少，极光越好。', true, 276, true),
  ('sabah-kinabalu', '沙巴 · 神山 Mt.Kinabalu', 'Sabah · Mt.Kinabalu Summit', 'PACKLOG 精选', 'MALAYSIA', '马来西亚', array['hiking'], 2, 2, 'all', 'hard', '东南亚最高峰，2天1夜，第二天凌晨2点出发攻顶。', '必须提前预约Laban Rata山屋。', false, 197, true),
  ('dali-solo-domestic', '大理 · 国内独旅', 'Dali · Domestic Solo Trip', 'PACKLOG 精选', 'CHINA', '中国', array['city_explore','hiking'], 5, 10, 'spring/autumn', 'easy', '苍山+洱海，高原紫外线强，防晒不能偷懒。', '轻装才能享受大理。', false, 332, true)
on conflict (slug) do update
set
  title = excluded.title,
  title_en = excluded.title_en,
  region = excluded.region,
  country = excluded.country,
  scenes = excluded.scenes,
  days_min = excluded.days_min,
  days_max = excluded.days_max,
  season = excluded.season,
  difficulty = excluded.difficulty,
  description = excluded.description,
  note = excluded.note,
  is_featured = excluded.is_featured,
  likes = excluded.likes;

with seed(section_slug, section, name, category, status, container, brand, note, sort_order) as (
  values
    ('yakushima-jomon-sugi','证件 & 出行','护照','documents','must','body','','出国必备，有效期6个月以上',1),
    ('yakushima-jomon-sugi','证件 & 出行','签证 / 入境材料','documents','must','body','','纸质+电子截图',2),
    ('yakushima-jomon-sugi','鞋履','防水徒步中帮鞋','footwear','must','suitcase','Salomon X Ultra 4 Mid GTX / Merrell Moab','GTX防水必要',3),
    ('yakushima-jomon-sugi','衣物','硬壳冲锋衣（防水≥20000mm）','clothing','must','backpack','Arc''teryx Beta LT / Patagonia Torrentshell','必须硬壳',4),
    ('yakushima-jomon-sugi','户外装备','折叠登山杖','gear','must','suitcase','Black Diamond / Leki','22km往返必须',5),
    ('yakushima-jomon-sugi','户外装备','头灯 + 备用电池','electronics','must','backpack','Petzl / Black Diamond','凌晨出发必备',6),
    ('yakushima-jomon-sugi','食物 & 补给','行动粮','nutrition','must','backpack','','备10-11小时份量',7),
    ('yakushima-jomon-sugi','数码','离线地图（手机）','electronics','must','body','Maps.me','山区信号很差',8),

    ('nepal-abc-trek','证件 & 出行','护照','documents','must','body','','申请TIMS和ACAP需要',1),
    ('nepal-abc-trek','证件 & 出行','TIMS卡','documents','must','body','尼泊尔登山协会','在博卡拉或加德满都办理',2),
    ('nepal-abc-trek','证件 & 出行','ACAP入园证','documents','must','body','安纳普尔纳保护区','约30USD',3),
    ('nepal-abc-trek','衣物','羽绒服（-5°C以下保暖）','clothing','must','suitcase','Patagonia / Arc''teryx','ABC夜间接近0°C',4),
    ('nepal-abc-trek','高海拔安全','高反药','health','must','backpack','Diamox','提前咨询医生',5),
    ('nepal-abc-trek','背包','登山包 40-50L','gear','must','','Osprey / Gregory','多日重装',6),
    ('nepal-abc-trek','户外装备','睡袋（-5°C标准）','camping','must','suitcase','Rab','茶馆毯子较薄',7),

    ('wonderfruit-festival','证件 & 票务','护照','documents','must','body','','',1),
    ('wonderfruit-festival','证件 & 票务','入场腕带确认码','documents','must','body','','提前注册',2),
    ('wonderfruit-festival','帐篷营地','帐篷（2-3人）','camping','must','','MSR / Big Agnes','早到选好位置',3),
    ('wonderfruit-festival','必带（规定）','可重复使用杯子 ≥473ml','gear','must','body','Wonder Cup','无塑料政策',4),
    ('wonderfruit-festival','必带（规定）','可重复使用水壶','gear','must','body','Hydro Flask / Nalgene','场内有补水站',5),
    ('wonderfruit-festival','夜间装备','耳塞','health','must','backpack','Loop','帐篷紧邻舞台',6),
    ('wonderfruit-festival','卫生 & 健康','防蚊液','toiletries','must','backpack','OFF!','露天夜间必需',7),

    ('trail-race-mandatory-utmb','赛事强制装备','越野跑包/腰包','gear','must','body','Salomon Adv Skin','需装下全部强制装备',1),
    ('trail-race-mandatory-utmb','赛事强制装备','防水冲锋衣','clothing','must','backpack','Arc''teryx Norvan','必须防水硬壳',2),
    ('trail-race-mandatory-utmb','赛事强制装备','紧急保温毯','first_aid','must','backpack','SOL','',3),
    ('trail-race-mandatory-utmb','赛事强制装备','头灯 + 备用电池','electronics','must','backpack','Petzl','必须独立工作',4),
    ('trail-race-mandatory-utmb','赛事强制装备','折叠杯（≥150ml）','nutrition','must','backpack','Salomon','补给站使用',5),
    ('trail-race-mandatory-utmb','补给建议','水 ≥1L','nutrition','must','backpack','','初始携带量',6),

    ('okinawa-diving','证件 & 资质','护照','documents','must','body','','',1),
    ('okinawa-diving','证件 & 资质','潜水执照（C卡）','documents','must','body','PADI / SSI','推荐截图备份',2),
    ('okinawa-diving','鞋履','沙滩凉鞋','footwear','must','suitcase','Teva / Chaco','珊瑚礁岸边必备',3),
    ('okinawa-diving','衣物','防晒水母衣（UV长袖）','clothing','must','suitcase','O''Neill','防晒+防刮伤',4),
    ('okinawa-diving','日用 & 护理','防晒霜（珊瑚礁安全款）','toiletries','must','suitcase','Raw Elements','禁止含oxybenzone',5),
    ('okinawa-diving','数码','防水相机 / GoPro','electronics','opt','backpack','GoPro','',6),

    ('xinjiang-tianshan-hike','证件 & 手续','身份证','documents','must','body','','',1),
    ('xinjiang-tianshan-hike','证件 & 手续','边防证','documents','must','body','','部分区域必须',2),
    ('xinjiang-tianshan-hike','高海拔防晒','防晒霜 SPF50+','toiletries','must','backpack','Anessa','紫外线强',3),
    ('xinjiang-tianshan-hike','衣物','抓绒保暖层','clothing','must','suitcase','Patagonia R1','晚间低温',4),
    ('xinjiang-tianshan-hike','补给','冻干饭（按天数+2天）','nutrition','must','suitcase','','沿途补给稀少',5),
    ('xinjiang-tianshan-hike','补给','净水器/净水片','first_aid','must','backpack','Sawyer','',6),

    ('chengdu-weekend-camping','帐篷 & 睡眠','帐篷（2-3人）','camping','must','','Naturehike / MSR','四川多阴雨',1),
    ('chengdu-weekend-camping','帐篷 & 睡眠','睡袋','camping','must','','','春秋15°C舒适温标',2),
    ('chengdu-weekend-camping','炊具（可选）','炉头','camping','opt','','MSR / Jetboil','',3),
    ('chengdu-weekend-camping','衣物','保暖层（抓绒/薄羽绒）','clothing','must','suitcase','','山区夜间凉',4),
    ('chengdu-weekend-camping','日用','防蚊液','toiletries','must','backpack','OFF!','草地蚊虫多',5),

    ('iceland-winter-aurora','证件 & 驾驶','护照','documents','must','body','','',1),
    ('iceland-winter-aurora','证件 & 驾驶','国际驾照','documents','must','body','','自驾必备',2),
    ('iceland-winter-aurora','防寒衣物','美利奴羊毛内层','clothing','must','suitcase','Icebreaker','贴身关键层',3),
    ('iceland-winter-aurora','防寒衣物','防风防水硬壳','clothing','must','suitcase','Arc''teryx Beta','冰岛风大+降水',4),
    ('iceland-winter-aurora','驾驶 & 安全','雪链','gear','must','','','冬季法规要求',5),
    ('iceland-winter-aurora','极光装备','三脚架','electronics','opt','suitcase','Joby','拍极光必备',6),

    ('sabah-kinabalu','证件','护照','documents','must','body','','',1),
    ('sabah-kinabalu','证件','神山公园预约确认','documents','must','body','Sabah Parks','提前预约',2),
    ('sabah-kinabalu','衣物','防风冲锋衣','clothing','must','backpack','','攻顶段风大',3),
    ('sabah-kinabalu','攻顶必备','头灯 + 备用电池','electronics','must','backpack','Petzl','凌晨2点出发',4),
    ('sabah-kinabalu','攻顶必备','防滑手套','gear','must','backpack','','最后200m拉绳攀爬',5),

    ('dali-solo-domestic','证件','身份证','documents','must','body','','',1),
    ('dali-solo-domestic','证件','高铁/机票记录','documents','must','body','','截图备份',2),
    ('dali-solo-domestic','衣物','速干T ×3','clothing','must','suitcase','','',3),
    ('dali-solo-domestic','防晒','防晒霜 SPF50+','toiletries','must','body','Anessa / LRP','高原日照强',4),
    ('dali-solo-domestic','出行','轻量背包 20-25L','gear','must','','','日用背包即可',5)
)
insert into public.community_template_items (template_id, section, name, category, status, container, brand, note, sort_order)
select ct.id, s.section, s.name, s.category, s.status, nullif(s.container, ''), nullif(s.brand, ''), nullif(s.note, ''), s.sort_order
from seed s
join public.community_templates ct on ct.slug = s.section_slug
on conflict (template_id, name) do update
set
  section = excluded.section,
  category = excluded.category,
  status = excluded.status,
  container = excluded.container,
  brand = excluded.brand,
  note = excluded.note,
  sort_order = excluded.sort_order;
