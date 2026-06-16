<script setup lang="ts">
/**
 * Placeholder for a visual to be added later (photo / video / figure).
 * Keeps the layout honest and "beautiful while empty" until Antonio drops in
 * the real asset. Swap for an <img>/<video>/<SlidevVideo> when assets land.
 *   <Media kind="video" label="VO2 sur l'eau — kayak (Vaires)" />
 */
withDefaults(defineProps<{
  label?: string
  kind?: 'photo' | 'video' | 'figure' | 'graph'
}>(), {
  kind: 'photo',
})

const icon: Record<string, string> = {
  photo: 'i-carbon-image',
  video: 'i-carbon-play',
  figure: 'i-carbon-chart-line',
  graph: 'i-carbon-chart-histogram',
}
const word: Record<string, string> = {
  photo: 'Photo',
  video: 'Vidéo',
  figure: 'Figure',
  graph: 'Graphique',
}
</script>

<template>
  <div
    class="media-ph w-full h-full min-h-[180px] rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed p-4"
    style="border-color: var(--brand-accent); background: var(--brand-accent-pale);"
  >
    <div :class="icon[kind]" class="text-3xl text-brand-gold-dark opacity-70" />
    <div class="text-xs uppercase tracking-widest text-brand-gold-dark opacity-70">{{ word[kind] }}</div>
    <div v-if="label" class="text-sm text-brand-navy opacity-75 text-center leading-snug">{{ label }}</div>
  </div>
</template>
