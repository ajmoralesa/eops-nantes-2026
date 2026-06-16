<script setup lang="ts">
// Static VO2 recovery curve diagram — no props needed
</script>

<template>
  <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" class="vo2-recovery-svg">
    <defs>
      <marker id="vo2rec-arrEnd" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 0 L 8 4 L 0 8 Z" fill="#666"/>
      </marker>
      <marker id="vo2rec-arrStart" viewBox="0 0 8 8" refX="0" refY="4" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 8 0 L 0 4 L 8 8 Z" fill="#666"/>
      </marker>
    </defs>

    <!-- Resting VO2 band -->
    <rect x="70" y="280" width="455" height="40" fill="rgba(44,47,101,0.10)"/>

    <!-- Oxygen deficit fill -->
    <path d="M 115 80 L 195 80 C 158 80, 115 100, 115 280 Z" fill="rgba(210,130,70,0.25)"/>

    <!-- EPOC fast phase fill -->
    <path d="M 310 80 C 315 175, 340 225, 385 250 L 385 280 L 310 280 Z" fill="rgba(44,47,101,0.18)"/>

    <!-- EPOC slow phase fill -->
    <path d="M 385 250 C 420 265, 475 278, 520 280 L 385 280 Z" fill="rgba(197,159,105,0.22)"/>

    <!-- Resting baseline dashed -->
    <line x1="70" y1="280" x2="525" y2="280" stroke="#999" stroke-width="1" stroke-dasharray="8,5"/>

    <!-- Steady state dashed -->
    <line x1="115" y1="80" x2="310" y2="80" stroke="#bbb" stroke-width="1" stroke-dasharray="6,4"/>

    <!-- Exercise end vertical dashed -->
    <line x1="310" y1="40" x2="310" y2="322" stroke="#ccc" stroke-width="1" stroke-dasharray="5,4"/>

    <!-- Phase divider -->
    <line x1="385" y1="250" x2="385" y2="280" stroke="rgba(160,125,69,0.5)" stroke-width="1" stroke-dasharray="4,3"/>

    <!-- Main VO2 curve -->
    <path
      d="M 70 280 L 115 280 C 115 100, 158 80, 195 80 L 310 80 C 315 175, 340 225, 385 250 C 420 265, 475 278, 520 280"
      fill="none" stroke="#2C2F65" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
    />

    <!-- Axes -->
    <line x1="70" y1="28" x2="70" y2="322" stroke="#555" stroke-width="1.5"/>
    <line x1="65" y1="322" x2="545" y2="322" stroke="#555" stroke-width="1.5"/>
    <polygon points="67,36 70,25 73,36" fill="#555"/>
    <polygon points="537,318 548,322 537,326" fill="#555"/>

    <!-- Y axis label -->
    <text x="30" y="190" font-size="8" fill="#444" text-anchor="middle" font-weight="600"
      transform="rotate(-90, 30, 190)">Consommation O₂</text>

    <!-- X axis label -->
    <text x="310" y="345" font-size="8" fill="#666" text-anchor="middle">Temps</text>

    <!-- Resting VO2 label -->
    <text x="523" y="296" font-size="7" fill="#777" text-anchor="end" font-style="italic">V̇O₂ repos</text>

    <!-- Steady state label -->
    <text x="220" y="72" font-size="7" fill="#888" text-anchor="middle" font-style="italic">V̇O₂ état stable</text>

    <!-- Exercise interval arrow -->
    <line x1="125" y1="355" x2="300" y2="355" stroke="#666" stroke-width="1"
      marker-start="url(#vo2rec-arrStart)" marker-end="url(#vo2rec-arrEnd)"/>
    <text x="213" y="370" font-size="7" fill="#666" text-anchor="middle">Intervalle d'exercice</text>

    <!-- Deficit label -->
    <text x="155" y="172" font-size="8" fill="#C06030" text-anchor="middle" font-weight="700">Déficit</text>
    <text x="155" y="185" font-size="8" fill="#C06030" text-anchor="middle" font-weight="700">d'O₂</text>

    <!-- EPOC bracket + label -->
    <text x="415" y="50" font-size="11" fill="#2C2F65" text-anchor="middle" font-weight="800">EPOC</text>
    <path d="M 320 60 Q 415 74, 515 60" fill="none" stroke="#2C2F65" stroke-width="1.2"/>
    <line x1="415" y1="74" x2="415" y2="56" stroke="#2C2F65" stroke-width="1.2"/>

    <!-- Fast phase label -->
    <text x="345" y="195" font-size="8" fill="#2C2F65" text-anchor="middle" font-weight="700">Phase</text>
    <text x="345" y="208" font-size="8" fill="#2C2F65" text-anchor="middle" font-weight="700">rapide</text>

    <!-- Slow phase label -->
    <text x="450" y="265" font-size="8" fill="#A07D45" text-anchor="middle" font-weight="700">Phase lente</text>
  </svg>
</template>

<style scoped>
.vo2-recovery-svg {
  width: 100%;
  display: block;
}
</style>
