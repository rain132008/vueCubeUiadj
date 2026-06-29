# 详细设计

## 定位

项目用于验证和对比 `cube-ui` 的 `cube-scroll` 行为。真实 `cube-scroll` 是基准，手写 `compat-scroll` 是待验证对象。

## 技术栈

- Vue 2.7
- Webpack 5
- cube-ui
- BetterScroll 2
- Jest

## 模块划分

### 真实基准组件

页面直接使用 `cube-ui` 注册出来的 `<cube-scroll>`，通过相同数据和操作按钮观察旧组件行为。

### 手写兼容组件

`src/components/CompatScroll.vue` 对外模拟常见 `cube-scroll` 使用方式：

- props：`data`、`options`、`direction`、`probeType`、`pullUpLoad`、`pullDownRefresh`、`click`、`bounce`、`scrollbar`、`mouseWheel`、`eventPassthrough`、`freeScroll`、`scrollEvents`
- events：`scroll`、`scroll-end`、`before-scroll-start`、`pulling-up`、`pulling-down`
- methods：`refresh()`、`forceUpdate()`、`scrollTo()`、`scrollToElement()`、`getScroll()`、`getPullStatus()`、`enable()`、`disable()`、`finishPullDown()`、`openPullUp()`、`closePullUp()`、`resetPullUpTxt()`、`destroy()`
- 历史兼容：组件实例暴露 `scroll`，允许旧写法访问 `$refs.xxx.scroll.x`

### 框架无关逻辑

`src/compat/scroll/options.js` 负责将 cube-scroll 风格配置映射为 BetterScroll 配置。传入 `scrollEvents` 且包含 `scroll` 时，自动将 `probeType` 提升到 3，保证实时滚动事件语义。

`eventPassthrough` 会做冲突规避：

1. 横向滚动删除 `eventPassthrough: 'horizontal'`，避免把当前主滚动方向穿透掉。
2. 纵向滚动删除 `eventPassthrough: 'vertical'`，避免把当前主滚动方向穿透掉。
3. `freeScroll` 删除 `eventPassthrough`，避免双向自由滚动被事件穿透破坏。

`src/compat/scroll/pullState.js` 负责维护上拉和下拉状态，避免这些规则散落在 Vue 生命周期中。`getPullStateSnapshot()` 返回可序列化状态，用于 demo 面板和后续迁移对照。

## Demo 场景

当前 demo 分为三个对照区：

1. 纵向滚动：验证普通列表滚动、事件、`data` 自动刷新、`forceUpdate()` 和 ref 方法。
2. 下拉刷新：验证 `pullDownRefresh` 配置、`pulling-down` 事件和 `finishPullDown()`。
3. 横向滚动：验证 `direction="horizontal"`、`options.direction="horizontal"`、横向负坐标和 `scrollTo(-260, 0)`。
4. 历史实例：验证 `$refs.xxx.scroll.x/y/maxScrollY/scrollTo()`。
5. scrollbar / mouseWheel：验证滚动条 DOM 和实际滚轮输入。
6. eventPassthrough / 嵌套滚动：验证外层纵向、内层横向组合。
7. freeScroll：验证双向自由滚动坐标。

## 数据流

1. demo 页面维护列表数据和事件日志。
2. 真实 `cube-scroll` 和手写 `compat-scroll` 接收相似 props。
3. 用户点击按钮或滚动面板。
4. 组件发出滚动事件或执行 ref 方法。
5. demo 页面记录坐标、状态和事件日志。

## 错误兜底

- BetterScroll 未创建前调用方法时不抛错，返回安全默认值。
- `scrollToElement()` 找不到元素时直接返回。
- `forceUpdate()` 无论当前处于上拉还是下拉状态，都安全结束状态并刷新。
- 插件方法不存在时先检查函数存在，再调用。

## 样式规范

- 保留 `cube-scroll`、`cube-scroll-wrapper`、`cube-scroll-content` 类名。
- 不在滚动容器上使用 `overflow: auto`，避免双层滚动。
- demo 页面使用清晰的对照面板，方便人工验证。

## 后续扩展

MVP 完成后继续补齐：

- 上拉加载完整 noMore 语义。
- 下拉刷新阈值、停留距离和文案。
- 横向滚动完整场景。
- scrollbar、mouseWheel、eventPassthrough、freeScroll。
- keep-alive、图片加载后 refresh、组件卸载销毁。
