/**
 * Media query reactiva para layouts responsive.
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function useMediaQuery(query: string) {
  const matches = ref(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  onMounted(() => {
    const mq = window.matchMedia(query)
    matches.value = mq.matches

    const onChange = (e: MediaQueryListEvent) => {
      matches.value = e.matches
    }

    mq.addEventListener('change', onChange)
    onUnmounted(() => mq.removeEventListener('change', onChange))
  })

  return matches
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}
