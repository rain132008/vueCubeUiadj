# 架构说明

## 根目录

- `package.json`：项目依赖、启动脚本、测试脚本和构建脚本。
- `webpack.config.js`：Webpack 入口、Vue 单文件组件处理、CSS 处理和开发服务器配置。
- `babel.config.js`：Babel 浏览器目标配置。
- `jest.config.js`：单元测试配置。
- `index.html`：Webpack HTML 模板。
- `README.md`：项目启动、构建、测试和当前范围说明。
- `proj.md`：高阶项目方案和当前路线。
- `design.md`：详细设计、模块边界、数据流和扩展方向。
- `implementPlan.md`：当前实施计划，只记录开发里程碑和后续步骤。
- `progress.md`：开发过程记录、验证结果和遗留问题。

## src

- `src/main.js`：Vue2 应用入口，只注册 `cube-ui/lib/scroll` 并挂载根组件。
- `src/App.vue`：应用壳，承载验证页面。
- `src/demos/CubeScrollCompareDemo.vue`：真实 `cube-scroll` 与手写 `compat-scroll` 的对照验证页面，包含纵向、下拉、横向、历史实例、scrollbar、mouseWheel、eventPassthrough 嵌套和 freeScroll 场景。
- `src/components/CompatScroll.vue`：手写 cube-scroll 兼容组件，负责 Vue2 外壳、BetterScroll 生命周期和 ref 方法。
- `src/compat/scroll/options.js`：cube-scroll 风格配置到 BetterScroll 配置的映射逻辑，包括 `scroll-events` 到 `probeType` 的兼容处理和 `eventPassthrough` 冲突规避。
- `src/compat/scroll/pullState.js`：上拉加载、下拉刷新状态管理逻辑，并提供 `getPullStateSnapshot()` 给 demo 和迁移验证读取状态。

## tests

- `tests/scrollOptions.spec.js`：滚动配置映射测试。
- `tests/pullState.spec.js`：上拉/下拉状态测试。

## 主流程和旧流程关系

真实 `cube-ui` 的 `<cube-scroll>` 只作为行为基准，不做二次封装。手写 `CompatScroll.vue` 是当前主开发对象，后续迁移 Vue3 时优先复用 `src/compat/scroll` 下的普通 JavaScript 逻辑，再重写 Vue3 外壳。
