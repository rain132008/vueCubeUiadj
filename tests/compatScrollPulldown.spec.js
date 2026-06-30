const fs = require('fs')
const path = require('path')

describe('CompatScroll pulldown layout', () => {
  test('keeps pulldown indicator outside scroll content flow', () => {
    const component = fs.readFileSync(
      path.resolve(__dirname, '../src/app/compat/cube/components/scroll/CubeCompatScroll.vue'),
      'utf8'
    )
    const template = component.slice(component.indexOf('<template>'), component.indexOf('</template>'))
    const wrapperStart = template.indexOf('ref="wrapper"')
    const contentStart = template.indexOf('ref="content"')
    const contentEnd = template.indexOf('</div>', contentStart)
    const pulldownStart = template.indexOf('class="compat-scroll-pulldown"')

    expect(wrapperStart).toBeGreaterThan(-1)
    expect(contentStart).toBeGreaterThan(wrapperStart)
    expect(pulldownStart).toBeGreaterThan(contentEnd)
  })
})
