<script setup lang="ts">
/**
 * Edificio representacional (usado en vistas de módulo como placeholder visual).
 * La versión interactiva 3D vive en CampusScene.vue.
 */
import type { BuildingModule } from '@/types'

defineProps<{
  building: BuildingModule
  active?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="building-card group relative flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-300"
    :class="active ? 'glass ring-2 ring-prolipa-400/50' : 'hover:glass'"
    @click="emit('click')"
  >
    <div
      class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-transform duration-300 group-hover:scale-110"
      :style="{ backgroundColor: building.color + '22', color: building.color }"
    >
      {{ building.icon }}
    </div>
    <span class="text-xs font-medium text-slate-600">{{ building.name }}</span>
  </button>
</template>
