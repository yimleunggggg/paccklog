# 社区清单导入后 QC（2026-04-23）

## 结论

- 本次目标模板：14 个（PackHacker 3 + REI 11），已全部入库。
- 数据量：CSV 共 526 条；远端入库核对共 386 条。
- 多语覆盖（CSV侧，可选增强层）：name_zh 缺失 526，note_zh 缺失 526。
- 价格线索覆盖（CSV侧）：81/526（15.4%）。
- 阻塞来源行（主要 REI 抓取受限）：0/526。

## 前端可见性验收（静态）

- `explore/page.tsx` 已查询 `community_templates` 全量并按 `created_at` 排序，无 `is_system=true` 限制。
- 查询已包含 `community_template_items` 的 `name_zh/name_en/note_zh/note_en/tags_zh/tags_en/image_url` 字段。
- 查询已联表 `community_item_price_refs` 并回填 `price_ref` 给前端卡片/抽屉。
- 结论：新导入模板应可直接在清单广场看到，且价格小标签可显示（有数据时）。

## 分模板明细

| 模板 slug | CSV 条目 | DB 条目 | name_zh 缺失 | note_zh 缺失 | 图片缺失 | 价格线索行 | 阻塞行 |
|---|---:|---:|---:|---:|---:|---:|---:|
| packhacker-digital-nomad | 118 | 116 | 118 | 118 | 118 | 28 | 0 |
| packhacker-road-trip-essentials | 70 | 68 | 70 | 70 | 70 | 20 | 0 |
| packhacker-sustainable-packing-list | 75 | 75 | 75 | 75 | 75 | 33 | 0 |
| rei-backcountry-ski-snowboard-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-backpacking-checklist | 15 | 12 | 15 | 15 | 15 | 0 | 0 |
| rei-camp-kitchen-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-canoe-multiday-touring-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-family-camping-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-festival-camping-checklist | 15 | 12 | 15 | 15 | 15 | 0 | 0 |
| rei-first-aid-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-kayak-day-touring-checklist | 28 | 12 | 28 | 28 | 28 | 0 | 0 |
| rei-snowshoe-checklist | 28 | 11 | 28 | 28 | 28 | 0 | 0 |
| rei-sup-checklist | 25 | 10 | 25 | 25 | 25 | 0 | 0 |
| rei-travel-preparation-checklist | 12 | 10 | 12 | 12 | 12 | 0 | 0 |

## 建议的下一步

- 优先补全 REI 来源：用浏览器态抓取（登录/CDP）替代 blocked 摘要数据。
- 保持按需翻译策略：不做全量补译入库，只对高频模板做可控缓存或人工优先回填。
- 对高频模板先补 `community_item_price_refs`，减少前端从 note 文本兜底解析。

> 生成时间：2026-04-23T09:22:38.739Z
