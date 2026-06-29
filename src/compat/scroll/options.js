export function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function hasEnabledConfig(value) {
  if (value === false || value === null || value === undefined || value === '') {
    return false
  }
  return true
}

export function normalizeFeatureConfig(value, fallback) {
  if (!hasEnabledConfig(value)) {
    return false
  }

  if (value === true) {
    return fallback === undefined ? true : fallback
  }

  if (isPlainObject(value)) {
    return {
      ...(isPlainObject(fallback) ? fallback : {}),
      ...value
    }
  }

  return value
}

export function getConfigValue(props, key, fallback) {
  const options = isPlainObject(props.options) ? props.options : {}
  const propValue = props[key]
  const optionValue = options[key]

  if (key === 'direction') {
    if (propValue === 'horizontal' || optionValue === 'horizontal') {
      return 'horizontal'
    }
    return 'vertical'
  }

  if (key === 'probeType') {
    return optionValue !== undefined ? optionValue : propValue
  }

  if (key === 'click') {
    return optionValue !== undefined ? optionValue : propValue
  }

  if (key === 'freeScroll') {
    return Boolean(optionValue !== undefined ? optionValue : propValue)
  }

  if (propValue !== false && propValue !== '' && propValue !== undefined) {
    return propValue
  }

  if (optionValue !== undefined) {
    return optionValue
  }

  return fallback
}

export function getPullUpText(config) {
  const normalized = normalizeFeatureConfig(config, {})
  const txt = isPlainObject(normalized) && isPlainObject(normalized.txt) ? normalized.txt : {}

  return {
    more: txt.more || '加载更多',
    loading: txt.loading || '加载中',
    noMore: txt.noMore || '没有更多'
  }
}

export function getPullDownText(config) {
  const normalized = normalizeFeatureConfig(config, {})

  if (isPlainObject(normalized) && typeof normalized.txt === 'string') {
    return normalized.txt
  }

  return '刷新成功'
}

export function normalizeEventPassthrough(eventPassthrough, direction, freeScroll) {
  if (!hasEnabledConfig(eventPassthrough)) {
    return ''
  }

  if (freeScroll) {
    return ''
  }

  if (direction === 'horizontal' && eventPassthrough === 'horizontal') {
    return ''
  }

  if (direction !== 'horizontal' && eventPassthrough === 'vertical') {
    return ''
  }

  return eventPassthrough
}

export function buildBetterScrollOptions(props) {
  const sourceOptions = isPlainObject(props.options) ? props.options : {}
  const direction = getConfigValue(props, 'direction', 'vertical')
  const freeScroll = getConfigValue(props, 'freeScroll', false)
  const pullUpLoad = getConfigValue(props, 'pullUpLoad', false)
  const pullDownRefresh = getConfigValue(props, 'pullDownRefresh', false)
  const scrollbar = getConfigValue(props, 'scrollbar', false)
  const mouseWheel = getConfigValue(props, 'mouseWheel', false)
  const eventPassthrough = normalizeEventPassthrough(getConfigValue(props, 'eventPassthrough', ''), direction, freeScroll)
  const bounce = getConfigValue(props, 'bounce', true)
  const scrollEvents = Array.isArray(props.scrollEvents) ? props.scrollEvents : []
  const requestedRealtimeScroll = scrollEvents.includes('scroll')
  const probeType = requestedRealtimeScroll ? Math.max(getConfigValue(props, 'probeType', 1), 3) : getConfigValue(props, 'probeType', 1)

  const betterOptions = {
    ...sourceOptions,
    click: getConfigValue(props, 'click', false),
    probeType,
    bounce,
    observeDOM: true,
    observeImage: true
  }

  if (freeScroll) {
    betterOptions.freeScroll = true
    betterOptions.scrollX = true
    betterOptions.scrollY = true
  } else if (direction === 'horizontal') {
    betterOptions.scrollX = true
    betterOptions.scrollY = false
  } else {
    betterOptions.scrollX = false
    betterOptions.scrollY = true
  }

  if (hasEnabledConfig(eventPassthrough)) {
    betterOptions.eventPassthrough = eventPassthrough
  } else {
    delete betterOptions.eventPassthrough
  }

  if (hasEnabledConfig(pullUpLoad)) {
    betterOptions.pullUpLoad = normalizeFeatureConfig(pullUpLoad, {
      threshold: 0
    })
  } else {
    delete betterOptions.pullUpLoad
  }

  if (hasEnabledConfig(pullDownRefresh)) {
    betterOptions.pullDownRefresh = normalizeFeatureConfig(pullDownRefresh, {
      threshold: 90,
      stop: 40,
      stopTime: 600
    })
  } else {
    delete betterOptions.pullDownRefresh
  }

  if (hasEnabledConfig(scrollbar)) {
    betterOptions.scrollbar = normalizeFeatureConfig(scrollbar, {
      fade: true
    })
  } else {
    delete betterOptions.scrollbar
  }

  if (hasEnabledConfig(mouseWheel)) {
    betterOptions.mouseWheel = normalizeFeatureConfig(mouseWheel, true)
  } else {
    delete betterOptions.mouseWheel
  }

  return betterOptions
}
