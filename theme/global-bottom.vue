<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed } from 'vue'
import { useBrand } from './useBrand'

const { currentSlideNo, currentSlideRoute, total } = useNav()
const { author, org, logo } = useBrand()

// Layouts that render their own chrome and should NOT show the footer.
const hiddenLayouts = ['cover', 'section', 'end', 'fact', 'quote', 'center']

const showFooter = computed(() => {
  const fm = currentSlideRoute.value?.meta?.slide?.frontmatter || {}
  const layout = fm.layout || 'default'
  if (currentSlideNo.value <= 1)
    return false
  return !hiddenLayouts.includes(layout)
})

const footerLeft = computed(() =>
  [author.value, org.value].filter(Boolean).join(' · '),
)
</script>

<template>
  <template v-if="showFooter">
    <div
      class="absolute bottom-0 left-0 flex items-center gap-1 pl-6 pb-3 opacity-60"
      style="z-index: 100;"
    >
      <span class="text-[0.7rem] font-medium" style="color: var(--brand-primary);">
        {{ footerLeft }}
      </span>
    </div>
    <div
      class="absolute bottom-0 right-0 flex items-center gap-2 pr-6 pb-3 opacity-70"
      style="z-index: 100;"
    >
      <img :src="logo('dark')" class="h-5 w-auto" :alt="org">
      <div class="w-px h-3.5" style="background: var(--brand-accent);" />
      <span class="text-[0.7rem] font-semibold" style="color: var(--brand-primary);">
        {{ currentSlideNo }} / {{ total }}
      </span>
    </div>
  </template>
</template>
