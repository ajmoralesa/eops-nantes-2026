<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: string
  thickness?: string
}>(), {
  width: '60px',
  thickness: '4px',
})
</script>

<template>
  <div
    class="rounded-full"
    :style="{
      width: props.width,
      height: props.thickness,
      background: 'linear-gradient(90deg, var(--brand-accent-dark), var(--brand-accent-light))',
    }"
  />
</template>
