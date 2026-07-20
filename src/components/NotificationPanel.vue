<script setup lang="ts">
/** Panel de notificaciones del docente */
import type { Notification } from '@/types'

defineProps<{
  notifications: Notification[]
}>()

const emit = defineEmits<{
  read: [id: number]
}>()

const typeIcons: Record<Notification['type'], string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Hace un momento'
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${Math.floor(hours / 24)}d`
}
</script>

<template>
  <div class="notification-panel">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-800">Notificaciones</h3>
      <span
        v-if="notifications.some((n) => !n.read)"
        class="flex h-5 min-w-5 items-center justify-center rounded-full bg-prolipa-500 px-1.5 text-[10px] font-bold text-white"
      >
        {{ notifications.filter((n) => !n.read).length }}
      </span>
    </div>

    <ul class="space-y-2">
      <li
        v-for="notif in notifications"
        :key="notif.id"
        class="cursor-pointer rounded-xl p-2.5 transition-all"
        :class="notif.read ? 'bg-white/30 opacity-60' : 'bg-white/60 hover:bg-white/90'"
        @click="emit('read', notif.id)"
      >
        <div class="flex gap-2">
          <span class="text-sm">{{ typeIcons[notif.type] }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-slate-700">{{ notif.title }}</p>
            <p class="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{{ notif.message }}</p>
            <p class="mt-1 text-[10px] text-slate-400">{{ timeAgo(notif.createdAt) }}</p>
          </div>
          <div v-if="!notif.read" class="mt-1 h-2 w-2 shrink-0 rounded-full bg-prolipa-500" />
        </div>
      </li>
    </ul>
  </div>
</template>
