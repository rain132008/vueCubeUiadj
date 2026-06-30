<template>
  <main class="demo-page">
    <header class="demo-header">
      <div>
        <h1>cube-scroll 行为验证沙盒</h1>
        <p>真实 cube-scroll 作为基准，手写 compat-scroll 用相同场景做行为对比。</p>
      </div>
      <div class="demo-actions">
        <button type="button" @click="$emit('back')">返回场景列表</button>
        <button type="button" @click="appendItems">追加纵向数据</button>
        <button type="button" @click="scrollBothToMiddle">滚动到 -300</button>
        <button type="button" @click="readBothScroll">读取坐标</button>
        <button type="button" @click="resetLogs">清空日志</button>
      </div>
    </header>

    <section class="status-grid">
      <div class="status-panel">
        <strong>真实 cube-scroll</strong>
        <span>x: {{ cubePosition.x }}</span>
        <span>y: {{ cubePosition.y }}</span>
      </div>
      <div class="status-panel">
        <strong>手写 compat-scroll</strong>
        <span>x: {{ compatPosition.x }}</span>
        <span>y: {{ compatPosition.y }}</span>
        <span>maxY: {{ compatMax.maxScrollY }}</span>
      </div>
      <div class="status-panel">
        <strong>手写上拉状态</strong>
        <span>status: {{ compatPullStatus.pullUpStatus }}</span>
        <span>hasMore: {{ compatPullStatus.hasMore }}</span>
        <span>open: {{ compatPullStatus.pullUpOpen }}</span>
      </div>
      <div class="status-panel">
        <strong>手写下拉状态</strong>
        <span>status: {{ compatPullStatus.pullDownStatus }}</span>
        <span>loading: {{ compatPullStatus.pullDownLoading }}</span>
      </div>
    </section>

    <section id="scenario-vertical" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>纵向：真实 cube-scroll</h2>
          <button type="button" @click="refreshCube">refresh</button>
        </div>
        <div class="scroll-box">
          <cube-scroll
            ref="cubeScroll"
            :data="items"
            :options="cubeOptions"
            @scroll="onCubeScroll"
            @scroll-end="onCubeScrollEnd"
            @before-scroll-start="recordCubeBeforeScroll"
            @pulling-up="onCubePullingUp"
          >
            <ul class="item-list">
              <li v-for="item in items" :key="'cube-' + item.id" class="item-row">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </cube-scroll>
        </div>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>纵向：手写 compat-scroll</h2>
          <button type="button" @click="refreshCompat">refresh</button>
        </div>
        <div class="scroll-box">
          <CompatScroll
            ref="compatScroll"
            :data="items"
            :options="compatOptions"
            :scroll-events="['scroll', 'scroll-end']"
            @scroll="onCompatScroll"
            @scroll-end="onCompatScrollEnd"
            @before-scroll-start="recordCompatBeforeScroll"
            @pulling-up="onCompatPullingUp"
            @refresh="recordCompatRefresh"
          >
            <ul class="item-list">
              <li v-for="item in items" :key="'compat-' + item.id" class="item-row compat-target">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </CompatScroll>
        </div>
      </article>
    </section>

    <section id="scenario-methods" class="method-grid scenario-section">
      <div class="method-panel">
        <h3>手写组件方法验证</h3>
        <div class="method-actions">
          <button type="button" @click="compatScrollToElement">scrollToElement</button>
          <button type="button" @click="compatDisable">disable</button>
          <button type="button" @click="compatEnable">enable</button>
          <button type="button" @click="compatForceUpdateTrue">forceUpdate(true)</button>
          <button type="button" @click="compatForceUpdateFalse">forceUpdate(false)</button>
          <button type="button" @click="compatOpenPullUp">openPullUp</button>
          <button type="button" @click="compatClosePullUp">closePullUp</button>
          <button type="button" @click="compatResetPullUpTxt">resetPullUpTxt</button>
          <button type="button" @click="readCompatPullStatus">getPullStatus</button>
        </div>
      </div>
      <div class="method-panel">
        <h3>本批新增验证</h3>
        <p>新增历史 scroll 实例、scrollbar、mouseWheel、eventPassthrough 嵌套横向、freeScroll 和上拉触底验证入口。</p>
      </div>
    </section>

    <section id="scenario-pulldown" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>下拉刷新：真实 cube-scroll</h2>
          <button type="button" @click="refreshCubePullDown">refresh</button>
        </div>
        <div class="scroll-box compact-scroll-box">
          <cube-scroll
            ref="cubePullDownScroll"
            :data="pullDownItems"
            :options="pullDownOptions"
            @pulling-down="onCubePullingDown"
            @scroll="onCubePullDownScroll"
          >
            <ul class="item-list">
              <li v-for="item in pullDownItems" :key="'cube-down-' + item.id" class="item-row">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </cube-scroll>
        </div>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>下拉刷新：手写 compat-scroll</h2>
          <button type="button" @click="refreshCompatPullDown">refresh</button>
        </div>
        <div class="scroll-box compact-scroll-box">
          <CompatScroll
            ref="compatPullDownScroll"
            :data="pullDownItems"
            :options="pullDownOptions"
            @pulling-down="onCompatPullingDown"
            @scroll="onCompatPullDownScroll"
          >
            <ul class="item-list">
              <li v-for="item in pullDownItems" :key="'compat-down-' + item.id" class="item-row">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </CompatScroll>
        </div>
      </article>
    </section>

    <section id="scenario-horizontal" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>横向：真实 cube-scroll</h2>
          <button type="button" @click="readHorizontalScroll">读取横向坐标</button>
        </div>
        <div class="scroll-box horizontal-scroll-box">
          <cube-scroll
            ref="cubeHorizontalScroll"
            direction="horizontal"
            :data="horizontalItems"
            :options="horizontalOptions"
            @scroll="onCubeHorizontalScroll"
            @scroll-end="onCubeHorizontalScrollEnd"
          >
            <div class="horizontal-track">
              <div v-for="item in horizontalItems" :key="'cube-horizontal-' + item.id" class="horizontal-card">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </div>
          </cube-scroll>
        </div>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>横向：手写 compat-scroll</h2>
          <button type="button" @click="scrollHorizontalCompat">scrollTo(-260, 0)</button>
        </div>
        <div class="scroll-box horizontal-scroll-box">
          <CompatScroll
            ref="compatHorizontalScroll"
            direction="horizontal"
            :data="horizontalItems"
            :options="horizontalOptions"
            @scroll="onCompatHorizontalScroll"
            @scroll-end="onCompatHorizontalScrollEnd"
          >
            <div class="horizontal-track">
              <div v-for="item in horizontalItems" :key="'compat-horizontal-' + item.id" class="horizontal-card">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </div>
          </CompatScroll>
        </div>
      </article>
    </section>

    <section class="status-grid">
      <div class="status-panel">
        <strong>真实横向</strong>
        <span>x: {{ cubeHorizontalPosition.x }}</span>
        <span>y: {{ cubeHorizontalPosition.y }}</span>
      </div>
      <div class="status-panel">
        <strong>手写横向</strong>
        <span>x: {{ compatHorizontalPosition.x }}</span>
        <span>y: {{ compatHorizontalPosition.y }}</span>
        <span>maxX: {{ compatHorizontalMax.maxScrollX }}</span>
      </div>
    </section>

    <section id="scenario-legacy" class="method-grid scenario-section">
      <div class="method-panel">
        <h3>历史 scroll 实例访问</h3>
        <div class="method-actions">
          <button type="button" @click="readLegacyCompatScroll">读取 $refs.scroll</button>
          <button type="button" @click="legacyCompatScrollTo">scroll.scrollTo(0, -180)</button>
          <button type="button" @click="triggerCompatPullUpCheck">滚到底部验证上拉</button>
        </div>
        <p>{{ legacyScrollText }}</p>
      </div>
      <div class="method-panel">
        <h3>scrollbar / mouseWheel</h3>
        <div class="method-actions">
          <button type="button" @click="scrollWheelPanel">scrollTo(0, -220)</button>
          <button type="button" @click="readWheelPanel">读取坐标</button>
        </div>
        <p>{{ wheelPanelText }}</p>
      </div>
    </section>

    <section id="scenario-wheel-free" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>scrollbar / mouseWheel：手写 compat-scroll</h2>
          <button type="button" @click="readWheelPanel">读取坐标</button>
        </div>
        <div class="scroll-box compact-scroll-box">
          <CompatScroll
            ref="wheelScroll"
            :data="wheelItems"
            :options="wheelOptions"
            @scroll="onWheelScroll"
            @scroll-end="onWheelScrollEnd"
          >
            <ul class="item-list">
              <li v-for="item in wheelItems" :key="'wheel-' + item.id" class="item-row">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </CompatScroll>
        </div>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>freeScroll：手写 compat-scroll</h2>
          <button type="button" @click="scrollFreePanel">scrollTo(-180, -120)</button>
        </div>
        <div class="scroll-box free-scroll-box">
          <CompatScroll
            ref="freeScroll"
            :data="freeItems"
            :options="freeOptions"
            @scroll="onFreeScroll"
            @scroll-end="onFreeScrollEnd"
          >
            <div class="free-grid">
              <div v-for="item in freeItems" :key="'free-' + item.id" class="free-cell">
                {{ item.title }}
              </div>
            </div>
          </CompatScroll>
        </div>
      </article>
    </section>

    <section id="scenario-nested" class="compare-panel nested-panel scenario-section">
      <div class="panel-title">
        <h2>eventPassthrough / 嵌套滚动：外层纵向，内层横向</h2>
        <button type="button" @click="scrollNestedHorizontal">内层 scrollTo(-240, 0)</button>
      </div>
      <div class="nested-outer">
        <p>外层是原生纵向滚动容器，内层 hand-written compat-scroll 使用横向滚动和 `eventPassthrough: 'vertical'`。</p>
        <div class="nested-horizontal-box">
          <CompatScroll
            ref="nestedHorizontalScroll"
            direction="horizontal"
            :data="horizontalItems"
            :options="nestedHorizontalOptions"
            @scroll="onNestedHorizontalScroll"
            @scroll-end="onNestedHorizontalScrollEnd"
          >
            <div class="horizontal-track">
              <div v-for="item in horizontalItems" :key="'nested-horizontal-' + item.id" class="horizontal-card">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </div>
            </div>
          </CompatScroll>
        </div>
        <div class="nested-filler">
          <p v-for="item in nestedFillerItems" :key="'nested-filler-' + item.id">{{ item.title }}：{{ item.desc }}</p>
        </div>
      </div>
      <div class="nested-status">
        <span>nested x: {{ nestedHorizontalPosition.x }}</span>
        <span>nested y: {{ nestedHorizontalPosition.y }}</span>
        <span>free x: {{ freePosition.x }}</span>
        <span>free y: {{ freePosition.y }}</span>
      </div>
    </section>

    <section id="scenario-lifecycle" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>keep-alive / activated：手写 compat-scroll</h2>
          <div class="panel-actions">
            <button type="button" @click="activeKeepAlivePane = 'scroll'">滚动页</button>
            <button type="button" @click="activeKeepAlivePane = 'blank'">离开</button>
            <button type="button" @click="appendKeepAliveItems">离开后追加</button>
            <button type="button" @click="readKeepAliveScroll">读取</button>
          </div>
        </div>
        <keep-alive>
          <KeepAliveScrollPane
            v-if="activeKeepAlivePane === 'scroll'"
            ref="keepAlivePane"
            :items="keepAliveItems"
            @pane-activated="onKeepAliveActivated"
            @pane-refresh="onKeepAliveRefresh"
          />
          <KeepAliveBlankPane v-else />
        </keep-alive>
        <p class="scenario-note">{{ keepAliveText }}</p>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>图片加载后 refresh：手写 compat-scroll</h2>
          <div class="panel-actions">
            <button type="button" @click="toggleDelayedImages">切换图片</button>
            <button type="button" @click="readImageScroll">读取高度</button>
          </div>
        </div>
        <div class="scroll-box compact-scroll-box">
          <CompatScroll
            ref="imageScroll"
            :data="imageItems"
            :options="imageOptions"
            @refresh="recordImageRefresh"
          >
            <ul class="image-list">
              <li v-for="item in imageItems" :key="'image-' + item.id" class="image-row">
                <div class="image-placeholder">
                  <img v-if="imagesVisible" :src="item.src" :alt="item.title" />
                  <span v-else>{{ item.title }}</span>
                </div>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </div>
              </li>
            </ul>
          </CompatScroll>
        </div>
        <p class="scenario-note">{{ imageScrollText }}</p>
      </article>
    </section>

    <section id="scenario-edge" class="compare-grid scenario-section">
      <article class="compare-panel">
        <div class="panel-title">
          <h2>空列表 / 不足一屏：手写 compat-scroll</h2>
          <button type="button" @click="readShortScrolls">读取状态</button>
        </div>
        <div class="short-grid">
          <div class="short-box">
            <CompatScroll
              ref="emptyScroll"
              :data="emptyItems"
              :options="shortOptions"
              @pulling-up="onEmptyPullingUp"
            >
              <div class="empty-state">空列表</div>
            </CompatScroll>
          </div>
          <div class="short-box">
            <CompatScroll
              ref="shortScroll"
              :data="shortItems"
              :options="shortOptions"
              @pulling-up="onShortPullingUp"
            >
              <ul class="item-list">
                <li v-for="item in shortItems" :key="'short-' + item.id" class="item-row">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.desc }}</span>
                </li>
              </ul>
            </CompatScroll>
          </div>
        </div>
        <p class="scenario-note">{{ shortScrollText }}</p>
      </article>

      <article class="compare-panel">
        <div class="panel-title">
          <h2>组件卸载销毁：手写 compat-scroll</h2>
          <div class="panel-actions">
            <button type="button" @click="toggleDestroyScroll">{{ showDestroyScroll ? '销毁' : '创建' }}</button>
            <button type="button" @click="readDestroyScroll">读取实例</button>
          </div>
        </div>
        <div class="scroll-box compact-scroll-box destroy-box">
          <CompatScroll
            v-if="showDestroyScroll"
            ref="destroyScroll"
            :data="destroyItems"
            :options="destroyOptions"
          >
            <ul class="item-list">
              <li v-for="item in destroyItems" :key="'destroy-' + item.id" class="item-row">
                <strong>{{ item.title }}</strong>
                <span>{{ item.desc }}</span>
              </li>
            </ul>
          </CompatScroll>
          <div v-else class="empty-state">组件已销毁</div>
        </div>
        <p class="scenario-note">{{ destroyScrollText }}</p>
      </article>
    </section>

    <section class="log-grid">
      <div class="log-panel">
        <h3>真实组件日志</h3>
        <ol>
          <li v-for="(entry, index) in cubeLogs" :key="'cube-log-' + index">{{ entry }}</li>
        </ol>
      </div>
      <div class="log-panel">
        <h3>手写组件日志</h3>
        <ol>
          <li v-for="(entry, index) in compatLogs" :key="'compat-log-' + index">{{ entry }}</li>
        </ol>
      </div>
    </section>
  </main>
