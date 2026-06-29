# CompatScroll 组件 AI 接手说明

## 目的

`CompatScroll` 是一个用于替代部分 `cube-ui` / `cube-scroll` 使用场景的兼容组件。当前仓库仍是 Vue2 + Webpack + cube-ui 的验证沙盒，真实 `cube-scroll` 只作为行为基准，手写 `CompatScroll` 是后续迁移到 Vue3 / AUI 时要继续演进的对象。

这份文档面向后续接手的 AI 或开发者。接手时优先读本文件，再读：

1. `src/components/CompatScroll.vue`
2. `src/compat/scroll/options.js`
3. `src/compat/scroll/pullState.js`
4. `src/demos/CubeScrollCompareDemo.vue`
5. `tests/scrollOptions.spec.js`
6. `tests/pullState.spec.js`
7. `tests/compatScrollPulldown.spec.js`

## 当前完成度

已经覆盖的能力：

- 基础纵向滚动。
- 横向滚动。
- `freeScroll` 双向自由滚动。
- `scrollbar`。
- `mouseWheel`。
- `eventPassthrough` 嵌套滚动场景。
- `data` 变化后自动 `refresh()`。
- `scroll`、`scroll-end`、`before-scroll-start` 事件。
- `pullUpLoad` 上拉加载状态。
- `pullDownRefresh` 下拉刷新状态。
- cube-ui 风格下拉 bubble、loading、成功文案停留、回弹隐藏。
- keep-alive 激活后刷新。
- observeDOM / observeImage 动态内容刷新。
- 空列表、不足一屏、组件销毁重建。
- 历史写法 `$refs.xxx.scroll` 直接访问。
- 移动端验收布局。

仍未完成的能力：

- 上拉触底、下拉阈值、横向滚动的自动化浏览器验证。
- Vue3 外壳。
- 目标迁移目录结构。
- 与真实 cube-ui 的全部边界行为逐项确认。

## 对外 API

### Props

组件对外模拟常见 `cube-scroll` 使用方式。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `Array` | 列表数据。变化后自动 `refresh()`。 |
| `options` | `Object` | cube-scroll 风格配置，内部映射成 BetterScroll 2 配置。 |
| `direction` | `String` | `vertical` 或 `horizontal`。 |
| `probeType` | `Number` | BetterScroll 滚动事件探测等级。监听实时 `scroll` 时会提升到 3。 |
| `pullUpLoad` | `Boolean/Object` | 上拉加载配置。也可放在 `options.pullUpLoad`。 |
| `pullDownRefresh` | `Boolean/Object` | 下拉刷新配置。也可放在 `options.pullDownRefresh`。 |
| `click` | `Boolean` | 是否允许点击。 |
| `bounce` | `Boolean/Object` | 回弹配置。 |
| `scrollbar` | `Boolean/Object` | 滚动条配置。 |
| `mouseWheel` | `Boolean/Object` | 鼠标滚轮配置。 |
| `eventPassthrough` | `String` | 事件穿透配置。会做冲突规避。 |
| `freeScroll` | `Boolean` | 是否启用双向自由滚动。 |
| `scrollEvents` | `Array` | 需要监听的滚动事件集合。包含 `scroll` 时自动开启实时探测。 |

### Events

| 名称 | 说明 |
| --- | --- |
| `scroll` | 滚动中触发，参数为 `{ x, y }`。 |
| `scroll-end` | 滚动结束触发，参数为 `{ x, y }`。 |
| `before-scroll-start` | 滚动开始前触发。 |
| `pulling-up` | 触发上拉加载。 |
| `pulling-down` | 触发下拉刷新。 |
| `refresh` | 执行 `refresh()` 后触发，用于 demo 和调试。 |

### Methods

