<script setup lang="ts">
/**
 * Vista de Módulo Avanzada y Profesional — Campus Virtual Prolipa Docentes.
 * Renderiza paneles específicos e interactivos según el módulo activo.
 */
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MODULES, MODULE_FEATURES, type CampusModule } from '@/config/modules'
import { mockDashboardData } from '@/api/mock/dashboard'

const route = useRoute()
const router = useRouter()

const mod = computed(() => MODULES.find((m) => m.route === route.path || m.id === route.meta.module) as CampusModule | undefined)
const features = computed(() => (mod.value ? MODULE_FEATURES[mod.value.id] ?? [] : []))
const subtitle = computed(() => mod.value?.subtitle ?? mod.value?.description ?? '')

// Toast interactivo para acciones de la demo
const toastMessage = ref<string | null>(null)
function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = null
  }, 2500)
}

// Filtros y búsquedas por módulo
const searchQuery = ref('')
const selectedTab = ref('all')

// Datos dinámicos del mock
const data = mockDashboardData

// Evaluaciones filtradas
const filteredEvaluations = computed(() => {
  if (!searchQuery.value) return data.evaluations
  return data.evaluations.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      e.course.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Libros filtrados
const filteredBooks = computed(() => {
  let list = data.books
  if (selectedTab.value === 'available') list = list.filter((b) => b.available)
  if (searchQuery.value) {
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }
  return list
})

// Certificados
const certificates = computed(() => data.certificates)

// Multimedia Mock items
const mediaItems = [
  { id: 1, type: 'video', title: 'Explicación del Álgebra en 8vo EGB', duration: '14 min', views: 142, icon: '🎥', color: 'from-blue-500 to-indigo-600' },
  { id: 2, type: 'video', title: 'Experimentos de Ciencias Naturales 7mo', duration: '22 min', views: 98, icon: '🧪', color: 'from-emerald-500 to-teal-600' },
  { id: 3, type: 'audio', title: 'Podcast Educativo: Lengua y Literatura', duration: '18 min', views: 210, icon: '🎙️', color: 'from-purple-500 to-pink-600' },
  { id: 4, type: 'image', title: 'Infografía Interactiva: Ecosistemas', duration: 'HD', views: 350, icon: '📊', color: 'from-amber-500 to-orange-600' },
]

const filteredMedia = computed(() => {
  if (selectedTab.value === 'all') return mediaItems
  return mediaItems.filter((item) => item.type === selectedTab.value)
})

// Publicaciones de Comunidad Mock
const forumPosts = [
  { id: 1, author: 'Lcda. María Elena Torres', role: 'Docente 8vo A', title: '¿Qué estrategias usan para la enseñanza de álgebra en grupos grandes?', replies: 8, likes: 15, date: 'Hace 2 horas' },
  { id: 2, author: 'Prof. Carlos Mendoza', role: 'Docente Ciencias', title: 'Comparto mi guía interactiva de experimentos caseros para 7mo EGB', replies: 12, likes: 24, date: 'Ayer' },
  { id: 3, author: 'Equipo Pedagógico Prolipa', role: 'Asesores Virtuales', title: 'Nuevos recursos interactivos disponibles para la evaluación del II Trimestre', replies: 5, likes: 38, date: 'Hace 3 días' },
]
</script>

<template>
  <div class="module-page relative min-h-full w-full overflow-y-auto bg-slate-950 px-4 pb-12 pt-[5.5rem] text-slate-100 lg:px-10 lg:pt-[6rem]">
    <!-- Fondo ambiental dinámico con resplandor del color del módulo -->
    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-20 blur-[100px]"
      :style="{
        background: mod
          ? `radial-gradient(circle at 50% 10%, ${mod.color}, transparent 60%)`
          : 'radial-gradient(circle at 50% 10%, #6366f1, transparent 60%)',
      }"
    />

    <!-- Toast de Notificación -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        class="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm text-emerald-400">✓</span>
        <p class="text-xs font-semibold text-white">{{ toastMessage }}</p>
      </div>
    </Transition>

    <div class="relative z-10 mx-auto max-w-6xl space-y-6">
      <!-- Top Navigation & Breadcrumb -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          @click="router.push('/')"
        >
          <span>←</span>
          Volver al Campus
        </button>

        <span
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
        >
          Campus Virtual · Docentes
        </span>
      </div>

      <!-- Hero Banner del Módulo -->
      <div
        class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-800/80 p-6 shadow-2xl backdrop-blur-xl md:p-8"
      >
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-start gap-4 sm:gap-5">
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-xl ring-2 ring-white/10 sm:h-20 sm:w-20 sm:text-4xl"
              :style="{
                background: mod ? `linear-gradient(135deg, ${mod.color}, ${mod.color}aa)` : '#6366f1',
                boxShadow: mod ? `0 12px 30px ${mod.color}55` : undefined,
              }"
            >
              {{ mod?.icon ?? '📦' }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {{ mod?.name ?? 'Módulo' }}
                </h1>
                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  :style="{ backgroundColor: mod?.color ?? '#6366f1' }"
                >
                  Activo
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-300 sm:text-base">
                {{ subtitle }}
              </p>

              <!-- Tags de características principales -->
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="feat in features"
                  :key="feat"
                  class="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-white/10"
                >
                  ✓ {{ feat }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botón de Acción Principal del Hero -->
          <div class="flex shrink-0 items-center gap-3">
            <button
              type="button"
              class="flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
              :style="{
                background: mod ? `linear-gradient(135deg, ${mod.color}, ${mod.color}cc)` : '#6366f1',
                boxShadow: mod ? `0 8px 24px ${mod.color}44` : undefined,
              }"
              @click="showToast(`Acción rápida iniciada en ${mod?.name}`)"
            >
              <span>✨</span>
              {{ mod?.id === 'evaluaciones' ? '+ Nueva Evaluación' : mod?.id === 'certificaciones' ? 'Descargar Certificados' : mod?.id === 'biblioteca' ? 'Explorar Libros' : 'Crear Recurso' }}
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA ESPECÍFICA: EVALUACIONES -->
      <div v-if="mod?.id === 'evaluaciones'" class="space-y-6">
        <!-- Tarjetas de Métricas -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
            <p class="text-xs text-slate-400">Total Evaluaciones</p>
            <p class="mt-1 text-2xl font-bold text-white">{{ data.evaluations.length }}</p>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 backdrop-blur-md">
            <p class="text-xs text-amber-300">Pendientes</p>
            <p class="mt-1 text-2xl font-bold text-amber-400">
              {{ data.evaluations.filter((e) => e.status === 'pending').length }}
            </p>
          </div>
          <div class="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-md">
            <p class="text-xs text-blue-300">En Curso</p>
            <p class="mt-1 text-2xl font-bold text-blue-400">
              {{ data.evaluations.filter((e) => e.status === 'in_progress').length }}
            </p>
          </div>
          <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-md">
            <p class="text-xs text-emerald-300">Completadas</p>
            <p class="mt-1 text-2xl font-bold text-emerald-400">12</p>
          </div>
        </div>

        <!-- Lista de Evaluaciones -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
          <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 class="text-base font-bold text-white">Evaluaciones Asignadas</h2>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar evaluación o curso…"
              class="rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="space-y-3">
            <div
              v-for="ev in filteredEvaluations"
              :key="ev.id"
              class="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-slate-800/50 p-4 transition-colors hover:border-purple-500/40 sm:flex-row sm:items-center"
            >
              <div class="flex items-center gap-3.5">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-lg text-purple-400">
                  📝
                </div>
                <div>
                  <p class="text-sm font-bold text-white">{{ ev.title }}</p>
                  <p class="text-xs text-slate-400">Curso: {{ ev.course }} · Fecha límite: {{ ev.dueDate }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-semibold"
                  :class="{
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': ev.status === 'pending',
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30': ev.status === 'in_progress',
                  }"
                >
                  {{ ev.status === 'pending' ? '⏳ Pendiente' : '🔄 En curso' }}
                </span>

                <button
                  type="button"
                  class="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-500"
                  @click="showToast(`Iniciando evaluación: ${ev.title}`)"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA ESPECÍFICA: BIBLIOTECA -->
      <div v-else-if="mod?.id === 'biblioteca'" class="space-y-6">
        <!-- Filtros y Búsqueda -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
              :class="selectedTab === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-400 hover:text-white'"
              @click="selectedTab = 'all'"
            >
              Todos los libros
            </button>
            <button
              type="button"
              class="rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
              :class="selectedTab === 'available' ? 'bg-blue-600 text-white' : 'bg-slate-900/60 text-slate-400 hover:text-white'"
              @click="selectedTab = 'available'"
            >
              Disponibles
            </button>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por libro o autor…"
            class="rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Grid de Libros -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="b in filteredBooks"
            :key="b.id"
            class="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-1"
          >
            <div>
              <div
                class="flex h-32 w-full items-center justify-center rounded-2xl text-4xl shadow-inner"
                :style="{ background: `linear-gradient(135deg, ${b.coverColor}, ${b.coverColor}88)` }"
              >
                📖
              </div>
              <p class="mt-3 text-sm font-bold text-white">{{ b.title }}</p>
              <p class="text-xs text-slate-400">{{ b.author }}</p>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span
                class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                :class="b.available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
              >
                {{ b.available ? '● Disponible' : '● Prestado' }}
              </span>

              <button
                type="button"
                class="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
                @click="showToast(`Abriendo libro: ${b.title}`)"
              >
                Leer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA ESPECÍFICA: CERTIFICADOS -->
      <div v-else-if="mod?.id === 'certificaciones'" class="space-y-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            v-for="cert in certificates"
            :key="cert.id"
            class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between"
          >
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl text-amber-400">
                🏆
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ cert.title }}</p>
                <p class="text-xs text-slate-400 mt-1">Emisión: {{ cert.issuedAt }}</p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <span
                class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                :class="cert.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'"
              >
                {{ cert.status === 'available' ? '✓ Emitido' : '⏳ En trámite' }}
              </span>

              <button
                type="button"
                class="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500 hover:text-slate-950"
                :disabled="cert.status !== 'available'"
                @click="showToast(`Descargando PDF de ${cert.title}`)"
              >
                Descargar PDF 📄
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA ESPECÍFICA: MULTIMEDIA -->
      <div v-else-if="mod?.id === 'multimedia'" class="space-y-6">
        <!-- Tabs de Formato -->
        <div class="flex gap-2 border-b border-white/10 pb-3">
          <button
            v-for="tab in [{ id: 'all', label: 'Todos los recursos' }, { id: 'video', label: '🎥 Videos' }, { id: 'audio', label: '🎙️ Audios' }, { id: 'image', label: '🖼️ Infografías' }]"
            :key="tab.id"
            type="button"
            class="rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
            :class="selectedTab === tab.id ? 'bg-red-600 text-white' : 'bg-slate-900/60 text-slate-400 hover:text-white'"
            @click="selectedTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="media in filteredMedia"
            :key="media.id"
            class="group relative rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl transition-transform hover:-translate-y-1"
          >
            <div
              class="relative flex h-36 w-full items-center justify-center rounded-2xl text-4xl shadow-md"
              :class="`bg-gradient-to-br ${media.color}`"
            >
              <span>{{ media.icon }}</span>
              <span class="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                {{ media.duration }}
              </span>
            </div>

            <p class="mt-3 text-sm font-bold text-white line-clamp-2">{{ media.title }}</p>
            <p class="mt-1 text-xs text-slate-400">👁️ {{ media.views }} reproducciones</p>

            <button
              type="button"
              class="mt-4 w-full rounded-xl bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500"
              @click="showToast(`Reproduciendo: ${media.title}`)"
            >
              Reproducción Interactiva
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA ESPECÍFICA: COMUNIDAD -->
      <div v-else-if="mod?.id === 'comunidad'" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-white">Foro de Innovación Docente</h2>
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            @click="showToast('Abriendo creador de publicaciones...')"
          >
            + Crear Tema
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="post in forumPosts"
            :key="post.id"
            class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl"
          >
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-400">
                👩‍🏫
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-bold text-indigo-300">{{ post.author }} <span class="font-normal text-slate-400">· {{ post.role }}</span></p>
                  <span class="text-[10px] text-slate-500">{{ post.date }}</span>
                </div>
                <h3 class="mt-1 text-sm font-bold text-white">{{ post.title }}</h3>

                <div class="mt-4 flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-slate-400">
                  <button type="button" class="hover:text-indigo-400" @click="showToast('Te gusta esta publicación')">
                    ❤️ {{ post.likes }} Me gusta
                  </button>
                  <button type="button" class="hover:text-indigo-400" @click="showToast('Cargando comentarios...')">
                    💬 {{ post.replies }} Respuestas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA GENÉRICA PARA OTROS MÓDULOS (Planificaciones, Estadísticas, etc.) -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Columna de Funciones -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl md:col-span-2 space-y-4">
          <h2 class="text-base font-bold text-white">Herramientas del Módulo</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div
              v-for="feat in features"
              :key="feat"
              class="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-800/60 p-4 transition-colors hover:border-white/20"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-xl text-sm"
                  :style="{ backgroundColor: mod ? `${mod.color}22` : '#ffffff22', color: mod?.color }"
                >
                  ✓
                </span>
                <span class="text-xs font-semibold text-slate-200">{{ feat }}</span>
              </div>
              <button
                type="button"
                class="rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10"
                @click="showToast(`Accediendo a: ${feat}`)"
              >
                Abrir →
              </button>
            </div>
          </div>
        </div>

        <!-- Panel lateral del módulo -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-4">
          <h2 class="text-base font-bold text-white">Información Prolipa</h2>
          <div class="rounded-2xl border border-white/5 bg-slate-800/40 p-4 text-xs space-y-2 text-slate-300">
            <p class="font-bold text-white">Módulo optimizado</p>
            <p>Conectado a la API Prolipa Virtual con sincronización en tiempo real para docentes.</p>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            @click="router.push('/')"
          >
            🏠 Ir al Inicio del Campus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
