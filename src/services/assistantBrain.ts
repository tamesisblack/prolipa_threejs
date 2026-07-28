/**
 * Orquestador del asistente: OpenRouter / Gemini o motor local (demo).
 */

import type { ChatMessage, IntentResult } from '@/types'
import { parseIntent } from '@/services/IntentEngine'
import {
  getAiProvider,
  getAiProviderLabel,
  isAiConfigured,
} from '@/services/aiContext'
import { detectNavigationIntent } from '@/services/navigationIntent'
import { chatWithGemini } from '@/services/GeminiProvider'
import { chatWithOpenRouter } from '@/services/OpenRouterProvider'

export { isAiConfigured, getAiProviderLabel }

/** @deprecated Usar isAiConfigured */
export const isGeminiConfigured = isAiConfigured

export async function processAssistantMessage(
  message: string,
  history: ChatMessage[],
): Promise<IntentResult> {
  const userMessage: ChatMessage = {
    role: 'user',
    content: message.trim(),
    timestamp: new Date(),
  }
  const allMessages = [...history, userMessage]

  // 1. Navegación explícita (ej. "lleva a biblioteca") -> Navegación inmediata
  const navIntent = detectNavigationIntent(message)
  if (navIntent) return navIntent

  // DEBUG: Verificar estado de IA
  const aiKey = import.meta.env.AI_API_KEY as string | undefined
  const aiConfigured = isAiConfigured()
  const provider = getAiProvider()
  console.log('[Proli DEBUG] AI_API_KEY exists:', !!aiKey, '| isAiConfigured:', aiConfigured, '| provider:', provider)

  // 2. Si la IA de OpenRouter está configurada en .env -> Responder con OpenRouter
  if (aiConfigured && provider) {
    try {
      console.log('[Proli DEBUG] Llamando a', provider, '...')
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout (12s)')), 12000),
      )

      const apiCall =
        provider === 'openrouter'
          ? chatWithOpenRouter(allMessages)
          : chatWithGemini(allMessages)

      const result = await Promise.race([apiCall, timeoutPromise])
      console.log('[Proli DEBUG] Respuesta recibida:', result.type, result.message?.slice(0, 80))
      return result
    } catch (error) {
      console.error('[Proli DEBUG] ERROR de IA:', error)
      // Mostrar el error en el chat para diagnóstico
      return {
        type: 'info',
        message: `⚠️ Error conectando con **${provider}**: ${error instanceof Error ? error.message : String(error)}\n\nUsando respuesta local como respaldo.`,
        confidence: 0.5,
      }
    }
  }

  // Si la IA NO está configurada, mostrar por qué
  if (!aiConfigured) {
    console.warn('[Proli DEBUG] IA NO configurada. AI_API_KEY:', aiKey ? 'presente' : 'VACÍA')
  }

  // 3. Si no hay IA o falló, usar motor local
  return parseIntent(message)
}

export function getThinkingDelay(_message: string, _useAi: boolean): number {
  return 50
}
