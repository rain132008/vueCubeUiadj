const fs = require('fs')
const path = require('path')

describe('CubeCompatScroll Vue3 handoff component', () => {
  const componentPath = path.resolve(
    __dirname,
    '../src/app/compat/cube/components/scroll/CubeCompatScrollVue3.vue'
  )
  const indexPath = path.resolve(__dirname, '../src/app/compat/cube/components/scroll/index.js')
  const componentsIndexPath = path.resolve(__dirname, '../src/app/compat/cube/components/index.js')
  const cubeIndexPath = path.resolve(__dirname, '../src/app/compat/cube/index.js')

  test('adds a separate Vue3 component without replacing the Vue2 component', () => {
    const vue2Path = path.resolve(__dirname, '../src/app/compat/cube/components/scroll/CubeCompatScroll.vue')

    expect(fs.existsSync(vue2Path)).toBe(true)
    expect(fs.existsSync(componentPath)).toBe(true)
  })

  test('Vue3 component uses composition exposure and shared scroll utils', () => {
    const component = fs.readFileSync(componentPath, 'utf8')

    expect(component).toContain('<script setup>')
    expect(component).toContain('defineExpose')
    expect(component).toContain('@/app/compat/cube/utils/scrollOptions')
    expect(component).toContain('@/app/compat/cube/utils/pullState')
    expect(component).toContain("name: 'CubeCompatScrollVue3'")
  })

  test('scroll index exports both Vue2 and Vue3 entry points explicitly', () => {
    const index = fs.readFileSync(indexPath, 'utf8')

    expect(index).toContain('CubeCompatScroll.vue')
    expect(index).toContain('CubeCompatScrollVue3.vue')
    expect(index).toContain('CubeCompatScrollVue3')
  })

  test('cube index re-exports Vue3 scroll entry for business integration', () => {
    const componentsIndex = fs.readFileSync(componentsIndexPath, 'utf8')
    const cubeIndex = fs.readFileSync(cubeIndexPath, 'utf8')

    expect(componentsIndex).toContain('CubeCompatScrollVue3')
    expect(cubeIndex).toContain('CubeCompatScrollVue3')
  })
})
