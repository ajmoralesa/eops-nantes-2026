<script setup lang="ts">
import { reactive, computed, watch, ref, onUnmounted, type Ref } from 'vue'

const props = withDefaults(
  defineProps<{
    step?: number
  }>(),
  { step: 0 },
)

// --------------- Slider state ---------------
const model = reactive({
  hr: 195,
  sv: 100,
  hb: 14,
  extraction: 75,
  mass: 80,
})

type ModelKey = keyof typeof model

// --------------- Presets ---------------
interface Preset {
  label: string
  hr: number
  sv: number
  hb: number
  extraction: number
  mass: number
}

const presets: Preset[] = [
  { label: 'Sédentaire',       hr: 195, sv: 100, hb: 14,   extraction: 75, mass: 80 },
  { label: 'Entraîné (H)',     hr: 190, sv: 160, hb: 15.5, extraction: 88, mass: 72 },
  { label: 'Élite skieur (H)', hr: 195, sv: 195, hb: 16.5, extraction: 85, mass: 85 },
  { label: 'Max théo. (H)',    hr: 200, sv: 200, hb: 17,   extraction: 90, mass: 100 },
  { label: 'Élite (F)',        hr: 200, sv: 150, hb: 15,   extraction: 86, mass: 65 },
]

const activePreset = ref<number | null>(0)

function applyPreset(index: number) {
  const p = presets[index]
  model.hr = p.hr
  model.sv = p.sv
  model.hb = p.hb
  model.extraction = p.extraction
  model.mass = p.mass
  activePreset.value = index
}

function clearPreset() {
  activePreset.value = null
}

function onSlider(key: ModelKey, e: Event) {
  model[key] = parseFloat((e.target as HTMLInputElement).value)
  clearPreset()
}

// --------------- Physiology math ---------------
// Q (L/min) = HR × SV / 1000
const qMax = computed(() => (model.hr * model.sv) / 1000)
// CaO2 (mL O2/dL blood) = [Hb] × 1.34 × SaO2(0.98)
const caO2 = computed(() => model.hb * 1.34 * 0.98)
// a-vO2 diff (mL O2/dL) = CaO2 × extraction fraction
const avO2diff = computed(() => caO2.value * (model.extraction / 100))
// VO2 (L/min) = Q (L/min) × a-vO2diff (mL O2/dL) × 10 (dL/L) / 1000 (mL→L)
//             = Q × a-vO2diff / 100
const vo2maxAbs = computed(() => (qMax.value * avO2diff.value) / 100)
// VO2 relative (mL/kg/min) = VO2 (L/min) × 1000 / mass (kg)
const vo2maxRel = computed(() => (vo2maxAbs.value * 1000) / model.mass)

// --------------- Animated display values ---------------
const displayQ = ref(qMax.value)
const displayAvO2 = ref(avO2diff.value)
const displayAbs = ref(vo2maxAbs.value)
const displayRel = ref(vo2maxRel.value)

const activeFrames = new Map<string, number>()

