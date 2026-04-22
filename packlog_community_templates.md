# PACKLOG 行前志 · 社区广场内置模板数据
# 版本 v1.0 · 交付 Cursor 写入数据库 seed data
# 说明：这些是系统内置的"精选清单"，显示在社区广场，用户可预览、复制、单件加入装备库

---

## 数据库结构补充

```sql
CREATE TABLE community_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE,           -- 用于URL和展示编号
  title         TEXT NOT NULL,
  title_en      TEXT,
  author_name   TEXT,                  -- 内置模板用 "PACKLOG 精选"
  region        TEXT,                  -- 地区标签 如 JAPAN / THAILAND / GLOBAL
  country       TEXT,
  scenes        TEXT[],               -- 场景标签数组
  days_min      INT,
  days_max      INT,
  season        TEXT,                  -- spring/summer/autumn/winter/all
  difficulty    TEXT,                  -- easy/moderate/hard/expert
  description   TEXT,
  note          TEXT,                  -- 编辑推荐语
  is_featured   BOOLEAN DEFAULT false,
  likes         INT DEFAULT 0,
  is_system     BOOLEAN DEFAULT true,  -- 系统内置 vs 用户投稿
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE community_template_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES community_templates(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  name_en       TEXT,
  category      TEXT,
  status        TEXT DEFAULT 'must',   -- must / opt / buy
  container     TEXT,
  brand         TEXT,
  note          TEXT,
  sort_order    INT DEFAULT 0
);
```

---

## 模板 001 · 屋久岛縄文杉 · 日归徒步

```
slug: yakushima-jomon-sugi
title: 屋久岛 · 縄文杉
title_en: Yakushima · Jomon Sugi Trek
author_name: PACKLOG 精选
region: JAPAN
country: 日本
scenes: [hiking, camping]
days_min: 1, days_max: 1
season: spring / autumn
difficulty: hard
description: 全程22km往返，凌晨出发，全日本降雨量最高地区，硬壳防水是底线
note: 这条路线让不少人改变了对"装备重要性"的认知。屋久岛不是普通山，是雨林。
is_featured: true
```

### 物品清单

**证件 & 出行**
- 护照 · must · body · · 出国必备，有效期6个月以上
- 签证 / 入境材料 · must · body · · 纸质+电子截图
- 旅行保险凭证 · must · body · · 含山地搜救
- 登山协力金收据 · must · body · ¥1000 · 荒川登山口购买，部分时期需要

**鞋履**
- 防水徒步中帮鞋 · must · suitcase · Salomon X Ultra 4 Mid GTX / Merrell Moab · GTX防水必要，雨林地面长期湿滑
- 防水鞋套 · opt · backpack · · 极端雨天叠加保险
- 徒步袜 ×2双 · must · suitcase · Darn Tough / Smartwool · 羊毛材质防起泡，备一双换洗

**衣物**
- 硬壳冲锋衣（防水≥20000mm） · must · backpack · Arc'teryx Beta LT / Patagonia Torrentshell · 必须是硬壳，软壳连续雨天会湿透
- 保暖中间层 · must · backpack · Patagonia Nano Puff / Arc'teryx Atom · 山顶气温与山下相差约8°C
- 速干排汗内层 · must · suitcase · Icebreaker 150 Merino · 美利奴湿了也保暖
- 速干登山裤 · must · suitcase · Mammut Runbold / Salomon · 避免棉质
- 压缩打底裤 · opt · suitcase · · 寒冷季节额外保暖
- 速干袜 ×2 · must · suitcase · Darn Tough · 备换洗

**背包 & 收纳**
- 日包 20–30L（含防雨罩） · must · · Osprey Talon / Salomon Trailblazer · 当日徒步容量充足
- 防水袋/干燥袋 · must · backpack · Sea to Summit · 保护相机、证件、食物

