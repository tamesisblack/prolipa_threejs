<script setup lang="ts">
/**
 * Tooltip elegante que aparece al hacer hover sobre un edificio 3D.
 */
import { computed } from 'vue'
import type { BuildingModule } from '@/types'

const props = defineProps<{
  building: BuildingModule
  x: number
  y: number
}>()

const style = computed(() => ({
  left: `${props.x + 16}px`,
  top: `${props.y - 48}px`,
}))
</script>

<template>
  <div
    class="building-tooltip pointer-events-none fixed z-50 glass rounded-2xl px-4 py-3 shadow-soft"
    :style="style"
  >
    <div class="flex items-center gap-3">
      <span class="text-2xl">{{ building.icon }}</span>
      <div>
        <p class="text-sm font-semibold text-slate-800">{{ building.name }}</p>
        <p class="text-xs text-slate-500">{{ building.description }}</p>
      </div>
    </div>
    <div
      class="mt-2 flex items-center gap-1 text-xs font-medium"
      :style="{ color: building.color }"
    >
      <span>Haz clic para entrar</span>
      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.building-tooltip {
  animation: tooltip-in 0.25s ease-out;
  transform-origin: left center;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