| 名称 | 说明 |
| --- | --- |
| `refresh()` | 刷新 BetterScroll 尺寸。 |
| `forceUpdate(dirty)` | 结束上拉/下拉状态并刷新。`dirty === false` 表示没有更多数据。 |
| `scrollTo(x, y, time)` | 滚动到指定坐标。 |
| `scrollToElement(el, time)` | 滚动到指定元素。 |
| `getScroll()` | 返回当前坐标、最大滚动范围和内部实例。 |
| `getPullStatus()` | 返回上拉/下拉状态快照。 |
| `enable()` | 启用滚动。 |
| `disable()` | 禁用滚动。 |
| `finishPullDown()` | 结束下拉刷新流程。 |
| `openPullUp()` | 开启上拉加载。 |
| `closePullUp()` | 关闭上拉加载。 |
| `resetPullUpTxt()` | 重置上拉文案和 noMore 状态。 |
| `destroy()` | 销毁内部 BetterScroll 实例。 |

组件实例会暴露 `scroll`，用于兼容旧代码里的 `$refs.xxx.scroll.x`、`$refs.xxx.scroll.scrollTo()` 等写法。新代码优先使用封装方法。

## 配置映射规则

配置入口在 `src/compat/scroll/options.js`。

关键规则：

- `options.direction === 'horizontal'` 或 `direction === 'horizontal'` 时映射为 `scrollX: true, scrollY: false`。
- `freeScroll` 为 true 时映射为 `scrollX: true, scrollY: true, freeScroll: true`。
- `scrollEvents` 包含 `scroll` 时，`probeType` 至少为 3。
- 默认启用 `observeDOM: true` 和 `observeImage: true`，用于动态内容和图片加载后刷新。
- `pullUpLoad` 默认配置为 `{ threshold: 0 }`。
- `pullDownRefresh` 默认配置为 `{ threshold: 90, stop: 40, stopTime: 600 }`。
- `scrollbar` 默认配置为 `{ fade: true }`。
- `eventPassthrough` 会做冲突规避：
  - 横向滚动删除 `eventPassthrough: 'horizontal'`。
  - 纵向滚动删除 `eventPassthrough: 'vertical'`。
  - `freeScroll` 删除 `eventPassthrough`。

## 状态机

状态入口在 `src/compat/scroll/pullState.js`。

### 上拉加载

初始状态：

```text
pullUpOpen=true
hasMore=true
pullUpStatus=more
pullUpLoading=false
```

流程：

1. BetterScroll 触发 `pullingUp`。
2. `startPullingUp()` 把状态改为 `loading`。
3. 组件发出 `pulling-up`。
4. 业务追加数据后调用 `forceUpdate(true)`，回到 `more`。
5. 业务确认没有更多数据时调用 `forceUpdate(false)`，进入 `noMore`。

### 下拉刷新

初始状态：

```text
pullDownStatus=pulling
pullDownLoading=false
```

流程：

1. 用户向下拉动时，组件根据正向 `y` 更新 bubble 拉伸距离。
2. BetterScroll 触发 `pullingDown`。
3. `startPullingDown()` 把状态改为 `refreshing`。
4. 组件发出 `pulling-down`。
5. 业务更新数据后调用 `finishPullDown()` 或 `forceUpdate()`。
6. `finishPullDownState()` 把状态改为 `success`，显示成功文案。
7. 等待 `stopTime`，默认 600ms。
8. 调用 BetterScroll `finishPullDown()` 执行回弹。
9. 等待 `bounceTime` 后隐藏下拉层到负高度。
10. `resetPullDownState()` 把状态重置为 `pulling`。

注意：下拉刷新过程中，`data` watcher 会延后 `refresh()`，避免数据变化抢跑并打断回弹。

## 下拉刷新 DOM 结构

下拉层必须是 wrapper 的直接子节点，不能放进滚动内容流。

正确结构：

```text
.compat-scroll-wrapper
  .compat-scroll-content
    slot content
    .compat-scroll-pullup
  .compat-scroll-pulldown
    .compat-scroll-pulldown-wrapper
      .before-trigger
        canvas bubble
      .after-trigger
        loading / loaded
```

