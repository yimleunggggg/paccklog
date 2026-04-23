# PACKLOG V2 架构升级影响审计（gear_master）

## 结论（先看这个）

- 你的方向正确：用 `gear_master` 做全局唯一装备主表，`gear_locker / trip_items / community_template_items` 全部改“引用”。
- 当前线上并不是这套：现在主要靠名称匹配（`ilike(name)`）去重，`trip_items` 仅有 `source_locker_id` 的半引用能力。
- 可行策略：采用“兼容式双轨迁移”（先加字段与映射，不硬切旧逻辑），避免打断现有流程。

---

## 当前真实数据链路（V1）

1. **用户仓库**
   - 表：`gear_locker`
   - 结构：`user_id + name + category + brand + note + status`
   - 去重：按 `name`（`ilike`）更新或插入

2. **行程条目**
   - 表：`trip_items`
   - 结构：以条目文本为主，含 `source_locker_id`（可空）
   - 关系：仅当命中已有 locker 同名条目时，才可能写 `source_locker_id`

3. **社区条目**
   - 表：`community_template_items`
   - 结构：独立文本条目（`name/name_zh/name_en/note...`）
   - 与主装备实体：当前无 `gear_id` 关联

---

## 升级到 V2（gear_master）时的全局影响面

## 数据库（必须改）

- **新增主表**
  - `gear_master`（全局唯一装备实体）
  - 建议字段：`id, normalized_name, display_name_zh/en, brand, category, tags, canonical_note, created_at, updated_at`

- **新增引用字段**
  - `gear_locker.gear_id`（用户拥有关系）
  - `trip_items.gear_id`（行程条目引用）
  - `community_template_items.gear_id`（社区条目引用）

- **建议唯一索引**
  - `gear_master`：`(normalized_name, coalesce(brand,''), coalesce(category,''))`
  - `gear_locker`：`(user_id, gear_id)` 唯一
  - `trip_items`：`(trip_id, gear_id)` 可选唯一（视是否允许同装多件）

- **RLS**
  - `gear_master`：读开放给认证用户，写限 service role / 后台管道
  - `gear_locker/trip_items/community_template_items`：沿用现有 owner-based 策略 + gear_id 可读校验

## 应用层（必须改）

- `src/features/trips/actions.ts`
  - `addTripItem` / `updateTripItem` / `addLockerItemsToTrip` / `bulkOperateTripItems(save_to_locker)`
  - 现状按名字去重；V2 要优先按 `gear_id`，名字仅兜底

- `src/features/explore/actions.ts`
  - `copyCommunityTemplateToTrip`
  - `addCommunityItemToLocker`
  - `addCommunityItemToTrip`
  - 现状按 localized name 匹配 locker；V2 要先走 `gear_id`

- `src/features/locker/actions.ts`
  - 新增/编辑/删除 locker 时，应维护 `gear_locker(user_id, gear_id)` 关系，不再只更新名字文本

## 页面与展示（必须改）

- `src/app/locker/page.tsx`
- `src/components/locker-filtered-list.tsx`
- `src/app/trips/[tripId]/page.tsx`
- `src/components/sortable-trip-group.tsx`
- `src/app/explore/page.tsx`
- `src/components/community-explore-client.tsx`

重点：展示层改为“有 `gear_id` 优先从主实体取标准信息，无 `gear_id` 回退旧字段”。

## 指标统计（建议同时改）

- 社区引用统计从“按条目文案”升级为“按 `gear_id` 聚合”
- 热门装备、加购次数、行程复用次数都应统一口径

---

## 迁移风险点与规避

- **风险 1：同款误合并**
  - 规避：回填阶段输出“低置信匹配清单”人工确认

- **风险 2：线上功能中断**
  - 规避：双写 + 读路径 fallback，不做一次硬切

- **风险 3：性能下降**
  - 规避：提前建索引；热路径减少多跳 join；按页加载

---

## 分阶段执行（推荐）

1. **Phase A（兼容）**
   - 新建 `gear_master` + 三表 `gear_id`（可空）
   - 不改旧 UI，仅埋点与双写

2. **Phase B（回填）**
   - 批量匹配 `gear_locker / trip_items / community_template_items -> gear_master`
   - 输出 QC（匹配率/冲突率/待确认）

3. **Phase C（切换）**
   - 读路径优先 `gear_id`
   - 写路径优先 `gear_id`，文本为副本/缓存

4. **Phase D（增强）**
   - 上装备评价、真实场景标签、可信度统计

---

## 你关心的核心流程（核对）

- 创建行程 -> 添加物品 -> 分类/容器 -> 打勾状态：**保持不变**
- 第二次复用（仓库导入/模板导入）：**会更稳（按 gear_id）**
- 社区抄作业：**更准（同装同统计）**
- 热门装备/清单可信度：**统计口径统一后可明显提升**

