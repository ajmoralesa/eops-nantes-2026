<script setup lang="ts">
import { computed } from 'vue'
import { useBrand } from '../useBrand'

const props = withDefaults(defineProps<{
  /** `large` = title/section motif, `small` = subtle content motif. */
  size?: 'large' | 'small'
}>(), {
  size: 'small',
})

const { brand } = useBrand()
// Brands without a corner asset (e.g. most federations) render nothing.
const src = computed(() => brand.value.corner)
const width = computed(() => (props.size === 'large' ? '44%' : '16%'))
</script>

<template>
  <img
    v-if="src"
    :src="src"
    class="brand-corner"
    :style="{ width }"
    alt=""
    aria-hidden="true"
  >
</template>

<style scoped>
.brand-corner {
  position: absolute;
  top: 0;
  right: 0;
  height: auto;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}
</style>
