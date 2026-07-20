<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useAssistantStore } from '@/stores/assistant'

const route = useRoute()
const router = useRouter()
const dashboard = useDashboardStore()
const assistant = useAssistantStore()

const helpOpen = ref(false)
const userOpen = ref(false)
const notifOpen = ref(false)

const isHome = computed(() => route.path === '/')
const pageTitle = computed(() => (route.meta.title as string) ?? 'Campus Virtual')
const user = computed(() => dashboard.data?.user)
const unreadCount = computed(() => dashboard.unreadNotifications)
const notifications = computed(() => dashboard.data?.notifications.slice(0, 4) ?? [])

function closeAll() {
  helpOpen.value = false
  userOpen.value = false
  notifOpen.value = false
}

function toggleHelp() {
  helpOpen.value = !helpOpen.value
  userOpen.value = false
  notifOpen.value = false
}

function toggleUser() {
  userOpen.value = !userOpen.value
  helpOpen.value = false
  notifOpen.value = false
}

function toggleNotif() {
  notifOpen.value = !notifOpen.value
  helpOpen.value = false
  userOpen.value = false
}

function openProli() {
  closeAll()
  assistant.open()
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t.closest('[data-header-menu]')) closeAll()
}

onMounted(() => {
  if (!dashboard.data) dashboard.load()
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="app-header pointer-events-none absolute inset-x-0 top-0 z-40 px-4 py-3 lg:px-6">
    <div class="pointer-events-auto flex items-center justify-between gap-3">
      <!-- Logo -->
      <div class="flex shrink-0 items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-sm font-bold text-white">
          P
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-bold text-slate-800">Prolipa</p>
          <p class="text-[10px] text-slate-500">Campus Virtual Docentes</p>
        </div>
      </div>

      <!-- Saludo central -->
      <div
        v-if="isHome"
        class="hidden max-w-md flex-1 rounded-full border border-white/60 bg-white/75 px-5 py-2.5 text-center shadow-sm backdrop-blur-md md:block lg:max-w-xl"
      >
        <p class="text-xs text-slate-600">
          ¡Hola, Docente! Bienvenido a tu campus virtual.
          <span class="hidden lg:inline"> Explora, crea y transforma.</span>
        </p>
      </div>

      <div v-else-if="!isHome" class="flex-1 text-center">
        <span class="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md">
          {{ pageTitle }}
        </span>
      </div>

      <!-- Acciones derecha -->
      <div class="flex shrink-0 items-center gap-2">
        <button
          v-if="!isHome"
          type="button"
          class="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-xs font-medium text-blue-700 shadow-sm backdrop-blur-md hover:bg-white"
          @click="router.push('/')"
        >
          ← Campus
        </button>

        <template v-if="isHome">
          <!-- Notificaciones -->
          <div class="relative hidden sm:block" data-header-menu>
            <button
              type="button"
              class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition-colors hover:text-blue-600"
              title="Notificaciones"
              @click.stop="toggleNotif"
            >
              🔔
              <span
                v-if="unreadCount > 0"
                class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
              >
                {{ unreadCount }}
              </span>
            </button>
            <Transition name="menu">
              <div v-if="notifOpen" class="header-dropdown right-0 w-72">
                <p class="dropdown-title">Notificaciones</p>
                <ul class="max-h-52 space-y-2 overflow-y-auto custom-scroll">
                  <li
                    v-for="n in notifications"
                    :key="n.id"
                    class="rounded-xl px-3 py-2 text-xs"
                    :class="n.read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-slate-700'"
                  >
                    <p class="font-semibold">{{ n.title }}</p>
                    <p class="mt-0.5 text-[10px] opacity-80">{{ n.message }}</p>
                  </li>
                </ul>
                <p v-if="!notifications.length" class="py-4 text-center text-xs text-slate-400">
                  Sin notificaciones
                </p>
              </div>
            </Transition>
          </div>

          <!-- Ayuda -->
          <div class="relative hidden sm:block" data-header-menu>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-sm font-bold text-slate-500 shadow-sm backdrop-blur-md transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Ayuda"
              @click.stop="toggleHelp"
            >
              ?
            </button>
            <Transition name="menu">
              <div v-if="helpOpen" class="header-dropdown right-0 w-64">
                <p class="dropdown-title">¿Necesitas ayuda?</p>
                <ul class="space-y-1 text-xs text-slate-600">
                  <li class="rounded-lg bg-slate-50 px-3 py-2">
                    <strong class="text-slate-800">Navegar:</strong> haz clic en una isla o pregunta a Proli.
                  </li>
                  <li class="rounded-lg bg-slate-50 px-3 py-2">
                    <strong class="text-slate-800">Panel docente:</strong> botón Panel a la derecha.
                  </li>
                  <li class="rounded-lg bg-slate-50 px-3 py-2">
                    <strong class="text-slate-800">Atajos Proli:</strong> "¿Qué tengo pendiente?", "Ir a biblioteca".
                  </li>
                </ul>
                <button
                  type="button"
                  class="mt-3 w-full rounded-xl bg-gradient-to-r from-prolipa-500 to-edu-500 py-2 text-xs font-semibold text-white"
                  @click="openProli"
                >
                  ✨ Hablar con Proli
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- Usuario MR -->
        <div class="relative" data-header-menu>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-xs font-bold text-white shadow-md ring-2 ring-white/50 transition-transform hover:scale-105"
            :title="user?.name ?? 'Mi perfil'"
            @click.stop="toggleUser"
          >
            {{ user?.avatarInitials ?? 'MR' }}
          </button>
          <Transition name="menu">
            <div v-if="userOpen" class="header-dropdown right-0 w-64">
              <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-sm font-bold text-white">
                  {{ user?.avatarInitials ?? 'MR' }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-bold text-slate-800">{{ user?.name ?? 'Docente' }}</p>
                  <p class="truncate text-[10px] text-slate-500">{{ user?.role ?? 'Docente Prolipa' }}</p>
                </div>
              </div>
              <div class="mt-3 space-y-2 text-xs text-slate-600">
                <p class="rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-[10px] uppercase text-slate-400">Institución</span><br>
                  {{ user?.institution ?? '—' }}
                </p>
                <p class="rounded-lg bg-slate-50 px-3 py-2">
                  <span class="text-[10px] uppercase text-slate-400">Correo</span><br>
                  {{ user?.email ?? '—' }}
                </p>
              </div>
              <div class="mt-3 flex gap-2">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-slate-200 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  @click="closeAll(); router.push('/estadisticas')"
                >
                  Mis estadísticas
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-slate-800 py-2 text-[11px] font-medium text-white hover:bg-slate-700"
                  @click="closeAll()"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  z-index: 50;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.95);
  padding: 14px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
  backdrop-filter: blur(16px);
}

.dropdown-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
