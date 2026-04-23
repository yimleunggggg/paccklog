# REI 阻塞补抓通路验证（CDP）

## 结论

- 已完成 2 篇 REI 页面的浏览器态验证：
  - `travel-preparation-checklist`
  - `backpacking-checklist`
- 静态抓取（`WebFetch`）在本环境超时；浏览器 CDP 可稳定拿到正文和清单条目。
- 已生成两份样本 CSV（高质量可入库格式）：
  - `data/imports/rei-travel-preparation-checklist-cdp.csv`（12 条）
  - `data/imports/rei-backpacking-checklist-cdp.csv`（15 条）

## 关键证据

- `travel-preparation-checklist` 页面快照中可直接读取分段清单（10-30 天前、5-7 天前、2-4 天前、出发前 1 天、出发当日）。
- `backpacking-checklist` 页面快照中可读取结构化章节与条目：
  - `Backpacking Gear`
  - `Backcountry Kitchen`
  - `Food & Water`
  - `Clothing & Footwear`
  - `Ten Essentials`（含安全关键项）

## 为什么要切 CDP

- 该站点在非浏览器态下容易出现超时/受限。
- CDP 可直接读取已渲染 DOM 文本，避免“blocked 摘要占位数据”。

## 下一步建议（可直接执行）

1. 按同一方式补抓剩余 9 篇 `rei-*.csv` 来源；
2. 生成一条专用 migration，把 `*-cdp.csv` 入库到 `community_templates` / `community_template_items`；
3. 对新入库 REI 条目跑 `import:community:qc`，重点看：
   - `blockedRows` 下降
   - `note_zh` 与 `name_zh` 补全率
   - 场景标签一致性