</template>

<script>
import CompatScroll from '@/app/compat/cube/components/scroll/CubeCompatScroll.vue'

function createItems(count, offset = 0, prefix = '列表项') {
  return Array.from({ length: count }).map((_, index) => {
    const id = offset + index + 1
    return {
      id,
      title: `${prefix} ${id}`,
      desc: `用于验证 cube-scroll 行为的测试内容 ${id}`
    }
  })
}

function createHorizontalItems() {
  return Array.from({ length: 12 }).map((_, index) => {
    const id = index + 1
    return {
      id,
      title: `横向卡片 ${id}`,
      desc: `x 轴滚动验证 ${id}`
    }
  })
}

function createPullStatus() {
  return {
    pullUpLoading: false,
    pullDownLoading: false,
    pullUpOpen: true,
    hasMore: true,
    pullUpStatus: 'more',
    pullDownStatus: 'pulling'
  }
}

function createImageSrc(id) {
  const colors = ['#4f8ad9', '#18a058', '#d97706', '#7c3aed', '#dc2626']
  const color = colors[(id - 1) % colors.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240"><rect width="640" height="240" fill="${color}"/><text x="36" y="132" fill="#ffffff" font-size="42" font-family="Arial">image ${id}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function createImageItems() {
  return Array.from({ length: 6 }).map((_, index) => {
    const id = index + 1
    return {
      id,
      title: `延迟图片 ${id}`,
      desc: `图片显示后内容高度变化，用于验证 observeImage 和 refresh。`,
      src: createImageSrc(id)
    }
  })
}

const KeepAliveScrollPane = {
  name: 'KeepAliveScrollPane',
  components: {
    CompatScroll
  },
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  activated() {
    this.$emit('pane-activated')
  },
  methods: {
    refresh() {
      if (this.$refs.scroll) {
        this.$refs.scroll.refresh()
      }
    },
    getScroll() {
      if (!this.$refs.scroll) {
        return {
          x: 0,
          y: 0,
          maxScrollX: 0,
          maxScrollY: 0,
          instance: null
        }
      }

      return this.$refs.scroll.getScroll()
    }
  },
  template: `
    <div class="keep-alive-box">
      <CompatScroll
        ref="scroll"
        :data="items"
        :options="{ probeType: 3, click: true, scrollbar: { fade: true } }"
        @refresh="$emit('pane-refresh')"
      >
        <ul class="item-list">
          <li v-for="item in items" :key="'keep-' + item.id" class="item-row">
            <strong>{{ item.title }}</strong>
            <span>{{ item.desc }}</span>
          </li>
        </ul>
      </CompatScroll>
    </div>
  `
}

const KeepAliveBlankPane = {
  name: 'KeepAliveBlankPane',
  template: '<div class="keep-alive-box empty-state">已离开滚动页</div>'
}

export default {
  name: 'CubeScrollCompareDemo',
  components: {
    CompatScroll,
    KeepAliveScrollPane,
    KeepAliveBlankPane
  },
  props: {
    initialScenario: {
      type: String,
      default: 'scenario-vertical'
    }
  },
  data() {
    return {
      items: createItems(24),
      pullDownItems: createItems(12, 0, '刷新项'),
      horizontalItems: createHorizontalItems(),
      wheelItems: createItems(18, 0, '滚轮项'),
      freeItems: createItems(36, 0, '自由项'),
      nestedFillerItems: createItems(8, 0, '外层内容'),
      keepAliveItems: createItems(10, 0, '缓存项'),
      imageItems: createImageItems(),
      emptyItems: [],
      shortItems: createItems(2, 0, '短列表项'),
      destroyItems: createItems(14, 0, '销毁项'),
      compatLoadCount: 0,
      activeKeepAlivePane: 'scroll',
      imagesVisible: false,
      showDestroyScroll: true,
      legacyScrollText: '尚未读取历史 scroll 实例',
      wheelPanelText: '已启用 scrollbar.fade 和 mouseWheel.speed=20',
      keepAliveText: 'keep-alive 滚动页已挂载',
      imageScrollText: '图片尚未显示',
      shortScrollText: '尚未读取空列表 / 短列表状态',
      destroyScrollText: '组件实例已创建',
      cubePosition: {
        x: 0,
        y: 0
      },
      compatPosition: {
        x: 0,
        y: 0
      },
      compatMax: {
        maxScrollX: 0,
        maxScrollY: 0
      },
      cubeHorizontalPosition: {
        x: 0,
        y: 0
      },
      compatHorizontalPosition: {
        x: 0,
        y: 0
      },
      compatHorizontalMax: {
        maxScrollX: 0,
        maxScrollY: 0
      },
      nestedHorizontalPosition: {
        x: 0,
        y: 0
      },
      freePosition: {
        x: 0,
        y: 0
      },
      compatPullStatus: createPullStatus(),
      cubeLogs: [],
      compatLogs: [],
      cubeOptions: {
        probeType: 3,
        click: true,
        pullUpLoad: {
          threshold: 10,
          txt: {
            more: '加载更多',
            noMore: '没有更多'
          }
        }
      },
      compatOptions: {
        probeType: 1,
        click: true,
        pullUpLoad: {
          threshold: 10,
          txt: {
            more: '加载更多',
            loading: '加载中',
            noMore: '没有更多'
          }
        },
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      pullDownOptions: {
        probeType: 3,
        click: true,
        pullDownRefresh: {
          threshold: 60,
          stop: 40,
          txt: '刷新成功'
        }
      },
      horizontalOptions: {
        direction: 'horizontal',
        probeType: 3,
        click: true,
        bounce: false,
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      wheelOptions: {
        probeType: 3,
        click: true,
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      nestedHorizontalOptions: {
        direction: 'horizontal',
        probeType: 3,
        click: true,
        eventPassthrough: 'vertical',
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      freeOptions: {
        probeType: 3,
        click: true,
        freeScroll: true,
        bounce: {
          top: true,
          bottom: true,
          left: true,
          right: true
        },
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      imageOptions: {
        probeType: 3,
        click: true,
        observeImage: true,
        scrollbar: {
          fade: true
        }
      },
      shortOptions: {
        probeType: 3,
        click: true,
        pullUpLoad: {
          threshold: 10,
          txt: {
            more: '加载更多',
            noMore: '没有更多'
          }
        }
      },
      destroyOptions: {
        probeType: 3,
        click: true,
        scrollbar: {
          fade: true
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.readCompatPullStatus()
      this.scrollToScenario(this.initialScenario)
    })
  },
  methods: {
    scrollToScenario(sceneId) {
      if (!sceneId) {
        return
      }

      const target = document.getElementById(sceneId)
      if (!target) {
        return
      }

      window.setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 120)
    },
    appendItems() {
      const nextItems = createItems(5, this.items.length)
      this.items = this.items.concat(nextItems)
      this.recordCubeLog(`追加 ${nextItems.length} 条纵向数据`)
      this.recordCompatLog(`追加 ${nextItems.length} 条纵向数据`)
      this.$nextTick(() => {
        this.readCompatPullStatus()
      })
    },
    appendKeepAliveItems() {
      const nextItems = createItems(4, this.keepAliveItems.length, '缓存新增')
      this.keepAliveItems = this.keepAliveItems.concat(nextItems)
      this.keepAliveText = `keep-alive 数据已追加 ${nextItems.length} 条`
      this.recordCompatLog(this.keepAliveText)
    },
    onKeepAliveActivated() {
      this.keepAliveText = `keep-alive activated，当前 ${this.keepAliveItems.length} 条`
      this.recordCompatLog(this.keepAliveText)
      this.$nextTick(() => {
        if (this.$refs.keepAlivePane) {
          this.$refs.keepAlivePane.refresh()
        }
      })
    },
    onKeepAliveRefresh() {
      this.recordCompatLog('keep-alive refresh event')
    },
    readKeepAliveScroll() {
      if (!this.$refs.keepAlivePane) {
        this.keepAliveText = '当前不在 keep-alive 滚动页'
        this.recordCompatLog(this.keepAliveText)
        return
      }

      const scroll = this.$refs.keepAlivePane.getScroll()
      this.keepAliveText = `keep-alive x=${scroll.x}, y=${scroll.y}, maxY=${scroll.maxScrollY}, count=${this.keepAliveItems.length}`
      this.recordCompatLog(this.keepAliveText)
    },
    scrollBothToMiddle() {
      if (this.$refs.cubeScroll && this.$refs.cubeScroll.scrollTo) {
        this.$refs.cubeScroll.scrollTo(0, -300, 300)
        this.recordCubeLog('scrollTo(0, -300, 300)')
      }

      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.scrollTo(0, -300, 300)
        this.recordCompatLog('scrollTo(0, -300, 300)')
      }
    },
    readBothScroll() {
      const cubeScroll = this.$refs.cubeScroll && this.$refs.cubeScroll.scroll
      if (cubeScroll) {
        this.cubePosition = {
          x: cubeScroll.x || 0,
          y: cubeScroll.y || 0
        }
        this.recordCubeLog(`直接读取 scroll: x=${this.cubePosition.x}, y=${this.cubePosition.y}`)
      }

      if (this.$refs.compatScroll) {
        const compatScroll = this.$refs.compatScroll.getScroll()
        this.compatPosition = {
          x: compatScroll.x,
          y: compatScroll.y
        }
        this.compatMax = {
          maxScrollX: compatScroll.maxScrollX,
          maxScrollY: compatScroll.maxScrollY
        }
        this.recordCompatLog(`getScroll: x=${compatScroll.x}, y=${compatScroll.y}, maxY=${compatScroll.maxScrollY}`)
        this.readCompatPullStatus()
      }
    },
    resetLogs() {
      this.cubeLogs = []
      this.compatLogs = []
    },
    refreshCube() {
      if (this.$refs.cubeScroll && this.$refs.cubeScroll.refresh) {
        this.$refs.cubeScroll.refresh()
        this.recordCubeLog('refresh')
      }
    },
    refreshCompat() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.refresh()
        this.recordCompatLog('refresh')
        this.readCompatPullStatus()
      }
    },
    onCubeScroll(position) {
      this.cubePosition = {
        x: position.x,
        y: position.y
      }
    },
    onCompatScroll(position) {
      this.compatPosition = {
        x: position.x,
        y: position.y
      }
      this.compatMax = this.$refs.compatScroll ? this.$refs.compatScroll.getScroll() : this.compatMax
    },
    onCubeScrollEnd(position) {
      this.recordCubeLog(`scroll-end x=${position.x}, y=${position.y}`)
    },
    onCompatScrollEnd(position) {
      this.recordCompatLog(`scroll-end x=${position.x}, y=${position.y}`)
    },
    recordCubeBeforeScroll() {
      this.recordCubeLog('before-scroll-start')
    },
    recordCompatBeforeScroll() {
      this.recordCompatLog('before-scroll-start')
    },
    onCubePullingUp() {
      this.recordCubeLog('pulling-up')
      window.setTimeout(() => {
        const nextItems = createItems(3, this.items.length)
        this.items = this.items.concat(nextItems)
        if (this.$refs.cubeScroll && this.$refs.cubeScroll.forceUpdate) {
          this.$refs.cubeScroll.forceUpdate(true)
          this.recordCubeLog('forceUpdate(true)')
        }
      }, 400)
    },
    onCompatPullingUp() {
      this.compatLoadCount += 1
      this.recordCompatLog(`pulling-up 第 ${this.compatLoadCount} 次`)
      window.setTimeout(() => {
        const nextItems = createItems(3, this.items.length)
        this.items = this.items.concat(nextItems)
        if (this.$refs.compatScroll) {
          const hasMore = this.compatLoadCount < 2
          this.$refs.compatScroll.forceUpdate(hasMore)
          this.recordCompatLog(`forceUpdate(${hasMore})`)
          this.readCompatPullStatus()
        }
      }, 400)
    },
    recordCompatRefresh() {
      this.recordCompatLog('refresh event')
    },
    compatScrollToElement() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.scrollToElement('.compat-target:nth-child(10)', 300)
        this.recordCompatLog('scrollToElement 第 10 项')
      }
    },
    compatDisable() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.disable()
        this.recordCompatLog('disable')
      }
    },
    compatEnable() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.enable()
        this.recordCompatLog('enable')
      }
    },
    compatForceUpdateTrue() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.forceUpdate(true)
        this.recordCompatLog('forceUpdate(true)')
        this.readCompatPullStatus()
      }
    },
    compatForceUpdateFalse() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.forceUpdate(false)
        this.recordCompatLog('forceUpdate(false)')
        this.readCompatPullStatus()
      }
    },
    compatOpenPullUp() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.openPullUp()
        this.recordCompatLog('openPullUp')
        this.readCompatPullStatus()
      }
    },
    compatClosePullUp() {
      if (this.$refs.compatScroll) {
        this.$refs.compatScroll.closePullUp()
        this.recordCompatLog('closePullUp')
        this.readCompatPullStatus()
      }
    },
    compatResetPullUpTxt() {
      if (this.$refs.compatScroll) {
        this.compatLoadCount = 0
        this.$refs.compatScroll.resetPullUpTxt()
        this.recordCompatLog('resetPullUpTxt')
        this.readCompatPullStatus()
      }
    },
    readCompatPullStatus() {
      if (this.$refs.compatScroll && this.$refs.compatScroll.getPullStatus) {
        this.compatPullStatus = this.$refs.compatScroll.getPullStatus()
        this.recordCompatLog(`getPullStatus: up=${this.compatPullStatus.pullUpStatus}, down=${this.compatPullStatus.pullDownStatus}`)
      }
    },
    refreshCubePullDown() {
      if (this.$refs.cubePullDownScroll && this.$refs.cubePullDownScroll.refresh) {
        this.$refs.cubePullDownScroll.refresh()
        this.recordCubeLog('pullDown refresh')
      }
    },
    refreshCompatPullDown() {
      if (this.$refs.compatPullDownScroll) {
        this.$refs.compatPullDownScroll.refresh()
        this.recordCompatLog('pullDown refresh')
      }
    },
    onCubePullingDown() {
      this.recordCubeLog('pulling-down')
      window.setTimeout(() => {
        this.pullDownItems = createItems(2, this.pullDownItems.length, '刷新新增').concat(this.pullDownItems)
        if (this.$refs.cubePullDownScroll && this.$refs.cubePullDownScroll.forceUpdate) {
          this.$refs.cubePullDownScroll.forceUpdate()
          this.recordCubeLog('pullDown forceUpdate')
        }
      }, 400)
    },
    onCompatPullingDown() {
      this.recordCompatLog('pulling-down')
      window.setTimeout(() => {
        this.pullDownItems = createItems(2, this.pullDownItems.length, '刷新新增').concat(this.pullDownItems)
        if (this.$refs.compatPullDownScroll) {
          this.$refs.compatPullDownScroll.finishPullDown()
          this.recordCompatLog('finishPullDown')
        }
      }, 400)
    },
    onCubePullDownScroll(position) {
      if (position.y > 0) {
        this.recordCubeLog(`pullDown y=${Math.round(position.y)}`)
      }
    },
    onCompatPullDownScroll(position) {
      if (position.y > 0) {
        this.recordCompatLog(`pullDown y=${Math.round(position.y)}`)
      }
    },
    readHorizontalScroll() {
      const cubeScroll = this.$refs.cubeHorizontalScroll && this.$refs.cubeHorizontalScroll.scroll
      if (cubeScroll) {
        this.cubeHorizontalPosition = {
          x: cubeScroll.x || 0,
          y: cubeScroll.y || 0
        }
        this.recordCubeLog(`horizontal scroll: x=${this.cubeHorizontalPosition.x}, y=${this.cubeHorizontalPosition.y}`)
      }

      const compatScroll = this.$refs.compatHorizontalScroll && this.$refs.compatHorizontalScroll.getScroll()
      if (compatScroll) {
        this.compatHorizontalPosition = {
          x: compatScroll.x,
          y: compatScroll.y
        }
        this.compatHorizontalMax = {
          maxScrollX: compatScroll.maxScrollX,
          maxScrollY: compatScroll.maxScrollY
        }
        this.recordCompatLog(`horizontal getScroll: x=${compatScroll.x}, maxX=${compatScroll.maxScrollX}`)
      }
    },
    scrollHorizontalCompat() {
      if (this.$refs.compatHorizontalScroll) {
        this.$refs.compatHorizontalScroll.scrollTo(-260, 0, 300)
        this.recordCompatLog('horizontal scrollTo(-260, 0, 300)')
        window.setTimeout(() => {
          this.readHorizontalScroll()
        }, 350)
      }
    },
    onCubeHorizontalScroll(position) {
      this.cubeHorizontalPosition = {
        x: position.x,
        y: position.y
      }
    },
    onCompatHorizontalScroll(position) {
      this.compatHorizontalPosition = {
        x: position.x,
        y: position.y
      }
    },
    onCubeHorizontalScrollEnd(position) {
      this.recordCubeLog(`horizontal scroll-end x=${position.x}, y=${position.y}`)
    },
    onCompatHorizontalScrollEnd(position) {
      this.recordCompatLog(`horizontal scroll-end x=${position.x}, y=${position.y}`)
      this.readHorizontalScroll()
    },
    readLegacyCompatScroll() {
      const scroll = this.$refs.compatScroll && this.$refs.compatScroll.scroll

      if (!scroll) {
        this.legacyScrollText = '历史 scroll 实例不存在'
        this.recordCompatLog(this.legacyScrollText)
        return
      }

      this.legacyScrollText = `scroll.x=${scroll.x || 0}, scroll.y=${scroll.y || 0}, maxX=${scroll.maxScrollX || 0}, maxY=${scroll.maxScrollY || 0}`
      this.recordCompatLog(`legacy ${this.legacyScrollText}`)
    },
    legacyCompatScrollTo() {
      const scroll = this.$refs.compatScroll && this.$refs.compatScroll.scroll

      if (!scroll || typeof scroll.scrollTo !== 'function') {
        this.legacyScrollText = '历史 scroll.scrollTo 不可用'
        this.recordCompatLog(this.legacyScrollText)
        return
      }

      scroll.scrollTo(0, -180, 300)
      this.recordCompatLog('legacy scroll.scrollTo(0, -180, 300)')
      window.setTimeout(() => {
        this.readLegacyCompatScroll()
      }, 350)
    },
    triggerCompatPullUpCheck() {
      if (!this.$refs.compatScroll) {
        return
      }

      const current = this.$refs.compatScroll.getScroll()
      this.$refs.compatScroll.scrollTo(0, current.maxScrollY, 300)
      this.recordCompatLog(`滚到底部验证上拉 maxY=${current.maxScrollY}`)
      window.setTimeout(() => {
        this.readBothScroll()
        this.readCompatPullStatus()
      }, 450)
    },
    scrollWheelPanel() {
      if (!this.$refs.wheelScroll) {
        return
      }

      this.$refs.wheelScroll.scrollTo(0, -220, 300)
      this.recordCompatLog('wheel panel scrollTo(0, -220, 300)')
      window.setTimeout(() => {
        this.readWheelPanel()
      }, 350)
    },
    readWheelPanel() {
      if (!this.$refs.wheelScroll) {
        return
      }

      const scroll = this.$refs.wheelScroll.getScroll()
      this.wheelPanelText = `x=${scroll.x}, y=${scroll.y}, maxY=${scroll.maxScrollY}`
      this.recordCompatLog(`wheel panel ${this.wheelPanelText}`)
    },
    onWheelScroll(position) {
      this.wheelPanelText = `滚动中 x=${Math.round(position.x)}, y=${Math.round(position.y)}`
    },
    onWheelScrollEnd(position) {
      this.wheelPanelText = `滚动结束 x=${position.x}, y=${position.y}`
      this.recordCompatLog(`wheel scroll-end x=${position.x}, y=${position.y}`)
    },
    scrollNestedHorizontal() {
      if (!this.$refs.nestedHorizontalScroll) {
        return
      }

      this.$refs.nestedHorizontalScroll.scrollTo(-240, 0, 300)
      this.recordCompatLog('nested horizontal scrollTo(-240, 0, 300)')
      window.setTimeout(() => {
        const scroll = this.$refs.nestedHorizontalScroll.getScroll()
        this.nestedHorizontalPosition = {
          x: scroll.x,
          y: scroll.y
        }
      }, 350)
    },
    onNestedHorizontalScroll(position) {
      this.nestedHorizontalPosition = {
        x: position.x,
        y: position.y
      }
    },
    onNestedHorizontalScrollEnd(position) {
      this.nestedHorizontalPosition = {
        x: position.x,
        y: position.y
      }
      this.recordCompatLog(`nested scroll-end x=${position.x}, y=${position.y}`)
    },
    scrollFreePanel() {
      if (!this.$refs.freeScroll) {
        return
      }

      this.$refs.freeScroll.scrollTo(-180, -120, 300)
      this.recordCompatLog('freeScroll scrollTo(-180, -120, 300)')
      window.setTimeout(() => {
        const scroll = this.$refs.freeScroll.getScroll()
        this.freePosition = {
          x: scroll.x,
          y: scroll.y
        }
      }, 350)
    },
    onFreeScroll(position) {
      this.freePosition = {
        x: position.x,
        y: position.y
      }
    },
    onFreeScrollEnd(position) {
      this.freePosition = {
        x: position.x,
        y: position.y
      }
      this.recordCompatLog(`freeScroll scroll-end x=${position.x}, y=${position.y}`)
    },
    toggleDelayedImages() {
      this.imagesVisible = !this.imagesVisible
      this.imageScrollText = this.imagesVisible ? '图片已显示，等待 observeImage/refresh' : '图片已隐藏'
      this.recordCompatLog(this.imageScrollText)
      window.setTimeout(() => {
        if (this.$refs.imageScroll) {
          this.$refs.imageScroll.refresh()
        }
        this.readImageScroll()
      }, 300)
    },
    recordImageRefresh() {
      this.recordCompatLog('image scroll refresh event')
    },
    readImageScroll() {
      if (!this.$refs.imageScroll) {
        this.imageScrollText = '图片滚动实例不存在'
        return
      }

      const scroll = this.$refs.imageScroll.getScroll()
      this.imageScrollText = `image x=${scroll.x}, y=${scroll.y}, maxY=${scroll.maxScrollY}, visible=${this.imagesVisible}`
      this.recordCompatLog(this.imageScrollText)
    },
    readShortScrolls() {
      const empty = this.$refs.emptyScroll ? this.$refs.emptyScroll.getScroll() : null
      const short = this.$refs.shortScroll ? this.$refs.shortScroll.getScroll() : null
      this.shortScrollText = `empty maxY=${empty ? empty.maxScrollY : 'none'}, short maxY=${short ? short.maxScrollY : 'none'}`
      this.recordCompatLog(this.shortScrollText)
    },
    onEmptyPullingUp() {
      this.recordCompatLog('empty pulling-up should not loop')
      if (this.$refs.emptyScroll) {
        this.$refs.emptyScroll.forceUpdate(false)
      }
    },
    onShortPullingUp() {
      this.recordCompatLog('short pulling-up should not loop')
      if (this.$refs.shortScroll) {
        this.$refs.shortScroll.forceUpdate(false)
      }
    },
    readDestroyScroll() {
      if (!this.showDestroyScroll) {
        this.destroyScrollText = '组件当前已销毁'
        this.recordCompatLog(this.destroyScrollText)
        return
      }

      if (!this.$refs.destroyScroll) {
        this.destroyScrollText = '组件显示中，但 ref 尚未就绪'
        this.recordCompatLog(this.destroyScrollText)
        return
      }

      const scroll = this.$refs.destroyScroll.getScroll()
      this.destroyScrollText = `destroy x=${scroll.x}, y=${scroll.y}, maxY=${scroll.maxScrollY}, instance=${Boolean(scroll.instance)}`
      this.recordCompatLog(this.destroyScrollText)
    },
    toggleDestroyScroll() {
      this.showDestroyScroll = !this.showDestroyScroll
      this.destroyScrollText = this.showDestroyScroll ? '组件正在创建' : '组件已销毁'
      this.recordCompatLog(this.destroyScrollText)

      if (this.showDestroyScroll) {
        this.$nextTick(() => {
          window.setTimeout(() => {
            this.readDestroyScroll()
          }, 100)
        })
      }
    },
    recordCubeLog(message) {
      this.cubeLogs.unshift(`${new Date().toLocaleTimeString()} ${message}`)
      this.cubeLogs = this.cubeLogs.slice(0, 30)
    },
    recordCompatLog(message) {
      this.compatLogs.unshift(`${new Date().toLocaleTimeString()} ${message}`)
      this.compatLogs = this.compatLogs.slice(0, 30)
    }
  }
}
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  padding: 24px;
  overflow-x: hidden;
}

