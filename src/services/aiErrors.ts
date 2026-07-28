/**
 * Mensajes de error legibles para Proli IA (sin jerga técnica para docentes).
 */

export function formatAiError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Error desconocido al conectar con la IA.'
  }

  const msg = error.message

  if (/AI_API_KEY no configurada/i.test(msg)) {
    return 'El asistente no está configurado. Contacta al administrador del campus.'
  }

  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'No pude conectar en este momento. Verifica tu internet e intenta de nuevo.'
  }

  if (/401|invalid.*key|unauthorized/i.test(msg)) {
    return 'El servicio de IA no está disponible temporalmente. Intenta más tarde.'
  }

  if (/402|insufficient|credit|balance/i.test(msg)) {
    return 'El servicio de IA requiere configuración adicional. Contacta al administrador.'
  }

  if (/404|model.*not found|no endpoints/i.test(msg)) {
    return 'El asistente no pudo procesar tu solicitud. Intenta reformular la pregunta.'
  }

  if (/429|rate limit/i.test(msg)) {
    return 'Hay muchas consultas en este momento. Espera unos segundos e intenta de nuevo.'
  }

  if (/OpenRouter|Gemini/i.test(msg)) {
    return 'El asistente tuvo un problema de conexión. Intenta de nuevo en un momento.'
  }

  return 'El asistente no pudo responder. Intenta de nuevo o usa: "Llévame a biblioteca".'
}
