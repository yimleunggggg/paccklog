# PackHacker 导入摘要（更新版）

## 多语策略
- 在线生成展示：前端展示层可按用户语言实时翻译/改写。
- 结构字段入库：CSV 保留结构化英文原文与中文摘要，不把多语版本写入同一结构列。
- 字段映射：`source_name -> source_title`，`source_url -> source_url_or_ref`，`author_name -> author_name`。

## 来源统计
| 来源 | 场景 | URL | Logo URL | 作者 | 条目数 | 品牌命中率估计 | 图片覆盖率估计 | 备注 |
|---|---|---|---|---|---:|---:|---:|---|
| Digital Nomad Packing List | 数字游民/远程办公 | https://www.packhacker.com/packing-list/digital-nomad/ | https://www.packhacker.com/favicon.ico | Pack Hacker | 118 | 100.0% | 0.0% | ok |
| Earth Friendly Sustainable Packing List | 可持续旅行 | https://www.packhacker.com/packing-list/earth-friendly-sustainable-packing-list/ | https://www.packhacker.com/favicon.ico | Pack Hacker | 75 | 100.0% | 0.0% | ok |
| Road Trip Packing List | 公路旅行 | https://www.packhacker.com/packing-list/road-trip-essentials/ | https://www.packhacker.com/favicon.ico | Pack Hacker | 70 | 100.0% | 0.0% | ok |
| Pack Hacker User List: lance939085 | 社区清单 | https://app.packhacker.com/u/lance939085 | https://app.packhacker.com/favicon.ico | lance939085 | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| Pack Hacker User List: james-glennie | 社区清单 | https://app.packhacker.com/u/james-glennie | https://app.packhacker.com/favicon.ico | james-glennie | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| Pack Hacker User List: jonathan1331022 | 社区清单 | https://app.packhacker.com/u/jonathan1331022 | https://app.packhacker.com/favicon.ico | jonathan1331022 | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| Pack Hacker User List: rachel-somers | 社区清单 | https://app.packhacker.com/u/rachel-somers | https://app.packhacker.com/favicon.ico | rachel-somers | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| Pack Hacker User List: guido1118454 | 社区清单 | https://app.packhacker.com/u/guido1118454 | https://app.packhacker.com/favicon.ico | guido1118454 | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| Pack Hacker User List: andre-calil | 社区清单 | https://app.packhacker.com/u/andre-calil | https://app.packhacker.com/favicon.ico | andre-calil | 1 | 0.0% | 0.0% | blocked_dynamic_no_public_items |
| REI Travel Checklist | 旅行通用 | https://www.rei.com/learn/expert-advice/travel-checklist.html | https://www.rei.com/favicon.ico | REI Co-op | 1 | 0.0% | 0.0% | source_level_seed |
| Wirecutter Travel Packing List | 旅行通用 | https://www.nytimes.com/wirecutter/reviews/travel-packing-list/ | https://www.nytimes.com/favicon.ico | Wirecutter | 1 | 0.0% | 0.0% | source_level_seed |
| Rick Steves Packing Light | 欧洲轻装 | https://www.ricksteves.com/travel-tips/packing-light/packing-smart | https://www.ricksteves.com/favicon.ico | Rick Steves | 1 | 0.0% | 0.0% | source_level_seed |
| Lonely Planet Packing List | 旅行通用 | https://www.lonelyplanet.com/articles/ultimate-travel-packing-list | https://www.lonelyplanet.com/favicon.ico | Lonely Planet | 1 | 0.0% | 0.0% | source_level_seed |
| The Points Guy Travel Checklist | 航旅场景 | https://thepointsguy.com/guide/travel-checklist/ | https://thepointsguy.com/favicon.ico | The Points Guy | 1 | 0.0% | 0.0% | source_level_seed |
| Nomadic Matt Packing List | 背包客 | https://www.nomadicmatt.com/travel-blogs/my-ultimate-travel-packing-list/ | https://www.nomadicmatt.com/favicon.ico | Nomadic Matt | 1 | 0.0% | 0.0% | source_level_seed |
| Sleeping in Airports Checklist | 机场过夜/转机 | https://www.sleepinginairports.net/packing-list/ | https://www.sleepinginairports.net/favicon.ico | Sleeping in Airports | 1 | 0.0% | 0.0% | source_level_seed |
| Travel + Leisure Carry-on List | 随身行李 | https://www.travelandleisure.com/style/travel-bags/carry-on-packing-list | https://www.travelandleisure.com/favicon.ico | Travel + Leisure | 1 | 0.0% | 0.0% | source_level_seed |
| AFAR Packing List | 旅行通用 | https://www.afar.com/magazine/the-only-packing-list-you-need | https://www.afar.com/favicon.ico | AFAR | 1 | 0.0% | 0.0% | source_level_seed |
| CDC Travel Checklist | 健康与安全 | https://wwwnc.cdc.gov/travel/page/checklist | https://wwwnc.cdc.gov/favicon.ico | CDC | 1 | 0.0% | 0.0% | source_level_seed |
| UK GOV Foreign Travel Checklist | 政务核查 | https://www.gov.uk/guidance/foreign-travel-checklist | https://www.gov.uk/favicon.ico | UK Government | 1 | 0.0% | 0.0% | source_level_seed |
| Australia Smartraveller Checklist | 政务核查 | https://www.smartraveller.gov.au/before-you-go/the-basics/checklist | https://www.smartraveller.gov.au/favicon.ico | Australian Government | 1 | 0.0% | 0.0% | source_level_seed |

## 新增公开来源（12）按场景切分
### 旅行通用
- https://www.rei.com/learn/expert-advice/travel-checklist.html
- https://www.nytimes.com/wirecutter/reviews/travel-packing-list/
- https://www.lonelyplanet.com/articles/ultimate-travel-packing-list
- https://www.afar.com/magazine/the-only-packing-list-you-need
### 轻装/背包/随身
- https://www.ricksteves.com/travel-tips/packing-light/packing-smart
- https://www.nomadicmatt.com/travel-blogs/my-ultimate-travel-packing-list/
- https://www.travelandleisure.com/style/travel-bags/carry-on-packing-list
### 航旅/机场
- https://thepointsguy.com/guide/travel-checklist/
- https://www.sleepinginairports.net/packing-list/
### 健康与政务核查
- https://wwwnc.cdc.gov/travel/page/checklist
- https://www.gov.uk/guidance/foreign-travel-checklist
- https://www.smartraveller.gov.au/before-you-go/the-basics/checklist

## 未解决阻塞
- `app.packhacker.com` 用户页为动态渲染，当前环境未连接 Chrome CDP，无法完成条目级抓取。
- 模板表头不含 `image_url` 列：已在摘要提供 logo URL 与图片覆盖率估算。