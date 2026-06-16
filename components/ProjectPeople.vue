<script setup lang="ts">
/**
 * Reusable "project meta bar" for the four applied-research project slides.
 * Renders the English title + contract on the left, and the people involved
 * (student / staff avatars) + the partner federation logo on the right.
 *
 * Degrades gracefully: omit `people` for projects with no student, omit
 * `fedLogo` to fall back to the federation short name, omit `titleEn`/`contract`
 * to drop the left rail. Photos live in `public/` and are referenced by a
 * runtime-bound `:src` (e.g. photo="/siblot.jpeg"), per the deck's asset rule.
 *
 *   <ProjectPeople titleEn="…" contract="CIFRE INSEP–FFTri" fed="FFTri"
 *     fedLogo="/fftri_logo.png"
 *     :people="[{ name: 'Adrian Siblot', role: 'Doctorant CIFRE', photo: '/siblot.jpeg' }]" />
 */
withDefaults(defineProps<{
  titleEn?: string
  contract?: string
  fed?: string
  fedLogo?: string
  people?: { name: string; role?: string; photo?: string }[]
}>(), {
  people: () => [],
})

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<template>
  <div class="proj-people">
    <div v-if="titleEn || contract" class="pp-lead">
      <div v-if="titleEn" class="pp-subtitle">{{ titleEn }}</div>
      <div v-if="contract" class="pp-contract">{{ contract }}</div>
    </div>
    <div class="pp-actors">
      <div v-for="p in people" :key="p.name" class="pp-person">
        <img v-if="p.photo" :src="p.photo" :alt="p.name" class="pp-avatar" />
        <div v-else class="pp-avatar pp-avatar-fallback">{{ initials(p.name) }}</div>
        <div class="pp-id">
          <div class="pp-name">{{ p.name }}</div>
          <div v-if="p.role" class="pp-role">{{ p.role }}</div>
        </div>
      </div>
      <div v-if="fedLogo || fed" class="pp-fed">
        <img v-if="fedLogo" :src="fedLogo" :alt="fed || 'Fédération'" class="pp-fed-logo" />
        <span v-else class="pp-fed-name">{{ fed }}</span>
      </div>
    </div>
  </div>
</template>
