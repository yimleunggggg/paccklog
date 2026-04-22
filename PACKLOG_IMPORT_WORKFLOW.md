# PACKLOG Import Workflow (SOP)

## 目标

把外部链接（文章、清单、帖子）稳定导入 PACKLOG 的社区清单，保证：

- 字段结构统一（可落库、可检索、可复制到行程/装备库）
- 品牌映射统一（回到品牌总库）
- 多语体验统一（界面随 `lang` 切换，不混杂）
- 每次导入都有可复核的质检报告

---

## 核心原则

- 默认所有内容支持多语展示，并维护条目级多语字段（`name_zh/name_en`, `note_zh/note_en`, `tags_zh/tags_en`）。
- 前端统一走 `lang -> 字段选择` 渲染管线，避免中英混杂。
- 在线能力用于翻译补齐与术语标准化，但结果要写回对应多语字段，不依赖一次性运行时兜底。
- 品牌是强一致字段：必须落到标准品牌库，避免同品牌多写法污染。

---

## 导入输入规范

每次导入至少提供：

- 来源链接（必须）
- 截图（建议，帮助定位页面结构）
- 导入目标（默认：社区清单草稿）
- 可选偏好（如：更重视品牌准确率 / 发布时间 / 图片覆盖率）

推荐口令：

`按 PACKLOG 导入流程处理这个链接，先入清单广场草稿。`

---

## 标准执行流程

### 1) 抽取阶段（Ingest）

- 采集模板级信息：
  - `source_title`
  - `source_url`
  - `author_name`
  - `source_language`
  - `source_type`（article/video/post）
  - `source_published_at`（可空）
  - `trip_style`（语义标签）
- 采集条目级信息：
  - `item_name_raw` / `item_name_en`
  - `category`
  - `status_recommend`
  - `container_recommend`
  - `quantity_recommend`
  - `reason_raw`
  - `image_url`（可空）

### 2) 语义标准化阶段（Normalize）

- 分类映射到 PACKLOG 枚举（如 clothing/footwear/electronics...）
- 状态映射到 PACKLOG 枚举（to_pack/to_buy/optional/packed）
- 容器映射到 PACKLOG 枚举（suitcase/backpack/carry_on/wear/undecided）
- 品牌识别并映射品牌库标准名（支持别名、大小写、语种混写）
- 翻译与术语标准化（固定步骤）：
  - 生成 `name_zh/name_en`
  - 生成 `note_zh/note_en`
  - 生成 `tags_zh/tags_en`
  - 保证术语在同一语种内一致（如“速干/quick-dry”）

### 3) 入库阶段（Persist）

- 社区模板写入 `community_templates`
- 条目写入 `community_template_items`
- 保留原始来源与结构化字段
- 不把所有翻译结果固化为唯一真相

### 4) 展示阶段（Render）

- UI 根据 `lang` 决定文案输出语言
- 中文界面读取 `*_zh`，英文界面读取 `*_en`
- 若目标语字段缺失，按统一 fallback 策略回退并标注待补齐
- 关键词标签优先使用 `tags_zh/tags_en`

### 5) 质检阶段（QA）

- 执行自动质检脚本，生成 Markdown 报告
- 人工只看“异常项”与“高风险项”

---

## 多语策略（重要）

### A. 固化到库（结构化多语层）

- 条目名：`name_zh` / `name_en`
- 推荐理由：`note_zh` / `note_en`
- 关键词：`tags_zh` / `tags_en`
- 结构字段：`category/status/container/brand/source metadata`

### B. 在线能力（生成与校对层）

- 抽取后自动翻译补齐缺失字段
- 术语统一（品牌、材质、规格词）
- 导入后质量复核（语义偏差、术语冲突、可读性）

---

## 质检门槛（默认）

- 枚举合法率：100%
- 品牌命中率：>= 85%
- 图片覆盖率：>= 70%
- 关键元数据完整度（source_url/source_type/source_language）：100%
- 高风险人工复核项：品牌错配、分类错配、发布时间可疑、图文不符

---

## 交付物约定

每次导入结束后固定输出：

- 1 份导入摘要（新增模板数、条目数、图片数）
- 1 份质检报告（Markdown）
- 1 份待人工确认清单（仅异常项）

---

## 失败回滚策略

- 入库失败：中止，不写部分脏数据
- 迁移失败：先修复 migration history 再重试
- 品牌映射失败：保留 `brand_raw`，标记待复核，不强行写错品牌

---

## 执行口令（团队内部）

`执行 PACKLOG IMPORT SOP：链接 + 截图，导入社区草稿并输出 QC 报告。`