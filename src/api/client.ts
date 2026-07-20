/**
 * Cliente HTTP base para la API Laravel.
 * Actualmente usa datos mock; cambiar USE_MOCK a false cuando el backend esté listo.
 */

const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function apiGet<T>(endpoint: string): Promise<T> {
  if (USE_MOCK) {
    throw new Error('Mock mode: use service functions instead of direct API calls')
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export { USE_MOCK, API_BASE }
