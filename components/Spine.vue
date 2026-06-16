<script setup lang="ts">
/**
 * The talk's narrative motif: recueil → traitement → restitution.
 * Pass `active` to highlight the current phase; omit to dim all three (intro).
 *   <Spine active="traitement" />
 */
defineProps<{ active?: 'recueil' | 'traitement' | 'restitution' }>()

const steps = [
  { key: 'recueil', label: 'Recueil', sub: 'le capteur' },
  { key: 'traitement', label: 'Traitement', sub: 'le code' },
  { key: 'restitution', label: 'Restitution', sub: 'le terrain' },
] as const
</script>

<template>
  <div class="flex items-center justify-center gap-2 my-2">
    <template v-for="(s, i) in steps" :key="s.key">
      <div
        class="px-5 py-2 rounded-full text-center transition-all duration-300"
        :class="active === s.key
          ? 'bg-brand-gold text-white shadow-md scale-105'
          : 'bg-brand-gold-pale text-brand-navy opacity-40'"
      >
        <div class="text-sm font-semibold leading-tight">{{ s.label }}</div>
        <div class="text-[0.6rem] uppercase tracking-widest opacity-80">{{ s.sub }}</div>
      </div>
      <div v-if="i < steps.length - 1" class="text-brand-gold text-xl opacity-50">&rarr;</div>
    </template>
  </div>
</template>
