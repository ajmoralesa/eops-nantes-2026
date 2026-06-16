<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Item {
  label: string
  value: number
  unit?: string
  hint?: string
}

const props = withDefaults(
  defineProps<{
    step?: number
    items?: Item[]
    max?: number
  }>(),
  { step: 0, items: () => [], max: 100 },
)

const displayed = ref<number[]>(props.items.map(() => 0))
const revealedSet = ref<Set<number>>(new Set())
const activeFrames = new Map<number, number>()

function animateCounter(index: number, target: number) {
  if (activeFrames.has(index)) {
    cancelAnimationFrame(activeFrames.get(index)!)
    activeFrames.delete(index)
  }

  const duration = 1200
  const start = performance.now()

  function tick(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    displayed.value[index] = Math.round(ease * target)
    if (t < 1) {
      activeFrames.set(index, requestAnimationFrame(tick))
    } else {
      activeFrames.delete(index)
    }
  }

  if (typeof requestAnimationFrame !== 'undefined') {
    activeFrames.set(index, requestAnimationFrame(tick))
  } else {
    displayed.value[index] = target
  }
}

watch(
  () => props.step,
  (step) => {
    const idx = step - 1
    if (idx >= 0 && idx < props.items.length && !revealedSet.value.has(idx)) {
      revealedSet.value.add(idx)
      animateCounter(idx, props.items[idx].value)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  for (const id of activeFrames.values()) {
    cancelAnimationFrame(id)
  }
  activeFrames.clear()
})
</script>

<template>
  <div class="vr-grid">
    <div
      v-for="(item, i) in items"
      :key="i"
      class="vr-card"
      :class="{ 'vr-revealed': revealedSet.has(i) }"
    >
      <div class="vr-label">{{ item.label }}</div>

      <div class="vr-value">
        <template v-if="revealedSet.has(i)">
          <span class="vr-number">{{ displayed[i] }}</span>
          <span v-if="item.unit" class="vr-unit">{{ item.unit }}</span>
        </template>
        <span v-else class="vr-placeholder">?</span>
      </div>

      <div class="vr-gauge">
        <div
          class="vr-gauge-fill"
          :style="{ width: revealedSet.has(i) ? (item.value / max * 100) + '%' : '0%' }"
        />
      </div>

      <div v-if="item.hint && revealedSet.has(i)" class="vr-hint">{{ item.hint }}</div>
    </div>
  </div>
</template>

<style scoped>
.vr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  height: 100%;
  align-content: center;
}

.vr-card {
  background: rgba(200, 200, 210, 0.10);
  border: 2px solid rgba(150, 150, 160, 0.25);
  border-radius: 10px;
  padding: 0.8rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transition: border-color 0.4s ease, background 0.4s ease;
}

.vr-card.vr-revealed {
  border-color: var(--insep-blue, #2c2f65);
  background: rgba(44, 47, 101, 0.08);
}

.vr-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--insep-blue, #2c2f65);
  text-align: center;
  line-height: 1.2;
  min-height: 1.8em;
}

.vr-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  min-height: 2.2rem;
  display: flex;
  align-items: baseline;
  gap: 0.2em;
}

.vr-number {
  color: var(--insep-red, #c5243d);
  font-variant-numeric: tabular-nums;
}

.vr-unit {
  font-size: 0.5rem;
  font-weight: 500;
  opacity: 0.6;
}

.vr-placeholder {
  color: rgba(150, 150, 160, 0.5);
  animation: vr-pulse 2s ease-in-out infinite;
}

@keyframes vr-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.vr-gauge {
  width: 100%;
  height: 5px;
  background: rgba(150, 150, 160, 0.15);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.15rem;
}

.vr-gauge-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--insep-gold, #c59f69), var(--insep-red, #c5243d));
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.vr-hint {
  font-size: 0.5rem;
  opacity: 0.55;
  text-align: center;
  margin-top: 0.1rem;
}
</style>
