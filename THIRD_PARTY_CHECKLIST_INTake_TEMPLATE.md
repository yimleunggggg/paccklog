# 第三方行李清单录入标准模板（长期版）

> 用途：把你从网页、帖子、视频、截图里拿到的“别人行李清单/攻略”结构化录入，便于后续检索、复用、对比。  
> 适用：中文/英文/多语言来源，含攻略说明、发布时间、出行时间、推荐理由。

---

## A. 清单级元信息（必填 + 推荐）

### 1) 基础信息（必填）

- `source_title`：来源标题（原文标题）
- `source_url_or_ref`：来源链接或截图编号
- `author_name`：作者/发布者（未知填 `unknown`）
- `source_language`：来源语言（`zh-CN` / `zh-TW` / `en` / `ja` / `mixed`）
- `published_at`：发布时间（尽量到日，格式 `YYYY-MM-DD`；未知可填 `YYYY-MM`）
- `trip_time_start`：作者对应行程开始时间（若有）
- `trip_time_end`：作者对应行程结束时间（若有）

### 2) 场景信息（推荐）

- `destination_country`
- `destination_city_or_region`
- `trip_days`
- `season_or_month`（如 `5月/雨季/秋季`）
- `temperature_range`（如 `12-20C`）
- `trip_style`（如 `徒步/城市/露营/商务/亲子`）

### 3) 质量信息（推荐）

- `source_type`：`article` / `post` / `video` / `screenshot` / `mixed`
- `capture_method`：`manual` / `ocr` / `manual+ocr`
- `confidence_score`：1-5（你对这份资料可信度）
- `copyright_note`：仅记录引用信息，不搬运受限内容

### 4) 攻略摘要（推荐）

- `summary_zh`：中文摘要（2-5 行）
- `summary_en`：英文摘要（可空）
- `why_this_list`：这份清单适合谁/为什么值得参考
- `special_notes`：特殊提醒（如“当地买更便宜”“药品法规限制”）

---

## B. 条目级录入表（核心）

每个物品一行，建议先粗录，再二次清洗。


| 字段                         | 必填  | 说明                                                | 示例                        |
| -------------------------- | --- | ------------------------------------------------- | ------------------------- |
| `item_name_raw`            | 是   | 原文物品名（保持来源原样）                                     | Compression packing cube  |
| `item_name_zh`             | 推荐  | 中文标准名                                             | 压缩收纳袋                     |
| `item_name_en`             | 推荐  | 英文标准名                                             | Compression packing cube  |
| `category`                 | 是   | 统一分类（必须走系统标准）                                     | bags / clothing / camping |
| `status_recommend`         | 是   | 推荐状态（to_pack/to_buy/optional/packed）              | to_pack                   |
| `container_recommend`      | 推荐  | 推荐放置位置（undecided/suitcase/backpack/carry_on/wear） | suitcase                  |
| `quantity_recommend`       | 推荐  | 推荐数量                                              | 2                         |
| `priority_level`           | 推荐  | 优先级（high/medium/low）                              | high                      |
| `brand_raw`                | 可选  | 原文品牌                                              | Decathlon                 |
| `brand_normalized`         | 推荐  | 标准品牌名（从品牌库映射）                                     | Decathlon                 |
| `alternatives`             | 可选  | 备选品牌（逗号分隔）                                        | Osprey, Naturehike        |
| `reason_raw`               | 推荐  | 来源里的推荐理由（原话/摘录）                                   | 防潮、防压缩、节省空间               |
| `reason_structured`        | 推荐  | 结构化理由（你整理后）                                       | 节省体积，适合短途多套换洗             |
| `buy_tips`                 | 可选  | 购买建议                                              | 当地可买，价格更低                 |
| `local_constraint`         | 可选  | 当地限制/注意                                           | 电池容量限制需托运                 |
| `source_quote_or_timecode` | 推荐  | 引用片段/时间戳                                          | 03:21 视频提到“必带”            |
| `confidence_item`          | 推荐  | 条目置信度 1-5                                         | 4                         |
| `is_duplicate_candidate`   | 推荐  | 是否疑似重复条目                                          | false                     |


---

## C. 统一分类与状态规范（必须遵守）

### 分类（必须用系统标准值）

`clothing / footwear / electronics / toiletries / documents / nutrition / first_aid / bags / accessories / disposable / camping / other`

### 状态（必须用系统标准值）

`to_pack / to_buy / optional / packed`

### 放置位置（必须用系统标准值）

`undecided / suitcase / backpack / carry_on / wear`

---

## D. 多语言录入规范

- 保留 `item_name_raw`（原语种）作为追溯依据。
- 同步维护 `item_name_zh` / `item_name_en`，至少保证一种标准语言可检索。
- 攻略摘要建议至少写 `summary_zh`，英文可后补。
- 品牌统一走品牌库映射，不新增临时拼写版本。

---

## E. 品牌字段标准（重点）

> 结论：**不要只存中文名**，也不要只存英文名。建议“原文 + 标准名 + 别名”三层。

### 品牌字段建议

- `brand_raw`：来源原文品牌（不改写）
- `brand_normalized`：标准品牌名（用于系统匹配，建议英文主键）
- `brand_zh`：品牌中文展示名（可选）
- `brand_aliases`：别名/常见拼写（逗号分隔）
- `brand_match_confidence`：品牌匹配置信度（1-5）

