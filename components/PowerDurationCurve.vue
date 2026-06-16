<script setup lang="ts">
import { computed, ref, watch, onUnmounted, type Ref } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// --------------- Chart constants ---------------
const CL = 50, CR = 610, CT = 12, CB = 278
const CW = CR - CL, CH = CB - CT
const T_MIN = 60, T_MAX = 1800, N = 200

// --------------- TTE data points (discovery phase) ---------------
const dataPoints = [
  { t: 120,  p: 447, label: '2 min → 447 W' },
  { t: 300,  p: 350, label: '5 min → 350 W' },
  { t: 600,  p: 312, label: '10 min → 312 W' },
  { t: 1200, p: 296, label: '20 min → 296 W' },
]

// --------------- Mathematical models ---------------
type ModelId = 'hyp2' | 'wt' | 'p1t' | 'hyp3'

const models: { id: ModelId; label: string; equation: string; color: string }[] = [
  { id: 'hyp2', label: 'P(t) hyperbolique', equation: "P = CP + W' / t", color: '#2C2F65' },
  { id: 'wt',   label: 'W(t) linéaire',     equation: "W = CP · t + W'", color: '#A07D45' },
  { id: 'p1t',  label: 'P(1/t) linéaire',   equation: "P = W' · (1/t) + CP", color: '#C5243D' },
  { id: 'hyp3', label: '3 paramètres',       equation: "P = W' / (t + k) + CP", color: '#6B7280' },
]

const activeModel = ref<ModelId>('hyp2')

// --------------- Reactive state (cycling only) ---------------
const cp = ref(280)
const wprime = ref(20000)
const pmax = ref(900)

// --------------- Animation engine ---------------
const displayCP = ref(cp.value)
const displayW = ref(wprime.value)
const displayPmax = ref(pmax.value)
const frames = new Map<string, number>()

function animateTo(key: string, target: Ref<number>, goal: number, dur = 400) {
  if (frames.has(key)) { cancelAnimationFrame(frames.get(key)!); frames.delete(key) }
  const s = target.value, t0 = performance.now()
  function tick(now: number) {
    const t = Math.min((now - t0) / dur, 1)
    target.value = s + (goal - s) * (1 - Math.pow(1 - t, 3))
    if (t < 1) frames.set(key, requestAnimationFrame(tick))
    else { target.value = goal; frames.delete(key) }
  }
  if (typeof requestAnimationFrame !== 'undefined') frames.set(key, requestAnimationFrame(tick))
  else target.value = goal
}

watch(() => cp.value, (v) => animateTo('cp', displayCP, v), { immediate: true })
watch(() => wprime.value, (v) => animateTo('w', displayW, v), { immediate: true })
watch(() => pmax.value, (v) => animateTo('pmax', displayPmax, v), { immediate: true })

onUnmounted(() => { for (const id of frames.values()) cancelAnimationFrame(id); frames.clear() })

// --------------- Handlers ---------------
function onCP(e: Event) { cp.value = parseFloat((e.target as HTMLInputElement).value) }
function onW(e: Event) { wprime.value = parseFloat((e.target as HTMLInputElement).value) }
function onPmax(e: Event) { pmax.value = parseFloat((e.target as HTMLInputElement).value) }

// --------------- Axis scaling (model-dependent) ---------------
const xMin = computed(() => activeModel.value === 'p1t' ? 1 / T_MAX : T_MIN)
const xMax = computed(() => activeModel.value === 'p1t' ? 1 / T_MIN : T_MAX)

function sx(xVal: number) {
  return CL + ((xVal - xMin.value) / (xMax.value - xMin.value)) * CW
}

const yBounds = computed(() => {
  const m = activeModel.value
  if (m === 'wt') {
    const wMax = (displayCP.value + displayW.value / T_MIN) * T_MAX
    return { min: 0, max: wMax * 1.08 }
  }
  if (m === 'hyp3') {
    const pHigh = displayPmax.value * 1.05
    return { min: Math.max(0, displayCP.value * 0.82), max: pHigh }
  }
  const pMax = displayCP.value + displayW.value / T_MIN
  return { min: Math.max(0, displayCP.value * 0.82), max: pMax * 1.08 }
})