function animateTo(key: string, target: Ref<number>, goal: number, duration = 600) {
  if (activeFrames.has(key)) {
    cancelAnimationFrame(activeFrames.get(key)!)
    activeFrames.delete(key)
  }

  const startVal = target.value
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
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

watch(
  () => [model.hr, model.sv, model.hb, model.extraction, model.mass],
  () => {
    animateTo('q', displayQ, qMax.value)
    animateTo('av', displayAvO2, avO2diff.value)
    animateTo('abs', displayAbs, vo2maxAbs.value)
    animateTo('rel', displayRel, vo2maxRel.value)
  },
  { immediate: true },
)

onUnmounted(() => {
  for (const id of activeFrames.values()) {
    cancelAnimationFrame(id)
  }
  activeFrames.clear()
})

// --------------- Color coding ---------------
function vo2Color(rel: number): string {
  if (rel < 40) return '#888'
  if (rel < 55) return 'var(--insep-gold, #C59F69)'
  if (rel < 70) return 'var(--insep-gold-dark, #B38D52)'
  if (rel < 80) return 'var(--insep-red, #C5243D)'
  return '#d4175a'
}

// --------------- Slider config ---------------
interface SliderDef {
  key: ModelKey
  label: string
  min: number
  max: number
  step: number
  unit: string
  decimals: number
}

const sliders: SliderDef[] = [
  { key: 'hr',         label: 'FC max',      min: 140, max: 220, step: 1,   unit: 'bpm',  decimals: 0 },
  { key: 'sv',         label: 'VES max',     min: 60,  max: 220, step: 1,   unit: 'mL',   decimals: 0 },
  { key: 'hb',         label: '[Hb]',        min: 10,  max: 20,  step: 0.1, unit: 'g/dL', decimals: 1 },
  { key: 'extraction', label: 'Extraction',  min: 50,  max: 100, step: 1,   unit: '%',    decimals: 0 },
  { key: 'mass',       label: 'Masse',       min: 40,  max: 120, step: 1,   unit: 'kg',   decimals: 0 },
]

const tooltips: Record<ModelKey, string[]> = {
  hr: [
    'Génétiquement fixée, NON entraînable',
    '↓ ~1 bpm/an avec l\'âge',
    '« 220 − âge » imprécis (± 12 bpm) — toujours mesurer',
  ],
  sv: [
    'LE facteur entraînable du Q̇ (FC fixe → seul levier)',
    'Sédentaire ~70 mL → Élite ~200 mL (× 3)',
    'Élite : VES ↑ jusqu\'au VO₂max, pas de plateau',
  ],
  hb: [
    '+1 g Hb-masse ≈ +4 mL O₂/min',
    'Plafond naturel : H ~17 · F ~15 g/dL',
    'Relation linéaire avec VO₂max → cible du dopage sanguin',
  ],
  extraction: [
    'Repos ~25 % → VO₂max 85–90 %',
    'Entraînement ↑ capillaires + mitochondries',
    'Holloszy 1967 : entraînement double les enzymes oxydatives',
  ],
  mass: [
    'Absolu (L/min) → aviron, cyclisme plat',
    'Relatif (mL/kg/min) → course, ski de fond',
    'Rameur 98 kg · 7.0 L · 70 rel. vs Coureur 57 kg · 4.8 L · 85 rel.',
  ],
}
</script>

<template>
  <div class="fs-container">
    <!-- Equation header -->
    <div class="fs-equation">
      V̇O₂max = Q̇max × (CaO₂ − CvO₂)
    </div>

    <!-- Preset buttons -->
    <div class="fs-presets">
      <button
        v-for="(p, i) in presets"
        :key="i"
        class="fs-preset-btn"
        :class="{ 'fs-preset-active': activePreset === i }"
        @click="applyPreset(i)"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Main content: sliders + results -->
    <div class="fs-main">
      <!-- Sliders column -->
      <div class="fs-sliders">
        <div
          v-for="s in sliders"
          :key="s.key"
          class="fs-slider-row"
        >
          <label class="fs-slider-label">
            {{ s.label }}
            <span class="fs-info">
              ⓘ
              <span class="fs-tooltip">
                <span v-for="(line, j) in tooltips[s.key]" :key="j">
                  {{ line }}<br v-if="j < tooltips[s.key].length - 1" />
                </span>
              </span>
            </span>
          </label>
          <input
            type="range"
            class="fs-range"
            :min="s.min"
            :max="s.max"
            :step="s.step"
            :value="model[s.key]"
            @input="onSlider(s.key, $event)"
          />
          <span class="fs-slider-value">
            {{ model[s.key].toFixed(s.decimals) }}<span class="fs-slider-unit">{{ s.unit }}</span>
          </span>
        </div>
      </div>

      <!-- Results column -->
      <div class="fs-results">
        <!-- Intermediate values -->
        <div class="fs-result-group">
          <div class="fs-result-card fs-result-secondary">
            <div class="fs-result-label">Q̇max</div>
            <div class="fs-result-value">
              {{ displayQ.toFixed(1) }}
              <span class="fs-result-unit">L/min</span>
            </div>
          </div>
          <div class="fs-result-card fs-result-secondary">
            <div class="fs-result-label">Diff. a-vO₂</div>
            <div class="fs-result-value">
              {{ displayAvO2.toFixed(1) }}
              <span class="fs-result-unit">mL O₂/dL</span>
            </div>
          </div>
        </div>

        <!-- Primary results -->
        <div class="fs-result-card fs-result-primary" :style="{ borderColor: vo2Color(displayRel) }">
          <div class="fs-result-label">V̇O₂max</div>
          <div class="fs-result-big" :style="{ color: vo2Color(displayRel) }">
            {{ displayAbs.toFixed(2) }}
            <span class="fs-result-unit">L/min</span>
          </div>
          <div class="fs-result-rel" :style="{ color: vo2Color(displayRel) }">
            {{ displayRel.toFixed(1) }}
            <span class="fs-result-unit">mL/kg/min</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reference -->
    <div class="fs-ref">
      D'après Levine (2008) · Haugen et al. (2018) — « Rule of 200s »
    </div>
  </div>
</template>

<style scoped>
.fs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
  font-family: inherit;
  padding: 0.25rem 0;
}

