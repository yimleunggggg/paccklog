# 行前志 TRIPLOG — Design Specification
> 给 Cursor 的前端设计规范文档  
> Version: v3.0 · 风格定义：Kinfolk杂志 × 日本户外品牌目录 × 无印良品

---

## 一、产品定位与设计语言

**产品名称**：行前志 · TRIPLOG  
**核心感觉**：克制、有温度、像一本精装旅行手账  
**设计参考**：Kinfolk 杂志、Ciele 品牌、Arc'teryx 产品目录、无印良品 UI  
**禁止出现**：紫色渐变、蓝色科技感、AI默认配色（蓝/灰/白三色体系）、过多圆角卡片堆叠

---

## 二、颜色系统（必须严格使用，不可随意添加颜色）

```css
:root {
  /* 背景纸感色 */
  --paper:   #F4F1EC;   /* 页面背景，暖白偏米 */
  --paper2:  #EDE8DF;   /* 分割线、悬停背景 */
  --paper3:  #D8D0C4;   /* 边框、描边 */

  /* 核心绿色系（品牌主色） */
  --forest:  #243D1F;   /* 最深，用于 hero card 背景、主按钮背景 */
  --forest2: #3A5C33;   /* 已完成状态、强调色 */
  --forest3: #6B9460;   /* 辅助绿、标签文字 */
  --forest4: #B8D4AD;   /* 浅绿边框 */
  --forest5: #E8F2E4;   /* 极浅绿背景（必带标签底色） */

  /* 墨色（文字层级） */
  --ink:  #1C1C18;      /* 主文字 */
  --ink2: #4A4840;      /* 次级文字 */
  --ink3: #8C8880;      /* 辅助文字、placeholder */
  --ink4: #B8B4AC;      /* 最弱，分割线文字 */

  /* 琥珀色（警示/待购买） */
  --amber:  #9B6A2A;
  --amberL: #F5ECD8;

  /* 纯白（卡片、输入框底色） */
  --white: #FEFCF8;     /* 注意：不是纯白，是带暖调的白 */
}
```

**使用原则**：
- 背景永远是 `--paper`，绝对不用纯白 `#FFFFFF` 做页面背景
- 主按钮：`--forest` 背景 + `#FEFCF8` 文字
- 边框统一用 `.5px solid var(--paper3)`，不用 `1px`
- 不引入任何蓝色、紫色

---

## 三、字体系统（核心视觉来源）

```css
/* Google Fonts 引入 */
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
```

| 用途 | 字体 | 样式 |
|------|------|------|
| 大标题、数字、引言 | EB Garamond | font-style: italic，weight 400 |
| 正文、按钮、标签 | DM Sans | weight 400/500 |
| 章节序号（01 02…） | EB Garamond | italic，color: --ink4 |
| 品牌名/备注 | EB Garamond | italic，color: --ink3 |

**字号规则**：
- Hero 大标题：28–32px，EB Garamond italic
- 页面二级标题：不用，用 uppercase letter-spacing 代替
- 正文物品名：13.5px，DM Sans 400
- 标签/徽章：9–10px，DM Sans 500，letter-spacing: .04em，UPPERCASE
- 辅助说明：11–12px，DM Sans 400，color: --ink3

---

## 四、间距与圆角

```css
--border-radius: 12px;    /* 卡片、输入框、按钮 */
--border-radius-lg: 18px; /* Hero card、分享卡片 */
--border-radius-sm: 5px;  /* 小标签 tag */

/* 间距节奏 */
/* 组件内部：8px / 12px / 16px */
/* 组件之间：16px / 24px */
/* 页面边距：无（容器自带 max-width: 660px） */
```

---

## 五、核心组件规范

### 5.1 Hero Card（行程信息卡）
```
- 背景：var(--forest) 深绿
- 圆角：18px
- padding：28px 26px 24px
- 标题：EB Garamond italic，30px，color: #FEFCF8
- 眉题：9px，letter-spacing: .22em，UPPERCASE，color: var(--forest3)
- 眉题右侧跟一条 .5px 延伸线（::after 伪元素）
- 进度数字：EB Garamond italic，32px，白色
- 进度条：height 1.5px（极细），background rgba(255,255,255,.12)，fill color: var(--forest3)
- 行程标签 chip：border .5px solid rgba(255,255,255,.15)，font-size 10px，color rgba(255,255,255,.65)
```

### 5.2 分区 Section Header
```
- 不用背景卡片，直接用 border-bottom: .5px solid var(--paper3) 分隔
- 左侧序号：EB Garamond italic，11px，color: --ink4（如 "01"）
- 序号右侧 margin-right: 12px
- 分区名：10px，DM Sans 500，letter-spacing: .14em，UPPERCASE，color: --ink2
- 右侧件数：EB Garamond italic，13px，color: --ink4
- 折叠箭头：10px SVG，stroke color: --ink4
```

