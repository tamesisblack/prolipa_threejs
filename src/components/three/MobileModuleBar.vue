<script setup lang="ts">
/**
 * Navegación rápida por módulos en móvil.
 */
import { CAMPUS_MODULES } from '@/config/modules'
import type { CampusModule } from '@/config/modules'

const emit = defineEmits<{
  select: [mod: CampusModule]
}>()
</script>

<template>
  <div class="mobile-module-bar pointer-events-auto md:hidden">
    <div class="mobile-module-scroll custom-scroll">
      <button
        v-for="mod in CAMPUS_MODULES"
        :key="mod.id"
        type="button"
        class="mobile-module-chip"
        :style="{ '--chip-color': mod.color }"
        :title="mod.name"
        @click="emit('select', mod)"
      >
        <span class="mobile-module-icon">{{ mod.icon }}</span>
        <span class="mobile-module-name">{{ mod.shortName }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.mobile-module-bar {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 30;
  padding: 0 0 calc(0.75rem + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.75) 60%, transparent 100%);
}

.mobile-module-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.75rem 1rem 0.25rem;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}

.mobile-module-chip {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.3rem;
  width: 4.75rem;
  min-height: 3.75rem;
  padding: 0.5rem 0.375rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
  scroll-snap-align: start;
  transition: transform 0.2s, border-color 0.2s;
}

.mobile-module-chip:active {
  transform: scale(0.95);
  border-color: color-mix(in srgb, var(--chip-color) 50%, transparent);
}

.mobile-module-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.mobile-module-name {
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1.2;
  color: #cbd5e1;
  word-break: break-word;
  hyphens: auto;
}
</style>
