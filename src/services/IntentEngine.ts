/**
 * Motor de intenciones local para el asistente IA (modo demo).
 * Simula respuestas inteligentes con datos quemados del dashboard.
 * Arquitectura preparada para integrar OpenAI, Gemini o Claude.
 */

import { mockDashboardData } from '@/api/mock/dashboard'
import type { AIProvider, ChatMessage, IntentResult } from '@/types'
import { detectNavigationIntent } from '@/services/navigationIntent'

const DATA = mockDashboardData

/** Patrones de intención → ruta del campus */
const NAVIGATION_PATTERNS: Array<{
  keywords: string[]
  route: string
  label: string
  icon: string
}> = [
    { keywords: ['inicio', 'campus', 'home', 'principal', 'volver', 'dashboard'], route: '/', label: 'Inicio', icon: '🏠' },
    { keywords: ['biblioteca', 'libro', 'libros', 'recurso'], route: '/biblioteca', label: 'Biblioteca', icon: '📚' },
    { keywords: ['evaluacion', 'evaluaciones', 'examen', 'prueba', 'diagnostico'], route: '/evaluaciones', label: 'Evaluaciones', icon: '📝' },
    { keywords: ['planificacion', 'planificaciones', 'clase', 'clases', 'calendario', 'agenda'], route: '/planificaciones', label: 'Planificaciones', icon: '📅' },
    { keywords: ['certificado', 'certificados', 'diploma', 'certificacion', 'capacitacion'], route: '/certificaciones', label: 'Certificados', icon: '🏆' },
    { keywords: ['estadistica', 'estadisticas', 'metrica', 'metricas', 'reporte'], route: '/estadisticas', label: 'Estadísticas', icon: '📈' },
    { keywords: ['comunidad', 'foro', 'docente', 'colaboracion'], route: '/comunidad', label: 'Comunidad', icon: '💬' },
    { keywords: ['asistente', 'proli', 'ia', 'inteligencia', 'chat', 'ayuda ia'], route: '/', label: 'Asistente IA', icon: '🤖' },
    { keywords: ['multimedia', 'video', 'videos', 'audio', 'imagen', 'galeria'], route: '/multimedia', label: 'Recursos Multimedia', icon: '🎥' },
  ]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw))
}

function firstName(): string {
  return DATA.user.name.split(' ')[0]
}

function buildPendingSummary(): string {
  const pendingEvals = DATA.evaluations.filter((e) => e.status === 'pending')
  const unread = DATA.notifications.filter((n) => !n.read)
  const nextTraining = DATA.trainings[0]

  const lines = [
    `Hola ${firstName()}, este es tu resumen del día:`,
    '',
    `📝 **${pendingEvals.length} evaluaciones pendientes**`,
    ...pendingEvals.map((e) => `   · ${e.title} (${e.course}) — vence ${e.dueDate}`),
    '',
    `🔔 **${unread.length} notificaciones sin leer**`,
    ...unread.map((n) => `   · ${n.title}`),
    '',
    `🎓 **Próxima capacitación:** ${nextTraining.title}`,
    `   ${nextTraining.date} a las ${nextTraining.time} (${nextTraining.modality})`,
    '',
    '¿Quieres que te lleve a alguno de estos módulos?',
  ]

  return lines.join('\n')
}

function buildEvaluationsInfo(): string {
  const pending = DATA.evaluations.filter((e) => e.status === 'pending')
  const inProgress = DATA.evaluations.filter((e) => e.status === 'in_progress')

  return [
    `Tienes ${pending.length} evaluaciones pendientes y ${inProgress.length} en curso:`,
    '',
    ...DATA.evaluations.map((e) => {
      const status = e.status === 'pending' ? '⏳ Pendiente' : e.status === 'in_progress' ? '🔄 En curso' : '✅ Completada'
      return `· **${e.title}** — ${e.course}\n  ${status} · Entrega: ${e.dueDate}`
    }),
    '',
    '¿Te llevo al Aula de Evaluaciones?',
  ].join('\n')
}

function buildBooksInfo(): string {
  const available = DATA.books.filter((b) => b.available)
  return [
    `Tienes **${available.length} libros disponibles** de ${DATA.books.length} en total:`,
    '',
    ...DATA.books.map((b) =>
      `${b.available ? '✅' : '📖'} **${b.title}** — ${b.author}${b.available ? '' : ' (prestado)'}`,
    ),
    '',
    '¿Quieres ir a la Biblioteca?',
  ].join('\n')
}

function buildTrainingsInfo(): string {
  return [
    'Estas son tus próximas capacitaciones:',
    '',
    ...DATA.trainings.map(
      (t) =>
        `· **${t.title}**\n  📅 ${t.date} · 🕐 ${t.time} · ${t.modality === 'virtual' ? '💻 Virtual' : '🏫 Presencial'}`,
    ),
    '',
    'La más próxima es **Metodologías Activas en Aula** el 24 de julio.',
  ].join('\n')
}

