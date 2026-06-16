<script setup lang="ts">
import { handleBackground } from '../layoutHelper'

const props = defineProps<{
  /**
   * Optional full-bleed *photographic* backdrop (a venue photo, etc.).
   * Without it, a clean solid brand-color closing is used — which suits any
   * brand and never fights a busy institutional image.
   */
  image?: string
  /** Logo size on the closing slide. */
  logoWidth?: string
}>()
</script>

<template>
  <div
    class="slidev-layout end h-full"
    :style="{ background: props.image ? undefined : 'var(--brand-primary)' }"
  >
    <template v-if="props.image">
      <div class="absolute inset-0" :style="handleBackground(props.image, true)" />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(to top, color-mix(in srgb, var(--brand-primary) 88%, transparent), color-mix(in srgb, var(--brand-primary) 35%, transparent));"
      />
    </template>

    <div class="relative z-10 h-full flex flex-col items-center justify-center text-center px-14 gap-7">
      <BrandLogo tone="light" :width="props.logoWidth || '180px'" />
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>
