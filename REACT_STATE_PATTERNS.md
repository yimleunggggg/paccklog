# React 状态模式约定（LOADOUT）

这份约定用于避免 UI 状态错乱和 `eslint react-hooks/set-state-in-effect` 报错，适用于 `src/components` 下所有前端组件。

## 1) 禁止：在 `useEffect` 里同步 setState

### 反例

- `useEffect(() => setLocal(items), [items])`
- `useEffect(() => setSelected(prev => ...), [items])`

这类写法会触发级联渲染，并且容易造成状态不同步。

## 2) 推荐模式

### A. 派生值优先（首选）

当某个状态可以由其它状态计算出来时，不要额外存一份本地 state。

- 用 `useMemo` 派生：如 `validSelectedIds`
- UI 展示、提交参数都走派生值

### B. 一次性初始化用 lazy initializer

对于 `localStorage`、`URL params` 等初始化值：

- `useState(() => initialValue)` 初始化一次
- 后续变化用 effect 做“副作用同步”（写 storage），不要反向 setState

### C. 组件重建替代“同步覆盖”

当父级数据变化后需要重置子组件局部状态：

- 在子组件调用处设置稳定且有语义的 `key`
- 通过重建组件重置内部 state，而不是 effect 强行覆盖

## 3) 本项目已落地示例

- `src/components/sortable-trip-group.tsx`
  - 去掉了 effect 同步 state
  - 用 `validSelectedIds` 派生有效选中项
- `src/components/trip-container-groups.tsx`
  - `openGroup` 使用 lazy init
  - 使用 `activeOpenGroup` 兜底并仅同步 `localStorage`

## 4) 代码评审检查清单

- 是否出现 `useEffect + setState` 的同步覆盖？
- 是否能改为 `useMemo` 派生值？
- 是否应使用 lazy init 初始化外部状态？
- 父数据变化导致子状态重置时，是否可用 `key` 重建解决？

## 5) 必跑检查

- 提交前至少运行：

```bash
npx eslint src/components
```

若出现 `react-hooks/set-state-in-effect`，优先按本约定改写，而不是忽略规则。
