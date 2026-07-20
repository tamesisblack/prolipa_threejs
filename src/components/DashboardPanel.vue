<script setup lang="ts">
/**
 * Panel derecho del dashboard con información rápida del docente.
 * Consume datos del store (mock → Laravel API).
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { animatePanelIn } from '@/composables/useGsap'
import UserCard from '@/components/UserCard.vue'
import CalendarCard from '@/components/CalendarCard.vue'
import NotificationPanel from '@/components/NotificationPanel.vue'

const store = useDashboardStore()
const router = useRouter()
const panelRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  if (!store.data) await store.load()
  if (panelRef.value) animatePanelIn(panelRef.value, 0.2)
})

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    completed: 'Completada',
    available: 'Disponible',
  }
  return map[status] ?? status
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'text-amber-600 bg-amber-50',
    in_progress: 'text-prolipa-600 bg-prolipa-50',
    completed: 'text-edu-600 bg-edu-50',
    available: 'text-edu-600 bg-edu-50',
  }
  return map[status] ?? 'text-slate-600 bg-slate-50'
}
</script>

<template>
  <aside
    ref="panelRef"
    class="dashboard-panel custom-scroll flex h-full w-full flex-col gap-4 overflow-y-auto border-l border-white/60 bg-white/40 p-5 backdrop-blur-xl"
  >
    <!-- Loading skeleton -->
    <template v-if="store.loading">
      <div v-for="i in 4" :key="i" class="glass h-24 animate-pulse rounded-2xl" />
    </template>

    <template v-else-if="store.data">
      <UserCard :user="store.data.user" />

      <!-- Stats rápidos -->
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-2xl border border-white/80 bg-white/80 p-3.5 text-center shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
          <p class="text-2xl font-bold text-prolipa-600">{{ store.data.books.filter(b => b.available).length }}</p>
          <p class="text-[11px] text-slate-500">Libros disponibles</p>
        </div>
        <div class="rounded-2xl border border-white/80 bg-white/80 p-3.5 text-center shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
          <p class="text-2xl font-bold text-amber-500">{{ store.pendingEvaluations }}</p>
          <p class="text-[11px] text-slate-500">Evaluaciones pendientes</p>
        </div>
      </div>

      <!-- Libros -->
      <section class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-800">📚 Libros</h3>
          <button
            class="text-[11px] font-medium text-prolipa-600 hover:underline"
            @click="router.push('/biblioteca')"
          >
            Ver todos
          </button>
        </div>
        <ul class="space-y-2">
          <li
            v-for="book in store.data.books.slice(0, 3)"
            :key="book.id"
            class="flex items-center gap-2.5 rounded-xl bg-white/50 p-2"
          >
            <div
              class="h-8 w-6 shrink-0 rounded-md shadow-sm"
              :style="{ backgroundColor: book.coverColor }"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-medium text-slate-700">{{ book.title }}</p>
              <p class="text-[10px] text-slate-400">{{ book.author }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              :class="book.available ? 'bg-edu-50 text-edu-600' : 'bg-slate-100 text-slate-400'"
            >
              {{ book.available ? 'Disponible' : 'Prestado' }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Evaluaciones -->
      <section class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-800">📝 Evaluaciones</h3>
          <button
            class="text-[11px] font-medium text-prolipa-600 hover:underline"
            @click="router.push('/evaluaciones')"
          >
            Ver todas
          </button>
        </div>
        <ul class="space-y-2">
          <li
            v-for="ev in store.data.evaluations.slice(0, 2)"
            :key="ev.id"
            class="rounded-xl bg-white/50 p-2.5"
          >
            <p class="text-xs font-medium text-slate-700">{{ ev.title }}</p>
            <div class="mt-1 flex items-center justify-between">
              <span class="text-[10px] text-slate-400">{{ ev.course }} · {{ ev.dueDate }}</span>
              <span
                class="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                :class="statusColor(ev.status)"
              >
                {{ statusLabel(ev.status) }}
              </span>
            </div>
          </li>
        </ul>
      </section>

      <!-- Capacitaciones -->
      <section class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
        <h3 class="mb-3 text-sm font-semibold text-slate-800">🎓 Próximas capacitaciones</h3>
        <ul class="space-y-2">
          <li
            v-for="t in store.data.trainings.slice(0, 2)"
            :key="t.id"
            class="flex items-center gap-2 rounded-xl bg-white/50 p-2.5"
          >
            <div class="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-prolipa-50 text-prolipa-600">
              <span class="text-[9px] font-bold leading-none">{{ t.date.slice(8) }}</span>
              <span class="text-[8px] leading-none opacity-70">{{ t.date.slice(5, 7) }}</span>
            </div>
            <div class="min-w-0">
              <p class="truncate text-xs font-medium text-slate-700">{{ t.title }}</p>
              <p class="text-[10px] text-slate-400">
                {{ t.time }} · {{ t.modality === 'virtual' ? 'Virtual' : 'Presencial' }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Certificados -->
      <section class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_4px_24px_rgba(30,64,175,0.06)] backdrop-blur-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-800">🏆 Certificados</h3>
          <button
            class="text-[11px] font-medium text-prolipa-600 hover:underline"
            @click="router.push('/certificaciones')"
          >
            Ver todos
          </button>
        </div>
        <ul class="space-y-2">
          <li
            v-for="cert in store.data.certificates"
            :key="cert.id"
            class="flex items-center justify-between rounded-xl bg-white/50 p-2.5"
          >
            <p class="truncate text-xs font-medium text-slate-700">{{ cert.title }}</p>
            <span
              class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              :class="statusColor(cert.status)"
            >
              {{ statusLabel(cert.status) }}
            </span>
          </li>
        </ul>
      </section>

      <NotificationPanel
        :notifications="store.data.notifications"
        @read="store.readNotification"
      />

      <CalendarCard :events="store.data.calendar" />
    </template>
  </aside>
</template>
