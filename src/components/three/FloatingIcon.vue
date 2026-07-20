<script setup lang="ts">
/**
 * Etiqueta flotante HTML para islas (referencia visual / hover).
 * La escena 3D usa floatingIconFactory.ts para CSS2DObject.
 */
import type { CampusModule } from '@/config/modules'

defineProps<{
  module: CampusModule
  active?: boolean
}>()
</script>

<template>
  <div class="island-floating-label pointer-events-none" :class="{ 'is-active': active }">
    <div class="island-label-icon" :style="{ '--accent': module.color }">
      {{ module.icon }}
    </div>
    <div class="island-label-text">
      <strong>{{ module.name }}</strong>
      <span>{{ module.subtitle }}</span>
    </div>
  </div>
</template>
