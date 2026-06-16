<script setup lang="ts">
/**
 * A figure thumbnail that opens fullscreen on click — for dense plots that are
 * unreadable at slide-thumbnail size (e.g. the BRS 3×750 m physiology panel).
 * Renders the deck's .proj-shot look; assets use a runtime-bound :src per the
 * deck's asset rule.
 *
 *   <ZoomImage src="/brs_3x750.png" tag="3×750 m" alt="Profil physiologique" variant="figure" />
 */
import { ref, onBeforeUnmount } from 'vue'

withDefaults(defineProps<{
  src: string
  tag?: string
  alt?: string
  variant?: 'cover' | 'contain' | 'figure'
}>(), {
  variant: 'figure',
})

const open = ref(false)

function openModal() {
  open.value = true
  window.addEventListener('keydown', onKey)
}
function closeModal() {
  open.value = false
  window.removeEventListener('keydown', onKey)
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="proj-shot zi-trigger" :class="variant" role="button" tabindex="0"
    @click="openModal" @keydown.enter="openModal" @keydown.space.prevent="openModal">
    <img :src="src" :alt="alt || tag || 'Agrandir la figure'" />
    <div v-if="tag" class="proj-shot-tag">{{ tag }}</div>
    <div class="zi-zoom"><div class="i-carbon-zoom-in" /></div>
  </div>

  <Teleport to="body">
    <Transition name="zi-fade">
      <div v-if="open" class="zi-overlay" @click.self="closeModal">
        <button class="zi-close" aria-label="Fermer" @click="closeModal">
          <div class="i-carbon-close" />
        </button>
        <img class="zi-full" :src="src" :alt="alt || tag || ''" @click="closeModal" />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.zi-trigger {
  cursor: zoom-in;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.zi-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
}
.zi-zoom {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.7rem;
  height: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  background: rgba(11, 31, 59, 0.55);
  opacity: 0.85;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.zi-trigger:hover .zi-zoom {
  opacity: 1;
  background: var(--brand-primary, #0b1f3b);
}

.zi-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5vh 3vw;
  background: rgba(8, 18, 35, 0.93);
  backdrop-filter: blur(4px);
}
.zi-full {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-out;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}
.zi-close {
  position: absolute;
  top: 1.4rem;
  right: 1.6rem;
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  transition: background 0.15s ease;
}
.zi-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

.zi-fade-enter-active,
.zi-fade-leave-active {
  transition: opacity 0.2s ease;
}
.zi-fade-enter-from,
.zi-fade-leave-to {
  opacity: 0;
}
</style>
