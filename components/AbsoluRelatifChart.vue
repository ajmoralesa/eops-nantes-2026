<script setup lang="ts">
import { ref, computed, watch, onUnmounted, type Ref } from 'vue'

// --------------- Data ---------------
interface Sport {
  id: string
  label: string
  emoji: string
  height: number
  weight: number
  absVO2: number
  relVO2: number
  color: string
}

const maleData: Sport[] = [
  { id: 'rowing',  label: 'Aviron',        emoji: '🚣', height: 198, weight: 98, absVO2: 7.0, relVO2: 71, color: 'var(--insep-navy, #2C2F65)' },
  { id: 'skiing',  label: 'Ski de fond',   emoji: '⛷️', height: 182, weight: 75, absVO2: 6.5, relVO2: 87, color: 'var(--insep-gold-dark, #B38D52)' },
  { id: 'cycling', label: 'Cyclisme',      emoji: '🚴', height: 175, weight: 65, absVO2: 5.5, relVO2: 85, color: 'var(--insep-gold, #C59F69)' },
  { id: 'running', label: 'Course 5000m',  emoji: '🏃', height: 170, weight: 57, absVO2: 4.9, relVO2: 86, color: 'var(--insep-red, #C5243D)' },
]

const femaleData: Sport[] = [
  { id: 'rowing',  label: 'Aviron',        emoji: '🚣', height: 185, weight: 77, absVO2: 5.0, relVO2: 65, color: 'var(--insep-navy, #2C2F65)' },
  { id: 'skiing',  label: 'Ski de fond',   emoji: '⛷️', height: 170, weight: 60, absVO2: 4.2, relVO2: 70, color: 'var(--insep-gold-dark, #B38D52)' },
  { id: 'cycling', label: 'Cyclisme',      emoji: '🚴', height: 168, weight: 55, absVO2: 4.0, relVO2: 73, color: 'var(--insep-gold, #C59F69)' },
  { id: 'running', label: 'Course 5000m',  emoji: '🏃', height: 160, weight: 43, absVO2: 3.4, relVO2: 79, color: 'var(--insep-red, #C5243D)' },
]

// --------------- State ---------------
const gender = ref<'male' | 'female'>('male')
const metric = ref<'absolute' | 'relative'>('absolute')

const currentData = computed(() => gender.value === 'male' ? maleData : femaleData)

// --------------- Animation engine (FickSimulator pattern) ---------------
const activeFrames = new Map<string, number>()

function animateTo(key: string, target: Ref<number>, goal: number, duration = 800) {
  if (activeFrames.has(key)) {
    cancelAnimationFrame(activeFrames.get(key)!)
    activeFrames.delete(key)
  }
  const startVal = target.value
  const startTime = performance.now()
  function tick(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3) // cubic ease-out
    target.value = startVal + (goal - startVal) * ease
    if (t < 1) {
      activeFrames.set(key, requestAnimationFrame(tick))
    } else {
      target.value = goal
      activeFrames.delete(key)
    }
  }
  if (typeof requestAnimationFrame !== 'undefined') {
    activeFrames.set(key, requestAnimationFrame(tick))
  } else {
    target.value = goal
  }
}

onUnmounted(() => {
  for (const id of activeFrames.values()) cancelAnimationFrame(id)
  activeFrames.clear()
})

// --------------- Animated refs for each sport (4 sports × 3 values: bar, display, y-pos) ---------------
const animBars = [ref(0), ref(0), ref(0), ref(0)]
const animValues = [ref(0), ref(0), ref(0), ref(0)]
const animY = [ref(0), ref(0), ref(0), ref(0)]

// --------------- Chart geometry ---------------
const svgW = 680
const svgH = 260
const barAreaX = 280
const barMaxW = 340
const rowH = 58
const rowStartY = 10

// Max values for bar scaling
const maxAbs = 7.5
const maxRel = 92

function getBarWidth(value: number, isAbsolute: boolean): number {
  const max = isAbsolute ? maxAbs : maxRel
  return (value / max) * barMaxW
}

// Compute sorted indices for current state
function getSortedIndices(data: Sport[], isAbsolute: boolean): number[] {
  const values = data.map((s, i) => ({
    i,
    v: isAbsolute ? s.absVO2 : s.relVO2,
  }))
  values.sort((a, b) => b.v - a.v)
  return values.map(x => x.i)
}

