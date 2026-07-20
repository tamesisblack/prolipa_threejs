/**
 * 8 islas del campus digital — layout circular minimalista.
 */

import type { BuildingModule } from '@/types'

export interface CampusModule extends BuildingModule {
  subtitle: string
  /** Nombre corto para barra móvil */
  shortName: string
  /** 'assistant' abre Proli IA en lugar de navegar */
  action?: 'navigate' | 'assistant'
}

const R = 9
const COUNT = 8

function circlePos(index: number): [number, number, number] {
  const angle = (index / COUNT) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(angle) * R, 0, Math.sin(angle) * R]
}

export const CAMPUS_MODULES: CampusModule[] = [
  {
    id: 'biblioteca',
    name: 'Biblioteca',
    shortName: 'Biblioteca',
    subtitle: 'Libros y recursos digitales',
    description: 'Libros y recursos digitales',
    route: '/biblioteca',
    icon: '📚',
    color: '#4285F4',
    position: circlePos(0),
  },
  {
    id: 'evaluaciones',
    name: 'Evaluaciones',
    shortName: 'Evaluaciones',
    subtitle: 'Exámenes y diagnósticos',
    description: 'Exámenes y diagnósticos',
    route: '/evaluaciones',
    icon: '📝',
    color: '#7C3AED',
    position: circlePos(1),
  },
  {
    id: 'planificaciones',
    name: 'Planificaciones',
    shortName: 'Planificar',
    subtitle: 'Organiza tus clases',
    description: 'Organiza tus clases',
    route: '/planificaciones',
    icon: '📅',
    color: '#10B981',
    position: circlePos(2),
  },
  {
    id: 'certificaciones',
    name: 'Certificados',
    shortName: 'Certificados',
    subtitle: 'Diplomas y logros',
    description: 'Diplomas y logros',
    route: '/certificaciones',
    icon: '🏆',
    color: '#F59E0B',
    position: circlePos(3),
  },
  {
    id: 'estadisticas',
    name: 'Estadísticas',
    shortName: 'Estadísticas',
    subtitle: 'Métricas y reportes',
    description: 'Métricas y reportes',
    route: '/estadisticas',
    icon: '📈',
    color: '#06B6D4',
    position: circlePos(4),
  },
  {
    id: 'comunidad',
    name: 'Comunidad',
    shortName: 'Comunidad',
    subtitle: 'Foro docente',
    description: 'Foro docente',
    route: '/comunidad',
    icon: '💬',
    color: '#6366F1',
    position: circlePos(5),
  },
  {
    id: 'asistente',
    name: 'Asistente IA',
    shortName: 'Proli IA',
    subtitle: 'Proli — tu copiloto',
    description: 'Proli — tu copiloto',
    route: '/',
    icon: '🤖',
    color: '#EC4899',
    position: circlePos(6),
    action: 'assistant',
  },
  {
    id: 'multimedia',
    name: 'Recursos Multimedia',
    shortName: 'Multimedia',
    subtitle: 'Videos, audios e imágenes',
    description: 'Videos, audios e imágenes',
    route: '/multimedia',
    icon: '🎥',
    color: '#EF4444',
    position: circlePos(7),
  },
]

export const MODULES = CAMPUS_MODULES
export const TEACHER_MODULES = CAMPUS_MODULES
export const BUILDINGS = CAMPUS_MODULES
export const CAMPUS_NODES = CAMPUS_MODULES

export const MODULE_FEATURES: Record<string, string[]> = {
  biblioteca: ['Libros asignados', 'Recursos descargables', 'Búsqueda inteligente'],
  evaluaciones: ['Banco de preguntas', 'Crear evaluación', 'Resultados'],
  planificaciones: ['Calendario', 'Plantillas', 'Historial de clases'],
  certificaciones: ['Certificados PDF', 'Historial', 'Capacitaciones'],
  estadisticas: ['Actividad semanal', 'Tiempo en plataforma', 'Reportes'],
  comunidad: ['Foro', 'Compartir recursos', 'Preguntas'],
  asistente: ['Navegación por voz', 'Resumen del día', 'Consultas rápidas'],
  multimedia: ['Videos educativos', 'Audios', 'Galería de imágenes'],
}

export function getModuleById(id: string) {
  return CAMPUS_MODULES.find((m) => m.id === id)
}
