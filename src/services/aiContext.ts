/**
 * Contexto compartido para proveedores de IA (Gemini, OpenRouter, etc.).
 */

import { mockDashboardData } from '@/api/mock/dashboard'
import { CAMPUS_MODULES } from '@/config/modules'
import type { ChatMessage, IntentResult } from '@/types'

const DATA = mockDashboardData

export const VALID_ROUTES = new Set([
  '/',
  ...CAMPUS_MODULES.filter((m) => m.action !== 'assistant').map((m) => m.route),
])

export type AiProviderKind = 'openrouter' | 'gemini'

export function getAiApiKey(): string | undefined {
  const key = import.meta.env.AI_API_KEY || import.meta.env.VITE_AI_API_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : undefined
}

export function getAiProvider(): AiProviderKind | null {
  const key = getAiApiKey()
  if (!key) return null

  const configured = (
    import.meta.env.AI_PROVIDER as string | undefined
  )?.trim().toLowerCase()

  if (configured === 'openrouter' || key.startsWith('sk-or-')) {
    return 'openrouter'
  }

  if (configured === 'gemini' || key.startsWith('AIza')) {
    return 'gemini'
  }

  return configured === 'openrouter' ? 'openrouter' : 'gemini'
}

export function isAiConfigured(): boolean {
  return Boolean(getAiApiKey())
}

export function getAiProviderLabel(): string {
  // Etiqueta visible para docentes — sin exponer proveedor técnico (OpenRouter, Gemini)
  if (isAiConfigured()) return 'Proli IA'
  return 'Proli'
}

export function buildSystemPrompt(): string {
  const modules = CAMPUS_MODULES.map(
    (m) => `· ${m.name} → ${m.route} (${m.subtitle})`,
  ).join('\n')

  const pendingEvals = DATA.evaluations.filter((e) => e.status === 'pending')
  const unread = DATA.notifications.filter((n) => !n.read)

  return `Eres **Proli**, la asistente IA del Campus Virtual Prolipa para docentes ecuatorianos.
Responde SIEMPRE en español, con tono cálido, profesional y conciso (máximo 4 párrafos cortos).
Usa **negrita** con markdown para resaltar nombres de módulos o datos importantes.

## Docente actual
- Nombre: ${DATA.user.name}
- Institución: ${DATA.user.institution}
- Rol: ${DATA.user.role}

## Datos del dashboard (usa estos datos reales al responder)
- Evaluaciones pendientes (${pendingEvals.length}): ${pendingEvals.map((e) => e.title).join(', ') || 'ninguna'}
- Notificaciones sin leer (${unread.length}): ${unread.map((n) => n.title).join(', ') || 'ninguna'}
- Próxima capacitación: ${DATA.trainings[0]?.title ?? '—'} (${DATA.trainings[0]?.date ?? ''})
- Libros disponibles: ${DATA.books.filter((b) => b.available).length} de ${DATA.books.length}

## Módulos del campus (rutas válidas para navigate)
· Campus Virtual / Inicio / Dashboard / Página principal → ruta "/" (NO es un resumen de datos; es la pantalla principal con islas o tarjetas)
${modules}

## Navegación — MUY IMPORTANTE
Cuando el usuario pida **ir, volver, regresar, abrir o llevarlo** a algún lugar, SIEMPRE usa "navigate" con la ruta. NO respondas solo con un resumen de datos.

Ejemplos que deben NAVEGAR (navigate ≠ null):
- "regresame al dashboard" → navigate: "/"
- "vuelve al inicio" → navigate: "/"
- "llévame a biblioteca" → navigate: "/biblioteca"
- "ir al campus" → navigate: "/"
- "abre evaluaciones" → navigate: "/evaluaciones"

Ejemplos que NO navegan (solo informan, navigate: null):
- "¿qué tengo pendiente?" → resumen de datos
- "cuántas evaluaciones tengo" → información

Si pide ir al **dashboard**, **inicio**, **campus** o **página principal** → navigate: "/"

## Formato de respuesta
Responde ÚNICAMENTE con JSON válido (sin markdown ni texto extra):
{"message":"texto para el docente","navigate":null,"action":null}

## Reglas
- No inventes rutas fuera de la lista.
- Si no sabes algo del campus, dilo con honestidad.
- Para saludos, preséntate brevemente como Proli.`
}

export interface AiReply {
  message: string
  navigate?: string | null
  action?: string | null
}

export function parseAiReply(raw: string): IntentResult {
  let parsed: AiReply

  try {
    const jsonText = raw.trim().replace(/^```json?\s*|\s*```$/g, '')
    parsed = JSON.parse(jsonText) as AiReply
  } catch {
    return {
      type: 'info',
      message: raw || 'No pude procesar la respuesta. ¿Puedes reformular tu pregunta?',
      confidence: 0.5,
    }
  }

  const route =
    parsed.navigate && VALID_ROUTES.has(parsed.navigate) ? parsed.navigate : undefined

  const module = route
    ? CAMPUS_MODULES.find((m) => m.route === route)
    : undefined

  return {
    type: route ? 'navigate' : 'info',
    route,
    message: parsed.message,
    confidence: 0.88,
    action:
      parsed.action ??
      (route && module ? `Navegando → ${module.name}` : undefined),
  }
}

export function toChatHistory(
  messages: ChatMessage[],
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
}
