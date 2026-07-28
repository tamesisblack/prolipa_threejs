/**
 * Detección de intención de navegación — compartida entre motor local e IA.
 */

import type { IntentResult } from '@/types'

const NAVIGATION_PATTERNS: Array<{
  keywords: string[]
  route: string
  label: string
  icon: string
}> = [
    {
      keywords: [
        'inicio',
        'campus',
        'home',
        'principal',
        'dashboard',
        'pagina principal',
        'pantalla principal',
        'menu principal',
        'menu de inicio',
        'portada',
      ],
      route: '/',
      label: 'Campus Virtual',
      icon: '🏠',
    },
    { keywords: ['biblioteca', 'libro', 'libros', 'recurso'], route: '/biblioteca', label: 'Biblioteca', icon: '📚' },
    { keywords: ['evaluacion', 'evaluaciones', 'examen', 'prueba', 'diagnostico'], route: '/evaluaciones', label: 'Evaluaciones', icon: '📝' },
    { keywords: ['planificacion', 'planificaciones', 'clase', 'clases'], route: '/planificaciones', label: 'Planificaciones', icon: '📅' },
    { keywords: ['certificado', 'certificados', 'diploma', 'certificacion'], route: '/certificaciones', label: 'Certificados', icon: '🏆' },
    { keywords: ['estadistica', 'estadisticas', 'metrica', 'metricas', 'reporte'], route: '/estadisticas', label: 'Estadísticas', icon: '📈' },
    { keywords: ['comunidad', 'foro', 'colaboracion'], route: '/comunidad', label: 'Comunidad', icon: '💬' },
    { keywords: ['multimedia', 'video', 'videos', 'audio', 'imagen', 'galeria'], route: '/multimedia', label: 'Recursos Multimedia', icon: '🎥' },
  ]

const NAV_VERBS = [
  'ir a',
  'ir al',
  'ir la',
  'ir ala',
  'lleva',
  'llevame',
  'llévame',
  'abre',
  'abrir',
  'mostrar',
  'muestrame',
  'muéstrame',
  'ver ',
  'necesito ir',
  'quiero ir',
  'regresa',
  'regresame',
  'regresar',
  'vuelve',
  'volver',
  'devuelve',
  'devolverme',
  'mandame',
  'mándame',
  'enviame',
  'envíame',
  'ir ',
  've a',
  've al',
  'entrar a',
  'entra a',
]

export function normalizeNavText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw))
}

function isNavigationRequest(normalized: string): boolean {
  if (NAV_VERBS.some((v) => normalized.includes(v))) return true
  if (/^(ir|ve|abre|lleva|regresa|vuelve)\b/.test(normalized)) return true
  return false
}

function isInfoOnlyRequest(normalized: string): boolean {
  return hasAny(normalized, [
    'que tengo',
    'qué tengo',
    'cuantas',
    'cuántas',
    'cuantos',
    'cuántos',
    'resumen',
    'pendiente',
    'pendientes',
    'lista de',
    'informacion de',
    'información de',
    'cuales son',
    'cuáles son',
    'dime mis',
    'mostrar mis',
  ])
}

/**
 * Detecta si el usuario pide ir a un módulo (prioridad sobre consultas).
 */
export function detectNavigationIntent(message: string): IntentResult | null {
  const normalized = normalizeNavText(message)

  if (!isNavigationRequest(normalized)) return null
  if (isInfoOnlyRequest(normalized)) return null

  for (const pattern of NAVIGATION_PATTERNS) {
    const matches = pattern.keywords.filter((kw) => normalized.includes(kw))
    if (matches.length === 0) continue

    if (
      pattern.route === '/evaluaciones' &&
      hasAny(normalized, ['pendiente', 'pendientes', 'cuantas', 'resumen'])
    ) {
      continue
    }

    const article = pattern.route === '/' ? 'al' : 'a'

    return {
      type: 'navigate',
      route: pattern.route,
      message: `Perfecto, te llevo ${article} **${pattern.label}** ${pattern.icon}`,
      confidence: 0.95,
      action: `Navegando → ${pattern.label}`,
    }
  }

  // "regresame" / "vuelve al inicio" sin módulo explícito → campus
  if (
    hasAny(normalized, ['regresa', 'volver', 'vuelve', 'inicio', 'principal', 'campus'])
  ) {
    return {
      type: 'navigate',
      route: '/',
      message: 'Perfecto, te regreso al **Campus Virtual** 🏠',
      confidence: 0.92,
      action: 'Navegando → Campus Virtual',
    }
  }

  return null
}

export { NAVIGATION_PATTERNS }
