<script setup lang="ts">
/**
 * Base-aware <img> for assets in `public/`.
 *
 * Use instead of a raw `<img :src="'/foo.png'">` so the asset resolves correctly
 * when the deck is deployed under a sub-path (e.g. GitHub Pages `/<repo>/`). All
 * other attributes (class, style, alt, …) forward to the underlying <img>.
 *
 *   <BaseImg src="/velo_vo2.jpg" class="…" alt="…" />
 */
import { asset } from './useAsset'

const props = defineProps<{ src: string }>()
</script>

<template>
  <img :src="asset(props.src)">
</template>
