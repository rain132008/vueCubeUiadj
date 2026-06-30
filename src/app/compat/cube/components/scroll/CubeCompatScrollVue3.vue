<template>
  <div class="cube-scroll compat-scroll">
    <div ref="wrapperRef" class="cube-scroll-wrapper compat-scroll-wrapper">
      <div ref="contentRef" class="cube-scroll-content compat-scroll-content" :class="contentClass">
        <slot />
        <div v-if="isPullUpVisible" class="compat-scroll-pullup">
          {{ currentPullUpText }}
        </div>
      </div>
      <div v-if="isPullDownVisible" ref="pulldownRef" class="compat-scroll-pulldown">
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
export default {
  name: 'CubeCompatScrollVue3'
}
</script>

<script setup>
import { computed, defineComponent, h, nextTick, onActivated, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import PullDown from '@better-scroll/pull-down'
import ScrollBar from '@better-scroll/scroll-bar'
import MouseWheel from '@better-scroll/mouse-wheel'
import ObserveDOM from '@better-scroll/observe-dom'
import ObserveImage from '@better-scroll/observe-image'
import { buildBetterScrollOptions, getPullDownText, getPullUpText, hasEnabledConfig } from '@/app/compat/cube/utils/scrollOptions'
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
} from '@/app/compat/cube/utils/pullState'

BScroll.use(PullUp)
BScroll.use(PullDown)
BScroll.use(ScrollBar)
BScroll.use(MouseWheel)
BScroll.use(ObserveDOM)
BScroll.use(ObserveImage)

const CompatPullDownBubble = defineComponent({
  name: 'CompatPullDownBubble',
  props: {
    y: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const bubbleRef = ref(null)
    const ratio = ref(1)
    const width = ref(50)
    const height = ref(80)
    const initRadius = ref(18)
    const minHeadRadius = ref(12)
    const minTailRadius = ref(5)
    const initArrowRadius = ref(10)
    const minArrowRadius = ref(6)
    const arrowWidth = ref(3)
    const maxDistance = ref(40)
    const initCenterX = ref(25)
    const initCenterY = ref(25)
    const headCenter = reactive({
      x: 25,
      y: 25
    })

    const canvasWidth = computed(() => width.value * ratio.value)
    const canvasHeight = computed(() => height.value * ratio.value)
    const canvasStyle = computed(() => ({
      width: `${width.value}px`,
      height: `${height.value}px`
    }))
    const distance = computed(() => Math.max(0, Math.min(props.y * ratio.value, maxDistance.value)))

    function drawBubble(context) {
      context.save()
      context.beginPath()

      const percent = distance.value / maxDistance.value
      const headRadius = initRadius.value - (initRadius.value - minHeadRadius.value) * percent
      const tailRadius = initRadius.value - (initRadius.value - minTailRadius.value) * percent

      headCenter.y = initCenterY.value - (initRadius.value - minHeadRadius.value) * percent
      context.arc(headCenter.x, headCenter.y, headRadius, 0, Math.PI, true)

      const tailCenter = {
        x: headCenter.x,
        y: headCenter.y + distance.value
      }
      const leftTailPoint = {
        x: tailCenter.x - tailRadius,
        y: tailCenter.y
      }
      const leftControlPoint = {
        x: leftTailPoint.x,
        y: leftTailPoint.y - distance.value / 2
      }

      context.quadraticCurveTo(leftControlPoint.x, leftControlPoint.y, leftTailPoint.x, leftTailPoint.y)
      context.arc(tailCenter.x, tailCenter.y, tailRadius, Math.PI, 0, true)

      const rightHeadPoint = {
        x: headCenter.x + headRadius,
        y: headCenter.y
      }
      const rightTailPoint = {
        x: tailCenter.x + tailRadius,
        y: rightHeadPoint.y + distance.value / 2
      }

      context.quadraticCurveTo(rightTailPoint.x, rightTailPoint.y, rightHeadPoint.x, rightHeadPoint.y)
      context.fillStyle = 'rgb(170, 170, 170)'
      context.fill()
      context.strokeStyle = 'rgb(153, 153, 153)'
      context.stroke()
      context.restore()
    }

    function drawArrow(context) {
      context.save()
      context.beginPath()

      const percent = distance.value / maxDistance.value
      const radius = initArrowRadius.value - (initArrowRadius.value - minArrowRadius.value) * percent
      const currentArrowWidth = arrowWidth.value - percent

      context.arc(headCenter.x, headCenter.y, radius - currentArrowWidth, -Math.PI / 2, 0, true)
      context.arc(headCenter.x, headCenter.y, radius, 0, (Math.PI * 3) / 2, false)
      context.lineTo(headCenter.x, headCenter.y - radius - arrowWidth.value / 2 + percent)
      context.lineTo(
        headCenter.x + 2 * arrowWidth.value - 2 * percent,
        headCenter.y - radius + arrowWidth.value / 2
      )
      context.lineTo(headCenter.x, headCenter.y - radius + (arrowWidth.value * 3) / 2 - percent)
      context.fillStyle = 'rgb(255, 255, 255)'
      context.fill()
      context.strokeStyle = 'rgb(170, 170, 170)'
      context.stroke()
      context.restore()
    }

    function draw() {
      const canvas = bubbleRef.value
      if (!canvas || typeof canvas.getContext !== 'function') {
        return
      }

      const context = canvas.getContext('2d')
      if (!context) {
        return
      }

      context.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
      drawBubble(context)
      drawArrow(context)
    }

    onMounted(() => {
      ratio.value = window.devicePixelRatio || 1
      initRadius.value = 18 * ratio.value
      minHeadRadius.value = 12 * ratio.value
      minTailRadius.value = 5 * ratio.value
      initArrowRadius.value = 10 * ratio.value
      minArrowRadius.value = 6 * ratio.value
      arrowWidth.value = 3 * ratio.value
      maxDistance.value = 40 * ratio.value
      initCenterX.value = 25 * ratio.value
      initCenterY.value = 25 * ratio.value
      headCenter.x = initCenterX.value
      headCenter.y = initCenterY.value
      nextTick(() => {
        draw()
      })
    })

    watch(
      () => props.y,
      () => {
        draw()
      }
    )

    return () =>
      h('canvas', {
        ref: bubbleRef,
        style: canvasStyle.value,
        width: canvasWidth.value,
        height: canvasHeight.value
      })
  }
})

