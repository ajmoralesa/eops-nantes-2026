<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    step?: number;
    highlight?: string;
  }>(),
  {
    step: 0,
    highlight: '',
  }
);

interface SubDeterminant {
  name: string;
  detail: string;
}

interface Pillar {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  subs: SubDeterminant[];
  step: number;
}

const pillars: Pillar[] = [
  {
    id: "aerobic",
    label: "Énergie aérobie",
    sublabel: "perf. VO₂",
    color: "var(--insep-red, #C5243D)",
    bg: "rgba(197, 36, 61, 0.06)",
    step: 1,
    subs: [
      { name: "VO₂max", detail: "DC × diff. a-vO₂ · Élite : 60–85 mL/kg/min" },
      {
        name: "Seuil lactique",
        detail: "LT1 & LT2 · Cap. oxydative, densité capillaire",
      },
      { name: "Frac. utilisation", detail: "Élite : 80–90 % VO₂max (>30 min)" },
      { name: "Cinétique O₂", detail: "Vitesse de réponse" },
    ],
  },
  {
    id: "anaerobic",
    label: "Énergie anaérobie",
    sublabel: "déficit O₂",
    color: "var(--insep-navy, #2C2F65)",
    bg: "rgba(44, 47, 101, 0.06)",
    step: 2,
    subs: [
      { name: "Masse musculaire", detail: "Réservoir anaérobie" },
      { name: "Neuromusculaire", detail: "Recrutement UM, types fibres, RDF" },
      {
        name: "Capacité tampon",
        detail: "H⁺, carnosine · Surges haute intensité",
      },
    ],
  },
  {
    id: "efficiency",
    label: "Rendement mécanique",
    sublabel: "économie",
    color: "var(--insep-gold, #C59F69)",
    bg: "rgba(197, 159, 105, 0.08)",
    step: 3,
    subs: [
      { name: "Anthropométrie", detail: "Proportions, masse · Poids critique" },
      { name: "Technique", detail: "Patrons moteurs · Énergie élastique" },
      {
        name: "Facteurs physiol.",
        detail: "Fibres ST + efficientes, coût ventilation",
      },
    ],
  },
];

function pillarState(pillar: Pillar) {
  if (props.highlight) {
    return pillar.id === props.highlight ? "highlighted" : "visible";
  }
  // Step 6: highlight aerobic pillar
  if (props.step >= 6) {
    return pillar.id === "aerobic" ? "highlighted" : "visible";
  }
  if (props.step < pillar.step) return "skeleton";
  if (props.step === pillar.step) return "highlighted";
  if (props.step === 5) return "visible";
  return "visible";
}

function isDimmed(pillar: Pillar) {
  if (props.highlight) {
    return pillar.id !== props.highlight;
  }
  // Step 6: dim non-aerobic pillars
  if (props.step >= 6) {
    return pillar.id !== "aerobic";
  }
  return (
    props.step >= 1 &&
    props.step <= 3 &&
    props.step !== pillar.step &&
    pillar.step < props.step
  );
}

function isAllVisible() {
  return !!props.highlight || props.step >= 5;
}
</script>

