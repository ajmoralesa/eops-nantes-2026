<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    step?: number;
  }>(),
  { step: 0 }
);

interface Protocol {
  id: string;
  letter: string;
  title: string;
  subtitle: string;
  xRange: [number, number];
  yRange: [number, number];
  xTicks: number[];
  yTicks: number[];
  poPeak: number;
  vo2peak: number;
  data: { t: number; vo2: number }[];
}

const protocols: Protocol[] = [
  {
    id: "ramp",
    letter: "A",
    title: "Rampe",
    subtitle: "(30 W·min⁻¹)",
    xRange: [-120, 600],
    yRange: [0.5, 4.0],
    xTicks: [0, 120, 240, 360, 480, 600],
    yTicks: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
    poPeak: 375,
    vo2peak: 3.7,
    data: [
      // Baseline at 50 W
      { t: -110, vo2: 1.05 }, { t: -95, vo2: 0.92 }, { t: -80, vo2: 1.08 },
      { t: -65, vo2: 0.98 }, { t: -50, vo2: 1.12 }, { t: -35, vo2: 1.0 },
      { t: -20, vo2: 1.06 }, { t: -5, vo2: 0.95 },
      // Ramp start
      { t: 15, vo2: 1.02 }, { t: 30, vo2: 1.10 }, { t: 50, vo2: 1.18 },
      { t: 70, vo2: 1.25 }, { t: 90, vo2: 1.38 }, { t: 110, vo2: 1.42 },
      { t: 130, vo2: 1.55 }, { t: 150, vo2: 1.60 }, { t: 170, vo2: 1.72 },
      { t: 190, vo2: 1.80 }, { t: 210, vo2: 1.92 }, { t: 230, vo2: 1.98 },
      { t: 250, vo2: 2.10 }, { t: 270, vo2: 2.18 }, { t: 290, vo2: 2.30 },
      { t: 310, vo2: 2.38 }, { t: 325, vo2: 2.48 }, { t: 340, vo2: 2.55 },
      { t: 355, vo2: 2.65 }, { t: 370, vo2: 2.72 }, { t: 385, vo2: 2.82 },
      { t: 400, vo2: 2.88 }, { t: 415, vo2: 2.98 }, { t: 430, vo2: 3.05 },
      { t: 445, vo2: 3.12 }, { t: 460, vo2: 3.22 }, { t: 475, vo2: 3.28 },
      { t: 490, vo2: 3.35 }, { t: 500, vo2: 3.42 }, { t: 510, vo2: 3.48 },
      { t: 520, vo2: 3.52 }, { t: 530, vo2: 3.58 }, { t: 540, vo2: 3.62 },
      { t: 548, vo2: 3.68 }, { t: 555, vo2: 3.72 }, { t: 560, vo2: 3.65 },
      { t: 565, vo2: 3.58 },
    ],
  },
  {
    id: "step",
    letter: "B",
    title: "Paliers",
    subtitle: "(60 W / 6 min)",
    xRange: [0, 1500],
    yRange: [0.5, 4.0],
    xTicks: [0, 360, 720, 1080, 1440],
    yTicks: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
    poPeak: 290,
    vo2peak: 3.7,
    data: [
      // Step 1: 110 W (0–360 s)
      { t: 10, vo2: 0.85 }, { t: 30, vo2: 1.05 }, { t: 60, vo2: 1.18 },
      { t: 90, vo2: 1.25 }, { t: 120, vo2: 1.30 }, { t: 160, vo2: 1.28 },
      { t: 200, vo2: 1.32 }, { t: 240, vo2: 1.25 }, { t: 280, vo2: 1.30 },
      { t: 320, vo2: 1.28 }, { t: 350, vo2: 1.32 },
      // Step 2: 170 W (360–720 s)
      { t: 370, vo2: 1.45 }, { t: 390, vo2: 1.72 }, { t: 420, vo2: 1.90 },
      { t: 460, vo2: 1.98 }, { t: 500, vo2: 2.02 }, { t: 540, vo2: 1.95 },
      { t: 580, vo2: 2.05 }, { t: 620, vo2: 2.00 }, { t: 660, vo2: 1.98 },
      { t: 700, vo2: 2.02 },
      // Step 3: 230 W (720–1080 s)
      { t: 730, vo2: 2.15 }, { t: 750, vo2: 2.48 }, { t: 780, vo2: 2.72 },
      { t: 810, vo2: 2.85 }, { t: 850, vo2: 2.90 }, { t: 890, vo2: 2.95 },
      { t: 930, vo2: 2.88 }, { t: 960, vo2: 2.98 }, { t: 1000, vo2: 3.02 },
      { t: 1040, vo2: 2.95 }, { t: 1070, vo2: 3.00 },
      // Step 4: 290 W (1080–1440 s)
      { t: 1090, vo2: 3.10 }, { t: 1110, vo2: 3.28 }, { t: 1140, vo2: 3.42 },
      { t: 1170, vo2: 3.48 }, { t: 1200, vo2: 3.52 }, { t: 1230, vo2: 3.55 },
      { t: 1260, vo2: 3.60 }, { t: 1300, vo2: 3.62 }, { t: 1340, vo2: 3.65 },
      { t: 1370, vo2: 3.68 }, { t: 1400, vo2: 3.72 }, { t: 1420, vo2: 3.65 },
    ],
  },
  {
    id: "constant",
    letter: "C",
    title: "Constant",
    subtitle: "(265 W)",
    xRange: [-120, 600],
    yRange: [0.2, 4.0],
    xTicks: [0, 120, 240, 360, 480, 600],
    yTicks: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
    poPeak: 265,
    vo2peak: 3.7,
    data: [
      // Baseline at 20 W
      { t: -110, vo2: 0.38 }, { t: -90, vo2: 0.42 }, { t: -70, vo2: 0.35 },
      { t: -50, vo2: 0.45 }, { t: -30, vo2: 0.40 }, { t: -10, vo2: 0.38 },
      // Fast phase
      { t: 5, vo2: 0.55 }, { t: 15, vo2: 0.95 }, { t: 25, vo2: 1.40 },
      { t: 35, vo2: 1.85 }, { t: 45, vo2: 2.15 }, { t: 55, vo2: 2.38 },
      { t: 70, vo2: 2.55 }, { t: 85, vo2: 2.68 },
      // Transition
      { t: 100, vo2: 2.78 }, { t: 120, vo2: 2.88 }, { t: 140, vo2: 2.95 },
      { t: 160, vo2: 3.02 }, { t: 180, vo2: 3.08 },
      // Slow component
      { t: 210, vo2: 3.12 }, { t: 240, vo2: 3.18 }, { t: 270, vo2: 3.22 },
      { t: 300, vo2: 3.28 }, { t: 330, vo2: 3.32 }, { t: 360, vo2: 3.38 },
      { t: 390, vo2: 3.42 }, { t: 420, vo2: 3.48 }, { t: 450, vo2: 3.52 },
      { t: 470, vo2: 3.58 }, { t: 490, vo2: 3.62 }, { t: 510, vo2: 3.68 },
      { t: 525, vo2: 3.72 }, { t: 535, vo2: 3.65 }, { t: 545, vo2: 3.60 },
    ],
  },
];

