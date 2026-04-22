# REI 场景重构建议

## 建议新增场景

- `festival-camping`：与通用 `family-camping` 的行为模式不同，补给频率高、噪音环境强、票证/人流管理刚需。
- `camp-kitchen`：厨房装备在多条露营清单中高频复用，适合沉淀为跨场景子模板。
- `first-aid-kit`：建议独立为横向能力场景，供徒步/水上/雪地复用。
- `travel-preparation-timeline`：偏任务编排，不是装备清单，应单独建“出发前流程”场景。
- `avalanche-terrain`：用于 backcountry ski/snowboard，强调雪崩三件套与雪地风险控制。

## 建议合并场景

- `sup-day-tour` 与 `kayak-day-touring`：可并入 `paddle-day-touring` 主场景，通过 `craft_type` 区分 SUP/Kayak/Canoe。
- `canoe-multiday-touring` 与 `backpacking-overnight`：在“多日远离补给”维度共享大量模块（补水、修理、应急），建议共享上层模块但保留交通载体差异子场景。

## 建议改名

- `family-camping` -> `frontcountry-car-camping`：更准确覆盖非家庭用户。
- `snowshoe` -> `winter-dayhike-snowshoe`：强调日间雪地徒步定位。
- `backpacking` -> `backpacking-overnight-wilderness`：便于与 day-hike、travel-prep 分层。

## 标签映射建议（用于 scenes）

- backpacking-checklist: `backpacking`, `wilderness`, `overnight`, `ten-essentials`
- festival-camping-checklist: `festival-camping`, `car-camping`, `crowd-logistics`, `sun-exposure`
- family-camping-checklist: `frontcountry-car-camping`, `camp-setup`, `group-camp`
- camp-kitchen-checklist: `camp-kitchen`, `camp-cooking`, `food-storage`, `camp-cleanup`
- first-aid-checklist: `first-aid-kit`, `medical-preparedness`, `risk-management`
- stand-up-paddleboarding-sup-checklist: `paddle-day-touring`, `sup`, `flatwater`, `pfd-required`
- kayak-day-touring-checklist: `paddle-day-touring`, `kayak`, `flatwater`, `navigation-on-water`
- canoe-multiday-touring-checklist: `paddle-expedition`, `canoe`, `multiday`, `boat-packing`
- backcountry-skiing-snowboarding-checklist: `backcountry-ski`, `snowboard`, `avalanche-terrain`, `winter-backcountry`
- snowshoe-checklist: `winter-dayhike-snowshoe`, `snow-travel`, `cold-weather-layering`
- travel-preparation-checklist: `travel-prep`, `timeline-checklist`, `departure-readiness`