/**
 * Router — campus digital (8 islas).
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'campus',
      component: () => import('@/pages/CampusPage.vue'),
      meta: { title: 'Inicio', module: 'dashboard' },
    },
    {
      path: '/biblioteca',
      name: 'biblioteca',
      component: () => import('@/pages/BibliotecaPage.vue'),
      meta: { title: 'Biblioteca', module: 'biblioteca' },
    },
    {
      path: '/evaluaciones',
      name: 'evaluaciones',
      component: () => import('@/pages/EvaluacionesPage.vue'),
      meta: { title: 'Evaluaciones', module: 'evaluaciones' },
    },
    {
      path: '/planificaciones',
      name: 'planificaciones',
      component: () => import('@/pages/PlanificacionesPage.vue'),
      meta: { title: 'Planificaciones', module: 'planificaciones' },
    },
    {
      path: '/certificaciones',
      name: 'certificaciones',
      component: () => import('@/pages/CertificacionesPage.vue'),
      meta: { title: 'Certificados', module: 'certificaciones' },
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      component: () => import('@/pages/EstadisticasPage.vue'),
      meta: { title: 'Estadísticas', module: 'estadisticas' },
    },
    {
      path: '/comunidad',
      name: 'comunidad',
      component: () => import('@/pages/ComunidadPage.vue'),
      meta: { title: 'Comunidad', module: 'comunidad' },
    },
    {
      path: '/multimedia',
      name: 'multimedia',
      component: () => import('@/pages/MultimediaPage.vue'),
      meta: { title: 'Recursos Multimedia', module: 'multimedia' },
    },
    // Legacy redirects
    { path: '/cursos', redirect: '/biblioteca' },
    { path: '/libros', redirect: '/biblioteca' },
    { path: '/calendario', redirect: '/planificaciones' },
    { path: '/certificados', redirect: '/certificaciones' },
    { path: '/noticias', redirect: '/' },
    { path: '/gamificacion', redirect: '/' },
    { path: '/laboratorio', redirect: '/multimedia' },
    { path: '/ayuda', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Inicio'} — Prolipa Docentes`
})

export default router
