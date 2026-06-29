<template>
  <div class="cube-scroll compat-scroll">
    <div ref="wrapper" class="cube-scroll-wrapper compat-scroll-wrapper">
      <div ref="content" class="cube-scroll-content compat-scroll-content" :class="contentClass">
        <slot />
        <div v-if="isPullUpVisible" class="compat-scroll-pullup">
          {{ currentPullUpText }}
        </div>
      </div>
      <div v-if="isPullDownVisible" ref="pulldown" class="compat-scroll-pulldown">
        <div class="compat-scroll-pulldown-wrapper" :style="pullDownStyle">
          <div v-show="isBeforePullDown" class="before-trigger">
            <CompatPullDownBubble class="bubble" :y="pullDownBubbleY" />
          </div>
          <div v-show="!isBeforePullDown" class="after-trigger">
            <div v-show="pullState.pullDownLoading" class="compat-scroll-loading">
              <span class="compat-scroll-loading-spinners">
                <i v-for="index in 12" :key="index" class="compat-scroll-loading-spinner" />
              </span>
            </div>
            <div v-show="!pullState.pullDownLoading" class="compat-scroll-pulldown-loaded">
              <span>{{ currentPullDownText }}</span>
            </div>
          </div>
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
  resetPullDownState,
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

const CompatPullDownBubble = {
  name: 'CompatPullDownBubble',
  props: {
    y: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      ratio: 1,
      width: 50,
      height: 80,
      initRadius: 18,
      minHeadRadius: 12,
      minTailRadius: 5,
      initArrowRadius: 10,
      minArrowRadius: 6,
      arrowWidth: 3,
      maxDistance: 40,
      initCenterX: 25,
      initCenterY: 25,
      headCenter: {
        x: 25,
        y: 25
      }
    }
  },
  computed: {
    canvasWidth() {
      return this.width * this.ratio
    },
    canvasHeight() {
      return this.height * this.ratio
    },
    canvasStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    },
    distance() {
      return Math.max(0, Math.min(this.y * this.ratio, this.maxDistance))
    }
  },
  watch: {
    y() {
      this.draw()
    }
  },
  mounted() {
    this.ratio = window.devicePixelRatio || 1
    this.initRadius = 18 * this.ratio
    this.minHeadRadius = 12 * this.ratio
    this.minTailRadius = 5 * this.ratio
    this.initArrowRadius = 10 * this.ratio
    this.minArrowRadius = 6 * this.ratio
    this.arrowWidth = 3 * this.ratio
    this.maxDistance = 40 * this.ratio
    this.initCenterX = 25 * this.ratio
    this.initCenterY = 25 * this.ratio
    this.headCenter = {
      x: this.initCenterX,
      y: this.initCenterY
    }
    this.$nextTick(() => {
      this.draw()
    })
  },
  methods: {
    draw() {
      const canvas = this.$refs.bubble
      if (!canvas || typeof canvas.getContext !== 'function') {
        return
      }

      const context = canvas.getContext('2d')
      if (!context) {
        return
      }

      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      this.drawBubble(context)
      this.drawArrow(context)
    },
    drawBubble(context) {
      context.save()
      context.beginPath()

      const percent = this.distance / this.maxDistance
      const headRadius = this.initRadius - (this.initRadius - this.minHeadRadius) * percent
      const tailRadius = this.initRadius - (this.initRadius - this.minTailRadius) * percent

      this.headCenter.y = this.initCenterY - (this.initRadius - this.minHeadRadius) * percent
      context.arc(this.headCenter.x, this.headCenter.y, headRadius, 0, Math.PI, true)

      const tailCenter = {
        x: this.headCenter.x,
        y: this.headCenter.y + this.distance
      }
      const leftTailPoint = {
        x: tailCenter.x - tailRadius,
        y: tailCenter.y
      }
      const leftControlPoint = {
        x: leftTailPoint.x,
        y: leftTailPoint.y - this.distance / 2
      }

      context.quadraticCurveTo(leftControlPoint.x, leftControlPoint.y, leftTailPoint.x, leftTailPoint.y)
      context.arc(tailCenter.x, tailCenter.y, tailRadius, Math.PI, 0, true)

      const rightHeadPoint = {
        x: this.headCenter.x + headRadius,
        y: this.headCenter.y
      }
      const rightTailPoint = {
        x: tailCenter.x + tailRadius,
        y: rightHeadPoint.y + this.distance / 2
      }

      context.quadraticCurveTo(rightTailPoint.x, rightTailPoint.y, rightHeadPoint.x, rightHeadPoint.y)
      context.fillStyle = 'rgb(170, 170, 170)'
      context.fill()
      context.strokeStyle = 'rgb(153, 153, 153)'
      context.stroke()
      context.restore()
    },
    drawArrow(context) {
      context.save()
      context.beginPath()

      const percent = this.distance / this.maxDistance
      const radius = this.initArrowRadius - (this.initArrowRadius - this.minArrowRadius) * percent
      const arrowWidth = this.arrowWidth - percent

      context.arc(this.headCenter.x, this.headCenter.y, radius - arrowWidth, -Math.PI / 2, 0, true)
      context.arc(this.headCenter.x, this.headCenter.y, radius, 0, (Math.PI * 3) / 2, false)
      context.lineTo(this.headCenter.x, this.headCenter.y - radius - this.arrowWidth / 2 + percent)
      context.lineTo(
        this.headCenter.x + 2 * this.arrowWidth - 2 * percent,
        this.headCenter.y - radius + this.arrowWidth / 2
      )
      context.lineTo(this.headCenter.x, this.headCenter.y - radius + (this.arrowWidth * 3) / 2 - percent)
      context.fillStyle = 'rgb(255, 255, 255)'
      context.fill()
      context.strokeStyle = 'rgb(170, 170, 170)'
      context.stroke()
      context.restore()
    }
  },
  render(h) {
    return h('canvas', {
      ref: 'bubble',
      style: this.canvasStyle,
      attrs: {
        width: this.canvasWidth,
        height: this.canvasHeight
      }
    })
  }
}