**户外装备**
- 折叠登山杖 · must · suitcase · Black Diamond Trail Ergo Cork / Leki Micro · 22km来回必须，下坡膝盖保护
- 头灯 + 备用电池 · must · backpack · Petzl Actik Core / Black Diamond Spot · 凌晨4–5点出发绝对必须
- 求生哨 · must · body · · Solo出行安全底线
- 急救包（基础） · must · backpack · · 创可贴/弹性绷带/碘伏/止痛药
- 折叠水杯 · must · backpack · · 部分补水点需要自备杯
- 水袋 1.5L · must · backpack · Platypus / Hydrapak · 山上有天然水源可补充
- 净水片 · opt · backpack · Katadyn · 安全起见过滤山泉水

**日用**
- 防晒 SPF50+ · must · backpack · 安热沙 Anessa / Biore · 开阔地段日照强
- 防蚊液 · must · backpack · 蚊不叮 / OFF! · 雨林蚊虫多
- 湿巾 ×1包 · must · backpack · · 无厕所区域基本清洁
- 压缩毛巾 · must · backpack · · 轻量

**食物 & 补给**
- 行动粮（按天计） · must · backpack · · 能量棒+坚果+米饭团，备10–11小时份量
- 电解质补充 · must · backpack · Precision Hydration / Tailwind · 长时间出汗补充
- 紧急高热量食品 · must · backpack · · 巧克力/糖，备用

**数码**
- 充电宝 ≥10000mAh · must · body · · 禁止托运，当日随身
- 离线地图（手机） · must · · Maps.me / 山と高原地図 App · 出发前下载，山区信号很差
- 日本SIM / eSIM · must · body · IIJmio / Docomo · 提前购买
- 防水手机袋 · must · backpack · · 雨林保护手机

---

## 模板 002 · 尼泊尔ABC大本营

```
slug: nepal-abc-trek
title: 尼泊尔 · ABC大本营
title_en: Nepal · Annapurna Base Camp Trek
author_name: PACKLOG 精选
region: NEPAL
country: 尼泊尔
scenes: [hiking, backpacking]
days_min: 10, days_max: 14
season: spring / autumn
difficulty: moderate
description: 海拔4130m，高反预案不能少。背包要轻，但关键装备不能省。
note: ABC最常见的后悔是没带够保暖层，以及没准备高反药。
is_featured: true
```

**证件 & 出行**
- 护照 · must · body · · 申请TIMS卡和ACAP入园证需要
- TIMS卡 · must · body · 尼泊尔登山协会 · 在博卡拉或加德满都办理
- ACAP入园证 · must · body · 安纳普尔纳保护区 · 约30USD
- 旅行保险（含高海拔直升机救援） · must · body · · 海拔4000m以上建议必备
- 美元现金 · must · body · · 沿途ATM稀少

**鞋履**
- 防水徒步中帮鞋 · must · suitcase · Salomon X Ultra / HOKA Anacapa Mid · 部分路段有积雪
- 营地拖鞋 · must · suitcase · · 每晚茶馆休息

**衣物**
- 羽绒服（-5°C以下保暖） · must · suitcase · Patagonia Down Sweater / Arc'teryx Cerium · ABC夜间气温接近0°C
- 软壳冲锋衣 · must · backpack · · 每日行走主力
- 速干排汗内层 ×3 · must · suitcase · Icebreaker Merino · 
- 速干登山裤 ×2 · must · suitcase · · 
- 保暖内衣套装 · must · suitcase · · 高海拔营地用
- 保暖手套 · must · suitcase · Black Diamond · 
- 毛绒帽 / 巴拉克拉瓦 · must · suitcase · · 
- 遮阳帽 · must · suitcase · · 白天高海拔紫外线强

**高海拔安全**
- 高原反应药（乙酰唑胺/红景天） · must · backpack · Diamox · 提前咨询医生，出发前几天开始服用
- 血氧仪 · opt · backpack · Oximeter · 监测血氧饱和度，低于80%考虑下撤
- 急救包 · must · backpack · · 