function sy(p: number) {
  const { min, max } = yBounds.value
  return CB - ((p - min) / (max - min)) * CH
}

// --------------- Axis ticks ---------------
const xTicks = computed(() => {
  if (activeModel.value === 'p1t') {
    // Only 3 ticks to avoid crowding on the reciprocal axis
    return [
      { val: 1/600,  label: "1/10'" },
      { val: 1/300,  label: "1/5'" },
      { val: 1/120,  label: "1/2'" },
    ].map(t => ({ ...t, x: sx(t.val) }))
  }
  return [
    { val: 120,  label: "2'" },
    { val: 300,  label: "5'" },
    { val: 600,  label: "10'" },
    { val: 900,  label: "15'" },
    { val: 1200, label: "20'" },
    { val: 1800, label: "30'" },
  ].map(t => ({ ...t, x: sx(t.val) }))
})

const yTicks = computed(() => {
  const { min, max } = yBounds.value
  const rough = (max - min) / 5
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const res = rough / mag
  const interval = res <= 1.5 ? mag : res <= 3.5 ? 2 * mag : res <= 7.5 ? 5 * mag : 10 * mag
  const ticks: { value: number; y: number; label: string }[] = []
  for (let v = Math.ceil(min / interval) * interval; v <= max + interval * 0.01; v += interval) {
    let label: string
    if (activeModel.value === 'wt') {
      label = v >= 1000 ? `${(v / 1000).toFixed(0)}` : Math.round(v).toString()
    } else {
      label = Math.round(v).toString()
    }
    ticks.push({ value: v, y: sy(v), label })
  }
  return ticks
})

// --------------- Axis labels ---------------
const yAxisLabel = computed(() => activeModel.value === 'wt' ? 'Travail (kJ)' : 'Puissance (W)')
const xAxisLabel = computed(() => activeModel.value === 'p1t' ? '1 / Temps' : 'Temps')

// --------------- Equation header ---------------
const activeEquation = computed(() => models.find(m => m.id === activeModel.value)?.equation ?? '')
const activeColor = computed(() => models.find(m => m.id === activeModel.value)?.color ?? '#2C2F65')

// --------------- Curve generation (model-dependent) ---------------
const curvePath = computed(() => {
  const m = activeModel.value
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = T_MIN + (T_MAX - T_MIN) * (i / N)
    let xVal: number, yVal: number

    if (m === 'hyp2') {
      xVal = t; yVal = displayCP.value + displayW.value / t
    } else if (m === 'wt') {
      xVal = t; yVal = displayCP.value * t + displayW.value
    } else if (m === 'p1t') {
      xVal = 1 / t; yVal = displayW.value * (1 / t) + displayCP.value
    } else {
      const k = displayW.value / (displayPmax.value - displayCP.value)
      xVal = t; yVal = displayW.value / (t + k) + displayCP.value
    }
    pts.push(`${sx(xVal).toFixed(1)},${sy(yVal).toFixed(1)}`)
  }
  if (m === 'p1t') pts.reverse()
  return `M${pts.join('L')}`
})

// Dashed 2-param curve shown alongside hyp3 for comparison
const hyp2DashedPath = computed(() => {
  if (activeModel.value !== 'hyp3') return ''
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = T_MIN + (T_MAX - T_MIN) * (i / N)
    pts.push(`${sx(t).toFixed(1)},${sy(displayCP.value + displayW.value / t).toFixed(1)}`)
  }
  return `M${pts.join('L')}`
})

