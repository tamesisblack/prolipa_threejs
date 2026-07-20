/**
 * Store Pinia del dashboard docente.
 * Consume datos mock; reemplazar fetchDashboardData por API Laravel.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardData } from '@/types'
import { fetchDashboardData, markNotificationRead } from '@/api/mock/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadNotifications = computed(
    () => data.value?.notifications.filter((n) => !n.read).length ?? 0,
  )

  const pendingEvaluations = computed(
    () => data.value?.evaluations.filter((e) => e.status === 'pending').length ?? 0,
  )

  async function load() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetchDashboardData()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar datos'
    } finally {
      loading.value = false
    }
  }

  async function readNotification(id: number) {
    await markNotificationRead(id)
    const notification = data.value?.notifications.find((n) => n.id === id)
    if (notification) notification.read = true
  }

  return {
    data,
    loading,
    error,
    unreadNotifications,
    pendingEvaluations,
    load,
    readNotification,
  }
})