function updateAnimations() {
  const data = currentData.value
  const isAbs = metric.value === 'absolute'
  const sorted = getSortedIndices(data, isAbs)

  // Build rank → originalIndex map
  const rankOf = new Array(4)
  sorted.forEach((origIdx, rank) => { rankOf[origIdx] = rank })

  for (let i = 0; i < 4; i++) {
    const value = isAbs ? data[i].absVO2 : data[i].relVO2
    const barW = getBarWidth(value, isAbs)
    const targetY = rowStartY + rankOf[i] * rowH

    animateTo(`bar-${i}`, animBars[i], barW)
    animateTo(`val-${i}`, animValues[i], value)
    animateTo(`y-${i}`, animY[i], targetY)
  }
}

// Initialize immediately
function initValues() {
  const data = currentData.value
  const isAbs = metric.value === 'absolute'
  const sorted = getSortedIndices(data, isAbs)
  const rankOf = new Array(4)
  sorted.forEach((origIdx, rank) => { rankOf[origIdx] = rank })

  for (let i = 0; i < 4; i++) {
    const value = isAbs ? data[i].absVO2 : data[i].relVO2
    animBars[i].value = getBarWidth(value, isAbs)
    animValues[i].value = value
    animY[i].value = rowStartY + rankOf[i] * rowH
  }
}

initValues()

watch([gender, metric], () => { updateAnimations() })

// --------------- Computed rank labels ---------------
const ranks = computed(() => {
  const data = currentData.value
  const isAbs = metric.value === 'absolute'
  const sorted = getSortedIndices(data, isAbs)
  const rankOf = new Array(4)
  sorted.forEach((origIdx, rank) => { rankOf[origIdx] = rank })
  return rankOf
})

// Format display value
function fmtValue(v: number, isAbs: boolean): string {
  return isAbs ? v.toFixed(1) : Math.round(v).toString()
}
</script>

<template>
  <div class="arc-container">
    <!-- Header with toggles -->
    <div class="arc-header">
      <div class="arc-title">VO₂max : absolu vs relatif — le classement s'inverse</div>
      <div class="arc-controls">
        <div class="arc-toggle-group">
          <button
            class="arc-toggle-btn"
            :class="{ 'arc-toggle-active': gender === 'male' }"
            @click="gender = 'male'"
          >Hommes</button>
          <button
            class="arc-toggle-btn"
            :class="{ 'arc-toggle-active': gender === 'female' }"
            @click="gender = 'female'"
          >Femmes</button>
        </div>
        <div class="arc-toggle-group arc-toggle-metric">
          <button
            class="arc-toggle-btn"
            :class="{ 'arc-toggle-active': metric === 'absolute' }"
            @click="metric = 'absolute'"
          >Absolu <span class="arc-unit-hint">L/min</span></button>
          <button
            class="arc-toggle-btn"
            :class="{ 'arc-toggle-active': metric === 'relative' }"
            @click="metric = 'relative'"
          >Relatif <span class="arc-unit-hint">mL/kg/min</span></button>
        </div>
      </div>
    </div>

    <!-- SVG Chart -->
    <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="arc-svg">
      <g
        v-for="(sport, i) in currentData"
        :key="sport.id"
        :transform="`translate(0, ${animY[i].value})`"
        class="arc-row"
      >
        <!-- Rank badge -->
        <circle
          cx="18" cy="24"
          r="14"
          :fill="sport.color"
          opacity="0.15"
        />
        <text
          x="18" y="29"
          text-anchor="middle"
          class="arc-rank-text"
          :fill="sport.color"
        >#{{ ranks[i] + 1 }}</text>

        <!-- Sport emoji + label -->
        <text x="42" y="20" class="arc-emoji">{{ sport.emoji }}</text>
        <text x="68" y="20" class="arc-sport-label">{{ sport.label }}</text>
        <text x="68" y="36" class="arc-anthropo">{{ sport.height }}cm · {{ sport.weight }}kg</text>

        <!-- Bar -->
        <rect
          :x="barAreaX"
          y="10"
          :width="Math.max(animBars[i].value, 2)"
          height="28"
          rx="4"
          :fill="sport.color"
          opacity="0.75"
        />

        <!-- Value label -->
        <text
          :x="barAreaX + animBars[i].value + 8"
          y="30"
          class="arc-value-text"
          :fill="sport.color"
        >
          {{ fmtValue(animValues[i].value, metric === 'absolute') }}
          <tspan class="arc-value-unit">{{ metric === 'absolute' ? 'L/min' : 'mL/kg/min' }}</tspan>
        </text>
      </g>
    </svg>

    <!-- Gravity spectrum -->
    <div class="arc-spectrum">
      <div class="arc-spectrum-bar">
        <div class="arc-spectrum-dot" style="left: 5%;">🚣</div>
        <div class="arc-spectrum-dot" style="left: 35%;">🚴</div>
        <div class="arc-spectrum-dot" style="left: 65%;">⛷️</div>
        <div class="arc-spectrum-dot" style="left: 92%;">🏃</div>
      </div>
      <div class="arc-spectrum-labels">
        <span class="arc-spectrum-left">Poids porté — absolu (L/min)</span>
        <span class="arc-spectrum-right">Contre gravité — relatif (mL/kg/min)</span>
      </div>
    </div>

    <!-- Reference -->
    <div class="arc-ref">
      <a href="https://doi.org/10.1123/ijspp.2017-0441" target="_blank" style="color: inherit; text-decoration: underline; text-underline-offset: 2px;">
        Haugen et al. (2018), <em>Int J Sports Physiol Perform</em> 13(6):678-686
      </a>
    </div>
  </div>
