# PACKLOG 行前志 · Product Requirements Document
**版本**: v1.0  
**状态**: 交付 Cursor 开发  
**产品名称**: PACKLOG（英文）· 行前志（中文）  
**品牌 Slogan**: 出发前，把每一件放进它该去的地方  
**技术栈**: Next.js + Supabase + Tailwind + Claude API（已有基础）

---

## 一、产品定位

PACKLOG 行前志是一个**装备生命周期管理工具**，以"一次出行"为主线，覆盖出发前准备、途中核对、归来后复盘三个完整阶段。

核心差异点：
- 不只是打勾清单，而是支持"带了没用 vs 没带后悔"的归来反馈闭环
- 每次出行的复盘自动沉淀为下次行程的个人模板
- 社区共创：参考别人的清单 + 贡献自己的清单

目标用户：户外爱好者（徒步 / 越野跑 / 露营 / 潜水）、重度出行者、有分享习惯的旅行博主

---

## 二、功能范围总览（三期）

### 第一期 · MVP（本次开发重点）
- 行程创建与管理
- 行李清单（CRUD + 状态管理 + 容器分类）
- AI 智能生成清单（接 Claude API）
- 分享卡片生成
- 基础用户账号体系

### 第二期
- 归来后复盘模块（行程 Review）
- 个人模板库（从历史行程沉淀）
- 社区广场（浏览 + 复制他人清单）

### 第三期
- 全网搜索（接 AI 搜索，抓取小红书/reddit/户外论坛经验）
- 装备笔记（品牌评价 + 购买建议）
- 帖子聚合展示（参考内容展示）

---

## 三、详细功能说明

---

### 3.1 行程管理

#### 3.1.1 行程列表页（首页）

**展示字段**：
- 行程标题（自动生成，可自定义）
- 日期区间 + 天数
- 打包进度（已打包 / 总件数，百分比）
- 行程标签（目的地 / 场景 / 季节）
- 状态：Planning / Packing / Done / Reviewed

**交互**：
- 支持置顶
- 支持归档
- 点击进入行程详情
- 顶部"新建行程"入口

---

#### 3.1.2 新建行程页

**字段与交互要求**（减少打字，以选择为主）：

| 字段 | 交互方式 |
|------|----------|
| 目的地 | 三级选择：大洲 → 国家 → 城市，支持搜索模糊匹配 |
| 出发日期 / 返回日期 | 日历选选器，选完自动计算天数，提供快选 3/5/7/10/14天 |
| 出行方式 | 多选胶囊：独旅 / 朋友同行 / 家庭 / 比赛 |
| 出行场景 | 多选图标卡片（见下方场景列表） |
| 自定义标题 | 可选填，不填则自动生成（格式：目的地 · 场景 · 天数） |
| 备注 | 可选文本域 |

**行程场景选项**（图标卡片，多选）：
- 🥾 徒步  · 🏕 露营  · 🏃 越野跑  · 🤿 潜水
- 🎵 音乐节  · 🏙 城市漫游  · 🧗 攀岩  · 🚵 骑行
- 🎿 滑雪  · 🏊 游泳 / 水上运动  · ✈ 商务出行  · 🌏 长途自驾

**自动生成标题逻辑**：
- 格式：`{城市} · {主场景} · {天数}日`
- 例：`屋久岛 · 徒步露营 · 7日`
- 生成后实时预览在表单底部 hero 样式卡片内

**天气联动**（创建后行程详情页）：
- 接 Open-Meteo API，根据目的地 + 日期区间查询历史气候均值
- 展示：平均温度区间 + 降水概率 + 季节描述
- 根据天气自动输出装备建议文字（如"春季山区建议携带硬壳冲锋衣"）

---

### 3.2 行李清单模块

#### 3.2.1 清单详情页布局

页面结构（从上至下）：
1. Hero Card（行程信息 + 打包进度）
2. 天气条（目的地天气 + 装备建议）
3. 提示横幅（行程专属注意事项，AI 生成）
4. 筛选标签栏（可横向滚动）
5. 快速添加输入框
6. 物品分组列表
7. 底部统计栏（总件 / 已打包 / 待购买 / 可选）

---

#### 3.2.2 物品状态系统

每件物品有两个独立维度：

**状态维度**（4选1）：
| 状态 | 含义 |
|------|------|
| 必带 | 这次行程必须带 |
| 待购买 | 还没买，需要购买 |
| 可选 | 可带可不带 |
| 已打包 | 已物理放入包中（打勾确认） |

