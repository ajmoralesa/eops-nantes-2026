<script setup lang="ts">
interface Panel {
  id: string;
  label: string;
  unit: string;
  mean: number;
  min: number;
  max: number;
  values: number[];
}

// Data approximated from Jones et al. (2021) Figure 5
const panels: Panel[] = [
  {
    id: "vo2peak",
    label: "VO₂peak",
    unit: "mL/kg/min",
    mean: 71.0,
    min: 58,
    max: 88,
    values: [60, 62, 64, 65, 65, 67, 68, 70, 71, 73, 75, 75, 77, 80, 84],
  },
  {
    id: "fracutil",
    label: "%VO₂peak au LTP",
    unit: "%",
    mean: 92,
    min: 83,
    max: 99,
    values: [85, 87, 88, 88, 89, 90, 90, 91, 92, 93, 94, 94, 95, 96, 98],
  },
  {
    id: "o2cost",
    label: "Coût en O₂",
    unit: "mL/kg/km",
    mean: 191,
    min: 155,
    max: 225,
    values: [165, 170, 175, 178, 180, 183, 185, 186, 188, 190, 192, 195, 198, 200, 210, 218],
  },
];

function yPos(value: number, min: number, max: number): number {
  const h = 200;
  const top = 20;
  return top + h - ((value - min) / (max - min)) * h;
}

function xJitter(index: number): number {
  const center = 60;
  const spread = 18;
  return center + ((index % 3) - 1) * spread * 0.5 + (index % 2 === 0 ? -3 : 3);
}
</script>

<template>
  <div class="jones-inline">
    <div class="panels">
      <div
        v-for="(panel, pi) in panels"
        :key="panel.id"
        class="panel"
      >
        <div class="panel-letter">{{ ['A', 'B', 'C'][pi] }}</div>
        <svg viewBox="0 0 120 260" class="chart">
          <!-- Y axis -->
          <line x1="30" y1="16" x2="30" y2="224" stroke="#bbb" stroke-width="0.8" />

          <!-- Tick marks and labels -->
          <template v-for="i in 6" :key="i">
            <line
              :x1="26"
              :y1="yPos(panel.min + ((panel.max - panel.min) / 5) * (i - 1), panel.min, panel.max)"
              :x2="30"
              :y2="yPos(panel.min + ((panel.max - panel.min) / 5) * (i - 1), panel.min, panel.max)"
              stroke="#bbb"
              stroke-width="0.8"
            />
            <text
              :x="24"
              :y="yPos(panel.min + ((panel.max - panel.min) / 5) * (i - 1), panel.min, panel.max) + 1.5"
              text-anchor="end"
              class="tick-label"
            >
              {{ Math.round(panel.min + ((panel.max - panel.min) / 5) * (i - 1)) }}
            </text>
          </template>

          <!-- Individual data points -->
          <circle
            v-for="(val, vi) in panel.values"
            :key="vi"
            :cx="xJitter(vi)"
            :cy="yPos(val, panel.min, panel.max)"
            r="4"
            fill="none"
            stroke="#555"
            stroke-width="1.2"
            class="data-point"
            :style="{ animationDelay: `${vi * 40 + pi * 150}ms` }"
          />

          <!-- Mean line (red) -->
          <line
            :x1="40"
            :y1="yPos(panel.mean, panel.min, panel.max)"
            :x2="80"
            :y2="yPos(panel.mean, panel.min, panel.max)"
            stroke="#C5243D"
            stroke-width="2.5"
            class="mean-line"
            :style="{ animationDelay: `${pi * 150 + 600}ms` }"
          />

          <!-- Mean value label -->
          <text
            :x="85"
            :y="yPos(panel.mean, panel.min, panel.max) + 1.5"
            class="mean-label"
            :style="{ animationDelay: `${pi * 150 + 700}ms` }"
          >
            {{ panel.mean }}
          </text>
        </svg>
        <div class="panel-label" v-html="panel.label"></div>
        <div class="panel-unit">({{ panel.unit }})</div>
      </div>
    </div>

    <div class="chart-footer">
      Chaque cercle = 1 athlète · Ligne rouge = moyenne du groupe
    </div>
  </div>
</template>

<style scoped>
.jones-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

/* Panels */
.panels {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  align-items: flex-end;
  flex: 1;
}

.panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 180px;
  animation: panelFadeIn 0.5s ease both;
}
.panel:nth-child(2) { animation-delay: 0.15s; }
.panel:nth-child(3) { animation-delay: 0.3s; }

.panel-letter {
  font-weight: 800;
  font-size: 0.85rem;
  color: #333;
  align-self: flex-start;
  margin-left: 1.5rem;
  margin-bottom: 0.1rem;
}

.chart {
  width: 100%;
  max-height: 220px;
}

.tick-label {
  font-size: 5.5px;
  fill: #666;
  font-family: system-ui, sans-serif;
}

.data-point {
  animation: dotFadeIn 0.3s ease both;
}

.mean-line {
  animation: dotFadeIn 0.4s ease both;
}

.mean-label {
  font-size: 5px;
  fill: #C5243D;
  font-weight: 700;
  font-family: system-ui, sans-serif;
  animation: dotFadeIn 0.4s ease both;
}

.panel-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-top: 0.1rem;
  line-height: 1.2;
}

.panel-unit {
  font-size: 0.55rem;
  color: #888;
  text-align: center;
}

/* Footer */
.chart-footer {
  text-align: center;
  font-size: 0.6rem;
  color: #aaa;
  margin-top: 0.3rem;
  padding-top: 0.4rem;
  border-top: 1px solid #eee;
}

/* Animations */
@keyframes panelFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes dotFadeIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
</style>
