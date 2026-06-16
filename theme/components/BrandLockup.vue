<script setup lang="ts">
import { computed } from 'vue'
import { useBrand } from '../useBrand'

const props = withDefaults(defineProps<{
  /** Override the brand lockup with an explicit path. */
  src?: string
  width?: string
}>(), {
  width: '260px',
})

const { brand, org } = useBrand()
const resolved = computed(() => props.src ?? brand.value.lockup ?? brand.value.logos.color)
</script>

<template>
  <img
    v-if="resolved"
    :src="resolved"
    :style="{ width: props.width }"
    :alt="org"
  >
</template>