### 5.3 物品行 Item Row
```
- 背景：透明（不是白色卡片！）
- 分隔：border-bottom: .5px solid var(--paper2)，最后一项不显示
- padding：13px 0 13px 2px
- 勾选圆：17px，border: 1px solid var(--paper3)；勾选后 background: var(--forest2)
- 物品名：13.5px，DM Sans 400，color: --ink
- 品牌备注：EB Garamond italic，12px，color: --ink3
- 说明文字：11px，DM Sans 400，color: --ink3，line-height: 1.5
- 已勾选：opacity .38，text-decoration line-through，color: --ink4
```

### 5.4 状态标签 Tag
```
必带：background var(--forest5)，color var(--forest2)，font-size 9px
待购买：background var(--amberL)，color var(--amber)，font-size 9px
可选：background var(--paper2)，color var(--ink3)，font-size 9px
容器标签：background var(--paper2)，color var(--ink3)，font-size 9px
border-radius: 4px；padding: 2px 7px；font-weight 500；letter-spacing .04em；UPPERCASE
```

### 5.5 提示横幅 Notice
```
- background: var(--amberL)
- border-left: 2px solid var(--amber)（左侧强调线，border-radius: 0）
- border-radius: 12px（整体）
- font-size: 12px，color: #5C3D10，line-height: 1.6
```

### 5.6 筛选标签 Filter Tag
```
默认：background var(--white)，border .5px solid var(--paper3)，color var(--ink3)
激活：background var(--forest)，border-color var(--forest)，color #FEFCF8
border-radius: 20px；font-size 11px；padding 5px 14px；letter-spacing .02em
```

### 5.7 主按钮
```
background: var(--forest)
color: #FEFCF8
border-radius: 12px
font-family: DM Sans，font-size: 12–13px，font-weight: 500
padding: 10px 16px
无边框，无阴影
```

### 5.8 底部统计
```
- 4列 grid，gap: 8px
- 每格：background var(--white)，border .5px solid var(--paper3)，border-radius 12px，padding 14px 12px，text-align center
- 数字：EB Garamond italic，24px，color var(--forest)
- 标签：9px，DM Sans，UPPERCASE，letter-spacing .08em，color --ink4
```

---

## 六、分享卡片规范

```
外层容器：background var(--forest)，border-radius 18px，overflow hidden
支持比例：3:4（默认）/ 1:1 / 9:16，由用户切换
内部布局（flex column）：
  - 眉题行（同 Hero Card 眉题）
  - EB Garamond italic 大标题（两行）
  - 日期字符串：10px UPPERCASE，color rgba(255,255,255,.38)
  - Chip 标签行
  - .5px 分隔线（rgba(255,255,255,.1)）
  - 4列数字统计（border-left 分割）
  - .5px 分隔线
  - 分类列表（小圆点 + 分类名 + 件数）
  - flex: 1 撑满剩余空间
  - 底部：品牌名（EB Garamond italic，rgba(255,255,255,.25)）+ 二维码占位
```

---

## 七、交互行为

| 行为 | 效果 |
|------|------|
| 点击物品行 | 整行切换勾选状态，opacity 变 .38，划线 |
| 点击分区头部 | 展开/收起物品列表，箭头旋转90° |
| 筛选标签切换 | 重新渲染物品列表，动效 transition .15s |
| 进度更新 | 进度条宽度 transition .6s cubic-bezier(.4,0,.2,1) |
| 分享卡比例切换 | 卡片 width/aspect-ratio 变化，transition .3s |

---

## 八、绝对禁止事项（给 Cursor 的 hard rules）

1. ❌ 不用 Inter、Roboto、System-UI 字体
2. ❌ 不用任何渐变（gradient）
3. ❌ 不用 box-shadow（进度条聚焦环除外）
4. ❌ 不用蓝色、紫色
5. ❌ 物品行不用卡片（白底+边框），改用横线分割
6. ❌ 标签文字不用全角字符逗号，统一英文标点
7. ❌ 不用 emoji 做主要图标，SVG 线条图标代替（除行程标签 chip 外）
8. ❌ 不用纯白 `#FFFFFF` 做任何背景

---

## 九、如何使用本文档

1. 在 Cursor 项目根目录新建 `DESIGN_SPEC.md`，粘贴本文档
2. 在 `.cursorrules` 中添加：`Always refer to DESIGN_SPEC.md before writing any CSS or component styles.`
3. 每次让 Cursor 写 UI 组件，先提示：`参考 DESIGN_SPEC.md 中的规范实现以下组件：[组件名]`

