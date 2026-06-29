# 项目方案

本项目是 Vue2 + Webpack + cube-ui 的独立验证沙盒，用于在升级 Vue3 前确认 `cube-scroll` 的真实行为，并测试手写兼容组件。

当前路线：

1. 先搭建 Vue2/Webpack/cube-ui 基准环境。
2. 在同一页面中并排展示真实 `cube-scroll` 和手写 `compat-scroll`。
3. 将可复用逻辑拆为普通 JavaScript，降低后续迁移 Vue3 的成本。
4. 逐步补齐 `cube-scroll` 的滚动、上拉、下拉、横向、滚轮、滚动条、嵌套滚动等验证场景。

项目不接入公司源码，不接入 AUI，不承载真实业务改造。