**背包**
- 登山包 40–50L · must · · Osprey Atmos / Gregory Baltoro · 多日重装
- 防雨罩 · must · · 配背包
- 压缩袋套装 · must · · Sea to Summit · 

**户外装备**
- 登山杖 · must · suitcase · Black Diamond Trail Cork · 陡坡多
- 头灯 + 电池 · must · backpack · Petzl · 
- 睡袋（建议-5°C标准） · must · suitcase · Rab Neutrino / Western Mountaineering · 茶馆毯子较薄

---

## 模板 003 · Wonderfruit 露营音乐节（泰国芭提雅）

```
slug: wonderfruit-festival
title: Wonderfruit · 泰国
title_en: Wonderfruit · Thailand
author_name: PACKLOG 精选
region: THAILAND
country: 泰国
scenes: [camp_festival, music_festival]
days_min: 4, days_max: 5
season: winter（12月）
difficulty: easy
description: 泰国冬季，白天30°C热，夜间18°C凉。无塑料政策，自带杯子是必须。
note: Wonderfruit是无现金、无塑料的节庆。RFID手环消费，进场前预充值，比排队方便很多。
is_featured: true
```

**证件 & 票务**
- 护照 · must · body · · 
- 参赛/入场腕带确认码 · must · body · · 提前在官网注册才能快速入场
- RFID腕带充值记录 · opt · body · · 现场有充值站但排队长

**帐篷营地**
- 帐篷（2–3人） · must · · MSR Hubba Hubba / Big Agnes · 营地场地有限，早到选好位置
- 睡袋（15°C舒适温标） · must · · · 夜间约18°C，凉但不冷
- 睡垫 · must · · Therm-a-Rest · 
- 帐篷灯 / 营地灯 · must · · Black Diamond Moji · 
- 帐篷标识（醒目颜色丝带） · must · · · 避免找不到自己帐篷

**穿着**
- 轻薄速干T ×3 · must · suitcase · · 白天热，排汗为主
- 轻薄外套 / 卫衣 · must · suitcase · · 夜间场地温度降到18°C
- 舒适步行鞋 · must · suitcase · · 全天行走超过1万步
- 凉鞋 / 拖鞋 · must · suitcase · · 营地穿
- 泳装 · opt · suitcase · · 有水上活动区域
- 创意服装 / 亮片配件 · opt · suitcase · · 节庆氛围，穿什么都不奇怪

**必带（Wonderfruit特殊规定）**
- 可重复使用杯子 ≥473ml · must · body · Wonder Cup / 任意不锈钢杯 · 无塑料政策，没有杯子无法点饮料，进场必备
- 可重复使用水壶 · must · body · Hydro Flask / Nalgene · 场内有免费补水站
- 环保袋 · must · · · 购物和日常携带

**日间装备**
- 防晒 SPF50+ · must · backpack · Biore UV / La Roche-Posay · 户外场地直射阳光
- 遮阳帽 / 帽子 · must · backpack · · 
- 太阳镜 · must · backpack · · 
- 折叠扇 / 小风扇 · opt · backpack · · 白天热场合
- 腰包 · must · body · · 贴身携带手机钱包，防人群中丢失

**夜间装备**
- 耳塞 × 多副 · must · backpack · Loop Quiet / Flare · 帐篷紧邻舞台，全夜有音乐
- 头灯 / 手电 · must · backpack · · 夜间营地导航
- 充电宝 · must · body · · 场内有太阳能充电站但不够用

**卫生 & 健康**
- 湿巾 × 多包 · must · backpack · · 基础清洁，厕所条件有限
- 防蚊液 · must · backpack · OFF! Thailand / 蚊不叮 · 露天夜间必需
- 基础药（止泻/藿香正气/创可贴） · must · backpack · · 
- 防晒唇膏 · must · backpack · · 

**数码**
- 充电宝 ≥20000mAh · must · body · · 
- 防水手机袋 · opt · backpack · · 水上活动保护
- 下载Wonderfruit App · must · · · 场内导航和节目表，提前下载离线版