/* ---- Equation header ---- */
.fs-equation {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--insep-navy, #2C2F65);
  letter-spacing: 0.02em;
  padding: 0.3rem 0;
  background: rgba(44, 47, 101, 0.04);
  border-radius: 0.4rem;
}

/* ---- Presets ---- */
.fs-presets {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.fs-preset-btn {
  padding: 0.2rem 0.55rem;
  font-size: 0.58rem;
  font-weight: 600;
  border: 1.5px solid var(--insep-gold, #C59F69);
  border-radius: 1rem;
  background: transparent;
  color: var(--insep-navy, #2C2F65);
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.3;
}

.fs-preset-btn:hover {
  background: var(--insep-gold-pale, #F9E9CA);
}

.fs-preset-active {
  background: var(--insep-gold, #C59F69);
  color: white;
  border-color: var(--insep-gold-dark, #B38D52);
}

/* ---- Main layout ---- */
.fs-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1rem;
  min-height: 0;
  align-items: center;
}

/* ---- Sliders ---- */
.fs-sliders {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.fs-slider-row {
  display: grid;
  grid-template-columns: 5.5rem 1fr 5rem;
  align-items: center;
  gap: 0.4rem;
}

.fs-slider-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--insep-navy, #2C2F65);
  text-align: right;
}

.fs-slider-value {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--insep-navy, #2C2F65);
  font-variant-numeric: tabular-nums;
  text-align: left;
}

.fs-slider-unit {
  font-size: 0.55rem;
  font-weight: 500;
  opacity: 0.55;
  margin-left: 0.15em;
}

/* ---- Range input styling ---- */
.fs-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(44, 47, 101, 0.12), rgba(44, 47, 101, 0.2));
  outline: none;
  cursor: pointer;
}

.fs-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--insep-gold, #C59F69);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.fs-range::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.fs-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--insep-gold, #C59F69);
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.fs-range::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(44, 47, 101, 0.12), rgba(44, 47, 101, 0.2));
}

/* ---- Results ---- */
.fs-results {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}

.fs-result-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.fs-result-card {
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  text-align: center;
  transition: border-color 0.4s ease;
}

.fs-result-secondary {
  flex: 1;
  background: rgba(44, 47, 101, 0.05);
  border: 1.5px solid rgba(44, 47, 101, 0.15);
}

.fs-result-primary {
  width: 100%;
  background: rgba(44, 47, 101, 0.06);
  border: 2.5px solid var(--insep-gold, #C59F69);
  padding: 0.6rem 0.8rem;
}

.fs-result-label {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--insep-navy, #2C2F65);
  opacity: 0.7;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fs-result-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--insep-navy, #2C2F65);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.fs-result-big {
  font-size: 1.8rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  transition: color 0.4s ease;
}

.fs-result-rel {
  font-size: 1.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-top: 0.15rem;
  transition: color 0.4s ease;
}

.fs-result-unit {
  font-size: 0.5em;
  font-weight: 500;
  opacity: 0.6;
  margin-left: 0.15em;
}

/* ---- Tooltip ---- */
.fs-info {
  position: relative;
  display: inline-block;
  margin-left: 0.2em;
  cursor: help;
  font-size: 0.6rem;
  opacity: 0.45;
  vertical-align: middle;
  transition: opacity 0.2s ease;
}

.fs-info:hover {
  opacity: 0.9;
}

.fs-tooltip {
  display: none;
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
  width: 240px;
  padding: 0.45rem 0.55rem;
  background: var(--insep-navy, #2C2F65);
  color: #fff;
  font-size: 0.52rem;
  font-weight: 400;
  line-height: 1.5;
  border-left: 3px solid var(--insep-gold, #C59F69);
  border-radius: 0.35rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  z-index: 10;
  pointer-events: none;
  white-space: normal;
  text-align: left;
}

.fs-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: var(--insep-navy, #2C2F65);
}

.fs-info:hover .fs-tooltip {
  display: block;
  animation: fs-fade-in 0.18s ease-out;
}

@keyframes fs-fade-in {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- Reference ---- */
.fs-ref {
  text-align: center;
  font-size: 0.48rem;
  opacity: 0.4;
  font-style: italic;
}
</style>
