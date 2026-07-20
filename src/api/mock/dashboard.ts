/**
 * Datos mock del dashboard docente.
 * Simula respuestas de la API Laravel para el demo frontend.
 */

import type { DashboardData } from '@/types'

const MOCK_DELAY = 400

function delay<T>(data: T, ms = MOCK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const mockDashboardData: DashboardData = {
  user: {
    id: 1,
    name: 'Steven Ichau',
    email: 'm.ruiz@prolipa.edu.ec',
    role: 'Docente de Matemáticas',
    avatarInitials: 'MR',
    institution: 'Unidad Educativa San Francisco',
  },
  books: [
    { id: 1, title: 'Matemáticas 8vo EGB', author: 'Editorial Prolipa', coverColor: '#0c87e8', available: true },
    { id: 2, title: 'Ciencias Naturales 7mo', author: 'Editorial Prolipa', coverColor: '#22c55e', available: true },
    { id: 3, title: 'Lengua y Literatura 9no', author: 'Editorial Prolipa', coverColor: '#8b5cf6', available: false },
    { id: 4, title: 'Guía Docente Integrada', author: 'Prolipa Academy', coverColor: '#f59e0b', available: true },
  ],
  evaluations: [
    { id: 1, title: 'Evaluación Trimestral — Álgebra', course: '8vo A', dueDate: '2026-07-25', status: 'pending' },
    { id: 2, title: 'Diagnóstico Inicial', course: '7mo B', dueDate: '2026-07-22', status: 'in_progress' },
    { id: 3, title: 'Proyecto Interdisciplinar', course: '9no C', dueDate: '2026-08-01', status: 'pending' },
  ],
  trainings: [
    { id: 1, title: 'Metodologías Activas en Aula', date: '2026-07-24', time: '15:00', modality: 'virtual' },
    { id: 2, title: 'Uso de Recursos Digitales Prolipa', date: '2026-07-28', time: '10:00', modality: 'virtual' },
    { id: 3, title: 'Evaluación Formativa Avanzada', date: '2026-08-05', time: '09:00', modality: 'presencial' },
  ],
  certificates: [
    { id: 1, title: 'Certificado Metodologías 2025', issuedAt: '2025-12-15', status: 'available' },
    { id: 2, title: 'Diploma Innovación Educativa', issuedAt: '2026-03-20', status: 'available' },
    { id: 3, title: 'Certificado Evaluación Digital', issuedAt: '—', status: 'pending' },
  ],
  notifications: [
    { id: 1, title: 'Nueva evaluación disponible', message: 'Evaluación Trimestral — Álgebra lista para aplicar.', type: 'info', read: false, createdAt: '2026-07-20T08:30:00' },
    { id: 2, title: 'Capacitación confirmada', message: 'Tu inscripción a Metodologías Activas fue confirmada.', type: 'success', read: false, createdAt: '2026-07-19T14:00:00' },
    { id: 3, title: 'Recordatorio', message: 'Entrega de planificaciones el viernes.', type: 'warning', read: true, createdAt: '2026-07-18T09:00:00' },
  ],
  calendar: [
    { id: 1, title: 'Clase 8vo A', date: '2026-07-21', time: '08:00', type: 'class' },
    { id: 2, title: 'Reunión departamental', date: '2026-07-23', time: '14:30', type: 'meeting' },
    { id: 3, title: 'Entrega evaluaciones', date: '2026-07-25', time: '23:59', type: 'deadline' },
    { id: 4, title: 'Capacitación virtual', date: '2026-07-24', time: '15:00', type: 'meeting' },
  ],
}

/** Obtiene todos los datos del dashboard (mock). */
export async function fetchDashboardData() {
  return delay(structuredClone(mockDashboardData))
}

/** Marca una notificación como leída (mock). */
export async function markNotificationRead(id: number) {
  const notification = mockDashboardData.notifications.find((n) => n.id === id)
  if (notification) notification.read = true
  return delay({ success: true })
}