export default {
  name: 'CompatScroll',
  components: {
    CompatPullDownBubble
  },
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
      pullState: createPullState(),
      isBeforePullDown: true,
      pullDownBubbleY: 0,
      pullDownStyle: 'top: -60px',
      pullDownHeight: 60,
      pullDownStop: 40,
      resetPullDownTimer: null
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
    },
    pullDownConfig() {
      return hasEnabledConfig(this.resolvedOptions.pullDownRefresh) ? this.resolvedOptions.pullDownRefresh : {}
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          if (this.shouldDeferRefreshForPullDown()) {
            return
          }

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
      this.resetPullDownVisual()
      this.scroll = new BScroll(this.$refs.wrapper, this.resolvedOptions)
      this.bindScrollEvents()
      this.refresh()
    },
    bindScrollEvents() {
      if (!this.scroll) {
        return
      }

      this.scroll.on('scroll', position => {
        const normalizedPosition = this.normalizePosition(position)
        this.updatePullDownVisual(normalizedPosition)
        this.$emit('scroll', normalizedPosition)
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
          this.clearPullDownTimer()
          this.isBeforePullDown = false
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
      if (hasEnabledConfig(this.resolvedOptions.pullDownRefresh)) {
        this.finishPullDown(dirty)
      }
      this.$nextTick(() => {
        if (!hasEnabledConfig(this.resolvedOptions.pullDownRefresh)) {
          this.refresh()
        }
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
      const dirty = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true
      finishPullDownState(this.pullState)
      this.clearPullDownTimer()

      const stopTime = this.getPullDownStopTime()

      this.resetPullDownTimer = window.setTimeout(() => {
        if (this.scroll && typeof this.scroll.finishPullDown === 'function') {
          this.scroll.finishPullDown()
        }

        const bounceTime = this.getBounceTime()

        this.resetPullDownTimer = window.setTimeout(() => {
          this.resetPullDownVisual()
          resetPullDownState(this.pullState)
          if (dirty) {
            this.$nextTick(() => {
              this.refresh()
            })
          }
        }, bounceTime)
      }, stopTime)
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
        this.clearPullDownTimer()
        return
      }

      this.clearPullDownTimer()

      if (typeof this.scroll.destroy === 'function') {
        this.scroll.destroy()
      }

      // 迁移兼容：为了兼容旧 cube-scroll 中直接访问 $refs.xxx.scroll 的历史代码。
      // 新代码不建议直接访问 scroll 实例，应优先使用 getScroll()/scrollTo()/refresh() 等封装方法。
      this.scroll = null
    },
    updatePullDownVisual(position) {
      if (!hasEnabledConfig(this.resolvedOptions.pullDownRefresh)) {
        return
      }

      const y = position && typeof position.y === 'number' ? position.y : 0

      if (this.isBeforePullDown) {
        this.pullDownBubbleY = Math.max(0, y - this.pullDownHeight)
        this.pullDownStyle = `top: ${Math.min(y - this.pullDownHeight, 0)}px`
        return
      }

      this.pullDownBubbleY = 0
      this.pullDownStyle = `top: ${Math.min(y - this.pullDownStop, 0)}px`
    },
    resetPullDownVisual() {
      this.pullDownStop = this.getPullDownStop()
      this.pullDownHeight = 60
      this.pullDownBubbleY = 0
      this.pullDownStyle = `top: -${this.pullDownHeight}px`
      this.isBeforePullDown = true
    },
    shouldDeferRefreshForPullDown() {
      return hasEnabledConfig(this.resolvedOptions.pullDownRefresh) && this.pullState.pullDownStatus !== 'pulling'
    },
    getPullDownStop() {
      return this.pullDownConfig && typeof this.pullDownConfig.stop === 'number' ? this.pullDownConfig.stop : 40
    },
    getPullDownStopTime() {
      return this.pullDownConfig && typeof this.pullDownConfig.stopTime === 'number' ? this.pullDownConfig.stopTime : 600
    },
    getBounceTime() {
      return this.scroll && this.scroll.options && typeof this.scroll.options.bounceTime === 'number'
        ? this.scroll.options.bounceTime
        : 800
    },
    clearPullDownTimer() {
      if (this.resetPullDownTimer) {
        window.clearTimeout(this.resetPullDownTimer)
        this.resetPullDownTimer = null
      }
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
  position: relative;
  z-index: 1;
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

.compat-scroll-pullup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  color: #667085;
  font-size: 13px;
}

.compat-scroll-pulldown {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  pointer-events: none;
}

.compat-scroll-pulldown-wrapper {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #667085;
  font-size: 13px;
  transition-property: top;
}

.compat-scroll-pulldown-wrapper .before-trigger {
  height: 54px;
  padding-top: 6px;
  line-height: 0;
}

.compat-scroll-pulldown-wrapper .after-trigger .compat-scroll-loading {
  padding: 8px 0;
}

.compat-scroll-pulldown-wrapper .after-trigger .compat-scroll-pulldown-loaded {
  padding: 12px 0;
}

.compat-scroll-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a96a3;
  font-size: 24px;
}

.compat-scroll-loading-spinners {
  position: relative;
  display: block;
  width: 1em;
  height: 1em;
}

.compat-scroll-loading-spinner {
  position: absolute;
  top: 37%;
  left: 44.5%;
  width: 2px;
  height: 25%;
  border-radius: 50% / 20%;
  background-color: currentColor;
  opacity: 0.25;
  animation: compat-spinner-fade 1s linear infinite;
}

.compat-scroll-loading-spinner:nth-child(1) {
  animation-delay: 0s;
  transform: rotate(-150deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(2) {
  animation-delay: 0.083333333333333s;
  transform: rotate(-120deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(3) {
  animation-delay: 0.166666666666667s;
  transform: rotate(-90deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(4) {
  animation-delay: 0.25s;
  transform: rotate(-60deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(5) {
  animation-delay: 0.333333333333333s;
  transform: rotate(-30deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(6) {
  animation-delay: 0.416666666666667s;
  transform: rotate(0deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(7) {
  animation-delay: 0.5s;
  transform: rotate(30deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(8) {
  animation-delay: 0.583333333333333s;
  transform: rotate(60deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(9) {
  animation-delay: 0.666666666666667s;
  transform: rotate(90deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(10) {
  animation-delay: 0.75s;
  transform: rotate(120deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(11) {
  animation-delay: 0.833333333333333s;
  transform: rotate(150deg) translateY(-150%);
}

.compat-scroll-loading-spinner:nth-child(12) {
  animation-delay: 0.916666666666667s;
  transform: rotate(180deg) translateY(-150%);
}

@keyframes compat-spinner-fade {
  0% {
    opacity: 0.85;
  }

  50%,
  100% {
    opacity: 0.25;
  }
}
</style>