---

## 模板 004 · 越野赛 · 通用强制装备（UTMB系列标准）

```
slug: trail-race-mandatory-utmb
title: 越野赛 · 强制装备
title_en: Trail Race · Mandatory Gear (UTMB Standard)
author_name: PACKLOG 精选
region: GLOBAL
scenes: [trail_race]
days_min: 1, days_max: 2
season: all
difficulty: expert
description: 基于UTMB系列强制装备清单整理，每场赛事略有差异，出发前必须核对官方最新版本。
note: 强制装备缺少任何一件 = 取消资格。装备检查会在赛前和赛中随机进行。
is_featured: true
```

**赛事强制装备（UTMB标准）**
- 越野跑包/腰包（含计时芯片位置） · must · body · Salomon Adv Skin / Ultimate Direction · 必须能装下所有强制装备
- 防水冲锋衣（防水≥10000mm + 接缝密封） · must · backpack · Arc'teryx Norvan SL / Patagonia Houdini · 不是软壳，是真正防水硬壳
- 保暖中间层（长袖非棉，≥180g） · must · backpack · Patagonia Nano Air / Arc'teryx Atom · 
- 紧急保温毯 · must · backpack · SOL Emergency Blanket · 单张即可
- 急救包 · must · backpack · · 三角绷带/创可贴/无菌敷料/弹性绷带
- 越野跑鞋（防滑山地鞋底） · must · body · Salomon Speedcross / HOKA Speedgoat · 光底跑鞋禁止参赛
- 折叠杯（≥150ml） · must · backpack · Salomon · 补给站领饮料必需，不能有盖
- 头灯 + 备用电池 · must · backpack · Petzl Nao / Black Diamond Spot · 必须能独立工作
- 急救哨子 · must · body · · 
- 手机（保持开机，存储赛事急救号码） · must · body · · 禁止开飞行模式

**赛事强制装备（气候加码，寒冷版）**
- 保暖手套 · must · backpack · · 赛事规定时需带
- 保暖帽 / 巴拉克拉瓦 · must · backpack · · 
- 长裤（非腿套，真正裤子） · must · body · · 

**赛事强制装备（气候加码，炎热版）**
- 太阳镜 · must · body · · 
- 遮阳帽 / 颈部防护巾 · must · body · Buff · 完全覆盖头部和颈部

**补给（建议携带）**
- 水 ≥1L · must · backpack · · 初始携带量，补给站之间保证
- 能量≥800kcal紧急储备 · must · backpack · GU / Maurten · 约2条能量棒+2袋凝胶
- 电解质盐丸 · must · backpack · Precision Hydration · 
- 咖啡因胶（后程） · opt · backpack · Maurten CAF / GU Roctane · 

**赛前准备物品**
- 参赛确认邮件截图 · must · body · · 
- 医疗证明（部分赛事要求） · opt · body · · 提前确认报名要求
- 强制装备检查清单（官方最新版） · must · · · 出发前对照核查，每年可能更新

---

## 模板 005 · 冲绳潜水 · 5日

```
slug: okinawa-diving
title: 冲绳 · 潜水
title_en: Okinawa · Scuba Diving
author_name: PACKLOG 精选
region: JAPAN
country: 日本
scenes: [diving]
days_min: 4, days_max: 7
season: spring / summer / autumn
difficulty: easy
description: 冲绳能见度极佳，珊瑚礁生态丰富。自备个人装备比租借舒适度高很多。
note: 防晒霜必须选择珊瑚礁安全款，不含oxybenzone和octinoxate。
```

**证件 & 潜水资质**
- 护照 · must · body · · 
- 潜水执照（C卡） · must · body · PADI / SSI · 电子版即可，推荐截图备份
- 潜水日志 · opt · body · · 记录潜点、深度、伙伴，潜水店可能要求查看

