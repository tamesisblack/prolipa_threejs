/**
 * Raycasting, hover y clic en islas — brillo estable sin parpadeo.
 */

import * as THREE from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CampusModule } from '@/config/modules'
import type { ParticleSystem } from '@/three/scene/ParticleSystem'

export interface IslandRegistry {
  group: THREE.Group
  glowMats: THREE.MeshStandardMaterial[]
  iconOrb: THREE.Mesh
  rimLight: THREE.PointLight
  particles: ParticleSystem
}

export interface PathRegistry {
  pathMat: THREE.MeshStandardMaterial
  ringMat: THREE.MeshStandardMaterial
  color: THREE.Color
}

export interface InteractionCallbacks {
  onHover: (mod: CampusModule | null, screenPos?: { x: number; y: number }) => void
  onClick: (mod: CampusModule) => void
}

const PATH_ON_EMISSIVE = 0.95

function setIslandMat(m: THREE.MeshStandardMaterial, emissive: number) {
  m.emissiveIntensity = emissive
}

export class InteractionManager {
  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()
  private pointerDown = { x: 0, y: 0 }
  private wasDragged = false
  private hoveredId: string | null = null
  private leaveTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private camera: THREE.Camera,
    private domElement: HTMLElement,
    private islands: Map<string, IslandRegistry>,
    private paths: Map<string, PathRegistry>,
    private modules: CampusModule[],
    private callbacks: InteractionCallbacks,
    private controls?: OrbitControls,
  ) {
    domElement.addEventListener('pointerdown', this.onDown)
    domElement.addEventListener('pointermove', this.onMove)
    domElement.addEventListener('pointerup', this.onUp)
    domElement.addEventListener('pointerleave', this.onLeave)
  }

  private getHit(): CampusModule | null {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const meshes: THREE.Object3D[] = []
    this.islands.forEach(({ group }) => {
      group.traverse((c) => {
        if (c instanceof THREE.Mesh && c.userData.isBuilding) meshes.push(c)
      })
    })
    const hits = this.raycaster.intersectObjects(meshes, false)
    if (!hits.length) return null
    const id = hits[0].object.userData.buildingId as string
    return this.modules.find((m) => m.id === id) ?? null
  }

  private setPathHighlight(id: string, on: boolean) {
    const path = this.paths.get(id)
    if (!path) return
    const off = path.pathMat.userData.baseEmissive ?? 0.06
    path.pathMat.emissiveIntensity = on ? PATH_ON_EMISSIVE : off
    path.ringMat.emissiveIntensity = on ? PATH_ON_EMISSIVE * 0.85 : off * 0.7
    path.pathMat.emissive.copy(path.color)
    path.ringMat.emissive.copy(path.color)
  }

  private setIslandHighlight(id: string, on: boolean) {
    const reg = this.islands.get(id)
    const mod = this.modules.find((m) => m.id === id)
    if (!reg || !mod) return

    const col = new THREE.Color(mod.color)

    reg.glowMats.forEach((m) => {
      const base = m.userData.baseEmissive ?? 0.12
      setIslandMat(m, on ? base + 0.75 : base)
      if (m.emissive) m.emissive.copy(col)
    })

    const iconMat = reg.iconOrb.material as THREE.MeshStandardMaterial
    setIslandMat(iconMat, on ? 1.1 : (iconMat.userData.baseEmissive ?? 0.15))

    reg.rimLight.intensity = on ? 2.5 : 0.4
    reg.particles.setActive(on)
    this.setPathHighlight(id, on)

    if (this.controls) {
      this.controls.autoRotate = !on
    }
  }

  private clearHover() {
    if (!this.hoveredId) return
    const prev = this.hoveredId
    this.hoveredId = null
    this.setIslandHighlight(prev, false)
    if (this.controls) this.controls.autoRotate = true
    this.callbacks.onHover(null)
  }

  private applyHover(mod: CampusModule | null, screenPos?: { x: number; y: number }) {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer)
      this.leaveTimer = null
    }

    if (!mod) {
      this.leaveTimer = setTimeout(() => this.clearHover(), 280)
      return
    }

    if (mod.id === this.hoveredId) {
      this.callbacks.onHover(mod, screenPos)
      return
    }

    if (this.hoveredId) this.setIslandHighlight(this.hoveredId, false)
    this.hoveredId = mod.id
    this.setIslandHighlight(mod.id, true)
    this.callbacks.onHover(mod, screenPos)
  }

  private onDown = (e: PointerEvent) => {
    this.pointerDown = { x: e.clientX, y: e.clientY }
    this.wasDragged = false
  }

  private onMove = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - this.pointerDown.x, e.clientY - this.pointerDown.y) > 6) {
      this.wasDragged = true
    }
    const rect = this.domElement.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const mod = this.getHit()
    this.applyHover(mod, mod ? { x: e.clientX, y: e.clientY } : undefined)
    this.domElement.style.cursor = mod || this.hoveredId ? 'pointer' : 'grab'
  }

  private onLeave = () => {
    this.clearHover()
  }

  private onUp = () => {
    if (this.wasDragged) return
    const mod = this.getHit()
    if (mod) this.callbacks.onClick(mod)
  }

  dispose() {
    if (this.leaveTimer) clearTimeout(this.leaveTimer)
    this.domElement.removeEventListener('pointerdown', this.onDown)
    this.domElement.removeEventListener('pointermove', this.onMove)
    this.domElement.removeEventListener('pointerup', this.onUp)
    this.domElement.removeEventListener('pointerleave', this.onLeave)
  }
}
