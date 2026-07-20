<script setup lang="ts">
/** Mini calendario de eventos del docente */
import type { CalendarEvent } from '@/types'

defineProps<{
  events: CalendarEvent[]
}>()

const typeColors: Record<CalendarEvent['type'], string> = {
  class: 'bg-prolipa-500',
  meeting: 'bg-edu-500',
  deadline: 'bg-amber-500',
}

const typeLabels: Record<CalendarEvent['type'], string> = {
  class: 'Clase',
  meeting: 'Reunión',
  deadline: 'Entrega',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="calendar-card glass rounded-2xl p-4">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-800">Calendario</h3>
      <span class="rounded-full bg-prolipa-100 px-2 py-0.5 text-[10px] font-medium text-prolipa-700">
        {{ events.length }} eventos
      </span>
    </div>

    <ul class="space-y-2">
      <li
        v-for="event in events"
        :key="event.id"
        class="flex items-start gap-2.5 rounded-xl bg-white/50 p-2.5 transition-colors hover:bg-white/80"
      >
        <div class="mt-0.5 h-2 w-2 shrink-0 rounded-full" :class="typeColors[event.type]" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-medium text-slate-700">{{ event.title }}</p>
          <p class="text-[11px] text-slate-400">
            {{ formatDate(event.date) }} · {{ event.time }}
          </p>
        </div>
        <span class="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
          {{ typeLabels[event.type] }}
        </span>
      </li>
    </ul>
  </div>
</template>
