import Vue from 'vue'
import CubeScroll from 'cube-ui/lib/scroll'
import 'cube-ui/lib/scroll/scroll.min.css'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(CubeScroll)

new Vue({
  render: h => h(App)
}).$mount('#app')