// Max number of data points across all panels (for VO₂max line delay)
const maxPoints = Math.max(...protocols.map((p) => p.data.length));

// SVG coordinate helpers
const margin = { top: 28, right: 10, bottom: 34, left: 36 };
const W = 200;
const H = 210;
const plotW = W - margin.left - margin.right;
const plotH = H - margin.top - margin.bottom;

function xPos(t: number, p: Protocol): number {
  return (
    margin.left +
    ((t - p.xRange[0]) / (p.xRange[1] - p.xRange[0])) * plotW
  );
}

function yPos(vo2: number, p: Protocol): number {
  return (
    margin.top +
    plotH -
    ((vo2 - p.yRange[0]) / (p.yRange[1] - p.yRange[0])) * plotH
  );
}
</script>

<template>
  <div class="keir-figure">
    <div class="panels">
      <div v-for="(p, pi) in protocols" :key="p.id" class="panel">
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart">
          <!-- Panel letter -->
          <text :x="margin.left + 2" :y="12" class="letter">{{ p.letter }}</text>
          <!-- Title -->
          <text :x="W / 2" :y="12" text-anchor="middle" class="title">
            {{ p.title }}
          </text>
          <text :x="W / 2" :y="22" text-anchor="middle" class="subtitle">
            {{ p.subtitle }}
          </text>

          <!-- Y axis -->
          <line
            :x1="margin.left" :y1="margin.top"
            :x2="margin.left" :y2="margin.top + plotH"
            stroke="#999" stroke-width="0.7"
          />
          <!-- X axis -->
          <line
            :x1="margin.left" :y1="margin.top + plotH"
            :x2="margin.left + plotW" :y2="margin.top + plotH"
            stroke="#999" stroke-width="0.7"
          />

          <!-- Y ticks -->
          <template v-for="tick in p.yTicks" :key="tick">
            <line
              :x1="margin.left - 3" :y1="yPos(tick, p)"
              :x2="margin.left" :y2="yPos(tick, p)"
              stroke="#999" stroke-width="0.5"
            />
            <text
              :x="margin.left - 5" :y="yPos(tick, p) + 1.5"
              text-anchor="end" class="tick-label"
            >
              {{ tick.toFixed(1) }}
            </text>
          </template>

          <!-- X ticks -->
          <template v-for="tick in p.xTicks" :key="tick">
            <line
              :x1="xPos(tick, p)" :y1="margin.top + plotH"
              :x2="xPos(tick, p)" :y2="margin.top + plotH + 3"
              stroke="#999" stroke-width="0.5"
            />
            <text
              :x="xPos(tick, p)" :y="margin.top + plotH + 10"
              text-anchor="middle" class="tick-label"
            >
              {{ tick }}
            </text>
          </template>

          <!-- Y axis label -->
          <text
            :x="6" :y="margin.top + plotH / 2"
            text-anchor="middle" class="axis-label"
            :transform="`rotate(-90, 6, ${margin.top + plotH / 2})`"
          >
            VO₂ (L·min⁻¹)
          </text>
          <!-- X axis label -->
          <text
            :x="margin.left + plotW / 2" :y="H - 2"
            text-anchor="middle" class="axis-label"
          >
            Temps (s)
          </text>

          <!-- Data points -->
          <circle
            v-for="(d, di) in p.data"
            :key="di"
            :cx="xPos(d.t, p)"
            :cy="yPos(d.vo2, p)"
            r="2.2"
            fill="none"
            stroke="#555"
            stroke-width="0.8"
            class="data-point"
            :class="{ visible: step >= 1 }"
            :style="{ animationDelay: `${di * 100 + pi * 250}ms` }"
          />

          <!-- VO₂max dashed line -->
          <line
            :x1="margin.left"
            :y1="yPos(p.vo2peak, p)"
            :x2="margin.left + plotW"
            :y2="yPos(p.vo2peak, p)"
            stroke="#C5243D"
            stroke-width="1.2"
            stroke-dasharray="5,3"
            class="vo2max-line"
            :class="{ visible: step >= 1 }"
            :style="{ animationDelay: `${maxPoints * 100 + 600}ms` }"
          />

          <!-- VO₂peak label (on the line) -->
          <text
            :x="margin.left + plotW - 2"
            :y="yPos(p.vo2peak, p) - 3"
            text-anchor="end"
            class="vo2max-label"
            :class="{ visible: step >= 1 }"
            :style="{ animationDelay: `${maxPoints * 100 + 800}ms` }"
          >
            {{ p.vo2peak }} L/min
          </text>

          <!-- POpeak annotation -->
          <g
            class="annotation"
            :class="{ visible: step >= 2 }"
          >
            <rect
              :x="margin.left + plotW / 2 - 28"
              :y="margin.top + 4"
              width="56" height="18"
              rx="3"
              fill="white" fill-opacity="0.9"
              stroke="#C59F69" stroke-width="0.8"
            />
            <text
              :x="margin.left + plotW / 2"
              :y="margin.top + 17.5"
              text-anchor="middle"
              class="po-label"
            >
              {{ p.poPeak }} W
            </text>
          </g>
        </svg>
      </div>
    </div>

    <div class="ref-line">
      <a href="https://pubmed.ncbi.nlm.nih.gov/29570982/" target="_blank">Keir et al. 2018</a>
    </div>
  </div>
