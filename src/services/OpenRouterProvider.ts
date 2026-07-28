/**
 * Proveedor OpenRouter — API compatible con OpenAI.
 */

import type { ChatMessage } from '@/types'
import {
  buildSystemPrompt,
  getAiApiKey,
  parseAiReply,
  toChatHistory,
} from '@/services/aiContext'

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'

/** Modelos de respaldo si el configurado no está disponible (cambian seguido en OpenRouter). */
const FALLBACK_MODELS = [
  'openrouter/free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
] as const

function getOpenRouterBaseUrl(): string {
  if (import.meta.env.DEV) {
    return '/api/openrouter'
  }
  return (
    (import.meta.env.AI_BASE_URL as string | undefined)?.trim() || DEFAULT_BASE_URL
  )
}

function getConfiguredModel(): string | undefined {
  const model = (import.meta.env.AI_MODEL as string | undefined)?.trim()
  return model || undefined
}

function getModelCandidates(): string[] {
  const configured = getConfiguredModel()
  const candidates = configured
    ? [configured, ...FALLBACK_MODELS.filter((m) => m !== configured)]
    : [...FALLBACK_MODELS]

  return [...new Set(candidates)]
}

async function requestCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'user') {
    throw new Error('Se requiere un mensaje de usuario')
  }

  const history = toChatHistory(messages.slice(0, -1))

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:5173',
      'X-Title': 'Prolipa Campus Virtual',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        { role: 'user', content: last.content },
      ],
      temperature: 0.7,
    }),
  })

  const rawText = await response.text()

  if (!response.ok) {
    let detail = rawText.slice(0, 280)
    try {
      const errJson = JSON.parse(rawText) as { error?: { message?: string } }
      detail = errJson.error?.message ?? detail
    } catch {
      /* usar rawText */
    }

    const err = new Error(`OpenRouter ${response.status}: ${detail}`) as Error & {
      status?: number
      model?: string
    }
    err.status = response.status
    err.model = model
    throw err
  }

  let data: { choices?: Array<{ message?: { content?: string } }> }
  try {
    data = JSON.parse(rawText) as typeof data
  } catch {
    throw new Error('OpenRouter devolvió JSON inválido')
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenRouter devolvió respuesta vacía')

  return content
}

function isModelUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return true
  const msg = error.message.toLowerCase()
  return (
    msg.includes('404') ||
    msg.includes('400') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('no endpoints') ||
    msg.includes('not found') ||
    msg.includes('available') ||
    msg.includes('rate') ||
    msg.includes('quota') ||
    msg.includes('model')
  )
}

export async function chatWithOpenRouter(messages: ChatMessage[]) {
  const apiKey = getAiApiKey()
  if (!apiKey) {
    throw new Error(
      'AI_API_KEY no configurada. Añádela en .env y reinicia npm run dev',
    )
  }

  const baseUrl = getOpenRouterBaseUrl()
  const models = getModelCandidates()
  let lastError: unknown

  for (const model of models) {
    try {
      const content = await requestCompletion(baseUrl, apiKey, model, messages)
      if (model !== models[0]) {
        console.info(`[Proli] Modelo ${models[0]} no disponible; usando ${model}`)
      }
      return parseAiReply(content)
    } catch (error) {
      lastError = error
      if (isModelUnavailable(error)) continue
      throw error
    }
  }

  throw lastError ?? new Error('Ningún modelo de OpenRouter está disponible')
}
