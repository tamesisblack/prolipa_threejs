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
  // 1. Navegación explícita o intención con data quemada -> Respuesta INSTANTÁNEA
  const navIntent = detectNavigationIntent(message)
  if (navIntent) return navIntent

  const localIntent = parseIntent(message)
  if (localIntent.type !== 'unknown') {
    return localIntent
  }

  // 2. Para preguntas complejas no quemadas, intentar IA remota con timeout máximo de 2s
  if (isAiConfigured()) {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }
    const allMessages = [...history, userMessage]
    const provider = getAiProvider()

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 2000),
      )

      const apiCall =
        provider === 'openrouter'
          ? chatWithOpenRouter(allMessages)
          : chatWithGemini(allMessages)

      const result = await Promise.race([apiCall, timeoutPromise])
      return result
    } catch (error) {
      console.warn('[Proli] Fallo/timeout en IA externa, usando motor local:', error)
      return localIntent
    }
  }

  return localIntent
}

export function getThinkingDelay(_message: string, _useAi: boolean): number {
  return 50
}