function buildCertificatesInfo(): string {
  const available = DATA.certificates.filter((c) => c.status === 'available')
  return [
    `Tienes **${available.length} certificados disponibles** para descargar:`,
    '',
    ...DATA.certificates.map((c) =>
      `${c.status === 'available' ? '🏆' : '⏳'} **${c.title}**${c.status === 'available' ? ` — emitido ${c.issuedAt}` : ' — en proceso'}`,
    ),
    '',
    '¿Te llevo al Auditorio de Certificados?',
  ].join('\n')
}

function buildCalendarInfo(): string {
  return [
    'Tu agenda de esta semana:',
    '',
    ...DATA.calendar.map(
      (e) => `· **${e.title}** — ${e.date} a las ${e.time}`,
    ),
  ].join('\n')
}

function buildNotificationsInfo(): string {
  const unread = DATA.notifications.filter((n) => !n.read)
  return [
    `Tienes **${unread.length} notificaciones nuevas**:`,
    '',
    ...DATA.notifications.map(
      (n) => `${n.read ? '✓' : '🔵'} **${n.title}**\n  ${n.message}`,
    ),
  ].join('\n')
}

function buildHelpInfo(): string {
  return [
    `¡Hola ${firstName()}! Soy **Proli**, tu asistente del Campus Virtual. Puedo ayudarte con:`,
    '',
    '🏫 **Navegar** — "Llévame a biblioteca", "Ir a gamificación"',
    '📊 **Consultar** — "¿Qué tengo pendiente?", "Mis evaluaciones"',
    '📚 **Información** — libros, capacitaciones, estadísticas',
    '',
    'Prueba cualquiera de las sugerencias de abajo 👇',
  ].join('\n')
}

function tryNavigation(normalized: string): IntentResult | null {
  return detectNavigationIntent(normalized) ?? legacyTryNavigation(normalized)
}

function legacyTryNavigation(normalized: string): IntentResult | null {
  const navTriggers = ['ir a', 'lleva', 'llevame', 'llévame', 'abre', 'mostrar', 'ver ', 'necesito', 'quiero']
  const isNavIntent = navTriggers.some((t) => normalized.includes(t)) || normalized.startsWith('ir ')

  for (const pattern of NAVIGATION_PATTERNS) {
    const matches = pattern.keywords.filter((kw) => normalized.includes(kw))
    if (matches.length > 0 && (isNavIntent || matches.length >= 1)) {
      // Evitar conflicto: "evaluaciones pendientes" es info, no navegación
      if (
        pattern.route === '/evaluaciones' &&
        hasAny(normalized, ['pendiente', 'pendientes', 'cuantas', 'cuántas', 'tengo', 'resumen'])
      ) {
        continue
      }

      const confidence = Math.min(0.98, 0.6 + matches.length * 0.12)
      return {
        type: 'navigate',
        route: pattern.route,
        message: `Perfecto, ${firstName()}. Te estoy llevando a **${pattern.label}** ${pattern.icon}\n\nAllí encontrarás todo lo relacionado con este módulo.`,
        confidence,
        action: `Navegando → ${pattern.label}`,
      }
    }
  }

  return null
}

/**
 * Analiza el mensaje del usuario y determina la intención (demo quemado).
 */
