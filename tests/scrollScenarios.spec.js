import { scrollScenarios } from '../src/demos/scrollScenarios'

describe('scroll scenario index', () => {
  test('scenario ids are unique and stable', () => {
    const ids = scrollScenarios.map(scene => scene.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual([
      'scenario-vertical',
      'scenario-pulldown',
      'scenario-horizontal',
      'scenario-legacy',
      'scenario-wheel-free',
      'scenario-nested',
      'scenario-lifecycle',
      'scenario-edge'
    ])
  })

  test('each scenario has enough text for acceptance navigation', () => {
    scrollScenarios.forEach(scene => {
      expect(scene.title.length).toBeGreaterThan(2)
      expect(scene.description.length).toBeGreaterThan(8)
      expect(scene.checks.length).toBeGreaterThan(0)
    })
  })
})
