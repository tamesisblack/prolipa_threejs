/**
 * Tipos compartidos del Campus Virtual Prolipa.
 * Preparados para mapear respuestas de la API Laravel.
 */

export interface BuildingModule {
  id: string
  name: string
  description: string
  route: string
  icon: string
  color: string
  position: [number, number, number]
}

export interface Book {
  id: number
  title: string
  author: string
  coverColor: string
  available: boolean
}

export interface Evaluation {
  id: number
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Training {
  id: number
  title: string
  date: string
  time: string
  modality: 'virtual' | 'presencial'
}

export interface Certificate {
  id: number
  title: string
  issuedAt: string
  status: 'available' | 'pending'
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  read: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: number
  title: string
  date: string
  time: string
  type: 'class' | 'meeting' | 'deadline'
}

export interface UserProfile {
  id: number
  name: string
  email: string
  role: string
  avatarInitials: string
  institution: string
}

export interface DashboardData {
  books: Book[]
  evaluations: Evaluation[]
  trainings: Training[]
  certificates: Certificate[]
  notifications: Notification[]
  calendar: CalendarEvent[]
  user: UserProfile
}

export interface IntentResult {
  type: 'navigate' | 'info' | 'unknown'
  route?: string
  message: string
  confidence: number
  /** Etiqueta de acción para mostrar en el chat (demo) */
  action?: string
}

export interface AIProvider {
  name: 'openai' | 'gemini' | 'claude' | 'local'
  chat(messages: ChatMessage[]): Promise<string>
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}