export function parseIntent(message: string): IntentResult {
  const normalized = normalize(message)

  const nav = detectNavigationIntent(message)
  if (nav) return nav

  // Saludos
  if (hasAny(normalized, ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'ola'])) {
    return {
      type: 'info',
      message: `¡Hola ${firstName()}! 👋 Me alegra verte en el Campus Virtual.\n\nSoy **Proli**, tu asistente inteligente. Puedo llevarte a cualquier módulo o contarte qué tienes pendiente hoy.\n\n¿En qué te ayudo?`,
      confidence: 0.95,
    }
  }

  // Operaciones matemáticas (ej: "5+5", "cuanto es 10 + 20", "cuánto es 8 * 4")
  const mathMatch =
    normalized.match(/(?:cuanto|cuanto es|calcula|resultado de)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/i) ||
    message.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/)
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1])
    const op = mathMatch[2]
    const num2 = parseFloat(mathMatch[3])
    let res = 0
    if (op === '+') res = num1 + num2
    else if (op === '-') res = num1 - num2
    else if (op === '*') res = num1 * num2
    else if (op === '/') res = num2 !== 0 ? num1 / num2 : NaN

    if (!isNaN(res)) {
      return {
        type: 'info',
        message: `El resultado de **${num1} ${op} ${num2}** es **${res}** 🔢.`,
        confidence: 0.98,
        action: 'Cálculo matemático',
      }
    }
  }

  // Resumen / pendientes
  if (
    hasAny(normalized, [
      'pendiente', 'pendientes', 'resumen', 'que tengo', 'qué tengo',
      'hoy', 'agenda del dia', 'agenda del día', 'mi dia', 'mi día',
    ])
  ) {
    return {
      type: 'info',
      message: buildPendingSummary(),
      confidence: 0.92,
      action: 'Consulta de resumen',
    }
  }

  // Evaluaciones (info)
  if (
    hasAny(normalized, ['evaluacion', 'evaluaciones', 'examen', 'examenes']) &&
    hasAny(normalized, ['pendiente', 'cuantas', 'cuántas', 'tengo', 'cuales', 'cuáles', 'lista'])
  ) {
    return {
      type: 'info',
      message: buildEvaluationsInfo(),
      confidence: 0.9,
      action: 'Consulta de evaluaciones',
    }
  }

  // Libros (info)
  if (
    hasAny(normalized, ['libro', 'libros', 'biblioteca']) &&
    hasAny(normalized, ['cuantos', 'cuántos', 'disponible', 'tengo', 'lista', 'cuales', 'cuáles'])
  ) {
    return {
      type: 'info',
      message: buildBooksInfo(),
      confidence: 0.88,
      action: 'Consulta de biblioteca',
    }
  }

  // Capacitaciones
  if (hasAny(normalized, ['capacitacion', 'capacitaciones', 'curso', 'cursos', 'formacion', 'formación'])) {
    return {
      type: 'info',
      message: buildTrainingsInfo(),
      confidence: 0.88,
      action: 'Consulta de capacitaciones',
    }
  }

  // Certificados (info)
  if (
    hasAny(normalized, ['certificado', 'certificados', 'diploma']) &&
    hasAny(normalized, ['cuantos', 'cuántos', 'tengo', 'mis', 'lista'])
  ) {
    return {
      type: 'info',
      message: buildCertificatesInfo(),
      confidence: 0.88,
      action: 'Consulta de certificados',
    }
  }

  // Calendario
  if (hasAny(normalized, ['calendario', 'agenda', 'eventos', 'reunion', 'reunión', 'clase'])) {
    return {
      type: 'info',
      message: buildCalendarInfo(),
      confidence: 0.85,
      action: 'Consulta de calendario',
    }
  }

  // Notificaciones
  if (hasAny(normalized, ['notificacion', 'notificaciones', 'avisos', 'alertas'])) {
    return {
      type: 'info',
      message: buildNotificationsInfo(),
      confidence: 0.85,
      action: 'Consulta de notificaciones',
    }
  }

  // Quién eres / ayuda
  if (hasAny(normalized, ['quien eres', 'quién eres', 'que puedes', 'qué puedes', 'ayudame', 'ayúdame', 'como funciona', 'cómo funciona'])) {
    return {
      type: 'info',
      message: buildHelpInfo(),
      confidence: 0.9,
    }
  }

  // Gracias
  if (hasAny(normalized, ['gracias', 'thank', 'perfecto', 'genial', 'excelente'])) {
    return {
      type: 'info',
      message: `¡Con gusto, ${firstName()}! 😊 Estoy aquí cuando me necesites. Recuerda que puedes preguntarme por tus pendientes o pedirme que te lleve a cualquier módulo del campus.`,
      confidence: 0.9,
    }
  }

  // Navegación (respaldo)
  const navLegacy = tryNavigation(normalized)
  if (navLegacy) return navLegacy

  return {
    type: 'unknown',
    message: `Hmm, no estoy seguro de entender eso, ${firstName()}. 🤔\n\nPrueba algo como:\n· "¿Qué tengo pendiente?"\n· "Llévame a biblioteca"\n· "Ver estadísticas"\n· "Ir al laboratorio"`,
    confidence: 0.3,
  }
}

/** Procesa un mensaje completo del chat y devuelve respuesta + acción. */
export function processMessage(message: string): IntentResult {
  return parseIntent(message)
}

/** Simula tiempo de "pensamiento" según complejidad (demo realista). */
export function getThinkingDelay(message: string): number {
  const normalized = normalize(message)
  if (hasAny(normalized, ['pendiente', 'resumen', 'evaluacion', 'notificacion'])) return 1200
  if (hasAny(normalized, ['hola', 'gracias'])) return 700
  return 900
}

/** Placeholder para proveedores de IA externos (OpenAI, Gemini, Claude). */
export class ExternalAIProvider implements AIProvider {
  name: AIProvider['name']

  constructor(name: AIProvider['name']) {
    this.name = name
  }

  async chat(_messages: ChatMessage[]): Promise<string> {
    throw new Error(
      `${this.name} no está configurado. Define la API key y el endpoint en .env`,
    )
  }
}

export const aiProviders = {
  openai: new ExternalAIProvider('openai'),
  gemini: new ExternalAIProvider('gemini'),
  claude: new ExternalAIProvider('claude'),
}

/** Punto de extensión para LLM externo. */
export async function processWithProvider(
  message: string,
  provider?: AIProvider,
): Promise<IntentResult> {
  const localResult = parseIntent(message)

  if (localResult.type !== 'unknown' || !provider) {
    return localResult
  }

  try {
    const response = await provider.chat([
      { role: 'user', content: message, timestamp: new Date() },
    ])
    return { type: 'info', message: response, confidence: 0.7 }
  } catch {
    return localResult
  }
}
