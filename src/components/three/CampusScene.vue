<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useRouter } from 'vue-router'
import { useCampusScene } from '@/composables/useCampusScene'
import { useAssistantStore } from '@/stores/assistant'
import { useIsMobile } from '@/composables/useMediaQuery'
import BuildingTooltip from '@/components/BuildingTooltip.vue'
import type { CampusModule } from '@/config/modules'

const props = withDefaults(defineProps<{ panelOpen?: boolean }>(), { panelOpen: false })

const router = useRouter()
const assistant = useAssistantStore()
const isMobile = useIsMobile()
const containerRef = ref<HTMLElement | null>(null)
const hovered = ref<CampusModule | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })

const panelOpenRef = toRef(props, 'panelOpen')

function handleModuleSelect(mod: CampusModule) {
  if (mod.action === 'assistant') {
    assistant.open()
    return
  }
  router.push(mod.route)
}

const { isReady, resetCamera } = useCampusScene(
  containerRef,
  {
    onIslandHover(mod, pos) {
      hovered.value = mod
      if (pos) tooltipPos.value = pos
    },
    onIslandClick: handleModuleSelect,
  },
  {
    isMobile,
    panelOpen: panelOpenRef,
  },
)

defineExpose({ resetCamera })
</script>

<template>
  <div class="campus-scene relative h-full w-full overflow-hidden bg-[#0f172a]">
    <div
      ref="containerRef"
      class="campus-canvas relative h-full w-full touch-none"
      :class="{ 'is-mobile': isMobile }"
    />

    <Transition name="fade">
      <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center bg-[#0f172a]/95">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-indigo-900 border-t-indigo-400" />
      </div>
    </Transition>

    <button
      v-if="!isMobile"
      type="button"
      class="absolute bottom-4 right-4 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 shadow-lg backdrop-blur-sm hover:text-white"
      @click="resetCamera()"
    >
      ⊙ Recentrar vista
    </button>

    <BuildingTooltip
      v-if="hovered && !isMobile"
      :building="hovered"
      :x="tooltipPos.x"
      :y="tooltipPos.y"
    />

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
