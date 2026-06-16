<script setup lang="ts">
import { computed } from 'vue'
import { useBrand } from '../useBrand'
import type { LogoTone } from '../brand'

const props = withDefaults(defineProps<{
  /** `light` for dark backgrounds, `dark` for light backgrounds, `color` full-color. */
  tone?: LogoTone
  /** Override the resolved brand logo with an explicit path (e.g. a federation logo). */
  src?: string
  width?: string
}>(), {
  tone: 'dark',
  width: '120px',
})

const { logo, org } = useBrand()
const resolved = computed(() => props.src ?? logo(props.tone))
</script>

<template>
  <img
    v-if="resolved"
    :src="resolved"
    :style="{ width: props.width }"
    :alt="org"
  >
</template>
