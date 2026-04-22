# PACKLOG · 物品条目设计规范
# 适用：行李清单页 + 装备仓库页
# 原则：同一数据表，两个视图，样式尽量统一

---

## 0) 与现有固定组件对齐（本次确认版）

以下是和当前项目已落地规范的对齐结论，避免与既有实现冲突：

### 保留不改（已固定）
- 品牌库与品牌选择器交互（分类分组 + 搜索 + 可手输）不改
- 全局筛选控件基线规范不改：`chip=32px`、输入/下拉触发器 `40px`
- 筛选区三态提示不改：默认 / 有结果 / 无结果，统一 `11px`
- 装备库筛选保留“筛选/清空”按钮（已做无刷新，不再整页闪烁）
- 顶部右上角图标头部（地球 + 人像）不改

### 可微调（本次允许）
- 物品行密度、间距、标签细节可继续微调
- 行操作区（编辑/删除/拖动）保持图标化小按钮风格统一
- 文案可统一为更直白动作词（如“切换为紧凑/详细”）

### 不采用（与已定规范冲突）
- 不采用“去掉筛选/清空按钮，改内嵌图标搜索”的方案
- 不回退为旧的文字大按钮/大白框操作区
- 不新增与现有品牌选择器并行的第二套下拉规范

---

## 一、物品行样式（两个页面尽量一致）

```
不用白色卡片，不用圆角卡片，不用阴影
透明背景 + border-bottom 分割线
```

```css
.item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 0;
  background: transparent;         /* 透明，不是白色 */
  border: none;                     /* 无卡片边框 */
  border-bottom: 0.5px solid var(--paper2);
  border-radius: 0;
  cursor: pointer;
  transition: opacity 0.18s;
}
.item:last-child { border-bottom: none; }

/* 已打包状态（行李清单） */
.item.packed {
  opacity: 0.35;
}
.item.packed .item-name {
  text-decoration: line-through;
  text-decoration-color: var(--ink4);
}
```

### 勾选圆
```css
.item-check {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 1px solid var(--paper3);
  background: transparent;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.item-check.checked {
  background: var(--forest2);   /* #3A5C33 */
  border-color: var(--forest2);
}
/* 勾号用 ::after 伪元素画，不用 emoji 或图片 */
.item-check.checked::after {
  content: '';
  width: 4px; height: 7px;
  border: 1.5px solid #FEFCF8;
  border-top: none; border-left: none;
  transform: rotate(45deg) translate(-0.5px, -1px);
}
```

**行李清单**：点击整行切换打包状态（勾选圆变绿 + opacity降）
**装备仓库**：勾选圆表示"已拥有"（绿色）vs "愿望清单"（空心），点击切换

### 物品内容区
```
物品名       DM Sans 400，13.5px，--ink
品牌         EB Garamond italic，12px，--ink3（如 Salomon / Arc'teryx）
备注         DM Sans 400，11px，--ink3，line-height 1.45
行程备注     DM Sans 400，10px，--forest3，前缀"本次"（仅行李清单显示）
标签行       margin-top: 6px
```

### 状态标签（itag）
```css
.itag {
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'DM Sans', sans-serif;
}

/* 行李清单状态 */
.t-must    { background: #E8F2E4; color: #3A5C33; }  /* 必带 */
.t-buy     { background: #F5ECD8; color: #9B6A2A; }  /* 待购买 */
.t-opt     { background: #E8E3D8; color: #8C8880; }  /* 可选 */

/* 装备仓库状态 */
.t-owned   { background: #E8F2E4; color: #3A5C33; }  /* 已有 */
.t-wish    { background: #F5ECD8; color: #9B6A2A; }  /* 愿望清单 */

/* 容器标签（行李清单专用） */
.t-bag     { background: #E8E3D8; color: #4A4840; }
```

### 使用次数（装备仓库专用）
```
位置：物品行右侧，替代"编辑"按钮的默认显示
格式：× 7（EB Garamond italic，12px，--ink4）
hover 时变为编辑图标（铅笔 SVG）
```

### 编辑按钮
```
位置：物品行最右侧
样式：图标化小按钮（当前统一为 30x30，图标16px，默认透明底，hover浅底）
点击：打开底部抽屉（bottom sheet），不在行内展开
删除：长按或在抽屉内操作，不在行内常驻显示
禁止：上下箭头排序按钮常驻显示（改为长按拖拽排序）
```

---

## 二、分区 Section Header（两个页面完全一致）

```css
.sec-hd {
  display: flex;
  align-items: center;
  padding: 12px 0 7px;
  border-bottom: 0.5px solid var(--paper2);
  cursor: pointer;
  user-select: none;
}
```