.demo-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.demo-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  color: #5d6b78;
}

.demo-actions,
.method-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-actions button,
.method-actions button,
.panel-title button {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #c8d1dc;
  border-radius: 6px;
  color: #102a43;
  background: #ffffff;
  cursor: pointer;
  line-height: 1.2;
  white-space: normal;
}

.demo-actions button:hover,
.method-actions button:hover,
.panel-title button:hover {
  border-color: #4f8ad9;
}

.status-grid,
.compare-grid,
.method-grid,
.log-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.scenario-section {
  scroll-margin-top: 18px;
}

.status-panel,
.compare-panel,
.method-panel,
.log-panel {
  min-width: 0;
  border: 1px solid #d7dee8;
  border-radius: 8px;
  background: #ffffff;
}

.status-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  min-height: 48px;
  padding: 12px 14px;
}

.status-panel strong {
  color: #102a43;
}

.status-panel span {
  color: #52606d;
}

.compare-panel {
  padding: 14px;
}

.panel-title {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.panel-title h2,
.method-panel h3,
.log-panel h3 {
  margin: 0;
  font-size: 16px;
}

.scroll-box {
  width: 100%;
  max-width: 100%;
  height: 420px;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
}

.compact-scroll-box {
  height: 300px;
}

.horizontal-scroll-box {
  height: 190px;
}

.free-scroll-box {
  height: 300px;
}

.keep-alive-box {
  width: 100%;
  max-width: 100%;
  height: 300px;
  overflow: hidden;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: #f8fafc;
}

.item-list {
  margin: 0;
  padding: 10px;
  list-style: none;
}

.item-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 64px;
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  background: #ffffff;
}

