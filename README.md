# cube-scroll 验证沙盒

这是一个 Vue2 + Webpack + cube-ui 的独立验证项目，用于对比真实 `cube-scroll` 行为，并测试手写 `compat-scroll` 组件。

## 目标

- 引入真实 `cube-ui`，保留一个行为基准。
- 只注册 `cube-ui/lib/scroll`，避免为了单个滚动组件引入整包 stylus 编译链。
- 在同一页面验证手写 `compat-scroll` 的 props、events、methods 和状态表现。
- 尽量把滚动配置、上拉/下拉状态等逻辑写成普通 JavaScript，方便后续迁移到 Vue3。

## 启动

```powershell
npm install
npm run dev
```

默认地址：

```text
http://127.0.0.1:8080
```

## 验证

```powershell
npm test
npm run build
```

当前验证结果：

- `npm test` 通过。
- `npm run build` 通过。
- `npm run dev` 已在 `http://127.0.0.1:8080/` 启动。
- 默认进入场景入口页，8 个场景卡片可逐项进入对应测试区。
- 浏览器烟测通过：页面存在纵向、下拉刷新、横向滚动共 6 个对照面板，控制台无 error。
- 点击“追加数据”后两侧纵向列表同步增加，控制台无 error。
- 点击 `forceUpdate(false)` 后，手写组件上拉状态进入 `noMore`。
- 点击 `scrollTo(-260, 0)` 后，手写横向面板坐标变为 `x=-260`。
- 实际滚轮输入可驱动 mouseWheel 面板滚动，滚动条 DOM 存在。
- eventPassthrough 嵌套横向面板可滚动到 `x=-240`。
- freeScroll 面板可滚动到 `x=-180, y=-120`。
- keep-alive 场景可离开、追加数据、返回后触发 activated/refresh。
- 图片延迟显示后可刷新并读到新的 `maxScrollY`。
- 空列表 / 不足一屏不会报错。
- v-if 销毁后重建可重新获得 BetterScroll 实例。

## 当前范围

第一版聚焦 MVP：

- 真实 `cube-scroll` 与手写 `compat-scroll` 并排对比。
- 普通纵向滚动。
- `data` 变化后自动 `refresh()`。
- `scroll`、`scroll-end`、`before-scroll-start` 事件。
- `refresh()`、`forceUpdate()`、`scrollTo()`、`scrollToElement()`、`getScroll()`、`enable()`、`disable()`。
- `getPullStatus()` 用于 demo 和迁移验证读取内部上拉/下拉状态。
- `pullUpLoad`、`pullDownRefresh` 状态骨架。
- `pullDownRefresh` 已补齐 cube-ui 风格下拉层：下拉 bubble 拉伸、loading、成功文案停留和回弹后隐藏。
- `direction="horizontal"` 与 `options.direction="horizontal"` 的配置映射。
- 下拉刷新和横向滚动已经有基础对照面板。
- `eventPassthrough` 会规避与当前滚动方向冲突的组合：横向滚动不会保留 `horizontal` 穿透，纵向滚动不会保留 `vertical` 穿透，`freeScroll` 不保留事件穿透。
- 已增加历史 `this.$refs.xxx.scroll` 直接访问、scrollbar、mouseWheel、eventPassthrough 嵌套横向和 freeScroll 专项验证区。
- 已增加 keep-alive、图片加载后 refresh、空列表、不足一屏、组件卸载销毁验证区。
- 已增加场景入口页，点击场景后进入完整测试页并滚动到对应区域。
- 已按移动端验收场景优化入口页和测试页：手机宽度下单列布局、按钮触控高度不低于 44px，横向滚动场景保留内部横向可滚动但不撑破整页。
- 已新增 `docs/compat-scroll-ai-handoff.md`，用于后续公司内部 AI 或开发者接手 `CompatScroll`。

后续会逐步补齐完整上拉触底自动化验证、下拉阈值细节、目标目录结构整理和 Vue3 迁移外壳。
