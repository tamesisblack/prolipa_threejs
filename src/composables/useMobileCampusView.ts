/**
 * Preferencia de vista: islas 3D (default) o tarjetas.
 * Persiste en localStorage entre recargas.
 */

import { ref, watch } from 'vue'

export type MobileCampusView = 'spheres' | 'grid'

const STORAGE_KEY = 'prolipa-campus-mobile-view'

function readStored(): MobileCampusView {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'grid' || value === 'spheres') return value
  } catch {
    /* localStorage no disponible */
  }
  return 'spheres'
}

const view = ref<MobileCampusView>(
  typeof window !== 'undefined' ? readStored() : 'spheres',
)

if (typeof window !== 'undefined') {
  watch(view, (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  })
}

export function useMobileCampusView() {
  function setView(next: MobileCampusView) {
    view.value = next
  }

  function setSpheres(enabled: boolean) {
    view.value = enabled ? 'spheres' : 'grid'
  }

  return { view, setView, setSpheres }
}