```
序号    EB Garamond italic，10px，--ink4（"01" "02"）
分类名  DM Sans 500，9px，UPPERCASE，letter-spacing .12em，--ink2
件数    EB Garamond italic，12px，--ink4，右对齐
箭头    9px SVG，--ink4，点击折叠/展开
```

**行李清单**：分类名用中文（证件、鞋履、衣物…）
**装备仓库**：分类名用中英双语（CAMPING 露营 / ELECTRONICS 电子）

---

## 三、完整物品结构示意

```
行李清单物品行：
[勾选圆] 护照                          [编辑图标]
         凤乐石 / KAIRAS（品牌斜体）
         PADI/SSI 电子版也可（备注）
         本次：出境证件，务必随身（行程备注，绿色）
         [必带] [随身]

装备仓库物品行：
[绿勾圆] 帐篷（2-3人）                  × 3（使用次数）
         MSR / Big Agnes
         早到选好位置
         [已拥有] [露营]
```

---

## 四、快速添加（两个页面统一）

```
行李清单快速添加：
[输入框：添加物品 —] [从仓库选入] [添加]

装备仓库快速添加：
[输入框：添加装备 —] [添加]
```

**规则：**
- 输入名称 → 回车 → 直接添加
- 默认状态：行李清单=必带；装备仓库=已拥有
- 分类默认：最近使用的分类，或"其他"
- 其他字段可以添加后在编辑抽屉里补充

---

## 五、编辑底部抽屉（bottom sheet）

**触发**：点击物品行右侧编辑图标

**布局（从上到下）**：
```
─────────────────────── （顶部拖拽条，4px灰线）

物品名称
[________________]      大字输入框，字号16px

品牌（选填）
[________________]      EB Garamond italic placeholder

备注（选填）
[________________]      通用说明，如"GTX防水款"

行程备注（仅行李清单显示）
[________________]      本次行程专属说明

分类
[证件] [鞋履] [衣物] [背包] [户外] [日用] [数码] ...  胶囊多选，单选

── 行李清单专有 ──────────────────────────────
状态
[必带] [待购买] [可选]                              胶囊单选

容器
[托运箱] [背包] [随身] [穿戴]                      胶囊单选

保存到装备仓库  ○ （toggle）

── 装备仓库专有 ──────────────────────────────
状态
[已拥有] [愿望清单]                                 胶囊单选

────────────────────────────────────────────
[删除]                              [保存]
```

**样式规范：**
- 抽屉背景：var(--cream) #FEFCF8
- 输入框：border .5px solid var(--paper3)，border-radius 9px，padding 10px 13px
- 胶囊状态选择：默认 var(--cream) + var(--paper3) border；选中 var(--forest) + 白色文字
- 保存按钮：全宽，var(--forest) 背景，border-radius 10px，EB Garamond italic 16px
- 删除按钮：文字链接样式，color #C0392B，11px，左对齐

---

## 六、装备仓库特有规范

### 页面顶部筛选（两排）
```
第一排（状态）：全部 / 已拥有 / 愿望清单
第二排（分类）：全部 / 衣物 / 鞋袜 / 电子 / 洗漱 / 证件 / 食品补给 / 露营 / 急救 / 其他
第二排允许换行，保持紧凑间距（遵循全局 chip 高度 32px）
```

### 搜索框
```
保留关键词输入 + 筛选/清空按钮（与现有无刷新筛选逻辑一致）
- placeholder: 品牌关键词（可按页面文案微调）
- 筛选与清空按钮使用统一交互控件规范（12px 按钮字级）
- 下方必须显示三态提示：默认/有结果/无结果（11px）
```

### 件数统计
```
分区标题下方不需要，在页面顶部用一行小字：
"共 XX 件装备 · 已拥有 XX · 愿望清单 XX"
字号 10px，--ink4
```

---

## 七、给 Cursor 的修复优先级

**P0 立即改（影响可用性）：**
1. 行李清单物品行：去掉白色卡片，改为透明底+底线
2. 去掉物品行的上下箭头排序按钮（常驻显示）
3. 状态标签颜色改为规范值（去掉黑色实心）
4. 装备仓库：筛选区保持无刷新，补齐并统一三态提示文案与样式

**P1 （提升体验）：**
5. 编辑交互改为底部抽屉，去掉行内展开弹层
6. 装备仓库勾选圆改为绿色表示"已拥有"，空心表示"愿望清单"
7. 使用次数显示（"× 3"）替代常驻"编辑"文字按钮
8. items 表添加 trip_note 字段，编辑抽屉中加入"行程备注"输入框

**P2 ：**
9. 长按拖拽排序（替代上下箭头）
10. 从行李清单一键同步到装备仓库
11. 装备仓库使用次数自动统计

