<script setup lang="ts">
import { handleBackground } from '../layoutHelper'
import type { LogoTone } from '../brand'

const props = withDefaults(defineProps<{
  /** Optional full-bleed background image. Falls back to the brand cover color. */
  background?: string
  /** Dim the background image. */
  dim?: boolean
  /** Logo tone: `light` for dark covers (default), `dark` for light covers. */
  logoTone?: LogoTone
  /** Small uppercase tagline shown under the title (e.g. lab / event name). */
  tagline?: string
  /** Optional date line. */
  date?: string
}>(), {
  logoTone: 'light',
})
</script>

<template>
  <div
    class="slidev-layout cover h-full"
    :style="{ background: props.background ? undefined : 'var(--brand-cover-bg)' }"
  >
    <div
      v-if="props.background"
      class="absolute inset-0"
      :style="handleBackground(props.background, props.dim)"
    />
    <div
      v-if="props.background"
      class="absolute inset-0"
      style="background: color-mix(in srgb, var(--brand-cover-bg) 72%, transparent);"
    />

    <div class="relative z-10 h-full flex flex-col">
      <div class="pt-8 flex justify-center">
        <BrandLogo :tone="props.logoTone" width="160px" />
      </div>

      <div class="flex-1 flex flex-col items-center text-center justify-center px-14 pb-6">
        <slot />
      </div>

      <div class="pb-5 text-center flex flex-col items-center gap-1.5">
        <span v-if="props.date" class="cover-date">{{ props.date }}</span>
        <span v-if="props.tagline" class="cover-tagline">{{ props.tagline }}</span>
      </div>
    </div>
  </div>
</template>
