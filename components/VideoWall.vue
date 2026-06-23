<script setup lang="ts">
/**
 * Clickable poster that opens a fullscreen modal playing several videos at once.
 * Used on the EMBARK slide: the kayak photo opens a 3-up wall (kayak / canoë / K4)
 * playing simultaneously, muted + looping.
 *
 * Assets live in public/ and are referenced with a runtime-bound :src, per the
 * deck's asset rule (a static src trips Slidev's import guard).
 *
 *   <VideoWall poster="/kayak_vaires.jpg" tag="Bassin olympique"
 *     :videos="['/video_kayak.mp4','/video_canoe.mp4','/video_k4.mp4']"
 *     :labels="['Kayak','Canoë','K4']" />
 */
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { asset } from './useAsset'

const props = withDefaults(defineProps<{
  poster: string
  tag?: string
  videos?: string[]
  labels?: string[]
}>(), {
  videos: () => [],
  labels: () => [],
})

const open = ref(false)
const els = ref<HTMLVideoElement[]>([])
const setRef = (i: number) => (el: any) => { if (el) els.value[i] = el }

async function openModal() {
  open.value = true
  window.addEventListener('keydown', onKey)
  await nextTick()
  els.value.forEach((v) => { if (v) { v.currentTime = 0; v.play().catch(() => {}) } })
}

function closeModal() {
  open.value = false
  window.removeEventListener('keydown', onKey)
  els.value.forEach((v) => { if (v) v.pause() })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="proj-shot vw-trigger" role="button" tabindex="0"
    @click="openModal" @keydown.enter="openModal" @keydown.space.prevent="openModal">
    <img :src="asset(poster)" :alt="tag || 'Voir les vidéos'" />
    <div v-if="tag" class="proj-shot-tag">{{ tag }}</div>
    <div class="vw-play"><div class="i-carbon-play-filled-alt" /></div>
  </div>

  <Teleport to="body">
    <Transition name="vw-fade">
      <div v-if="open" class="vw-overlay" @click.self="closeModal">
        <button class="vw-close" aria-label="Fermer" @click="closeModal">
          <div class="i-carbon-close" />
        </button>
        <div class="vw-grid" :style="{ '--n': videos.length }">
          <div v-for="(v, i) in videos" :key="v" class="vw-cell">
            <video :ref="setRef(i)" :src="asset(v)" muted loop playsinline preload="auto" />
            <div v-if="labels[i]" class="vw-label">{{ labels[i] }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.vw-trigger {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.vw-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
}
.vw-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.6rem;
  background: rgba(11, 31, 59, 0.18);
  opacity: 0.85;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.vw-trigger:hover .vw-play {
  opacity: 1;
  background: rgba(11, 31, 59, 0.3);
}

.vw-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5vh 3vw;
  background: rgba(8, 18, 35, 0.92);
  backdrop-filter: blur(4px);
}
.vw-grid {
  display: grid;
  grid-template-columns: repeat(var(--n, 3), 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 1400px;
  height: 100%;
  align-items: center;
}
.vw-cell {
  position: relative;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}
.vw-cell video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}
.vw-label {
  position: absolute;
  left: 0.6rem;
  bottom: 0.6rem;
  padding: 0.15rem 0.7rem;
  border-radius: 999px;
  background: var(--brand-primary, #0b1f3b);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.vw-close {
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
.vw-close:hover {
  background: rgba(255, 255, 255, 0.28);
}

.vw-fade-enter-active,
.vw-fade-leave-active {
  transition: opacity 0.2s ease;
}
.vw-fade-enter-from,
.vw-fade-leave-to {
  opacity: 0;
}
</style>