.item-row strong {
  color: #102a43;
}

.item-row span {
  color: #667085;
  font-size: 13px;
}

.image-list {
  margin: 0;
  padding: 10px;
  list-style: none;
}

.image-row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  background: #ffffff;
}

.image-row p {
  margin: 6px 0 0;
  color: #667085;
  line-height: 1.5;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  overflow: hidden;
  border-radius: 6px;
  color: #52606d;
  background: #e8edf3;
}

.image-placeholder img {
  display: block;
  width: 100%;
  height: auto;
}

.short-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.short-box {
  min-width: 0;
  height: 220px;
  overflow: hidden;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: #f8fafc;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
  color: #667085;
  text-align: center;
}

.destroy-box {
  position: relative;
}

.scenario-note {
  min-height: 24px;
  margin: 10px 0 0;
  color: #52606d;
  line-height: 1.5;
}

.horizontal-track {
  display: inline-flex;
  gap: 10px;
  min-width: max-content;
  height: 100%;
  padding: 12px;
  white-space: nowrap;
}

.horizontal-card {
  display: inline-flex;
  flex: 0 0 170px;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  height: 140px;
  padding: 14px;
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  color: #102a43;
  background: #ffffff;
}

.horizontal-card span {
  color: #667085;
  font-size: 13px;
}

