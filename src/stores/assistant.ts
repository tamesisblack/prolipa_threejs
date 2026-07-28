/**
 * Store del asistente IA con historial de chat y efecto de escritura.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, IntentResult } from '@/types'
import {
  getThinkingDelay,
  isAiConfigured,
  processAssistantMessage,
} from '@/services/assistantBrain'

function createWelcomeMessage(): ChatMessage {
  const aiOn = isAiConfigured()
  return {
    role: 'assistant',
    content: aiOn
      ? '¡Hola! 👋 Soy **Proli**, tu asistente inteligente del Campus Virtual.\n\nPregúntame lo que necesites o pídeme que te lleve a cualquier módulo del campus.'
      : '¡Bienvenida al Campus Virtual! 👋 Soy **Proli**, tu asistente inteligente.\n\nPuedo llevarte a cualquier módulo o contarte qué tienes pendiente. ¿En qué te ayudo?',
    timestamp: new Date(),
  }
}

export const useAssistantStore = defineStore('assistant', () => {
  const isOpen = ref(false)
  const isTyping = ref(false)
  const hasInteracted = ref(false)
  const lastAction = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([createWelcomeMessage()])

  const hasConversation = computed(() =>
    messages.value.some((m) => m.role === 'user'),
  )

  const aiEnabled = computed(() => isAiConfigured())

  function toggle() {
    isOpen.value = !isOpen.value
    hasInteracted.value = true
  }

  function open() {
    isOpen.value = true
    hasInteracted.value = true
  }

  function newChat() {
    if (isTyping.value) return
    messages.value = [createWelcomeMessage()]
    lastAction.value = null
  }

  function clearChat() {
    newChat()
  }

  /** Simula escritura progresiva tipo ChatGPT */
  async function typeMessage(fullText: string): Promise<void> {
    const msg: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    messages.value.push(msg)
    const index = messages.value.length - 1

    const chars = [...fullText]
    const chunkSize = fullText.length > 200 ? 3 : 2

    for (let i = 0; i < chars.length; i += chunkSize) {
      messages.value[index].content += chars.slice(i, i + chunkSize).join('')
      await new Promise((r) => setTimeout(r, 18))
    }
  }

  async function send(text: string, onNavigate?: (route: string) => void) {
    if (!text.trim() || isTyping.value) return

    hasInteracted.value = true
    lastAction.value = null

    messages.value.push({
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    })

    isTyping.value = true
    const history = messages.value.slice(0, -1)
    await new Promise((r) =>
      setTimeout(r, getThinkingDelay(text, isAiConfigured())),
    )

    const result: IntentResult = await processAssistantMessage(text, history)
    isTyping.value = false

    if (result.action) lastAction.value = result.action

    await typeMessage(result.message)

    if (result.type === 'navigate' && result.route && onNavigate) {
      lastAction.value = result.action ?? `Navegando → ${result.route}`
      setTimeout(() => onNavigate(result.route!), 1000)
    }
  }

  return {
    isOpen,
    isTyping,
    hasInteracted,
    hasConversation,
    aiEnabled,
    lastAction,
    messages,
    toggle,
    open,
    newChat,
    clearChat,
    send,
  }
})
