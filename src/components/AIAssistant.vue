<script setup lang="ts">
/**
 * Asistente IA del Campus Virtual — Demo interactivo para gerencia.
 * Motor de intenciones local con datos quemados; listo para LLM real.
 */
import { ref, nextTick, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssistantStore } from '@/stores/assistant'
import { usePreferCampusGrid } from '@/composables/useMediaQuery'
import gsap from 'gsap'

const store = useAssistantStore()
const router = useRouter()
const route = useRoute()
const preferGrid = usePreferCampusGrid()
const showFab = computed(() => !(preferGrid.value && route.path === '/'))
const input = ref('')
const chatRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const fabRef = ref<HTMLElement | null>(null)

/** Sugerencias para la demo con gerencia */
const suggestions = [
  '¿Qué tengo pendiente?',
  'Ir a evaluaciones',
  'Ver biblioteca',
  'Abrir multimedia',
  'Hablar con Proli',
]

onMounted(() => {
  // Pulso en el botón para llamar la atención en la demo
  if (fabRef.value && !store.hasInteracted) {
    gsap.to(fabRef.value, {
      boxShadow: '0 0 0 8px rgba(12, 135, 232, 0.25)',
      duration: 1.2,
      yoyo: true,
      repeat: 3,
      ease: 'sine.inOut',
    })
  }
})

watch(
  () => store.isOpen,
  async (open) => {
    if (open && panelRef.value) {
      await nextTick()
      gsap.fromTo(
        panelRef.value,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' },
      )
    }
  },
)

watch(
  () => store.messages.length,
  async () => {
    await nextTick()
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  },
)

watch(
  () => store.messages.map((m) => m.content).join(''),
  async () => {
    await nextTick()
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight
    }
  },
)

async function send(text?: string) {
  const message = (text ?? input.value).trim()
  if (!message || store.isTyping) return
  input.value = ''
  await store.send(message, (route) => router.push(route))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function handleNewChat() {
  if (store.isTyping) return
  if (store.hasConversation && !confirm('¿Iniciar un nuevo chat? Se borrará la conversación actual.')) {
    return
  }
  store.newChat()
}

function handleClearChat() {
  if (store.isTyping || !store.hasConversation) return
  if (!confirm('¿Borrar toda la conversación?')) return
  store.clearChat()
}

/** Renderiza markdown básico (**negrita**) en mensajes del asistente */
function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <!-- Botón flotante -->
  <button
    v-if="showFab"
    ref="fabRef"
    type="button"
    class="ai-fab fixed z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-prolipa-500 to-edu-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 max-md:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] max-md:right-4 max-md:left-auto max-md:h-11 max-md:px-3.5 md:bottom-6 md:left-6 md:h-14 md:pl-4 md:pr-5"
    aria-label="Asistente IA"
    @click="store.toggle()"
  >
    <span class="text-xl">{{ store.isOpen ? '✕' : '✨' }}</span>
    <span v-if="!store.isOpen" class="text-xs font-semibold tracking-wide max-md:hidden md:inline">Proli IA</span>
  </button>

  <!-- Panel de chat -->
  <Transition name="fade">
    <div
      v-if="store.isOpen"
      ref="panelRef"
      class="ai-panel fixed z-50 flex flex-col overflow-hidden rounded-3xl glass shadow-soft inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] max-h-[min(560px,calc(100vh-7rem))] md:inset-x-auto md:bottom-24 md:left-6 md:w-[420px] md:max-h-[min(560px,calc(100vh-120px))]"
    >
      <!-- Header -->
      <div class="border-b border-white/40 px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-400 to-edu-400 text-xl shadow-md"
            >
              🤖
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-edu-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800">Proli — Asistente IA</p>
            <p class="text-[11px] text-edu-600">● En línea · Demo interactivo</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="rounded-lg px-2 py-1.5 text-[10px] font-semibold text-prolipa-700 transition-colors hover:bg-prolipa-50 disabled:opacity-40"
              title="Nuevo chat"
              :disabled="store.isTyping"
              @click="handleNewChat"
            >
              + Nuevo
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              title="Borrar chat"
              :disabled="store.isTyping || !store.hasConversation"
              @click="handleClearChat"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <span class="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 sm:inline">
            Demo
          </span>
        </div>

        <!-- Última acción ejecutada -->
        <Transition name="fade">
          <div
            v-if="store.lastAction"
            class="mt-3 flex items-center gap-2 rounded-xl bg-prolipa-50/80 px-3 py-2"
          >
            <span class="text-prolipa-500">⚡</span>
            <span class="text-[11px] font-medium text-prolipa-700">{{ store.lastAction }}</span>
          </div>
        </Transition>
      </div>

      <!-- Mensajes -->
      <div ref="chatRef" class="custom-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div
          v-for="(msg, i) in store.messages"
          :key="i"
          class="flex gap-2"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-100 to-edu-100 text-xs"
          >
            🤖
          </div>
          <div
            class="max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-prolipa-500 text-white rounded-br-md'
                : 'bg-white/75 text-slate-700 rounded-bl-md shadow-sm'
            "
          >
            <span
              v-if="msg.role === 'assistant'"
              v-html="formatMessage(msg.content)"
            />
            <span v-else>{{ msg.content }}</span>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="store.isTyping" class="flex items-start gap-2">
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-100 to-edu-100 text-xs">
            🤖
          </div>
          <div class="rounded-2xl bg-white/75 px-4 py-3 shadow-sm">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-slate-400">Proli está pensando</span>
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" />
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" style="animation-delay: 0.15s" />
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" style="animation-delay: 0.3s" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sugerencias rápidas -->
      <div class="border-t border-white/30 px-4 py-2">
        <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Prueba en la demo
        </p>
        <div class="custom-scroll flex gap-1.5 overflow-x-auto pb-1">
          <button
            v-for="s in suggestions"
            :key="s"
            type="button"
            class="shrink-0 rounded-full bg-prolipa-50 px-2.5 py-1 text-[10px] font-medium text-prolipa-700 transition-colors hover:bg-prolipa-100 disabled:opacity-50"
            :disabled="store.isTyping"
            @click="send(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t border-white/40 p-3">
        <div class="flex items-end gap-2 rounded-2xl bg-white/60 p-2 ring-1 ring-white/50 focus-within:ring-prolipa-300">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Pregúntame lo que necesites…"
            class="max-h-20 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            :disabled="store.isTyping"
            @keydown="onKeydown"
          />
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-prolipa-600"
            title="Voz — próximamente"
            disabled
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-prolipa-500 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            :disabled="!input.trim() || store.isTyping"
            @click="send()"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.typing-dot {
  animation: bounce 1.2s infinite ease-in-out;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
}

:deep(strong) {
  font-weight: 600;
  color: #0154a1;
}
</style>
