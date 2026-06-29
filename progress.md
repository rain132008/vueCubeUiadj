# 开发进度

## 2026-06-29

### 已完成

- 确认项目方向：当前仓库用于 Vue2 + Webpack + cube-ui 行为验证和手写组件测试。
- 确认 `cube-scroll` 是第一个重点组件。
- 读取并理解外部 `cube-scroll Vue3 兼容组件独立开发交接说明`，将其作为行为契约参考，不直接照搬 Vue3/Vite 工程方案。
- 设计第一版 MVP：真实 `cube-scroll` 与手写 `compat-scroll` 并排对比。
- 初始化 Vue2/Webpack/cube-ui 工程。
- 建立可迁移的滚动配置映射和状态管理逻辑。
- 构建时发现 `import Cube from 'cube-ui'` 会触发 `module: src/index.js` 并要求处理 cube-ui 全量 stylus 源码，已调整为只注册 `cube-ui/lib/scroll` 构建产物。
- 浏览器烟测发现未开启下拉刷新时不应绑定 `pullingDown`，已改为只在对应插件配置启用时绑定事件。
- 实现 `CompatScroll.vue` MVP：接入 BetterScroll、基础事件、ref 方法、`data` 自动刷新、上拉/下拉状态骨架。
- 实现 `CubeScrollCompareDemo.vue`：真实 `cube-scroll` 与手写 `compat-scroll` 并排对比。
- `npm test` 通过：2 个测试套件，15 个测试。
- `npm run build` 通过：Webpack 5 生产构建成功。
- 浏览器烟测通过：`http://127.0.0.1:8080/` 页面渲染出 2 个滚动面板，控制台无 error。
- 浏览器交互验证通过：点击“追加数据”后列表项总数从 48 增加到 58，控制台无 error。
- 新增 `scroll-events` 兼容测试：传入 `['scroll', 'scroll-end']` 时自动将 `probeType` 提升到 3。
- 新增 `getPullStateSnapshot()`，并在手写组件上暴露 `getPullStatus()`，用于 demo 状态面板和后续迁移验证。
- 扩展 demo：纵向、下拉刷新、横向滚动共 6 个对照面板。
- 浏览器交互验证通过：点击 `forceUpdate(false)` 后，手写组件上拉状态展示为 `noMore`、`hasMore=false`。
- 浏览器交互验证通过：点击 `scrollTo(-260, 0)` 后，手写横向面板展示 `x=-260`，控制台无 error。
- 上一阶段最终验证：`npm test` 通过 2 个测试套件、17 个测试；`npm run build` 通过；常见中文乱码片段扫描未发现异常。
- 上一阶段浏览器验证：页面存在 6 个滚动对照面板、3 个真实 `cube-scroll`、3 个手写 `compat-scroll`；关键交互后控制台无 error。
- 新增 `eventPassthrough` 冲突规避：横向滚动删除 horizontal 穿透，纵向滚动删除 vertical 穿透，freeScroll 删除事件穿透。
- 新增专项验证区：历史 scroll 实例访问、scrollbar / mouseWheel、eventPassthrough 嵌套横向、freeScroll。
- 浏览器验证：历史 `scroll.scrollTo(0, -180)` 后可读取 `scroll.y=-180`。
- 浏览器验证：实际滚轮输入驱动 mouseWheel 面板到 `y=-420`，并检测到 `bscroll-vertical-scrollbar` 和 `bscroll-indicator`。
- 浏览器验证：eventPassthrough 嵌套横向滚动到 `x=-240`，控制台无 error。
- 浏览器验证：freeScroll 滚动到 `x=-180, y=-120`，控制台无 error。
- 本轮最终验证：`npm test` 通过 2 个测试套件、19 个测试；`npm run build` 通过；常见中文乱码片段扫描未发现异常。
- 本轮最终浏览器验证：页面存在 8 个滚动盒和 eventPassthrough 嵌套区；历史实例、scrollbar、freeScroll、嵌套横向关键交互后控制台无 error。
- 新增 `observeDOM/observeImage` 回归测试，确保动态内容和延迟图片场景默认可刷新。
- 新增 keep-alive 场景：离开、追加数据、返回后触发 activated/refresh；浏览器验证返回后显示 14 条。
- 新增图片加载后 refresh 场景：切换图片显示后读取到 `maxY=-509`，控制台无 error。
- 新增空列表 / 不足一屏场景：浏览器验证 `empty maxY=0`、`short maxY=0`，控制台无 error。
- 新增组件卸载销毁场景：v-if 销毁后重建，浏览器验证重新读取到 `instance=true`。
- 本轮最终验证：`npm test` 通过 2 个测试套件、20 个测试；`npm run build` 通过；常见中文乱码片段扫描未发现异常。
- 本轮最终浏览器验证：keep-alive 返回后 14 条、图片显示后 `maxY=-509`、空/短列表 `maxY=0`、销毁重建后 `instance=true`，控制台无 error。

### 遗留问题

- 需要逐步确认 BetterScroll 2 插件方法和 cube-ui 旧行为之间的差异。
- 需要继续补齐完整上拉触底自动化验证、下拉阈值细节、目标迁移目录结构和 Vue3 外壳迁移验证。