const props = defineProps({
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
})

const emit = defineEmits([
  'scroll',
  'scroll-end',
  'before-scroll-start',
  'pulling-up',
  'pulling-down',
  'refresh'
])

const wrapperRef = ref(null)
const contentRef = ref(null)
const pulldownRef = ref(null)
const scroll = ref(null)
const pullState = reactive(createPullState())
const isBeforePullDown = ref(true)
const pullDownBubbleY = ref(0)
const pullDownStyle = ref('top: -60px')
const pullDownHeight = ref(60)
const pullDownStop = ref(40)
const resetPullDownTimer = ref(null)

const resolvedOptions = computed(() => buildBetterScrollOptions(props))
const contentClass = computed(() => ({
  'compat-scroll-content-horizontal': resolvedOptions.value.scrollX && !resolvedOptions.value.scrollY,
  'compat-scroll-content-free': resolvedOptions.value.freeScroll
}))
const isPullUpVisible = computed(() => hasEnabledConfig(resolvedOptions.value.pullUpLoad))
const isPullDownVisible = computed(() => hasEnabledConfig(resolvedOptions.value.pullDownRefresh))
const pullUpTextConfig = computed(() => getPullUpText(resolvedOptions.value.pullUpLoad))
const currentPullUpText = computed(() => {
  if (pullState.pullUpStatus === 'loading') {
    return pullUpTextConfig.value.loading
  }

  if (pullState.pullUpStatus === 'noMore') {
    return pullUpTextConfig.value.noMore
  }

  return pullUpTextConfig.value.more
})
const currentPullDownText = computed(() => {
  if (pullState.pullDownStatus === 'refreshing') {
    return '刷新中'
  }

  if (pullState.pullDownStatus === 'success') {
    return getPullDownText(resolvedOptions.value.pullDownRefresh)
  }

  return '下拉刷新'
})
const pullDownConfig = computed(() =>
  hasEnabledConfig(resolvedOptions.value.pullDownRefresh) ? resolvedOptions.value.pullDownRefresh : {}
)