这样回弹到 `y=0` 后，下拉提示不会作为列表第一项占位。这个约束由 `tests/compatScrollPulldown.spec.js` 保护。

## Demo 验收入口

启动开发服务：

```powershell
npm run dev
```

默认访问：

```text
http://127.0.0.1:8080
```

页面先进入场景入口，点击场景卡片后进入完整测试页并滚动到对应验证区。

重点验收场景：

- 纵向滚动：确认真实 cube-scroll 和手写组件坐标、事件、数据追加一致。
- 下拉刷新：确认 bubble 拉伸、loading、成功文案、回弹隐藏。
- 横向滚动：确认 `scrollTo(-260, 0)` 后横向坐标为负数。
- 历史实例：确认 `$refs.xxx.scroll` 可读取和调用。
- scrollbar / mouseWheel：确认滚动条 DOM 存在，滚轮可驱动滚动。
- eventPassthrough 嵌套：确认外层纵向、内层横向互不阻断。
- freeScroll：确认 x/y 双向坐标变化。
- keep-alive：确认返回后触发 refresh。
- 图片加载：确认图片显示后高度刷新。
- 空/短列表：确认不报错、不循环触发上拉。
- 卸载销毁：确认重建后实例恢复。

## 自动化验证

当前命令：

```powershell
npm test
npm run build
```

现有测试覆盖：

- `tests/scrollOptions.spec.js`：配置映射、默认值、冲突规避。
- `tests/pullState.spec.js`：上拉/下拉状态机。
- `tests/scrollScenarios.spec.js`：验收入口场景清单。
- `tests/compatScrollPulldown.spec.js`：下拉层结构。

接手后如果改组件行为，必须至少跑：

```powershell
npm test
npm run build
```

如果改了中文文档或文案，还要按项目规范扫描典型中文乱码片段。扫描没有命中时，`rg` 退出码可能是 1，这是正常的。

## Vue3 迁移建议

迁移时不要直接照搬整个 `CompatScroll.vue`。建议分层处理：

1. 保留 `src/compat/scroll/options.js`，继续作为配置映射层。
2. 保留 `src/compat/scroll/pullState.js`，继续作为状态机。
3. 新建 Vue3 外壳，负责：
   - `ref` 替代 Vue2 `$refs` 生命周期访问。
   - `onMounted` / `onActivated` / `onBeforeUnmount` 管理 BetterScroll。
   - `defineExpose()` 暴露旧方法。
   - 事件用 `emit` 对齐现有名称。
4. 下拉 bubble 可以继续作为独立内部组件迁移。
5. 先让 Vue3 外壳跑同一套 demo 行为，再考虑进入业务项目替换。

## AI 接手提示词建议

后续让 AI 接手时，可以直接给下面这段上下文：

```text
当前项目是 Vue2 + Webpack + cube-ui 的 cube-scroll 行为验证沙盒。真实 cube-scroll 只作为对照，手写组件是 src/components/CompatScroll.vue。普通 JS 逻辑在 src/compat/scroll/options.js 和 src/compat/scroll/pullState.js，后续 Vue3 迁移应优先复用这两个文件。请先阅读 docs/compat-scroll-ai-handoff.md、design.md、architecture.md、progress.md，再修改代码。所有改动需要同步文档，并至少运行 npm test、npm run build。移动端是主要验收场景，注意按钮触控尺寸和页面不能整体横向溢出。
```

## 接手时不要做的事

- 不要把真实 `cube-scroll` 删除，它是当前行为基准。
- 不要把下拉刷新提示层放回 `.compat-scroll-content` 里。
- 不要为了某个场景直接改 BetterScroll 内部源码。
- 不要用字符串拼接粗暴处理配置，优先扩展 `options.js`。
- 不要把上拉/下拉状态散落到 demo 页面，优先扩展 `pullState.js`。
- 不要只按桌面宽度验收，移动端是主要场景。
- 不要跳过中文乱码扫描。