**鞋履**
- 沙滩凉鞋（保护脚底） · must · suitcase · Teva / Chaco · 珊瑚礁岸边必须
- 防滑水鞋 · opt · suitcase · · 浮潜时保护脚

**衣物**
- 速干泳衣 ×2 · must · suitcase · · 每天换洗
- 防晒水母衣（UV长袖） · must · suitcase · O'Neill / Billabong · 防晒+珊瑚礁刮伤
- 速干T ×3 · must · suitcase · · 
- 防晒帽（宽檐） · must · suitcase · · 

**个人潜水装备（vs 租借）**
- 潜水面镜 · opt · suitcase · Cressi / Mares · 个人面镜更合脸，卫生有保证
- 呼吸管 · opt · suitcase · · 
- 脚蹼（旅行蹼） · opt · suitcase · Mares Razor / Cressi Palau · 旅行脚蹼更轻便
- 潜水手套 · opt · suitcase · · 部分保护区禁止带手套（防止随意触摸珊瑚）

**日用 & 护理**
- 防晒霜（珊瑚礁安全款） · must · suitcase · Raw Elements / All Good · 禁止含oxybenzone，冲绳部分潜点有严格规定
- 晒后修复 · must · suitcase · 芦荟胶 · 
- 防水袋 / 干燥袋 · must · backpack · Sea to Summit · 保护证件、手机

**数码**
- 防水相机 / GoPro · opt · backpack · GoPro Hero / Olympus TG · 
- 浮力棒/手柄 · opt · backpack · · GoPro拍摄配件
- 充电宝 · must · body · · 

---

## 模板 006 · 新疆天山徒步 · 独库公路

```
slug: xinjiang-tianshan-hike
title: 新疆 · 天山徒步
title_en: Xinjiang · Tianshan Trekking
author_name: PACKLOG 精选
region: CHINA
country: 中国
scenes: [hiking, backpacking]
days_min: 7, days_max: 14
season: summer / autumn
difficulty: moderate
description: 高海拔紫外线极强，昼夜温差20°C+，防晒和保暖都不能省
note: 独库公路沿线补给稀少，建议提前备好3天以上干粮。部分区域需要边防证。
```

**证件 & 手续**
- 身份证 · must · body · · 
- 边防证 · must · body · 当地公安局或网上预约办理 · 部分边境区域必须
- 景区门票 / 预约记录 · must · body · · 天池等热门景点需提前预约

**高海拔防晒**
- 防晒霜 SPF50+ PA++++ · must · backpack · 安热沙 / La Roche-Posay · 高海拔紫外线是平地2–3倍
- 太阳镜（UV400） · must · body · Julbo / Oakley · 必须有侧面遮光
- 防晒帽（宽檐+颈部遮护） · must · body · 
- 防晒口罩 / Buff · must · body · 

**衣物（昼夜温差大）**
- 速干T ×3 · must · suitcase · 
- 保暖抓绒 · must · suitcase · Patagonia R1 · 晚上营地气温低
- 羽绒服 · must · suitcase · · 部分区域夜间接近0°C
- 防风冲锋衣 · must · backpack · · 
- 速干登山裤 × 2 · must · suitcase · 

**补给（沿途稀少）**
- 冻干饭 × 按天数+2天 · must · suitcase · 
- 能量棒 / 坚果 · must · backpack · 
- 净水器 / 净水片 · must · backpack · Sawyer Squeeze · 

---

## 模板 007 · 成都周边露营 · 周末轻装

```
slug: chengdu-weekend-camping
title: 成都周边 · 周末露营
title_en: Chengdu · Weekend Camping
author_name: PACKLOG 精选
region: CHINA
country: 中国
scenes: [camping]
days_min: 1, days_max: 2
season: spring / autumn
difficulty: easy
description: 四川盆地气候多变，阴天多。轻装出发，营地配置齐全的话可以精简不少
note: 成都周边民宿式露营地很多，装备配置会影响选择。背包控可以叠加附近的徒步路线。
```

