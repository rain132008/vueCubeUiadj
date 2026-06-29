<template>
  <main class="scenario-index">
    <header class="index-header">
      <div>
        <p class="index-kicker">cube-scroll 验收入口</p>
        <h1>按场景进入测试</h1>
        <p class="index-summary">每个入口会跳到对应验证区。先看清单，再逐项进入页面操作。</p>
      </div>
      <button type="button" class="primary-action" @click="$emit('open-scene', 'scenario-vertical')">
        进入完整验证页
      </button>
    </header>

    <section class="scene-grid">
      <article v-for="(scene, index) in scenarios" :key="scene.id" class="scene-card">
        <div class="scene-card-head">
          <span class="scene-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <h2>{{ scene.title }}</h2>
        </div>
        <p>{{ scene.description }}</p>
        <div class="scene-tags">
          <span v-for="check in scene.checks" :key="scene.id + '-' + check">{{ check }}</span>
        </div>
        <button type="button" @click="$emit('open-scene', scene.id)">
          进入测试
        </button>
      </article>
    </section>
  </main>
</template>

<script>
import { scrollScenarios } from './scrollScenarios'

export default {
  name: 'ScenarioIndex',
  data() {
    return {
      scenarios: scrollScenarios
    }
  }
}
</script>

<style scoped>
.scenario-index {
  min-height: 100vh;
  padding: 28px;
  overflow-x: hidden;
  color: #17202a;
  background: #eef3f7;
}

.index-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 22px;
  border: 1px solid #ccd8e3;
  border-radius: 8px;
  background: #ffffff;
}

.index-kicker {
  margin: 0 0 8px;
  color: #52606d;
  font-size: 13px;
  font-weight: 700;
}

.index-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}

.index-summary {
  max-width: 680px;
  margin: 10px 0 0;
  color: #5d6b78;
  line-height: 1.6;
}

.primary-action,
.scene-card button {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #2f6fb5;
  border-radius: 6px;
  color: #ffffff;
  background: #2f6fb5;
  cursor: pointer;
  line-height: 1.2;
  white-space: normal;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.scene-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 260px;
  padding: 16px;
  border: 1px solid #ccd8e3;
  border-radius: 8px;
  background: #ffffff;
}

.scene-card-head {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.scene-index {
  flex: 0 0 auto;
  min-width: 34px;
  padding-top: 3px;
  color: #2f6fb5;
  font-family: Consolas, "Courier New", monospace;
  font-weight: 700;
}

.scene-card h2 {
  margin: 0;
  font-size: 17px;
  line-height: 1.35;
}

.scene-card p {
  margin: 12px 0;
  color: #52606d;
  line-height: 1.55;
}

.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  margin-bottom: 14px;
}

.scene-tags span {
  padding: 4px 8px;
  border: 1px solid #d5e0ea;
  border-radius: 999px;
  color: #405261;
  background: #f7fafc;
  font-size: 12px;
}

.scene-card button {
  width: 100%;
}

@media (max-width: 1200px) {
  .scene-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .scenario-index {
    padding: 12px;
  }

  .index-header {
    flex-direction: column;
    gap: 14px;
    margin-bottom: 12px;
    padding: 16px;
  }

  .index-header h1 {
    font-size: 24px;
  }

  .index-summary {
    margin-top: 8px;
    font-size: 14px;
  }

  .scene-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .scene-card {
    min-height: auto;
    padding: 14px;
  }

  .scene-card h2 {
    font-size: 16px;
  }

  .scene-card p {
    margin: 10px 0 12px;
    font-size: 14px;
  }

  .primary-action {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .scene-card-head {
    gap: 8px;
  }

  .scene-index {
    min-width: 30px;
  }

  .scene-tags span {
    padding: 4px 7px;
  }
}
</style>
