<template>
  <div id="app">
    <ScenarioIndex v-if="view === 'index'" @open-scene="openScene" />
    <CubeScrollCompareDemo
      v-else
      :key="activeScenario"
      :initial-scenario="activeScenario"
      @back="view = 'index'"
    />
  </div>
</template>

<script>
import CubeScrollCompareDemo from './demos/CubeScrollCompareDemo.vue'
import ScenarioIndex from './demos/ScenarioIndex.vue'

export default {
  name: 'App',
  components: {
    CubeScrollCompareDemo,
    ScenarioIndex
  },
  data() {
    return {
      view: 'index',
      activeScenario: 'scenario-vertical'
    }
  },
  methods: {
    openScene(sceneId) {
      this.activeScenario = sceneId
      this.view = 'demo'
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  color: #1f2933;
  background: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
}

button {
  min-height: 44px;
  font: inherit;
  touch-action: manipulation;
}
</style>
