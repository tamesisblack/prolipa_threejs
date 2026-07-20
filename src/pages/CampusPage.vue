<script setup lang="ts">
/**
 * Página principal — islas 3D en desktop / tarjetas en móvil y tablet.
 */
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import DashboardPanel from '@/components/DashboardPanel.vue'
import MobileCampusHome from '@/components/mobile/MobileCampusHome.vue'
import { usePreferCampusGrid } from '@/composables/useMediaQuery'
import { useMobileCampusView } from '@/composables/useMobileCampusView'

const CampusScene = defineAsyncComponent(
  () => import('@/components/three/CampusScene.vue'),
)

const preferGrid = usePreferCampusGrid()
const { view: campusView } = useMobileCampusView()
const effectiveView = computed(() => (preferGrid.value ? 'grid' : campusView.value))
const panelOpen = ref(false)
const sceneRef = ref<{ resetCamera?: () => void } | null>(null)

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

watch(panelOpen, (open) => {
  if (open && !preferGrid.value) {
    setTimeout(() => sceneRef.value?.resetCamera?.(), 400)
  }
})

watch(preferGrid, (compact) => {
  if (compact) panelOpen.value = false
})
</script>

<template>
  <div
    class="campus-page relative flex h-full w-full overflow-hidden"
    :class="{ 'panel-open': panelOpen, 'is-compact': preferGrid }"
  >
    <!-- Vista tarjetas -->
    <MobileCampusHome
      v-if="effectiveView === 'grid'"
      class="relative min-h-0 min-w-0 flex-1"
      @toggle-panel="togglePanel"
    />

    <!-- Vista islas 3D — solo desktop -->
    <div v-else class="relative min-h-0 min-w-0 flex-1 overflow-hidden">
      <Suspense>
        <CampusScene ref="sceneRef" :panel-open="panelOpen" />
        <template #fallback>
          <div class="flex h-full items-center justify-center bg-[#0f172a]">
            <div class="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-indigo-900 border-t-indigo-400" />
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Backdrop panel — móvil y tablet -->
    <Transition name="fade">
      <button
        v-if="preferGrid && panelOpen"
        type="button"
        class="panel-backdrop"
        aria-label="Cerrar panel"
        @click="togglePanel"
      />
    </Transition>

    <!-- Panel lateral -->
    <div
      class="panel-wrapper"
      :class="panelOpen ? 'is-open' : 'is-closed'"
    >
      <DashboardPanel class="h-full !w-full" @close="panelOpen = false" />
    </div>

    <!-- Toggle panel — solo desktop grande -->
    <button
      v-if="!preferGrid"
      type="button"
      class="panel-toggle"
      :aria-expanded="panelOpen"
      :title="panelOpen ? 'Ocultar panel' : 'Mostrar panel'"
      @click.stop.prevent="togglePanel"
    >
      <svg
        class="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300"
        :class="panelOpen ? 'rotate-180' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span v-if="!panelOpen" class="panel-toggle-label">Panel</span>
    </button>
  </div>
</template>

<style scoped>
.campus-page {
  --panel-width: 340px;
}

@media (min-width: 1280px) {
  .campus-page {
    --panel-width: 360px;
  }
}

.panel-backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  border: none;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.panel-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 40;
  width: var(--panel-width);
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.panel-wrapper.is-open {
  transform: translateX(0);
  pointer-events: auto;
}

.panel-wrapper.is-closed {
  transform: translateX(100%);
  pointer-events: none;
}

.panel-toggle {
  position: fixed;
  top: 50%;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 14px 10px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-right: none;
  border-radius: 14px 0 0 14px;
  background: #ffffff;
  box-shadow: -4px 0 20px rgba(15, 23, 42, 0.1);
  transform: translateY(-50%);
  cursor: pointer;
  transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s;
  right: 0;
}

.campus-page.panel-open .panel-toggle {
  right: var(--panel-width);
}

.panel-toggle:hover {
  background: #f0f7ff;
  border-color: #93c5fd;
}

.panel-toggle-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1e40af;
  writing-mode: vertical-rl;
}

@media (max-width: 1023px) {
  .campus-page {
    --panel-width: 100%;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