**容器维度**（4选1，可不填）：
- 托运行李箱 / 登机背包 / 随身携带 / 身上穿戴

---

#### 3.2.3 物品字段

| 字段 | 必填 | 说明 |
|------|------|------|
| 物品名称 | 是 | 支持中英文 |
| 分类 | 是 | 见下方分类体系 |
| 状态 | 是 | 必带 / 待购买 / 可选 |
| 容器 | 否 | 托运箱 / 背包 / 随身 / 穿戴 |
| 数量 | 否 | 默认1 |
| 品牌备注 | 否 | 如：Salomon X Ultra 4 Mid GTX |
| 说明/备注 | 否 | 如：日本山区推荐硬壳而非软壳 |
| 备选品牌 | 否 | 多行，格式自由 |

---

#### 3.2.4 物品分类体系

默认分类（用户可自定义增减）：
- 证件 & 出行必备
- 鞋履
- 衣物
- 背包 & 收纳
- 户外装备
- 日用 & 护理
- 数码 & 通讯
- 食物 & 补给
- 药品 & 急救
- 其他

---

#### 3.2.5 清单视图切换

支持以下视图（顶部 tab 切换）：
- **全部** — 按分类分组
- **待打包** — 状态为"必带"但未勾选
- **已打包** — 已勾选物品
- **待购买** — 状态为"待购买"
- **可选** — 状态为"可选"
- **按容器** — 按托运箱 / 背包 / 随身 分组显示

---

#### 3.2.6 快速添加

输入框 + 添加按钮，支持：
- 回车提交
- 输入后自动归入"最近使用的分类"或让用户快选分类
- 初始状态默认"必带"

---

### 3.3 AI 智能生成清单

#### 触发方式
- 新建行程完成后，弹出"是否要 AI 帮你生成初始清单？"
- 行程详情页顶部入口"AI 推荐补充"

#### 输入参数（来自行程信息，无需用户重复填写）
- 目的地（国家 + 城市）
- 日期区间 + 天数
- 季节（自动判断）
- 出行场景（多个）
- 出行方式（独旅 / 朋友等）
- 天气数据（如已获取）

#### 输出格式（Claude API）
要求 Claude 返回结构化 JSON，格式如下：
```json
{
  "sections": [
    {
      "name": "证件 & 出行必备",
      "items": [
        {
          "name": "护照",
          "status": "must",
          "container": "body",
          "brand": "",
          "note": "有效期需6个月以上"
        }
      ]
    }
  ],
  "trip_notice": "屋久岛年降雨量全日本最高，硬壳冲锋衣必须，提前下载离线地图",
  "weather_tip": "春季山区14–22°C，早晚温差大，保暖中间层必备"
}
```

#### System Prompt 要求
- 结合目的地本地特殊需求（如日本A型插头、屋久岛无信号）
- 按场景权重排序（徒步 > 城市 > 露营 场景物品各有优先级）
- 标注品牌建议时使用"/"分隔多个选项
- 不要生成过多可选物品，保持清单精简实用

---

### 3.4 归来后 · 行程 Review（第二期，先做数据结构）

#### Review 字段（每件物品可标注）：
- ✅ 带了，用上了
- ❌ 带了，完全没用（下次删）
- ⚠️ 没带，后悔了（下次加）
- 💬 备注：自由文字反馈

#### Review 聚合输出：
- 自动生成"这次行程的装备总结"
- 标注高频"带了没用"物品，提示下次精简
- 标注高频"没带后悔"物品，提示下次加入
- 支持一键将此次清单（含 Review 标注）保存为个人模板

---

### 3.5 分享卡片

#### 生成方式
- 行程详情页顶部"分享"按钮
- 支持比例切换：3:4（默认，适合小红书）/ 1:1 / 9:16

#### 卡片展示内容（不列具体物品，保持摘要感）
- 品牌名：PACKLOG 行前志
- 行程标题（EB Garamond 斜体大字）
- 日期 + 天数 + 出行方式
- 场景标签 Chip
- 数据摘要：总件数 / 已打包 / 待购买 / 可选
- 分类汇总：各类别件数（圆点 + 分类名 + 件数）
- 天气提示（如有）
- 底部品牌水印 + 域名

#### 导出方式
- 保存图片（html2canvas 截图）
- 复制链接（分享行程只读页）
- 一键分享到系统分享菜单

---

### 3.6 社区广场（第二期）