.free-grid {
  display: grid;
  grid-template-columns: repeat(6, 140px);
  grid-auto-rows: 78px;
  gap: 10px;
  width: max-content;
  min-width: 980px;
  min-height: 540px;
  padding: 12px;
}

.free-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  color: #102a43;
  background: #ffffff;
}

.nested-panel {
  margin-bottom: 16px;
  padding: 14px;
}

.nested-outer {
  height: 330px;
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: #f8fafc;
}

.nested-outer > p {
  margin: 0;
  padding: 12px;
  color: #52606d;
}

.nested-horizontal-box {
  width: calc(100% - 24px);
  max-width: calc(100% - 24px);
  height: 170px;
  margin: 0 12px 12px;
  overflow: hidden;
  border: 1px solid #d7dee8;
  border-radius: 6px;
  background: #ffffff;
}

.nested-filler {
  padding: 0 12px 16px;
}

.nested-filler p {
  min-height: 54px;
  margin: 0 0 8px;
  padding: 12px;
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  background: #ffffff;
}

.nested-status {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  color: #52606d;
}

.method-panel,
.log-panel {
  padding: 14px;
}

.method-panel h3,
.log-panel h3 {
  margin-bottom: 10px;
}

.method-panel p {
  margin: 0;
  color: #5d6b78;
  line-height: 1.6;
}

