export function createPullState() {
  return {
    pullUpLoading: false,
    pullDownLoading: false,
    pullUpOpen: true,
    hasMore: true,
    pullUpStatus: 'more',
    pullDownStatus: 'pulling'
  }
}

export function startPullingUp(state) {
  if (!state.pullUpOpen || !state.hasMore || state.pullUpLoading) {
    return false
  }

  state.pullUpLoading = true
  state.pullUpStatus = 'loading'
  return true
}

export function startPullingDown(state) {
  if (state.pullDownLoading) {
    return false
  }

  state.pullDownLoading = true
  state.pullDownStatus = 'refreshing'
  return true
}

export function finishPullDownState(state) {
  state.pullDownLoading = false
  state.pullDownStatus = 'success'
  return state
}

export function forceUpdateState(state, dirty) {
  state.pullUpLoading = false
  state.pullDownLoading = false
  state.pullDownStatus = 'success'

  if (dirty === false) {
    state.hasMore = false
    state.pullUpStatus = 'noMore'
    return state
  }

  state.hasMore = true
  state.pullUpStatus = 'more'
  return state
}

export function openPullUpState(state) {
  state.pullUpOpen = true

  if (state.hasMore) {
    state.pullUpStatus = 'more'
  }

  return state
}

export function closePullUpState(state) {
  state.pullUpOpen = false
  state.pullUpLoading = false
  return state
}

export function resetPullUpState(state) {
  state.pullUpOpen = true
  state.pullUpLoading = false
  state.hasMore = true
  state.pullUpStatus = 'more'
  return state
}

export function getPullStateSnapshot(state) {
  return {
    pullUpLoading: Boolean(state.pullUpLoading),
    pullDownLoading: Boolean(state.pullDownLoading),
    pullUpOpen: Boolean(state.pullUpOpen),
    hasMore: Boolean(state.hasMore),
    pullUpStatus: state.pullUpStatus,
    pullDownStatus: state.pullDownStatus
  }
}
