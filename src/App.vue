<template>
  <div id="app">
    <CubeScrollCompareDemo />
  </div>
</template>

<script>
import CubeScrollCompareDemo from './demos/CubeScrollCompareDemo.vue'

export default {
  name: 'App',
  components: {
    CubeScrollCompareDemo
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

body {
  color: #1f2933;
  background: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
}

button {
  font: inherit;
}
</style>
