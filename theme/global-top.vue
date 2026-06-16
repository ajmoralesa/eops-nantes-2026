<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'
import { useBrand } from './useBrand'

// Mirrors the active brand onto <html data-brand="…"> so the CSS variant
// blocks in styles/brands.css apply. Defaults to "insep" when unset.
const { brandId } = useBrand()

function apply() {
  if (typeof document === 'undefined')
    return
  document.documentElement.dataset.brand = brandId.value
}

onMounted(() => {
  apply()
  watchEffect(apply)
})
</script>

<template>
  <span style="display: none" aria-hidden="true" />
</template>
