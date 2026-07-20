/**
 * Composable para animaciones GSAP reutilizables.
 */

import gsap from 'gsap'

export function useGsapHover(element: HTMLElement | null, scale = 1.03) {
  if (!element) return

  const onEnter = () => {
    gsap.to(element, { scale, duration: 0.35, ease: 'power2.out' })
  }
  const onLeave = () => {
    gsap.to(element, { scale: 1, duration: 0.35, ease: 'power2.out' })
  }

  element.addEventListener('mouseenter', onEnter)
  element.addEventListener('mouseleave', onLeave)

  return () => {
    element.removeEventListener('mouseenter', onEnter)
    element.removeEventListener('mouseleave', onLeave)
  }
}

/** Animación de entrada para paneles glass */
export function animatePanelIn(el: HTMLElement, delay = 0) {
  gsap.fromTo(
    el,
    { opacity: 0, y: 24, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7, delay, ease: 'power3.out' },
  )
}

/** Pulso suave para elementos destacados */
export function pulseGlow(el: HTMLElement) {
  gsap.to(el, {
    boxShadow: '0 0 20px rgba(12, 135, 232, 0.35)',
    duration: 1.2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  })
}
