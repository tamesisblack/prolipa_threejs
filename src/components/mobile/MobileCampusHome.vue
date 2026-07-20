<script setup lang="ts">
/**
 * Vista principal del campus en móvil/tablet — grid táctil, sin escena 3D.
 */
import { useRouter } from 'vue-router'
import { CAMPUS_MODULES } from '@/config/modules'
import type { CampusModule } from '@/config/modules'
import { useAssistantStore } from '@/stores/assistant'

defineEmits<{ togglePanel: [] }>()

const router = useRouter()
const assistant = useAssistantStore()

function openModule(mod: CampusModule) {
  if (mod.action === 'assistant') {
    assistant.open()
    return
  }
  router.push(mod.route)
}
</script>

<template>
  <div class="mobile-campus relative h-full overflow-hidden bg-[#0f172a]">
    <!-- Fondo decorativo -->
    <div class="mobile-campus-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="bg-orb bg-orb-1">📚</div>
      <div class="bg-orb bg-orb-2">🧠</div>
      <div class="bg-orb bg-orb-3">📐</div>
      <div class="bg-orb bg-orb-4">📝</div>
      <div class="bg-glow" />
    </div>

    <div class="custom-scroll relative h-full overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <!-- Hero — móvil y tablet -->
      <section class="px-4 pb-5 pt-[5.25rem] lg:hidden">
        <p class="text-[11px] font-medium uppercase tracking-wider text-indigo-400">
          Prolipa · Campus Virtual
        </p>
        <h1 class="mt-1.5 text-2xl font-bold tracking-tight text-white">
          ¡Hola, Docente!
        </h1>
        <p class="mt-1.5 max-w-[280px] text-sm leading-relaxed text-slate-400 md:max-w-md">
          Elige un módulo para continuar. Tu campus, optimizado para móvil.
        </p>
      </section>

      <!-- Acciones rápidas — móvil y tablet -->
      <div class="flex gap-2.5 px-4 pb-5 lg:hidden">
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-prolipa-500 to-edu-500 py-3 text-sm font-semibold text-white shadow-lg shadow-prolipa-500/20 active:scale-[0.98]"
          @click="assistant.open()"
        >
          <span>✨</span>
          Proli IA
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur-sm active:scale-[0.98]"
          @click="$emit('togglePanel')"
        >
          <span>📊</span>
          Mi panel
        </button>
      </div>

      <!-- Grid de módulos -->
      <section class="px-4 pb-6 md:mx-auto md:max-w-5xl md:px-8 md:pb-8 lg:pt-[10rem]">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:mb-4">
          Módulos del campus
        </h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3">
          <button
            v-for="mod in CAMPUS_MODULES"
            :key="mod.id"
            type="button"
            class="module-card group text-left active:scale-[0.97]"
            :style="{ '--accent': mod.color }"
            @click="openModule(mod)"
          >
            <div class="module-card-glow" />
            <div class="module-card-icon">{{ mod.icon }}</div>
            <p class="module-card-name">{{ mod.name }}</p>
            <p class="module-card-sub">{{ mod.subtitle }}</p>
            <span class="module-card-arrow">→</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mobile-campus-bg {
  background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.18), transparent),
    radial-gradient(ellipse 60% 40% at 100% 50%, rgba(236, 72, 153, 0.08), transparent);
}

.bg-glow {
  position: absolute;
  left: 50%;
  top: 30%;
  height: 12rem;
  width: 12rem;
  transform: translateX(-50%);
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.1);
  filter: blur(48px);
}

.bg-orb {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.07;
  filter: blur(0.5px);
  animation: float-orb 8s ease-in-out infinite;
}

.bg-orb-1 { top: 18%; left: 8%; animation-delay: 0s; }
.bg-orb-2 { top: 12%; right: 10%; animation-delay: 2s; font-size: 2rem; }
.bg-orb-3 { bottom: 35%; left: 5%; animation-delay: 4s; font-size: 2.2rem; }
.bg-orb-4 { bottom: 28%; right: 8%; animation-delay: 1s; }

@keyframes float-orb {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(6deg); }
}

.module-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(30, 41, 59, 0.65);
  padding: 1rem 0.875rem 0.875rem;
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}

.module-card:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
}

.module-card:active {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.module-card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.2s;
}

.module-card:active .module-card-glow,
.module-card:hover .module-card-glow {
  opacity: 1;
}

.module-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  font-size: 1.25rem;
  line-height: 1;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 20%, transparent);
}

.module-card-name {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.25;
  color: #f1f5f9;
}

.module-card-sub {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1.35;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.module-card-arrow {
  position: absolute;
  right: 0.75rem;
  top: 0.875rem;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--accent) 70%, #64748b);
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s, transform 0.2s;
}

.module-card:active .module-card-arrow,
.module-card:hover .module-card-arrow {
  opacity: 1;
  transform: translateX(0);
}
</style>
