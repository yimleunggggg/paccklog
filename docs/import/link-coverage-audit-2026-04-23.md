# 社区清单来源覆盖核对（2026-04-23）

## 结论（先看）

- 你之前给的 PackHacker/REI 链接，**本地导入 CSV 基本都已存在**。
- 但目前线上可见内容“没体现”的主要原因是：  
  1. 只有 `packhacker-hostel-essentials` 明确有入库迁移（`community_templates`）；  
  2. 其他来源多停留在 `data/imports/*.csv`，还没有批量生成并执行“入库 migration”。
- 另外，`packhacker-merged.csv` 中大量记录 `record_status=draft`，也说明还在待发布状态。

## 你给的重点链接核对

### PackHacker 文章页（已抓到 CSV）

- `https://www.packhacker.com/packing-list/hostel-essentials-packing-list/` -> `packhacker-hostel-essentials.csv`（且已有入库 migration）
- `https://www.packhacker.com/packing-list/digital-nomad/` -> `packhacker-digital-nomad.csv`
- `https://www.packhacker.com/packing-list/earth-friendly-sustainable-packing-list/` -> `packhacker-sustainable-packing-list.csv`
- `https://www.packhacker.com/packing-list/road-trip-essentials/` -> `packhacker-road-trip-essentials.csv`

### PackHacker 用户页（已落 CSV，但为阻塞占位）

- `https://app.packhacker.com/u/lance939085` -> `packhacker-user-lance939085.csv`
- `https://app.packhacker.com/u/james-glennie` -> `packhacker-user-james-glennie.csv`
- `https://app.packhacker.com/u/jonathan1331022` -> `packhacker-user-jonathan1331022.csv`
- `https://app.packhacker.com/u/rachel-somers` -> `packhacker-user-rachel-somers.csv`
- `https://app.packhacker.com/u/guido1118454` -> `packhacker-user-guido1118454.csv`
- `https://app.packhacker.com/u/andre-calil` -> `packhacker-user-andre-calil.csv`

> 说明：这批用户页在当前流程里多是 `blocked_dynamic_no_public_items`，需要浏览器态抓取或登录态支持。

### REI 文章页（已抓到 CSV）

- `rei-backpacking-checklist.csv`
- `rei-festival-camping-checklist.csv`
- `rei-family-camping-checklist.csv`
- `rei-camp-kitchen-checklist.csv`
- `rei-first-aid-checklist.csv`
- `rei-sup-checklist.csv`
- `rei-kayak-day-touring-checklist.csv`
- `rei-canoe-multiday-touring-checklist.csv`
- `rei-backcountry-ski-snowboard-checklist.csv`
- `rei-snowshoe-checklist.csv`
- `rei-travel-preparation-checklist.csv`

## 当前“为什么广场看不到”

- 已确认存在的“正式入库”迁移主要围绕：
  - `20260422191000_add_packhacker_hostel_template.sql`
  - 后续对该模板做 enrich/backfill 的 migration
- 但对 `digital-nomad / sustainable / road-trip / REI` 这一批，缺少对应的“批量写入 `community_templates + community_template_items`”迁移文件。

## 下一步（建议按顺序）

1. 从 `data/imports/packhacker-*.csv` 与 `rei-*.csv` 生成批量 SQL（模板 + 条目）。
2. 为每个来源固定 `slug/source_url/source_name/author_name/scenes/trip_style`。
3. 执行 migration 后跑一次核对：
  - 模板数
  - 每模板条目数
  - 多语字段填充率
  - 价格参考覆盖率
4. 再做前端验收（广场卡片数量、预览内容、搜索筛选可见性）。

## 相关证据文件

- `data/imports/packhacker-import-summary.md`
- `data/imports/packhacker-merged.csv`
- `supabase/migrations/20260422191000_add_packhacker_hostel_template.sql`