// --------------- W' shaded area (hyp2 only) ---------------
const wprimeArea = computed(() => {
  if (activeModel.value !== 'hyp2') return ''
  const pts: string[] = []
  for (let i = 0; i <= N; i++) {
    const t = T_MIN + (T_MAX - T_MIN) * (i / N)
    pts.push(`${sx(t).toFixed(1)},${sy(displayCP.value + displayW.value / t).toFixed(1)}`)
  }
  const cpY = sy(displayCP.value).toFixed(1)
  return `M${pts.join('L')}L${sx(T_MAX).toFixed(1)},${cpY}L${sx(T_MIN).toFixed(1)},${cpY}Z`
})

const cpLineY = computed(() => sy(displayCP.value))

const wLabelPos = computed(() => {
  const t = T_MIN + (T_MAX - T_MIN) * 0.12
  const pAtT = displayCP.value + displayW.value / t
  const mid = (sy(pAtT) + sy(displayCP.value)) / 2
  return { x: sx(t), y: mid, show: Math.abs(sy(pAtT) - sy(displayCP.value)) > 20 }
})

// --------------- Data point transformation ---------------
function pointXY(pt: { t: number; p: number }) {
  const m = activeModel.value
  if (m === 'wt') return { x: sx(pt.t), y: sy(pt.p * pt.t) }
  if (m === 'p1t') return { x: sx(1 / pt.t), y: sy(pt.p) }
  return { x: sx(pt.t), y: sy(pt.p) }
}

function pointLabel(pt: { t: number; p: number }) {
  const m = activeModel.value
  const tMin = Math.round(pt.t / 60)
  if (m === 'wt') return `${tMin}' → ${(pt.p * pt.t / 1000).toFixed(1)} kJ`
  if (m === 'p1t') return `1/${tMin}' → ${pt.p} W`
  return `${tMin} min → ${pt.p} W`
}

// Label position with model-aware collision avoidance
function pointLabelPos(pt: { t: number; p: number }, i: number) {
  const base = pointXY(pt)
  const m = activeModel.value
  if (m === 'p1t') {
    // Last point (1/20') is very close to 1/10' — place label below
    if (i === 3) return { x: base.x + 4, y: base.y + 10, anchor: 'start' }
  }
  if (m === 'wt') {
    // First two points are near bottom, stagger vertically
    if (i === 0) return { x: base.x + 5, y: base.y - 3, anchor: 'start' }
    if (i === 1) return { x: base.x + 5, y: base.y - 6, anchor: 'start' }
  }
  return { x: base.x + 4, y: base.y - 4, anchor: 'start' }
}

// --------------- Annotations: wt slope triangle ---------------
const wtAnnotation = computed(() => {
  if (activeModel.value !== 'wt') return null
  // Triangle positioned between 10' and 30' data points (clear area)
  const t1 = 850, t2 = 1450
  const w1 = displayCP.value * t1 + displayW.value
  const w2 = displayCP.value * t2 + displayW.value
  return {
    x1: sx(t1), y1: sy(w1),
    x2: sx(t2), y2: sy(w2),
    cornerX: sx(t2), cornerY: sy(w1),
    labelX: sx(t2) + 6,
    labelY: (sy(w1) + sy(w2)) / 2,
  }
})

// --------------- Annotations: p1t slope triangle ---------------
const p1tAnnotation = computed(() => {
  if (activeModel.value !== 'p1t') return null
  // Triangle positioned in upper-right, away from all data points
  const inv1 = 1 / 110, inv2 = 1 / 70
  const p1 = displayW.value * inv1 + displayCP.value
  const p2 = displayW.value * inv2 + displayCP.value
  return {
    x1: sx(inv1), y1: sy(p1),
    x2: sx(inv2), y2: sy(p2),
    cornerX: sx(inv2), cornerY: sy(p1),
    labelX: sx(inv2) + 6,
    labelY: (sy(p1) + sy(p2)) / 2,
  }
})

// --------------- Pmax line for hyp3 ---------------
const pmaxLineY = computed(() => sy(displayPmax.value))
</script>