</template>

<style scoped>
.keir-figure {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.panels {
  display: flex;
  gap: 0.4rem;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.chart {
  width: 100%;
  height: 100%;
}

.letter {
  font-size: 11px;
  font-weight: 800;
  fill: #333;
}

.title {
  font-size: 9px;
  font-weight: 700;
  fill: var(--insep-blue, #2C2F65);
}

.subtitle {
  font-size: 7px;
  fill: #888;
}

.tick-label {
  font-size: 6px;
  fill: #666;
  font-family: system-ui, sans-serif;
}

.axis-label {
  font-size: 6.5px;
  fill: #555;
  font-family: system-ui, sans-serif;
}

/* Data points */
.data-point {
  opacity: 0;
}
.data-point.visible {
  animation: fadeIn 0.25s ease both;
}

/* VO₂max line */
.vo2max-line {
  opacity: 0;
}
.vo2max-line.visible {
  animation: fadeIn 0.4s ease both;
}

.vo2max-label {
  font-size: 6.5px;
  fill: #C5243D;
  font-weight: 700;
  font-family: system-ui, sans-serif;
  opacity: 0;
}
.vo2max-label.visible {
  animation: fadeIn 0.4s ease both;
}

/* POpeak annotation */
.annotation {
  opacity: 0;
}
.annotation.visible {
  animation: fadeIn 0.4s ease both;
}

.po-label {
  font-size: 8px;
  font-weight: 800;
  fill: var(--insep-gold, #C59F69);
  font-family: system-ui, sans-serif;
}

.ref-line {
  margin-top: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