**帐篷 & 睡眠**
- 帐篷（2–3人，内置防雨层） · must · · Naturehike / MSR Hubba · 四川多阴雨
- 睡袋（按季节选） · must · · · 春秋15°C舒适温标
- 睡垫 · must · · Therm-a-Rest Z Lite / 充气垫 · 
- 营地灯 · must · · Black Diamond Moji · 

**炊具（如果自炊）**
- 炉头 · opt · · MSR PocketRocket 2 / Jetboil · 
- 气罐 · opt · · · 炉头配套，按天数备
- 锅具（轻量） · opt · · Snow Peak / MSR · 
- 餐具套装 · opt · · 

**衣物**
- 保暖层（抓绒/薄羽绒） · must · suitcase · · 四川山区夜间凉
- 防风外套 · must · suitcase · · 

**日用**
- 防蚊液 · must · backpack · 六神 / OFF! · 草地蚊虫多
- 防晒 · must · backpack · 
- 头灯 · must · backpack · 

---

## 模板 008 · 冰岛极光自驾 · 冬季

```
slug: iceland-winter-aurora
title: 冰岛 · 极光自驾
title_en: Iceland · Winter Aurora Road Trip
author_name: PACKLOG 精选
region: EUROPE
country: 冰岛
scenes: [city_explore]
days_min: 7, days_max: 10
season: winter
difficulty: moderate
description: 冰岛冬季气温-10°C到5°C，风大，防寒是第一要务。自驾需要备雪链。
note: 极光预报App（My Aurora Forecast）是必装。越往东部人越少，极光越好。
```

**证件 & 驾驶**
- 护照 · must · body · · 
- 国际驾照 · must · body · · 自驾必备
- 租车确认单 · must · body · · 建议选4WD
- 旅行保险（含车损） · must · body · · 

**防寒衣物（分层穿搭）**
- 美利奴羊毛内层（上下） · must · suitcase · Icebreaker 260 · 贴身最重要一层
- 抓绒中层 · must · suitcase · Patagonia R2 · 
- 防风防水硬壳（上下） · must · suitcase · Arc'teryx Beta / Patagonia Torrentshell · 冰岛风大+降水
- 羽绒服 · must · suitcase · Canada Goose / Patagonia Down Sweater · 极寒加码
- 防水保暖手套 × 2副 · must · suitcase · Black Diamond · 普通手套+厚手套各一副
- 毛线帽 + 巴拉克拉瓦 · must · suitcase · 
- 保暖厚袜 × 4双 · must · suitcase · Smartwool · 
- 防水雪地靴 · must · suitcase · Sorel / Columbia · 

**驾驶 & 安全**
- 雪链（或确认租车含） · must · · · 冬季法规要求
- 手机离线地图 · must · · Maps.me / Google Maps 离线 · 偏远地区无信号
- 急救包 · must · · · 
- 暖宝宝 × 多片 · must · backpack · Hakugen / 金霸王 · 极光守候夜间长时间户外

**极光装备**
- 三脚架 · opt · suitcase · Joby GorillaPod / 轻量碳纤维 · 拍极光必须
- 相机（手动模式） · opt · backpack · · 用手机也行但效果差
- 备用电池 × 多块 · must · backpack · · 寒冷环境耗电快，放贴身口袋保温
- My Aurora Forecast App · must · · · 提前下载

---

## 模板 009 · 马来西亚沙巴 · 神山登顶

```
slug: sabah-kinabalu
title: 沙巴 · 神山 Mt.Kinabalu
title_en: Sabah · Mt.Kinabalu Summit
author_name: PACKLOG 精选
region: MALAYSIA
country: 马来西亚
scenes: [hiking]
days_min: 2, days_max: 2
season: all（避开雨季3-5月）
difficulty: hard
description: 东南亚最高峰，海拔4095m。2天1夜，第二天凌晨2点出发攻顶，赶日出。
note: 必须提前数月预约Laban Rata山屋，旺季非常难订。攻顶前夜气温接近0°C。
```

