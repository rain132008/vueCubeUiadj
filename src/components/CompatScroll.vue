<template>
  <div class="cube-scroll compat-scroll">
    <div ref="wrapper" class="cube-scroll-wrapper compat-scroll-wrapper">
      <div ref="content" class="cube-scroll-content compat-scroll-content" :class="contentClass">
        <div v-if="isPullDownVisible" class="compat-scroll-pulldown">
          {{ currentPullDownText }}
        </div>
        <slot />
        <div v-if="isPullUpVisible" class="compat-scroll-pullup">
          {{ currentPullUpText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * cube-scroll Vue2 验证用兼容组件
 *
 * 背景：
 * 当前项目先在 Vue2 + cube-ui 环境中验证真实 cube-scroll 行为，
 * 并用此组件测试手写兼容实现。组件内部尽量把规则拆到普通 JS，
 * 便于后续迁移到 Vue3 外壳。
 *
 * 注意：
 * 这是迁移兼容层，不是新的业务滚动组件。
 * 新代码优先使用 refresh()/scrollTo()/getScroll() 等封装方法，
 * 不建议继续直接访问内部 scroll 实例。
 */
import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import PullDown from '@better-scroll/pull-down'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import ObserveDOM from '@better-scroll/observe-dom'
import ObserveImage from '@better-scroll/observe-image'
import { buildBetterScrollOptions, getPullDownText, getPullUpText, hasEnabledConfig } from '@/compat/scroll/options'
import {
  closePullUpState,
  createPullState,
  finishPullDownState,
  forceUpdateState,
  getPullStateSnapshot,
  openPullUpState,
  resetPullUpState,
  startPullingDown,
  startPullingUp
} from '@/compat/scroll/pullState'

BScroll.use(PullUp)
BScroll.use(PullDown)
BScroll.use(ScrollBar)
BScroll.use(MouseWheel)
BScroll.use(ObserveDOM)
BScroll.use(ObserveImage)

export default {
  name: 'CompatScroll',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    },
    direction: {
      type: String,
      default: 'vertical'
    },
    probeType: {
      type: Number,
      default: 1
    },
    pullUpLoad: {
      type: [Boolean, Object],
      default: false
    },
    pullDownRefresh: {
      type: [Boolean, Object],
      default: false
    },
    click: {
      type: Boolean,
      default: false
    },
    bounce: {
      type: [Boolean, Object],
      default: true
    },
    scrollbar: {
      type: [Boolean, Object],
      default: false
    },
    mouseWheel: {
      type: [Boolean, Object],
      default: false
    },
    eventPassthrough: {
      type: String,
      default: ''
    },
    freeScroll: {
      type: Boolean,
      default: false
    },
    scrollEvents: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      scroll: null,
      pullState: createPullState()
    }
  },
  computed: {
    resolvedOptions() {
      return buildBetterScrollOptions(this.$props)
    },
    contentClass() {
      return {
        'compat-scroll-content-horizontal': this.resolvedOptions.scrollX && !this.resolvedOptions.scrollY,
        'compat-scroll-content-free': this.resolvedOptions.freeScroll
      }
    },
    isPullUpVisible() {
      return hasEnabledConfig(this.resolvedOptions.pullUpLoad)
    },
    isPullDownVisible() {
      return hasEnabledConfig(this.resolvedOptions.pullDownRefresh)
    },
    pullUpTextConfig() {
      return getPullUpText(this.resolvedOptions.pullUpLoad)
    },
    currentPullUpText() {
      if (this.pullState.pullUpStatus === 'loading') {
        return this.pullUpTextConfig.loading
      }

      if (this.pullState.pullUpStatus === 'noMore') {
        return this.pullUpTextConfig.noMore
      }

      return this.pullUpTextConfig.more
    },
    currentPullDownText() {
      if (this.pullState.pullDownStatus === 'refreshing') {
        return '刷新中'
      }

      if (this.pullState.pullDownStatus === 'success') {
        return getPullDownText(this.resolvedOptions.pullDownRefresh)
      }

      return '下拉刷新'
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.refresh()
        })
      }
    },
    options: {
      deep: true,
      handler() {
        this.rebuild()
      }
    },
    direction() {
      this.rebuild()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initScroll()
    })
  },
  activated() {
    this.$nextTick(() => {
      this.refresh()
    })
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    initScroll() {
      if (!this.$refs.wrapper) {
        return
      }

      this.destroy()
      this.scroll = new BScroll(this.$refs.wrapper, this.resolvedOptions)
      this.bindScrollEvents()
      this.refresh()
    },
    bindScrollEvents() {
      if (!this.scroll) {
        return
      }

      this.scroll.on('scroll', position => {
        this.$emit('scroll', this.normalizePosition(position))
      })

      this.scroll.on('scrollEnd', position => {
        this.$emit('scroll-end', this.normalizePosition(position))
      })

      this.scroll.on('beforeScrollStart', () => {
        this.$emit('before-scroll-start')
      })

      if (hasEnabledConfig(this.resolvedOptions.pullUpLoad)) {
        this.scroll.on('pullingUp', () => {
          if (!startPullingUp(this.pullState)) {
            this.finishPullUp()
            return
          }

          this.$emit('pulling-up')
        })
      }

      if (hasEnabledConfig(this.resolvedOptions.pullDownRefresh)) {
        this.scroll.on('pullingDown', () => {
          if (!startPullingDown(this.pullState)) {
            this.finishPullDown()
            return
          }

          this.$emit('pulling-down')
        })
      }
    },
    normalizePosition(position) {
      return {
        x: position && typeof position.x === 'number' ? position.x : this.scroll ? this.scroll.x : 0,
        y: position && typeof position.y === 'number' ? position.y : this.scroll ? this.scroll.y : 0
      }
    },
    rebuild() {
      this.$nextTick(() => {
        this.initScroll()
      })
    },
    refresh() {
      if (!this.scroll) {
        return
      }

      this.scroll.refresh()
      this.$emit('refresh')
    },
    forceUpdate(dirty) {
      forceUpdateState(this.pullState, dirty)
      this.finishPullUp()
      this.finishPullDown()
      this.$nextTick(() => {
        this.refresh()
      })
    },
    scrollTo(x = 0, y = 0, time = 0) {
      if (!this.scroll || typeof this.scroll.scrollTo !== 'function') {
        return
      }

      this.scroll.scrollTo(x, y, time)
    },
    scrollToElement(el, time = 0) {
      if (!this.scroll || typeof this.scroll.scrollToElement !== 'function') {
        return
      }

      let target = el
      if (typeof el === 'string') {
        target = this.$el.querySelector(el)
      }

      if (!target) {
        return
      }

      this.scroll.scrollToElement(target, time)
    },
    getScroll() {
      return {
        x: this.scroll ? this.scroll.x : 0,
        y: this.scroll ? this.scroll.y : 0,
        maxScrollX: this.scroll ? this.scroll.maxScrollX : 0,
        maxScrollY: this.scroll ? this.scroll.maxScrollY : 0,
        instance: this.scroll
      }
    },
    getPullStatus() {
      return getPullStateSnapshot(this.pullState)
    },
    enable() {
      if (this.scroll && typeof this.scroll.enable === 'function') {
        this.scroll.enable()
      }
    },
    disable() {
      if (this.scroll && typeof this.scroll.disable === 'function') {
        this.scroll.disable()
      }
    },
    finishPullUp() {
      if (this.scroll && typeof this.scroll.finishPullUp === 'function') {
        this.scroll.finishPullUp()
      }
    },
    finishPullDown() {
      finishPullDownState(this.pullState)

      if (this.scroll && typeof this.scroll.finishPullDown === 'function') {
        this.scroll.finishPullDown()
      }

      this.$nextTick(() => {
        this.refresh()
      })
    },
    openPullUp() {
      openPullUpState(this.pullState)

      if (this.scroll && typeof this.scroll.openPullUp === 'function') {
        this.scroll.openPullUp()
      }

      this.refresh()
    },
    closePullUp() {
      closePullUpState(this.pullState)

      if (this.scroll && typeof this.scroll.closePullUp === 'function') {
        this.scroll.closePullUp()
      }
    },
    resetPullUpTxt() {
      resetPullUpState(this.pullState)
      this.openPullUp()
      this.refresh()
    },
    destroy() {
      if (!this.scroll) {
        return
      }

      if (typeof this.scroll.destroy === 'function') {
        this.scroll.destroy()
      }

      // 迁移兼容：为了兼容旧 cube-scroll 中直接访问 $refs.xxx.scroll 的历史代码。
      // 新代码不建议直接访问 scroll 实例，应优先使用 getScroll()/scrollTo()/refresh() 等封装方法。
      this.scroll = null
    }
  }
}
</script>

<style scoped>
.compat-scroll {
  position: relative;
  width: 100%;
  height: 100%;
}

.compat-scroll-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.compat-scroll-content {
  min-height: 100%;
}

.compat-scroll-content-horizontal {
  display: inline-block;
  min-width: 100%;
  white-space: nowrap;
}

.compat-scroll-content-free {
  display: inline-block;
  min-width: 100%;
}

.compat-scroll-pullup,
.compat-scroll-pulldown {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  color: #667085;
  font-size: 13px;
}
</style>
