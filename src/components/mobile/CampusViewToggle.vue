<script setup lang="ts">
/**
 * Chip de vista: islas 3D (default) vs tarjetas.
 * Visible en móvil y desktop; guarda preferencia en localStorage.
 */
import { computed } from 'vue'
import { useMobileCampusView } from '@/composables/useMobileCampusView'

const { view, setSpheres } = useMobileCampusView()

const isSpheres = computed(() => view.value === 'spheres')
</script>

<template>
  <div
    class="campus-view-toggle"
    role="group"
    aria-label="Tipo de vista del campus"
  >
    <span class="campus-view-label">Vista</span>

    <button
      type="button"
      class="campus-view-option"
      :class="{ 'is-active': isSpheres }"
      :aria-pressed="isSpheres"
      @click="setSpheres(true)"
    >
      <span aria-hidden="true">🪐</span>
      Islas 3D
    </button>

    <button
      type="button"
      class="campus-view-option"
      :class="{ 'is-active': !isSpheres }"
      :aria-pressed="!isSpheres"
      @click="setSpheres(false)"
    >
      <span aria-hidden="true">▭</span>
      Tarjetas
    </button>
  </div>
</template>

<style scoped>
.campus-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.92);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
}

.campus-view-label {
  padding: 0 0.5rem 0 0.625rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.campus-view-option {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.5rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}

.campus-view-option.is-active {
  background: #6366f1;
  color: #fff;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.campus-view-option:focus-visible {
  outline: 2px solid #818cf8;
  outline-offset: 2px;
}

@media (min-width: 768px) {
  .campus-view-option {
    min-height: 2.25rem;
    font-size: 0.75rem;
  }
}
</style>