function normalizePosition(position) {
  return {
    x: position && typeof position.x === 'number' ? position.x : scroll.value ? scroll.value.x : 0,
    y: position && typeof position.y === 'number' ? position.y : scroll.value ? scroll.value.y : 0
  }
}

function updatePullDownVisual(position) {
  if (!hasEnabledConfig(resolvedOptions.value.pullDownRefresh)) {
    return
  }

  const y = position && typeof position.y === 'number' ? position.y : 0

  if (isBeforePullDown.value) {
    pullDownBubbleY.value = Math.max(0, y - pullDownHeight.value)
    pullDownStyle.value = `top: ${Math.min(y - pullDownHeight.value, 0)}px`
    return
  }

  pullDownBubbleY.value = 0
  pullDownStyle.value = `top: ${Math.min(y - pullDownStop.value, 0)}px`
}

function resetPullDownVisual() {
  pullDownStop.value = getPullDownStop()
  pullDownHeight.value = 60
  pullDownBubbleY.value = 0
  pullDownStyle.value = `top: -${pullDownHeight.value}px`
  isBeforePullDown.value = true
}

function shouldDeferRefreshForPullDown() {
  return hasEnabledConfig(resolvedOptions.value.pullDownRefresh) && pullState.pullDownStatus !== 'pulling'
}

function getPullDownStop() {
  return pullDownConfig.value && typeof pullDownConfig.value.stop === 'number' ? pullDownConfig.value.stop : 40
}

function getPullDownStopTime() {
  return pullDownConfig.value && typeof pullDownConfig.value.stopTime === 'number' ? pullDownConfig.value.stopTime : 600
}

function getBounceTime() {
  return scroll.value && scroll.value.options && typeof scroll.value.options.bounceTime === 'number'
    ? scroll.value.options.bounceTime
    : 800
}

function clearPullDownTimer() {
  if (resetPullDownTimer.value) {
    window.clearTimeout(resetPullDownTimer.value)
    resetPullDownTimer.value = null
  }
}

function bindScrollEvents() {
  if (!scroll.value) {
    return
  }

  scroll.value.on('scroll', position => {
    const normalizedPosition = normalizePosition(position)
    updatePullDownVisual(normalizedPosition)
    emit('scroll', normalizedPosition)
  })

  scroll.value.on('scrollEnd', position => {
    emit('scroll-end', normalizePosition(position))
  })

  scroll.value.on('beforeScrollStart', () => {
    emit('before-scroll-start')
  })

  if (hasEnabledConfig(resolvedOptions.value.pullUpLoad)) {
    scroll.value.on('pullingUp', () => {
      if (!startPullingUp(pullState)) {
        finishPullUp()
        return
      }

      emit('pulling-up')
    })
  }

  if (hasEnabledConfig(resolvedOptions.value.pullDownRefresh)) {
    scroll.value.on('pullingDown', () => {
      clearPullDownTimer()
      isBeforePullDown.value = false
      if (!startPullingDown(pullState)) {
        finishPullDown()
        return
      }

      emit('pulling-down')
    })
  }
}

function initScroll() {
  if (!wrapperRef.value) {
    return
  }

  destroy()
  resetPullDownVisual()
  scroll.value = new BScroll(wrapperRef.value, resolvedOptions.value)
  bindScrollEvents()
  refresh()
}

function rebuild() {
  nextTick(() => {
    initScroll()
  })
}

function refresh() {
  if (!scroll.value) {
    return
  }

  scroll.value.refresh()
  emit('refresh')
}