<template>
  <div class="pdc-container">
    <div class="pdc-equation" :style="{ color: activeColor }">{{ activeEquation }}</div>

    <div class="pdc-main">
      <!-- ========== SVG Chart ========== -->
      <div class="pdc-chart-wrap">
        <svg viewBox="0 0 660 320">
          <defs>
            <clipPath id="pdc-clip">
              <rect :x="CL" :y="CT" :width="CW" :height="CH" />
            </clipPath>
          </defs>

          <!-- Grid -->
          <line v-for="tick in yTicks" :key="'gy'+tick.value"
                :x1="CL" :x2="CR" :y1="tick.y" :y2="tick.y"
                stroke="#e5e7eb" stroke-width="0.2" />
          <line v-for="tick in xTicks" :key="'gx'+tick.val"
                :x1="tick.x" :x2="tick.x" :y1="CT" :y2="CB"
                stroke="#e5e7eb" stroke-width="0.2" />

          <!-- Axes -->
          <line :x1="CL" :y1="CB" :x2="CR" :y2="CB" stroke="#374151" stroke-width="0.5" />
          <line :x1="CL" :y1="CT" :x2="CL" :y2="CB" stroke="#374151" stroke-width="0.5" />

          <!-- Clipped content -->
          <g clip-path="url(#pdc-clip)">
            <!-- Data points (appear one by one, steps 1-4) -->
            <g v-for="(pt, i) in dataPoints" :key="'dp'+i"
               class="pdc-point" :class="{ 'pdc-point-hidden': props.step < i + 1 }">
              <circle :cx="pointXY(pt).x" :cy="pointXY(pt).y" r="1.8"
                      fill="var(--insep-navy, #2C2F65)" stroke="white" stroke-width="0.5"
                      class="pdc-animated-attr" />
              <text :x="pointLabelPos(pt, i).x" :y="pointLabelPos(pt, i).y"
                    :text-anchor="pointLabelPos(pt, i).anchor"
                    font-size="2.5" fill="#374151" class="pdc-animated-attr">{{ pointLabel(pt) }}</text>
            </g>

            <!-- ===== hyp2 annotations ===== -->
            <template v-if="activeModel === 'hyp2' && props.step >= 5">
              <path :d="wprimeArea" fill="var(--insep-gold, #C59F69)" fill-opacity="0.12" />
              <line :x1="CL" :x2="CR" :y1="cpLineY" :y2="cpLineY"
                    stroke="var(--insep-red, #C5243D)" stroke-width="0.7" stroke-dasharray="6 3" />
              <path :d="curvePath" fill="none" stroke="#2C2F65" stroke-width="1.2" />
              <text v-if="wLabelPos.show" :x="wLabelPos.x" :y="wLabelPos.y"
                    fill="var(--insep-gold-dark, #B38D52)" font-size="4.5" font-weight="700"
                    text-anchor="middle" opacity="0.6">W'</text>
            </template>

            <!-- ===== wt annotations ===== -->
            <template v-if="activeModel === 'wt' && props.step >= 5">
              <path :d="curvePath" fill="none" stroke="#A07D45" stroke-width="1.2" />
              <!-- Slope triangle (positioned between 10' and 30' points) -->
              <template v-if="wtAnnotation">
                <line :x1="wtAnnotation.x1" :y1="wtAnnotation.y1"
                      :x2="wtAnnotation.cornerX" :y2="wtAnnotation.cornerY"
                      stroke="#A07D45" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.5" />
                <line :x1="wtAnnotation.cornerX" :y1="wtAnnotation.cornerY"
                      :x2="wtAnnotation.x2" :y2="wtAnnotation.y2"
                      stroke="#A07D45" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.5" />
                <text :x="wtAnnotation.labelX" :y="wtAnnotation.labelY"
                      font-size="3" fill="#A07D45" font-weight="600">
                  pente = CP
                </text>
              </template>
            </template>

            <!-- ===== p1t annotations ===== -->
            <template v-if="activeModel === 'p1t' && props.step >= 5">
              <path :d="curvePath" fill="none" stroke="#C5243D" stroke-width="1.2" />
              <!-- CP intercept dashed line -->
              <line :x1="CL" :x2="CR" :y1="cpLineY" :y2="cpLineY"
                    stroke="#C5243D" stroke-width="0.7" stroke-dasharray="6 3" />
              <!-- Slope triangle (positioned in upper-right, clear of data points) -->
              <template v-if="p1tAnnotation">
                <line :x1="p1tAnnotation.x1" :y1="p1tAnnotation.y1"
                      :x2="p1tAnnotation.cornerX" :y2="p1tAnnotation.cornerY"
                      stroke="#C5243D" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.5" />
                <line :x1="p1tAnnotation.cornerX" :y1="p1tAnnotation.cornerY"
                      :x2="p1tAnnotation.x2" :y2="p1tAnnotation.y2"
                      stroke="#C5243D" stroke-width="0.5" stroke-dasharray="3 2" opacity="0.5" />
                <text :x="p1tAnnotation.labelX" :y="p1tAnnotation.labelY"
                      font-size="3" fill="#C5243D" font-weight="600">
                  pente = W'
                </text>
              </template>
            </template>

            <!-- ===== hyp3 annotations ===== -->
            <template v-if="activeModel === 'hyp3' && props.step >= 5">
              <!-- 2-param dashed reference -->
              <path :d="hyp2DashedPath" fill="none" stroke="#2C2F65" stroke-width="0.8" stroke-dasharray="5 3" opacity="0.5" />
              <!-- 3-param solid -->
              <path :d="curvePath" fill="none" stroke="#6B7280" stroke-width="1.2" />
              <!-- CP dashed line -->
              <line :x1="CL" :x2="CR" :y1="cpLineY" :y2="cpLineY"
                    stroke="var(--insep-red, #C5243D)" stroke-width="0.5" stroke-dasharray="4 3" opacity="0.5" />
              <!-- Pmax dashed line -->
              <line :x1="CL" :x2="CR" :y1="pmaxLineY" :y2="pmaxLineY"
                    stroke="#6B7280" stroke-width="0.7" stroke-dasharray="6 3" />
            </template>
          </g>

          <!-- Labels outside clip -->
          <!-- CP label -->
          <text v-if="(activeModel === 'hyp2' || activeModel === 'p1t' || activeModel === 'hyp3') && props.step >= 5"
                :x="CR + 3" :y="cpLineY + 1.5"
                fill="var(--insep-red, #C5243D)" font-size="3.5" font-weight="700">CP</text>

          <!-- CP = intercept label for p1t -->
          <text v-if="activeModel === 'p1t' && props.step >= 5"
                :x="CR - 5" :y="cpLineY - 4"
                fill="#C5243D" font-size="2.5" font-weight="600" text-anchor="end" opacity="0.7">intercept</text>

          <!-- Pmax label (hyp3) -->
          <text v-if="activeModel === 'hyp3' && props.step >= 5"
                :x="CR + 3" :y="pmaxLineY + 1.5"
                fill="#6B7280" font-size="3.5" font-weight="700">Pmax</text>

          <!-- Y ticks & labels -->
          <g v-for="tick in yTicks" :key="'yt'+tick.value">
            <line :x1="CL - 2" :x2="CL" :y1="tick.y" :y2="tick.y" stroke="#374151" stroke-width="0.5" />
            <text :x="CL - 4" :y="tick.y + 1" text-anchor="end" fill="#6b7280" font-size="3">{{ tick.label }}</text>
          </g>

          <!-- X ticks & labels -->
          <g v-for="tick in xTicks" :key="'xt'+tick.val">
            <line :x1="tick.x" :x2="tick.x" :y1="CB" :y2="CB + 3" stroke="#374151" stroke-width="0.5" />
            <text :x="tick.x" :y="CB + 11" text-anchor="middle" fill="#6b7280" font-size="3">{{ tick.label }}</text>
          </g>

          <!-- Axis titles -->
          <text :x="(CL + CR) / 2" :y="CB + 24" text-anchor="middle" fill="#374151" font-size="3">{{ xAxisLabel }}</text>
          <text :x="7" :y="(CT + CB) / 2" text-anchor="middle" fill="#374151" font-size="3"
                :transform="`rotate(-90, 7, ${(CT + CB) / 2})`">{{ yAxisLabel }}</text>
        </svg>
      </div>

      <!-- ========== Controls ========== -->
      <div class="pdc-controls">
        <!-- Model selector (step 6+) -->
        <div class="pdc-models" :class="{ 'pdc-hidden': props.step < 6 }">
          <button v-for="m in models" :key="m.id"
            class="pdc-model-btn" :class="{ active: activeModel === m.id }"
            :style="activeModel === m.id
              ? { background: m.color, borderColor: m.color, color: 'white' }
              : { borderColor: m.color, color: m.color }"
            @click="activeModel = m.id">
            {{ m.label }}
          </button>
        </div>

        <!-- Sliders (step 5+) -->
        <div class="pdc-sliders" :class="{ 'pdc-hidden': props.step < 5 }">
          <div class="pdc-slider-row">
            <label class="pdc-slider-label">CP</label>
            <input type="range" class="pdc-range"
                   :min="150" :max="400" :step="5"
                   :value="cp" @input="onCP" />
            <span class="pdc-slider-val">{{ Math.round(displayCP) }} W</span>
          </div>
          <div class="pdc-slider-row">
            <label class="pdc-slider-label">W'</label>
            <input type="range" class="pdc-range"
                   :min="5000" :max="35000" :step="500"
                   :value="wprime" @input="onW" />
            <span class="pdc-slider-val">{{ (displayW / 1000).toFixed(1) }} kJ</span>
          </div>
          <!-- Pmax slider (step 7+, only for hyp3) -->
          <div class="pdc-slider-row" :class="{ 'pdc-hidden': props.step < 7 || activeModel !== 'hyp3' }">
            <label class="pdc-slider-label">Pmax</label>
            <input type="range" class="pdc-range"
                   :min="500" :max="1500" :step="10"
                   :value="pmax" @input="onPmax" />
            <span class="pdc-slider-val">{{ Math.round(displayPmax) }} W</span>
          </div>
        </div>

        <!-- Value cards -->
        <div class="pdc-values">
          <div class="pdc-val-card">
            <span class="pdc-val-lbl">CP</span>
            <span class="pdc-val-num" style="color: var(--insep-red, #C5243D);">{{ Math.round(displayCP) }} W</span>
          </div>
          <div class="pdc-val-card">
            <span class="pdc-val-lbl">W'</span>
            <span class="pdc-val-num" style="color: var(--insep-gold, #C59F69);">{{ (displayW / 1000).toFixed(1) }} kJ</span>
          </div>
          <div v-if="activeModel === 'hyp3'" class="pdc-val-card">
            <span class="pdc-val-lbl">Pmax</span>
            <span class="pdc-val-num" style="color: #6B7280;">{{ Math.round(displayPmax) }} W</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="pdc-legend">
          <template v-if="activeModel === 'hyp2'">
            <div class="pdc-leg-item"><span class="pdc-leg-line"></span> CP = asymptote</div>
            <div class="pdc-leg-item"><span class="pdc-leg-fill"></span> W' = aire au-dessus de CP</div>
          </template>
          <template v-else-if="activeModel === 'wt'">
            <div class="pdc-leg-item"><span class="pdc-leg-swatch" style="background: #A07D45;"></span> Droite : pente = CP, intercept = W'</div>
          </template>
          <template v-else-if="activeModel === 'p1t'">
            <div class="pdc-leg-item"><span class="pdc-leg-swatch" style="background: #C5243D;"></span> Droite : pente = W', intercept = CP</div>
          </template>
          <template v-else>
            <div class="pdc-leg-item"><span class="pdc-leg-swatch" style="background: #6B7280;"></span> 3-param (solide)</div>
            <div class="pdc-leg-item"><span class="pdc-leg-line-navy"></span> 2-param (pointillé)</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdc-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.35rem;
  font-family: inherit;
  padding: 0.15rem 0;
}