#### 功能点
- 浏览他人公开分享的行程清单
- 按场景 / 目的地 / 季节 / 热度筛选
- 点击行程可预览清单内容
- "复制到我的行程"功能：一键将他人清单复制为新行程，可自由修改
- 点赞 / 收藏
- 评论（可选，第三期）

---

### 3.7 全网搜索（第三期）

#### 功能点
- 在清单详情页内，针对某个分类或物品触发"看看大家怎么说"
- 接 AI 搜索（如 Tavily / Perplexity API）
- 抓取小红书、什么值得买、reddit、户外论坛的推荐内容
- 以"参考帖子"卡片展示，包含：来源平台 / 标题 / 关键建议摘要
- 用户可从搜索结果直接"加入我的清单"

---

## 四、设计规范（Cursor 必须严格遵守）

> ⚠️ 所有页面的视觉实现必须遵循本节规范，不得使用默认 Tailwind 配色或通用 UI 库默认样式。

### 4.1 字体

```css
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
```

| 用途 | 字体 | 样式 |
|------|------|------|
| 大标题、进度数字、行程名 | EB Garamond | italic，400 |
| 正文、按钮、标签、导航 | DM Sans | 400 / 500 |
| 品牌备注、辅助说明 | EB Garamond | italic，color: --ink3 |
| 章节序号（01 02…） | EB Garamond | italic，color: --ink4 |

禁止使用：Inter、Roboto、System UI、Arial

### 4.2 颜色系统

```css
:root {
  /* 页面背景 */
  --paper:   #F4F1EC;
  --paper2:  #E8E3D8;
  --paper3:  #CEC8BC;

  /* 品牌绿 */
  --forest:  #243D1F;   /* Hero Card 背景、主按钮 */
  --forest2: #3A5C33;   /* 已完成、强调 */
  --forest3: #6B9460;   /* 辅助绿、eyebrow 文字 */
  --forest4: #B8D4AD;
  --forest5: #E8F2E4;   /* 必带标签底色 */

  /* 文字层级 */
  --ink:  #1C1C18;
  --ink2: #4A4840;
  --ink3: #8C8880;
  --ink4: #B8B4AC;

  /* 琥珀（警示 / 待购买） */
  --amber:  #9B6A2A;
  --amberL: #F5ECD8;

  /* 暖白 */
  --cream: #FEFCF8;
}
```

**禁止**：蓝色系、紫色渐变、纯白 `#FFFFFF` 作为页面背景、`box-shadow`（聚焦环除外）、任何 `gradient`

### 4.3 核心组件规范

**Hero Card（行程信息卡）**
- 背景：`--forest`，圆角 20px，padding 26px 24px 22px
- 标题：EB Garamond italic，28px，`--cream`
- 进度百分比：EB Garamond italic，30px，白色
- 进度条：height 1.5px，极细
- eyebrow 行：9px，letter-spacing .22em，UPPERCASE，`--forest3`，右侧延伸 .5px 横线

**分区 Section Header**
- 不用卡片，用 `border-bottom: .5px solid var(--paper2)`
- 左侧序号：EB Garamond italic，11px，`--ink4`
- 分区名：10px，DM Sans 500，letter-spacing .13em，UPPERCASE，`--ink2`

**物品行 Item Row**
- 背景：透明（不是白色卡片）
- 分隔：`border-bottom: .5px solid var(--paper2)`
- 点击整行 → 切换打包状态，opacity 变 .38 + 划线
- 勾选圆：17px，勾选后 `--forest2` 背景

**状态标签 Tag**
- 字号：9px，DM Sans 500，UPPERCASE，letter-spacing .04em，border-radius 4px
- 必带：`--forest5` 底 + `--forest2` 字
- 待购买：`--amberL` 底 + `--amber` 字
- 可选：`--paper2` 底 + `--ink3` 字

**主按钮**
- `--forest` 背景，`--cream` 字，border-radius 12px，无阴影，无边框

**提示横幅 Notice**
- `--amberL` 背景，`border-left: 2px solid var(--amber)`，border-radius 0

**筛选标签 Filter Tag**
- 默认：`--cream` 背景，`.5px border --paper3`，`--ink3` 字
- 激活：`--forest` 背景，`--cream` 字，border-radius 20px

### 4.4 品牌 Logo SVG

在所有页面 Header、分享卡片、启动页使用以下 SVG：