function forceUpdate(dirty) {
  forceUpdateState(pullState, dirty)
  finishPullUp()
  if (hasEnabledConfig(resolvedOptions.value.pullDownRefresh)) {
    finishPullDown(dirty)
  }
  nextTick(() => {
    if (!hasEnabledConfig(resolvedOptions.value.pullDownRefresh)) {
      refresh()
    }
  })
}

function scrollTo(x = 0, y = 0, time = 0) {
  if (!scroll.value || typeof scroll.value.scrollTo !== 'function') {
    return
  }

  scroll.value.scrollTo(x, y, time)
}

function scrollToElement(el, time = 0) {
  if (!scroll.value || typeof scroll.value.scrollToElement !== 'function') {
    return
  }

  let target = el
  if (typeof el === 'string' && wrapperRef.value) {
    target = wrapperRef.value.querySelector(el)
  }

  if (!target) {
    return
  }

  scroll.value.scrollToElement(target, time)
}

function getScroll() {
  return {
    x: scroll.value ? scroll.value.x : 0,
    y: scroll.value ? scroll.value.y : 0,
    maxScrollX: scroll.value ? scroll.value.maxScrollX : 0,
    maxScrollY: scroll.value ? scroll.value.maxScrollY : 0,
    instance: scroll.value
  }
}

function getPullStatus() {
  return getPullStateSnapshot(pullState)
}

function enable() {
  if (scroll.value && typeof scroll.value.enable === 'function') {
    scroll.value.enable()
  }
}

function disable() {
  if (scroll.value && typeof scroll.value.disable === 'function') {
    scroll.value.disable()
  }
}

function finishPullUp() {
  if (scroll.value && typeof scroll.value.finishPullUp === 'function') {
    scroll.value.finishPullUp()
  }
}

function finishPullDown(dirty = true) {
  finishPullDownState(pullState)
  clearPullDownTimer()

  const stopTime = getPullDownStopTime()

  resetPullDownTimer.value = window.setTimeout(() => {
    if (scroll.value && typeof scroll.value.finishPullDown === 'function') {
      scroll.value.finishPullDown()
    }

    const bounceTime = getBounceTime()

    resetPullDownTimer.value = window.setTimeout(() => {
      resetPullDownVisual()
      resetPullDownState(pullState)
      if (dirty) {
        nextTick(() => {
          refresh()
        })
      }
    }, bounceTime)
  }, stopTime)
}

function openPullUp() {
  openPullUpState(pullState)

  if (scroll.value && typeof scroll.value.openPullUp === 'function') {
    scroll.value.openPullUp()
  }

  refresh()
}

function closePullUp() {
  closePullUpState(pullState)

  if (scroll.value && typeof scroll.value.closePullUp === 'function') {
    scroll.value.closePullUp()
  }
}

function resetPullUpTxt() {
  resetPullUpState(pullState)
  openPullUp()
  refresh()
}

function destroy() {
  if (!scroll.value) {
    clearPullDownTimer()
    return
  }

  clearPullDownTimer()

  if (typeof scroll.value.destroy === 'function') {
    scroll.value.destroy()
  }

  scroll.value = null
}

watch(
  () => props.data,
  () => {
    nextTick(() => {
      if (shouldDeferRefreshForPullDown()) {
        return
      }

      refresh()
    })
  },
  {
    deep: true
  }
)

watch(
  () => props.options,
  () => {
    rebuild()
  },
  {
    deep: true
  }
)

watch(
  () => props.direction,
  () => {
    rebuild()
  }
)

onMounted(() => {
  nextTick(() => {
    initScroll()
  })
})

onActivated(() => {
  nextTick(() => {
    refresh()
  })
})

onBeforeUnmount(() => {
  destroy()
})

defineExpose({
  get scroll() {
    return scroll.value
  },
  refresh,
  forceUpdate,
  scrollTo,
  scrollToElement,
  getScroll,
  getPullStatus,
  enable,
  disable,
  finishPullDown,
  openPullUp,
  closePullUp,
  resetPullUpTxt,
  destroy
})
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