/* ---- Equation header ---- */
.pdc-equation {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.25rem 0;
  background: rgba(44, 47, 101, 0.04);
  border-radius: 0.4rem;
  transition: color 0.3s ease;
}

/* ---- Main layout ---- */
.pdc-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 0.75rem;
  min-height: 0;
}

.pdc-chart-wrap {
  display: flex;
  align-items: center;
}

.pdc-chart-wrap svg {
  width: 100%;
  height: auto;
}

/* ---- Controls panel ---- */
.pdc-controls {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  justify-content: center;
}

/* ---- Step reveal transition ---- */
.pdc-models,
.pdc-sliders,
.pdc-values {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.pdc-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
}

/* ---- Data point pop-in ---- */
.pdc-point {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.pdc-point-hidden {
  opacity: 0;
  transform: scale(0.3);
  pointer-events: none;
}

/* ---- Model selector buttons ---- */
.pdc-models {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.pdc-model-btn {
  padding: 0.18rem 0.5rem;
  font-size: 0.55rem;
  font-weight: 600;
  border: 1.5px solid;
  border-radius: 1rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.3;
}

.pdc-model-btn:hover {
  opacity: 0.85;
  filter: brightness(1.1);
}

/* ---- Sliders ---- */
.pdc-sliders {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pdc-slider-row {
  display: grid;
  grid-template-columns: 2.5rem 1fr 4.5rem;
  align-items: center;
  gap: 0.3rem;
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.pdc-slider-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--insep-navy, #2C2F65);
  text-align: right;
}

.pdc-slider-val {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--insep-navy, #2C2F65);
  font-variant-numeric: tabular-nums;
}

.pdc-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(44, 47, 101, 0.12), rgba(44, 47, 101, 0.2));
  outline: none;
  cursor: pointer;
}

.pdc-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--insep-gold, #C59F69);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s;
}