**证件**
- 护照 · must · body · · 
- 神山公园预约确认 · must · body · Sabah Parks · 提前预约，人数每日有限
- 向导费收据 · must · body · · 强制向导，已含在预约中

**衣物（分层关键）**
- 速干T · must · suitcase · · 热带低海拔区段
- 保暖中间层 · must · backpack · · 山屋和攻顶段需要
- 防风冲锋衣 · must · backpack · · 攻顶段风大
- 保暖手套 · must · backpack · · 凌晨攻顶气温接近0°C
- 毛绒帽 · must · backpack · · 

**攻顶必备**
- 头灯 + 备用电池 · must · backpack · Petzl Actik · 凌晨2点黑暗出发
- 防滑手套（抓绳索用） · must · backpack · · 最后200m需要拉绳攀爬
- 能量棒 · must · backpack · · 凌晨没有补给

---

## 模板 010 · 广州→大理 · 独自旅行

```
slug: dali-solo-domestic
title: 大理 · 国内独旅
title_en: Dali · Domestic Solo Trip
author_name: PACKLOG 精选
region: CHINA
country: 中国
scenes: [city_explore, hiking]
days_min: 5, days_max: 10
season: spring / autumn
difficulty: easy
description: 苍山+洱海，骑行或徒步都有，高原紫外线强，防晒不能偷懒
note: 大理古城很小，不需要太多行李，轻装才能享受。建议骑共享单车环洱海。
```

**证件**
- 身份证 · must · body · · 
- 高铁/机票 · must · body · · 截图备份

**衣物（高原昼夜温差）**
- 速干T ×3 · must · suitcase · 
- 薄外套 / 防风层 · must · suitcase · · 高原早晚凉
- 防晒长袖 ×1 · must · suitcase · · 

**防晒（高原必须认真）**
- 防晒霜 SPF50+ · must · body · 安热沙 / 理肤泉 · 
- 太阳镜 · must · body · · 
- 遮阳帽 · must · body · · 

**出行**
- 轻量背包 20–25L · must · · · 日用背包，不需要大包
- 折叠雨伞 · opt · suitcase · · 大理夏季午后多雨

---

## 给 Cursor 的实现说明

### 社区广场功能要求

```
路由：/explore

筛选维度（顶部横向滚动筛选栏）：
1. 场景筛选：全部 / 徒步 / 露营 / 越野跑 / 潜水 / 音乐节 / 越野赛 / 骑行（横向滚动chip）
2. 地区筛选：全部 / 亚洲 / 欧洲 / 中国 / 全球（第二行或下拉）

列表卡片展示（参考截图样式）：
- 左侧深绿色块（background: var(--forest)，宽约120px）：
  · 顶部：§ 001 （EB Garamond italic，9px，--forest3色）
  · 中部：地名（EB Garamond italic，18px，白色，2行以内）
  · 底部：地区英文（DM Sans，9px，UPPERCASE，--forest3色）
- 右侧内容区：
  · 作者名（@xxx，DM Sans，12px，--ink3）+ 右对齐爱心数
  · 标题（DM Sans 500，16px，--ink）
  · 场景标签（如 徒步 · 露营 · 7日，DM Sans，12px，--ink3）
  · 两个按钮：预览（轻量边框样式）+ 复制到我的（深绿填充）

点击"预览"：底部抽屉展开，显示完整清单（只读）
点击"复制到我的"：
  1. 弹出选择目标行程的弹窗（或新建行程）
  2. 确认后将所有物品复制到目标行程清单
  3. toast提示：已复制 XX 件物品到「行程名」

单件物品操作（在预览抽屉内）：
  - 每件物品右侧有"+ 加入装备库"按钮
  - 点击后弹出选择：加入已拥有 / 加入愿望清单
  - 确认后写入 gear_locker 表

卡片之间用 border-bottom: 0.5px solid var(--paper2) 分隔，不用卡片阴影
整页最大宽度 660px 居中
```

