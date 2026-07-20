/**
 * Factory CSS2D para etiquetas de isla (usado por Island.ts).
 */

import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import type { CampusModule } from '@/config/modules'

export function createIslandLabel(mod: CampusModule): CSS2DObject {
  const el = document.createElement('div')
  el.className = 'island-floating-label'
  el.innerHTML = `
    <div class="island-label-icon" style="--accent:${mod.color}">${mod.icon}</div>
    <div class="island-label-text">
      <strong>${mod.name}</strong>
      <span>${mod.subtitle}</span>
    </div>
  `
  const obj = new CSS2DObject(el)
  obj.position.set(0, 2.6, 0)
  return obj
}
