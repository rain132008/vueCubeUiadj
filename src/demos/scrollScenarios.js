export const scrollScenarios = [
  {
    id: 'scenario-vertical',
    title: '纵向滚动与基础事件',
    description: '对比真实 cube-scroll 和手写 compat-scroll 的纵向滚动、scroll、scroll-end、before-scroll-start、data 自动刷新。',
    checks: ['追加数据', '滚动到 -300', '读取坐标', 'forceUpdate']
  },
  {
    id: 'scenario-pulldown',
    title: '下拉刷新',
    description: '验证 pullDownRefresh、pulling-down、finishPullDown 和刷新后列表更新。',
    checks: ['下拉触发', '刷新结束', '状态文案']
  },
  {
    id: 'scenario-horizontal',
    title: '横向滚动',
    description: '验证 direction="horizontal"、options.direction、横向负坐标和 maxScrollX。',
    checks: ['真实横向', '手写横向', 'scrollTo(-260, 0)']
  },
  {
    id: 'scenario-legacy',
    title: '历史实例与方法',
    description: '验证历史代码直接访问 $refs.xxx.scroll 以及 scrollTo、getScroll、enable、disable 等方法。',
    checks: ['$refs.scroll', 'scrollToElement', 'disable/enable', 'open/close pullUp']
  },
  {
    id: 'scenario-wheel-free',
    title: '滚轮、滚动条与自由滚动',
    description: '验证 scrollbar、mouseWheel、freeScroll 的滚动坐标和滚动条 DOM。',
    checks: ['mouseWheel', 'scrollbar', 'freeScroll x/y']
  },
  {
    id: 'scenario-nested',
    title: '事件穿透与嵌套滚动',
    description: '验证外层纵向滚动、内层横向滚动和 eventPassthrough 的组合。',
    checks: ['eventPassthrough', '内层横向', '外层纵向']
  },
  {
    id: 'scenario-lifecycle',
    title: '生命周期与动态内容',
    description: '验证 keep-alive activated、图片加载后 refresh、observeDOM 和 observeImage。',
    checks: ['keep-alive', '图片加载', 'refresh']
  },
  {
    id: 'scenario-edge',
    title: '边界与销毁',
    description: '验证空列表、不足一屏、组件销毁和重建后实例恢复。',
    checks: ['空列表', '不足一屏', 'v-if 销毁重建']
  }
]
