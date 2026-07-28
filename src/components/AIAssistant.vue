<script setup lang="ts">
/**
 * Asistente IA del Campus Virtual — Demo interactivo para gerencia.
 * Diseño adaptativo:
 * - Móvil: Pantalla completa estilo WhatsApp / Gemini con botón para cerrar/atrás.
 * - PC / Escritorio: Tarjeta flotante glassmorphism elegante con fondo blanco sólido/translúcido.
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

// FAB solo visible si la ruta no es grid pura o el asistente está cerrado en móvil
const showFab = computed(() => !(preferGrid.value && route.path === '/') && !store.isOpen)
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
  // Pulso en el botón flotante
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
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' },
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

/** Renderiza markdown básico (**negrita** / *negrita*) en mensajes del asistente */
function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <!-- Botón flotante FAB — Estilo futurista glassmorphism -->
  <button
    v-if="showFab"
    ref="fabRef"
    type="button"
    class="ai-fab-futuristic"
    aria-label="Asistente IA"
    @click="store.toggle()"
  >
    <span class="ai-fab-avatar">🤖</span>
    <div class="ai-fab-info">
      <span class="ai-fab-name">Proli IA</span>
      <span class="ai-fab-sub">Tu asistente inteligente</span>
    </div>
  </button>

  <!-- Panel de Chat (Móvil: estilo WhatsApp / Gemini fullscreen; PC: Tarjeta limpia con fondo blanco solid/glass) -->
  <Transition name="fade">
    <div
      v-if="store.isOpen"
      ref="panelRef"
      class="ai-panel fixed z-[100] flex flex-col overflow-hidden max-md:inset-0 max-md:h-[100dvh] max-md:w-full max-md:bg-[#0b141a] max-md:text-slate-100 md:bottom-24 md:left-6 md:z-50 md:h-auto md:w-[420px] md:max-h-[min(560px,calc(100vh-120px))] md:rounded-3xl md:border md:border-white/80 md:bg-white/95 md:text-slate-800 md:shadow-2xl md:backdrop-blur-xl"
    >
      <!-- Header -->
      <div class="border-b max-md:border-white/10 max-md:bg-[#111b21] max-md:px-3 max-md:py-2.5 md:border-slate-200/80 md:bg-white/95 md:px-5 md:py-4">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Botón atrás (Solo en móvil para cerrar chat) -->
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95 max-md:flex md:hidden"
              title="Cerrar chat"
              @click="store.close()"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Avatar -->
            <div class="relative shrink-0">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-400 to-edu-400 text-lg shadow-md md:h-11 md:w-11 md:text-xl"
              >
                🤖
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 max-md:border-[#111b21] bg-emerald-500 md:border-white" />
            </div>

            <!-- Título y Estado -->
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-bold max-md:text-white md:text-slate-800">
                Proli — Asistente IA
              </p>
              <p class="truncate text-[11px]" :class="store.aiEnabled ? 'max-md:text-emerald-400 md:text-edu-600' : 'text-slate-400'">
                {{ store.aiEnabled ? '● En línea · Gemini Campus' : '● Modo demo' }}
              </p>
            </div>
          </div>

          <!-- Acciones del Header -->
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1.5 text-xs font-semibold max-md:text-emerald-400 max-md:hover:bg-white/10 md:text-[10px] md:text-prolipa-700 md:hover:bg-prolipa-50 disabled:opacity-40"
              title="Nuevo chat"
              :disabled="store.isTyping"
              @click="handleNewChat"
            >
              + Nuevo
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:opacity-30 md:hover:bg-red-50 md:hover:text-red-600"
              title="Borrar chat"
              :disabled="store.isTyping || !store.hasConversation"
              @click="handleClearChat"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <!-- Botón cerrar (X) para PC y Móvil -->
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hover:bg-slate-100 md:hover:text-slate-700"
              title="Cerrar asistente"
              @click="store.close()"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Última acción ejecutada -->
        <Transition name="fade">
          <div
            v-if="store.lastAction"
            class="mt-2.5 flex items-center gap-2 rounded-xl max-md:bg-prolipa-500/15 max-md:px-3 max-md:py-1.5 md:bg-prolipa-50 md:px-3 md:py-2"
          >
            <span class="text-prolipa-400 md:text-prolipa-500">⚡</span>
            <span class="text-[11px] font-medium max-md:text-prolipa-300 md:text-prolipa-700">{{ store.lastAction }}</span>
          </div>
        </Transition>
      </div>

      <!-- Área de Mensajes -->
      <div
        ref="chatRef"
        class="custom-scroll flex-1 space-y-3.5 overflow-y-auto px-4 py-4 max-md:bg-[#0b141a] md:bg-slate-50/60"
      >
        <div
          v-for="(msg, i) in store.messages"
          :key="i"
          class="flex gap-2"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="msg.role === 'assistant'"
            class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-400 to-edu-400 text-xs shadow-sm md:from-prolipa-100 md:to-edu-100"
          >
            🤖
          </div>
          <div
            class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm md:max-w-[82%]"
            :class="
              msg.role === 'user'
                ? 'max-md:bg-[#005c4b] max-md:text-white max-md:rounded-tr-xs md:bg-prolipa-500 md:text-white md:rounded-br-md'
                : 'max-md:bg-[#202c33] max-md:text-slate-100 max-md:rounded-tl-xs max-md:border max-md:border-white/5 md:bg-white md:text-slate-700 md:rounded-bl-md md:border md:border-slate-200/60'
            "
          >
            <span
              v-if="msg.role === 'assistant'"
              v-html="formatMessage(msg.content)"
            />
            <span v-else>{{ msg.content }}</span>
          </div>
        </div>

        <!-- Indicador de pensando -->
        <div v-if="store.isTyping" class="flex items-start gap-2">
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prolipa-400 to-edu-400 text-xs shadow-sm md:from-prolipa-100 md:to-edu-100">
            🤖
          </div>
          <div class="rounded-2xl max-md:bg-[#202c33] max-md:text-slate-100 max-md:rounded-tl-xs px-4 py-3 shadow-sm md:bg-white md:border md:border-slate-200/60">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] max-md:text-slate-300 md:text-slate-400">Proli está pensando</span>
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" />
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" style="animation-delay: 0.15s" />
              <span class="typing-dot h-1.5 w-1.5 rounded-full bg-prolipa-400" style="animation-delay: 0.3s" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sugerencias rápidas (Chips) -->
      <div class="border-t max-md:border-white/10 max-md:bg-[#111b21] max-md:px-4 max-md:py-2.5 md:border-slate-200/60 md:bg-white md:px-4 md:py-2">
        <p class="mb-1.5 text-[10px] font-medium uppercase tracking-wider max-md:text-slate-400 md:text-slate-400">
          Sugerencias rápidas
        </p>
        <div class="custom-scroll flex gap-1.5 overflow-x-auto pb-1">
          <button
            v-for="s in suggestions"
            :key="s"
            type="button"
            class="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 max-md:bg-[#202c33] max-md:text-emerald-400 max-md:hover:bg-[#2a3942] md:bg-prolipa-50 md:text-[10px] md:text-prolipa-700 md:hover:bg-prolipa-100"
            :disabled="store.isTyping"
            @click="send(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="border-t max-md:border-white/10 max-md:bg-[#111b21] max-md:p-2.5 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))] md:border-slate-200/80 md:bg-white md:p-3">
        <div class="flex items-center gap-2 rounded-2xl p-2 max-md:bg-[#2a3942] max-md:ring-1 max-md:ring-white/10 md:items-end md:bg-slate-50 md:ring-1 md:ring-slate-200 md:focus-within:ring-prolipa-400">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Pregúntame lo que necesites…"
            class="max-h-20 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none max-md:text-white max-md:placeholder:text-slate-400 md:text-slate-700 md:placeholder:text-slate-400"
            :disabled="store.isTyping"
            @keydown="onKeydown"
          />
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 max-md:text-slate-400 md:hover:bg-slate-200/70 md:hover:text-prolipa-600"
            title="Voz — próximamente"
            disabled
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 max-md:bg-[#00a884] md:bg-prolipa-500"
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
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
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
  color: #38bdf8;
}

@media (min-width: 768px) {
  :deep(strong) {
    color: #0154a1;
  }
}

/* ===== BOTÓN FLOTANTE FUTURISTA ===== */
.ai-fab-futuristic {
  position: fixed;
  bottom: 3.5rem;
  left: 1.25rem;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(12px);
  color: white;
  cursor: pointer;
  transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(99,102,241,0.1);
  font-family: inherit;
}

.ai-fab-futuristic:hover {
  border-color: rgba(99,102,241,0.6);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 24px rgba(0,0,0,0.6), 0 0 25px rgba(99,102,241,0.25);
}

.ai-fab-futuristic:active {
  transform: translateY(0) scale(0.98);
}

.ai-fab-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  box-shadow: 0 0 10px rgba(99,102,241,0.4);
}

.ai-fab-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.ai-fab-name {
  font-size: 11px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.ai-fab-sub {
  font-size: 8px;
  color: #94a3b8;
  line-height: 1.2;
}

@media (max-width: 1023px) {
  .ai-fab-futuristic {
    bottom: 4.5rem;
  }
}
</style>