</template>

<style scoped>
.arc-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.3rem;
  font-family: inherit;
  padding: 0.15rem 0;
}

/* ---- Header ---- */
.arc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.arc-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--insep-navy, #2C2F65);
  letter-spacing: 0.01em;
}

.arc-controls {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

/* ---- Toggle buttons (FickSimulator pill pattern) ---- */
.arc-toggle-group {
  display: flex;
  gap: 0;
  border-radius: 1rem;
  overflow: hidden;
  border: 1.5px solid var(--insep-gold, #C59F69);
}

.arc-toggle-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.56rem;
  font-weight: 600;
  background: transparent;
  color: var(--insep-navy, #2C2F65);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.3;
  white-space: nowrap;
}

.arc-toggle-btn:hover {
  background: var(--insep-gold-pale, #F9E9CA);
}

.arc-toggle-active {
  background: var(--insep-gold, #C59F69) !important;
  color: white;
}

.arc-unit-hint {
  font-size: 0.48rem;
  font-weight: 400;
  opacity: 0.7;
}

.arc-toggle-metric .arc-toggle-active {
  background: var(--insep-navy, #2C2F65) !important;
}

/* ---- SVG chart ---- */
.arc-svg {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.arc-row {
  transition: none; /* animated via JS */
}

.arc-rank-text {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.arc-emoji {
  font-size: 16px;
}

.arc-sport-label {
  font-size: 13px;
  font-weight: 700;
  fill: var(--insep-navy, #2C2F65);
}

.arc-anthropo {
  font-size: 10px;
  fill: #888;
  font-weight: 500;
}

.arc-value-text {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.arc-value-unit {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.6;
}

/* ---- Gravity spectrum ---- */
.arc-spectrum {
  margin: 0.1rem 1.5rem 0;
}

.arc-spectrum-bar {
  position: relative;
  height: 22px;
  border-radius: 11px;
  background: linear-gradient(
    90deg,
    var(--insep-navy, #2C2F65) 0%,
    var(--insep-gold, #C59F69) 50%,
    var(--insep-red, #C5243D) 100%
  );
  opacity: 0.25;
}

.arc-spectrum-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
}

.arc-spectrum-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.1rem;
}

.arc-spectrum-left,
.arc-spectrum-right {
  font-size: 0.48rem;
  font-weight: 600;
  color: var(--insep-navy, #2C2F65);
  opacity: 0.5;
}

.arc-spectrum-left::before {
  content: '◄ ';
}

.arc-spectrum-right::after {
  content: ' ►';
}

/* ---- Reference ---- */
.arc-ref {
  text-align: center;
  font-size: 0.46rem;
  opacity: 0.4;
  font-style: italic;
}
</style>