<template>
  <div class="determinants">
    <!-- Performance header -->
    <div class="perf-box">
      <div class="perf-label">Performance</div>
      <div class="perf-sub">vitesse ou puissance soutenue</div>
    </div>

    <!-- Arrows row -->
    <div class="arrows-row">
      <svg viewBox="0 0 24 16" class="arrow-icon">
        <path
          d="M12 14V2m0 0L6 8m6-6l6 6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg viewBox="0 0 24 16" class="arrow-icon">
        <path
          d="M12 14V2m0 0L6 8m6-6l6 6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg viewBox="0 0 24 16" class="arrow-icon">
        <path
          d="M12 14V2m0 0L6 8m6-6l6 6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Main content -->
    <div class="main-area">
      <!-- Pillars with operators -->
      <div class="pillars-row">
        <template v-for="(pillar, idx) in pillars" :key="pillar.id">
          <!-- Operator between pillars -->
          <div
            v-if="idx > 0"
            class="operator"
            :class="{ 'op-visible': isAllVisible() || step >= pillar.step }"
          >
            {{ idx === 1 ? "+" : "×" }}
          </div>

          <!-- Pillar -->
          <div
            class="pillar"
            :class="[
              'pillar-' + pillarState(pillar),
              { 'pillar-dimmed': isDimmed(pillar) },
            ]"
            :style="{
              '--pillar-color': pillar.color,
              '--pillar-bg': pillar.bg,
            }"
          >
            <div class="pillar-header">
              <div class="pillar-label">{{ pillar.label }}</div>
              <div class="pillar-sublabel">{{ pillar.sublabel }}</div>
            </div>
            <div class="pillar-subs">
              <div
                v-for="sub in pillar.subs"
                :key="sub.name"
                class="sub-item"
                :class="{ 'sub-visible': isAllVisible() || step >= pillar.step }"
              >
                <span class="sub-name">{{ sub.name }}</span>
                <span class="sub-detail">{{ sub.detail }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Fatigue bar -->
      <div class="fatigue-bar" :class="{ 'fatigue-visible': isAllVisible() || step >= 4 }">
        <span class="fatigue-label">Résistance à la fatigue / Résilience</span>
        <span class="fatigue-items"
          >Substrats · Thermorégulation · Fatigue centrale · Fatigue
          périphérique</span
        >
      </div>

      <!-- Recovery -->
      <div class="recovery" :class="{ 'recovery-visible': isAllVisible() || step >= 5 }">
        <svg viewBox="0 0 20 20" class="recovery-icon"><path d="M4 10a6 6 0 1 1 1.76 4.24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M4 14.24V10h4.24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Récupération</span>
      </div>
    </div>

    <!-- Reference -->
    <div class="ref-line">Adapted from Sandbakk et al. (2023) ; Joyner &amp; Coyle (2008)</div>
  </div>
</template>

<style scoped>
.determinants {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.35rem;
  font-family: inherit;
}

/* Performance header */
.perf-box {
  background: var(--insep-navy, #2c2f65);
  color: white;
  text-align: center;
  padding: 0.45rem 1rem;
  border-radius: 0.5rem;
}

.perf-label {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.perf-sub {
  font-size: 0.55rem;
  opacity: 0.65;
  margin-top: 0.05rem;
}

/* Arrows */
.arrows-row {
  display: flex;
  justify-content: space-around;
  padding: 0 2rem;
}

.arrow-icon {
  width: 18px;
  height: 14px;
  color: var(--insep-navy, #2c2f65);
  opacity: 0.35;
}

/* Main area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 0;
}

/* Pillars row */
.pillars-row {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
  min-height: 0;
}

/* Operator */
.operator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--insep-navy, #2c2f65);
  min-width: 1.6rem;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.op-visible {
  opacity: 0.5;
}

/* Pillar */
.pillar {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.65rem;
  background: #fafafa;
  transition: all 0.4s ease;
  min-width: 0;
  overflow: hidden;
}

.pillar-skeleton {
  border-color: #e5e7eb;
  background: #fafafa;
}

.pillar-highlighted {
  border-color: var(--pillar-color);
  background: var(--pillar-bg);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
  transform: scale(1.02);
}

.pillar-visible {
  border-color: var(--pillar-color);
  background: var(--pillar-bg);
}

.pillar-dimmed {
  opacity: 0.45;
  filter: saturate(0.4);
}

/* Pillar header */
.pillar-header {
  text-align: center;
  margin-bottom: 0.4rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.pillar-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--pillar-color);
  line-height: 1.2;
}

.pillar-sublabel {
  font-size: 0.6rem;
  opacity: 0.5;
  margin-top: 0.05rem;
}

/* Sub-determinants */
.pillar-subs {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  justify-content: center;
}

.sub-item {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0.5rem;
  border-radius: 0.3rem;
  background: rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.sub-visible {
  opacity: 1;
  transform: translateY(0);
}

.sub-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--insep-navy, #2c2f65);
  line-height: 1.3;
}

.sub-detail {
  font-size: 0.6rem;
  opacity: 0.5;
  line-height: 1.3;
}

/* Fatigue bar */
.fatigue-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(
    90deg,
    rgba(197, 36, 61, 0.08),
    rgba(44, 47, 101, 0.08),
    rgba(197, 159, 105, 0.08)
  );
  border: 1.5px dashed rgba(44, 47, 101, 0.25);
  border-radius: 0.4rem;
  padding: 0.3rem 0.6rem;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fatigue-visible {
  opacity: 1;
  transform: translateY(0);
}

.fatigue-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--insep-navy, #2c2f65);
}

.fatigue-items {
  font-size: 0.55rem;
  opacity: 0.55;
  margin-top: 0.1rem;
}

/* Recovery */
.recovery {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--insep-navy, #2c2f65);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.recovery-visible {
  opacity: 0.6;
  transform: translateY(0);
}

.recovery-icon {
  width: 14px;
  height: 14px;
}

</style>
