<script setup lang="ts">
import { handleBackground } from '../layoutHelper'

const props = defineProps<{
  image: string
}>()
</script>

<template>
  <div class="slidev-layout image-right h-full grid grid-cols-2">
    <div
      class="relative flex flex-col justify-center px-12 py-10 border-r-3"
      style="border-color: var(--brand-accent);"
    >
      <slot />
    </div>
    <div class="h-full" :style="handleBackground(props.image)" />
  </div>
</template>
