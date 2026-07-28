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
import { formatAiError } from '@/services/aiErrors'

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

  // Navegación explícita — prioridad sobre la IA (ej. "regresame al dashboard")
  const navIntent = detectNavigationIntent(message)
  if (navIntent) return navIntent

  if (isAiConfigured()) {
    const provider = getAiProvider()

    try {
      if (provider === 'openrouter') {
        const result = await chatWithOpenRouter(allMessages)
        // Si la IA no navegó pero el mensaje era claro, forzar navegación
        if (result.type !== 'navigate') {
          const retryNav = detectNavigationIntent(message)
          if (retryNav) return retryNav
        }
        return result
      }
      const result = await chatWithGemini(allMessages)
      if (result.type !== 'navigate') {
        const retryNav = detectNavigationIntent(message)
        if (retryNav) return retryNav
      }
      return result
    } catch (error) {
      console.error(`[Proli] ${getAiProviderLabel()} falló:`, error)
      const fallback = parseIntent(message)
      if (fallback.type !== 'unknown') return fallback

      const detail = formatAiError(error)

      return {
        type: 'info',
        message:
          `Tuve un problema al conectar con el **servicio de IA**.\n\n${detail}\n\nMientras tanto, prueba: "¿Qué tengo pendiente?" o "Llévame a biblioteca".`,
        confidence: 0.4,
        action: 'Error de conexión IA',
      }
    }
  }

  return parseIntent(message)
}

export function getThinkingDelay(message: string, useAi: boolean): number {
  if (useAi) return 400
  const normalized = message.toLowerCase()
  if (/pendiente|resumen|evaluacion|notificacion/.test(normalized)) return 1200
  if (/hola|gracias/.test(normalized)) return 700
  return 900
}
