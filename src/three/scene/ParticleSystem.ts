/**
 * Partículas flotantes alrededor de cada isla — solo visibles al seleccionar.
 */

import * as THREE from 'three'

export interface ParticleSystemOptions {
  color: string
  count?: number
  radius?: number
  height?: number
}

export class ParticleSystem {
  readonly points: THREE.Points
  private readonly basePositions: Float32Array
  private readonly count: number
  private active = false

  constructor(opts: ParticleSystemOptions) {
    this.count = opts.count ?? 18
    const radius = opts.radius ?? 1.4
    const height = opts.height ?? 2.2

    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(this.count * 3)
    this.basePositions = new Float32Array(this.count * 3)

    for (let i = 0; i < this.count; i++) {
      const angle = (i / this.count) * Math.PI * 2
      const r = radius * (0.5 + Math.random() * 0.5)
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      const y = 1.2 + Math.random() * height
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      this.basePositions[i * 3] = x
      this.basePositions[i * 3 + 1] = y
      this.basePositions[i * 3 + 2] = z
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const col = new THREE.Color(opts.color)
    const mat = new THREE.PointsMaterial({
      color: col,
      size: 0.05,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(geo, mat)
    this.points.visible = false
  }

  setActive(on: boolean) {
    this.active = on
    this.points.visible = on
    const mat = this.points.material as THREE.PointsMaterial
    mat.opacity = on ? 0.7 : 0
  }

  update(_t: number) {
    if (!this.active) return
    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < this.count; i++) {
      pos.array[i * 3 + 1] = this.basePositions[i * 3 + 1]
    }
    pos.needsUpdate = true
  }

  /** @deprecated use setActive */
  setIntensity(factor: number) {
    this.setActive(factor > 0.5)
  }

  dispose() {
    this.points.geometry.dispose()
    ;(this.points.material as THREE.Material).dispose()
  }
}