.log-panel ol {
  min-height: 140px;
  max-height: 220px;
  margin: 0;
  padding-left: 20px;
  overflow: auto;
  color: #334e68;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .demo-page {
    padding: 14px;
  }

  .demo-header {
    flex-direction: column;
  }

  .status-grid,
  .compare-grid,
  .method-grid,
  .log-grid,
  .short-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .demo-page {
    padding: 12px;
  }

  .demo-header {
    gap: 14px;
    margin-bottom: 12px;
  }

  .demo-header h1 {
    font-size: 23px;
  }

  .demo-header p,
  .method-panel p,
  .scenario-note,
  .nested-outer > p {
    font-size: 14px;
  }

  .demo-actions,
  .method-actions,
  .panel-actions {
    width: 100%;
    gap: 8px;
  }

  .demo-actions button,
  .method-actions button,
  .panel-title button {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    padding: 0 10px;
  }

  .demo-actions button:first-child {
    flex-basis: 100%;
  }

  .status-grid,
  .compare-grid,
  .method-grid,
  .log-grid {
    gap: 12px;
    margin-bottom: 12px;
  }

  .scenario-section {
    scroll-margin-top: 8px;
  }

  .status-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
    min-height: auto;
    padding: 10px 12px;
    font-size: 13px;
  }

  .status-panel strong {
    grid-column: 1 / -1;
    font-size: 14px;
  }

  .compare-panel,
  .method-panel,
  .log-panel,
  .nested-panel {
    padding: 12px;
  }

  .panel-title {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .panel-actions {
    justify-content: flex-start;
  }

  .panel-title h2,
  .method-panel h3,
  .log-panel h3 {
    font-size: 15px;
    line-height: 1.35;
  }

  .scroll-box {
    height: min(58vh, 420px);
  }

  .compact-scroll-box {
    height: min(46vh, 320px);
  }

  .horizontal-scroll-box {
    height: 180px;
  }

  .free-scroll-box,
  .keep-alive-box {
    height: min(48vh, 320px);
  }

  .short-box {
    height: 190px;
  }

  .item-list,
  .image-list {
    padding: 8px;
  }

  .item-row {
    min-height: 58px;
    margin-bottom: 8px;
    padding: 10px;
  }

  .image-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .image-placeholder {
    min-height: 118px;
  }

  .horizontal-track {
    gap: 8px;
    padding: 10px;
  }

  .horizontal-card {
    flex-basis: 150px;
    height: 132px;
    padding: 12px;
  }

  .free-grid {
    grid-template-columns: repeat(6, 120px);
    grid-auto-rows: 72px;
    min-width: 820px;
    min-height: 500px;
    padding: 10px;
  }

  .nested-outer {
    height: min(52vh, 340px);
  }

  .nested-horizontal-box {
    width: calc(100% - 20px);
    max-width: calc(100% - 20px);
    height: 164px;
    margin: 0 10px 10px;
  }

  .nested-filler {
    padding: 0 10px 14px;
  }

  .nested-status {
    gap: 8px 10px;
    font-size: 13px;
  }

  .log-panel ol {
    min-height: 110px;
    max-height: 180px;
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .demo-actions button,
  .method-actions button,
  .panel-title button {
    flex-basis: 100%;
  }

  .status-panel {
    grid-template-columns: 1fr;
  }
}
</style>
