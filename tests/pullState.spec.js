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
} from '../src/compat/scroll/pullState'

describe('pull state', () => {
  test('startPullingUp enters loading once and blocks duplicate triggers', () => {
    const state = createPullState()

    expect(startPullingUp(state)).toBe(true)
    expect(state.pullUpLoading).toBe(true)
    expect(state.pullUpStatus).toBe('loading')
    expect(startPullingUp(state)).toBe(false)
  })

  test('forceUpdate true unlocks pull up and keeps hasMore true', () => {
    const state = createPullState()
    startPullingUp(state)

    forceUpdateState(state, true)

    expect(state.pullUpLoading).toBe(false)
    expect(state.hasMore).toBe(true)
    expect(state.pullUpStatus).toBe('more')
    expect(startPullingUp(state)).toBe(true)
  })

  test('forceUpdate false enters noMore state and blocks next pull up', () => {
    const state = createPullState()
    startPullingUp(state)

    forceUpdateState(state, false)

    expect(state.pullUpLoading).toBe(false)
    expect(state.hasMore).toBe(false)
    expect(state.pullUpStatus).toBe('noMore')
    expect(startPullingUp(state)).toBe(false)
  })

  test('close and open pull up update trigger ability', () => {
    const state = createPullState()

    closePullUpState(state)
    expect(startPullingUp(state)).toBe(false)

    openPullUpState(state)
    expect(startPullingUp(state)).toBe(true)
  })

  test('resetPullUpState clears noMore and loading flags', () => {
    const state = createPullState()
    startPullingUp(state)
    forceUpdateState(state, false)

    resetPullUpState(state)

    expect(state.pullUpOpen).toBe(true)
    expect(state.pullUpLoading).toBe(false)
    expect(state.hasMore).toBe(true)
    expect(state.pullUpStatus).toBe('more')
  })

  test('startPullingDown enters refreshing once and finishPullDownState ends it', () => {
    const state = createPullState()

    expect(startPullingDown(state)).toBe(true)
    expect(state.pullDownLoading).toBe(true)
    expect(state.pullDownStatus).toBe('refreshing')
    expect(startPullingDown(state)).toBe(false)

    finishPullDownState(state)
    expect(state.pullDownLoading).toBe(false)
    expect(state.pullDownStatus).toBe('success')
  })

  test('forceUpdate also ends pull down loading safely', () => {
    const state = createPullState()
    startPullingDown(state)

    forceUpdateState(state)

    expect(state.pullDownLoading).toBe(false)
    expect(state.pullDownStatus).toBe('success')
  })

  test('getPullStateSnapshot exposes serializable status for demos and migration checks', () => {
    const state = createPullState()
    startPullingUp(state)

    expect(getPullStateSnapshot(state)).toEqual({
      pullUpLoading: true,
      pullDownLoading: false,
      pullUpOpen: true,
      hasMore: true,
      pullUpStatus: 'loading',
      pullDownStatus: 'pulling'
    })
  })
})