.pdc-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.pdc-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--insep-gold, #C59F69);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.pdc-range::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(44, 47, 101, 0.12), rgba(44, 47, 101, 0.2));
}

/* ---- Value cards ---- */
.pdc-values {
  display: flex;
  gap: 0.5rem;
}

.pdc-val-card {
  flex: 1;
  text-align: center;
  padding: 0.3rem 0.4rem;
  background: rgba(44, 47, 101, 0.04);
  border-radius: 0.4rem;
  border: 1px solid rgba(44, 47, 101, 0.1);
}

.pdc-val-lbl {
  display: block;
  font-size: 0.52rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.6;
  margin-bottom: 0.1rem;
  color: var(--insep-navy, #2C2F65);
}

.pdc-val-num {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* ---- Legend ---- */
.pdc-legend {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.pdc-leg-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.5rem;
  color: #6b7280;
}

.pdc-leg-line {
  width: 16px;
  height: 0;
  border-bottom: 2px dashed var(--insep-red, #C5243D);
  display: inline-block;
}

.pdc-leg-line-navy {
  width: 16px;
  height: 0;
  border-bottom: 2px dashed #2C2F65;
  display: inline-block;
  opacity: 0.5;
}

.pdc-leg-fill {
  width: 12px;
  height: 8px;
  background: var(--insep-gold, #C59F69);
  opacity: 0.3;
  border-radius: 2px;
  display: inline-block;
}

.pdc-leg-swatch {
  width: 12px;
  height: 3px;
  border-radius: 1px;
  display: inline-block;
}
</style>