```svg
<svg width="32" height="32" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="19" stroke="#6B9460" stroke-width="1"/>
  <path d="M12 30 L22 12 L32 30" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
  <path d="M16 30 L28 30" stroke="#6B9460" stroke-width="1.1" stroke-linecap="round"/>
  <path d="M17 23 L22 16 L27 23" stroke="#6B9460" stroke-width=".9" fill="none"/>
  <circle cx="22" cy="12" r="2" fill="#6B9460"/>
</svg>
```

深色背景下 `currentColor` 用 `#FEFCF8`，浅色背景用 `#243D1F`

### 4.5 绝对禁止事项

1. ❌ 不用 Inter、Roboto、System UI
2. ❌ 不用任何 gradient（CSS 或 SVG）
3. ❌ 不用 box-shadow
4. ❌ 不用蓝色、紫色
5. ❌ 物品行不用白色卡片，用横线分割
6. ❌ 不用纯白 `#FFFFFF` 做页面背景
7. ❌ 不用黑色实心 pill 标签
8. ❌ 不用 Tailwind 默认颜色 class（如 bg-green-500），全部用 CSS 变量

---

## 五、页面路由结构

```
/                      → 首页（行程列表）
/trips/new             → 新建行程
/trips/[id]            → 行程详情 + 行李清单
/trips/[id]/share      → 分享卡片预览
/trips/[id]/review     → 归来后复盘（第二期）
/explore               → 社区广场（第二期）
/profile               → 个人主页 + 模板库
```

---

## 六、数据库结构（Supabase）

```sql
-- 用户表（使用 Supabase Auth）

-- 行程表
CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  title       TEXT,
  destination_continent TEXT,
  destination_country   TEXT,
  destination_city      TEXT,
  start_date  DATE,
  end_date    DATE,
  days        INT,
  travel_style TEXT[],       -- solo / friends / family
  scenes      TEXT[],        -- hiking / camping / trail_run ...
  status      TEXT DEFAULT 'planning',  -- planning/packing/done/reviewed
  notes       TEXT,
  is_public   BOOLEAN DEFAULT false,
  is_pinned   BOOLEAN DEFAULT false,
  weather_data JSONB,
  ai_notice   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 物品分类表（每个行程独立）
CREATE TABLE item_categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id   UUID REFERENCES trips(id) ON DELETE CASCADE,
  name      TEXT,
  sort_order INT DEFAULT 0
);

-- 物品表
CREATE TABLE items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,
  category_id UUID REFERENCES item_categories(id),
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'must',   -- must / buy / optional / packed
  container   TEXT,                  -- suitcase / backpack / body / wearing
  quantity    INT DEFAULT 1,
  brand       TEXT,
  note        TEXT,
  alt_brands  TEXT,
  is_packed   BOOLEAN DEFAULT false,
  sort_order  INT DEFAULT 0,
  -- 第二期 Review 字段
  review_result TEXT,                -- used / unused / missed / na
  review_note   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 模板表（第二期）
CREATE TABLE templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  source_trip_id UUID REFERENCES trips(id),
  name        TEXT,
  scenes      TEXT[],
  is_public   BOOLEAN DEFAULT false,
  data        JSONB,   -- 存完整清单结构
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 七、第一期开发优先级

按此顺序开发，不要跳步：

1. **用户认证**（Supabase Auth，email + Google OAuth）
2. **行程 CRUD**（创建 / 列表 / 删除 / 归档）
3. **物品 CRUD**（添加 / 编辑 / 删除 / 状态切换）
4. **打包勾选交互**（点击整行切换 is_packed，进度实时更新）
5. **AI 生成清单**（接 Claude API，结构化 JSON 写入数据库）
6. **天气联动**（接 Open-Meteo）
7. **分享卡片**（html2canvas 截图 + 比例切换）
8. **语言切换**（中文简体 / 繁体 / English，所有 UI 文字必须完整切换）

---

## 八、给 Cursor 的补充说明

1. 所有产品内文字使用"PACKLOG 行前志"作为品牌名，不要用 LOADOUT 或其他旧名称
2. 每次开发新页面前，先阅读第四节设计规范，再写代码
3. CSS 颜色全部使用 `var(--xxx)` 变量，在 `globals.css` 的 `:root` 中定义
4. 字体通过 Google Fonts 引入，在 `layout.tsx` 的 `<head>` 中加载
5. 所有页面最大宽度 660px，居中显示
6. 移动端优先，响应式
7. 行程详情页的物品列表，物品行使用透明背景 + 细线分割，不要用白色卡片
8. 进度条高度 1.5px，不要用厚条
9. 分享卡片使用 html2canvas 生成图片，不要用服务端截图