### 匹配规则（给 AI / 清洗流程）

1. 优先匹配已有品牌库（完全匹配 > 别名匹配 > 模糊匹配）。
2. 命中品牌库时：
  - `brand_normalized` 填品牌库标准名；
  - `brand_raw` 保留原文；
  - `brand_zh` 可由品牌库回填。
3. 未命中时：
  - `brand_raw` 保留；
  - `brand_normalized` 留空；
  - `brand_match_confidence` 降低（如 1-2）；
  - 标记到待人工审核队列。

---

## F. Google Sheets 表格版（可直接建表）

> 下方是推荐列名。你可以直接复制到 Google Sheets 首行（A1 开始）。

```text
record_id,source_title,source_url_or_ref,author_name,source_language,source_type,capture_method,published_at,trip_time_start,trip_time_end,destination_country,destination_city_or_region,trip_days,season_or_month,temperature_range,trip_style,summary_zh,summary_en,why_this_list,special_notes,confidence_score,item_name_raw,item_name_zh,item_name_en,category,status_recommend,container_recommend,quantity_recommend,priority_level,brand_raw,brand_normalized,brand_zh,brand_aliases,brand_match_confidence,alternatives,reason_raw,reason_structured,buy_tips,local_constraint,source_quote_or_timecode,confidence_item,is_duplicate_candidate,screenshot_id,ocr_text_snippet,manual_corrected,ocr_risk_note,ingested_at,last_verified_at,record_status,reviewer
```

### 列说明（关键补充）

- `record_id`：建议 `SRC-YYYYMMDD-001`，便于追踪。
- `ingested_at`：录入时间（系统时间）。
- `last_verified_at`：最近人工复核时间。
- `record_status`：`draft` / `verified` / `archived`。
- `reviewer`：复核人（可选）。

---

## G. 给 AI 的标准整理提示词（可直接用）

把下面这段复制给 AI（可用于你后续自动化录入）：

```text
你是“第三方行李清单结构化助手”。请把我提供的原始素材（网页文本、截图OCR、视频笔记）整理成结构化记录，输出为 CSV 行或 JSON 数组。

必须遵守：
1) 分类 category 只能使用：
clothing,footwear,electronics,toiletries,documents,nutrition,first_aid,bags,accessories,disposable,camping,other
2) 状态 status_recommend 只能使用：
to_pack,to_buy,optional,packed
3) 放置位置 container_recommend 只能使用：
undecided,suitcase,backpack,carry_on,wear
4) 品牌处理规则：
- 保留 brand_raw 原文
- 优先匹配品牌库并填 brand_normalized
- 未匹配则 brand_normalized 留空，不要臆造
5) 缺失信息处理：
- 任何无法确认的字段必须留空字符串，不要猜测、不要编造
- 日期不完整时可只保留 YYYY-MM；完全未知则留空
6) 保留证据：
- source_quote_or_timecode 尽量填写来源片段或时间点
7) 输出前自检：
- 不允许输出不在枚举内的 category/status/container
- 不允许把“推荐理由”写进品牌字段

输出格式：
- 默认输出 CSV（首行表头 + 多行记录）
- 若我要求 JSON，则输出 JSON 数组，每条对象字段与表头一致
```

---

## H. 定期更新机制（建议）

### 更新节奏

- **每周一次（轻量）**：新增来源、快速录入、标记 `draft`
- **每月一次（深度）**：统一品牌映射、分类纠偏、去重、复核 `verified`

### 每次更新流程

1. 拉取新素材（链接/截图/OCR）
2. 用标准提示词让 AI 初次结构化
3. 运行枚举校验（分类/状态/位置）
4. 品牌映射（命中库 / 未命中待审）
5. 去重（按 `source + item_name_raw + destination + month`）
6. 更新 `last_verified_at` 与 `record_status`

### 去重优先级

- 一级：`source_url_or_ref + item_name_raw + published_at`
- 二级：`item_name_zh/en + destination + season_or_month`
- 三级：人工复核（相似但语义不同）

---

## I. 截图/OCR 来源补充字段（可选但强烈推荐）

- `screenshot_id`：截图文件名或编号
- `ocr_text_snippet`：OCR 抽取关键段
- `manual_corrected`：是否人工校对（true/false）
- `ocr_risk_note`：可能识别错误项（品牌名、数字、药名）

---

## J. 最小可用录入（你赶时间时）

至少录入以下字段即可入库：

- 清单级：`source_title`, `source_url_or_ref`, `source_language`, `published_at`
- 条目级：`item_name_raw`, `category`, `status_recommend`, `reason_raw`

---

## K. 一条示例（可直接照抄）

- `source_title`：2025 富士山徒步清单
- `source_url_or_ref`：[https://example.com/post/123](https://example.com/post/123)
- `source_language`：zh-CN
- `published_at`：2025-06-18
- `trip_time_start`：2025-07-03
- `trip_time_end`：2025-07-07
- `season_or_month`：7月（夏季）
- `temperature_range`：8-18C
- `trip_style`：徒步

条目：

- `item_name_raw`：轻量冲锋衣
- `item_name_zh`：轻量防水冲锋衣
- `category`：clothing
- `status_recommend`：to_pack
- `container_recommend`：wear
- `reason_raw`：山上温差大且易下雨
- `reason_structured`：保暖+防雨双用途
- `brand_normalized`：Montbell
- `confidence_item`：5

