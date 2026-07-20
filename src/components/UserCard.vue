<script setup lang="ts">
/** Tarjeta de perfil del docente */
import type { UserProfile } from '@/types'

defineProps<{
  user: UserProfile
}>()
</script>

<template>
  <div class="user-card glass rounded-2xl p-4">
    <div class="flex items-center gap-3">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-500 to-edu-500 text-sm font-bold text-white shadow-md"
      >
        {{ user.avatarInitials }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-slate-800">{{ user.name }}</p>
        <p class="truncate text-xs text-slate-500">{{ user.role }}</p>
      </div>
    </div>
    <div class="mt-3 rounded-xl bg-prolipa-50/60 px-3 py-2">
      <p class="text-[11px] text-slate-400">Institución</p>
      <p class="truncate text-xs font-medium text-slate-700">{{ user.institution }}</p>
    </div>
  </div>
</template>
