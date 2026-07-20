<script setup lang="ts">
/**
 * Metadatos de isla — documentación del módulo 3D.
 * La geometría se construye en src/three/islands/Island.ts
 */
import type { CampusModule } from '@/config/modules'

defineProps<{
  module: CampusModule
}>()
</script>

<template>
  <div class="hidden" :data-island-id="module.id" />
</template>
