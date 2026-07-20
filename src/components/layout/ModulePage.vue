<script setup lang="ts">
/**
 * Plantilla de módulo con identidad visual propia (demo).
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MODULES, MODULE_FEATURES, type CampusModule } from '@/config/modules'

const route = useRoute()

const mod = computed(() => MODULES.find((m) => m.route === route.path || m.id === route.meta.module) as CampusModule | undefined)
const features = computed(() => (mod.value ? MODULE_FEATURES[mod.value.id] ?? [] : []))
const subtitle = computed(() => mod.value?.subtitle ?? mod.value?.description ?? '')
</script>

<template>
  <div
    class="module-page flex h-full items-center justify-center overflow-y-auto p-6"
    :style="{ background: mod ? `linear-gradient(135deg, ${mod.color}08 0%, #f8fbff 50%, ${mod.color}05 100%)` : undefined }"
  >
    <div class="glass w-full max-w-2xl rounded-3xl p-8 shadow-soft md:p-10">
      <div class="flex items-start gap-5">
        <div
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md"
          :style="{
            background: mod ? `linear-gradient(135deg, ${mod.color}33, ${mod.color}11)` : undefined,
            boxShadow: mod ? `0 8px 24px ${mod.color}33` : undefined,
          }"
        >
          {{ mod?.icon }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">{{ mod?.name ?? 'Módulo' }}</h1>
          <p class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
        </div>
      </div>

      <div class="mt-8 grid gap-2 sm:grid-cols-2">
        <div
          v-for="feat in features"
          :key="feat"
          class="flex items-center gap-2.5 rounded-xl bg-white/60 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-white/90"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ backgroundColor: mod?.color }"
          />
          {{ feat }}
        </div>
      </div>

      <div
        class="mt-8 rounded-2xl px-5 py-4"
        :style="{ backgroundColor: mod ? `${mod.color}12` : undefined }"
      >
        <p class="text-xs font-semibold" :style="{ color: mod?.color }">Demo Frontend · Prolipa</p>
        <p class="mt-1 text-xs text-slate-500">
          Vista de demostración con identidad visual propia. Se conectará a la API Laravel.
        </p>
      </div>
    </div>
  </div>
</template>
