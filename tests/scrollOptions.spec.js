import {
  buildBetterScrollOptions,
  getConfigValue,
  getPullDownText,
  getPullUpText,
  normalizeFeatureConfig
} from '../src/app/compat/cube/utils/scrollOptions'

describe('scroll options', () => {
  test('direction horizontal maps to scrollX true and scrollY false', () => {
    const options = buildBetterScrollOptions({
      options: {},
      direction: 'horizontal',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.scrollX).toBe(true)
    expect(options.scrollY).toBe(false)
  })

  test('options.direction horizontal also maps to horizontal scrolling', () => {
    const options = buildBetterScrollOptions({
      options: {
        direction: 'horizontal'
      },
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.scrollX).toBe(true)
    expect(options.scrollY).toBe(false)
  })

  test('freeScroll enables both scroll axes', () => {
    const options = buildBetterScrollOptions({
      options: {},
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: true,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.freeScroll).toBe(true)
    expect(options.scrollX).toBe(true)
    expect(options.scrollY).toBe(true)
  })

  test('pullUpLoad object preserves threshold and text config', () => {
    const options = buildBetterScrollOptions({
      options: {
        pullUpLoad: {
          threshold: 10,
          txt: {
            more: '加载更多',
            noMore: '没有更多'
          }
        }
      },
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.pullUpLoad.threshold).toBe(10)
    expect(options.pullUpLoad.txt.more).toBe('加载更多')
    expect(options.pullUpLoad.txt.noMore).toBe('没有更多')
  })

  test('scrollbar and mouseWheel configs are not ignored', () => {
    const options = buildBetterScrollOptions({
      options: {
        scrollbar: {
          fade: true
        },
        mouseWheel: {
          speed: 20
        }
      },
      direction: 'vertical',
      probeType: 3,
      click: true,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.scrollbar.fade).toBe(true)
    expect(options.mouseWheel.speed).toBe(20)
    expect(options.probeType).toBe(3)
    expect(options.click).toBe(true)
  })

  test('getConfigValue gives options.direction horizontal precedence over default vertical prop', () => {
    expect(
      getConfigValue(
        {
          options: {
            direction: 'horizontal'
          },
          direction: 'vertical'
        },
        'direction',
        'vertical'
      )
    ).toBe('horizontal')
  })

  test('normalizeFeatureConfig merges object config with fallback', () => {
    expect(
      normalizeFeatureConfig(
        {
          stop: 50
        },
        {
          threshold: 90,
          stop: 40
        }
      )
    ).toEqual({
      threshold: 90,
      stop: 50
    })
  })

  test('pullDownRefresh default keeps cube-ui stopTime behavior', () => {
    const options = buildBetterScrollOptions({
      options: {
        pullDownRefresh: true
      },
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.pullDownRefresh.stop).toBe(40)
    expect(options.pullDownRefresh.stopTime).toBe(600)
  })

  test('pull text helpers provide stable defaults', () => {
    expect(getPullUpText(false)).toEqual({
      more: '加载更多',
      loading: '加载中',
      noMore: '没有更多'
    })
    expect(getPullDownText(false)).toBe('刷新成功')
  })

  test('scrollEvents containing scroll upgrades probeType to 3 for realtime scroll events', () => {
    const options = buildBetterScrollOptions({
      options: {},
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: '',
      scrollEvents: ['scroll', 'scroll-end']
    })

    expect(options.probeType).toBe(3)
  })

  test('horizontal scrolling removes conflicting horizontal eventPassthrough', () => {
    const options = buildBetterScrollOptions({
      options: {
        eventPassthrough: 'horizontal'
      },
      direction: 'horizontal',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.scrollX).toBe(true)
    expect(options.scrollY).toBe(false)
    expect(options.eventPassthrough).toBeUndefined()
  })

  test('freeScroll removes eventPassthrough because both axes must stay controlled', () => {
    const options = buildBetterScrollOptions({
      options: {
        eventPassthrough: 'vertical'
      },
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: true,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.freeScroll).toBe(true)
    expect(options.scrollX).toBe(true)
    expect(options.scrollY).toBe(true)
    expect(options.eventPassthrough).toBeUndefined()
  })

  test('observeDOM and observeImage stay enabled for dynamic content and delayed images', () => {
    const options = buildBetterScrollOptions({
      options: {
        observeDOM: false,
        observeImage: false
      },
      direction: 'vertical',
      probeType: 1,
      click: false,
      bounce: true,
      freeScroll: false,
      pullUpLoad: false,
      pullDownRefresh: false,
      scrollbar: false,
      mouseWheel: false,
      eventPassthrough: ''
    })

    expect(options.observeDOM).toBe(true)
    expect(options.observeImage).toBe(true)
  })
})
