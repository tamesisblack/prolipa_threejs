/**
 * Decoración flotante de fondo — libros, reglas y cerebros (geometrías simples).
 */

import * as THREE from 'three'

type DecorType = 'book' | 'ruler' | 'brain'

interface DecorConfig {
  type: DecorType
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  color: number
  phase: number
}

const DECOR_ITEMS: DecorConfig[] = [
  { type: 'book', position: [22, 6.5, 8], color: 0x4285f4, phase: 0.2, scale: 1.1 },
  { type: 'book', position: [-24, 7, 12], rotation: [0, 1.2, 0.3], color: 0x7c3aed, phase: 1.4, scale: 0.95 },
  { type: 'book', position: [16, 9, -20], rotation: [0.2, -0.8, 0], color: 0x10b981, phase: 2.1, scale: 1 },
  { type: 'ruler', position: [-20, 8.5, -14], rotation: [0.4, 0.6, 0.8], color: 0xf59e0b, phase: 0.8 },
  { type: 'ruler', position: [28, 5.5, -6], rotation: [0, -1.1, 0.5], color: 0x06b6d4, phase: 2.8, scale: 1.15 },
  { type: 'ruler', position: [-12, 10, 22], rotation: [0.1, 2.2, 0.3], color: 0xec4899, phase: 1.9, scale: 0.9 },
  { type: 'brain', position: [14, 11, 24], color: 0xec4899, phase: 0.5 },
  { type: 'brain', position: [-26, 6, -4], color: 0xa855f7, phase: 1.2, scale: 1.1 },
  { type: 'brain', position: [30, 9, 14], color: 0x6366f1, phase: 2.4, scale: 0.85 },
  { type: 'book', position: [-18, 5, 26], rotation: [0, 0.4, -0.2], color: 0xef4444, phase: 3.1, scale: 0.9 },
  { type: 'ruler', position: [8, 12, -28], rotation: [0.3, 1.5, 0.2], color: 0x8b5cf6, phase: 0.3, scale: 1.05 },
  { type: 'brain', position: [-30, 8.5, 18], color: 0x14b8a6, phase: 1.7, scale: 1.15 },
  { type: 'book', position: [26, 7.5, -18], rotation: [0.1, -1.6, 0.15], color: 0x0ea5e9, phase: 2.6, scale: 1 },
  { type: 'brain', position: [-8, 5.5, -26], color: 0xf472b6, phase: 3.4, scale: 0.95 },
  { type: 'ruler', position: [20, 10.5, 20], rotation: [0.2, -0.4, 0.6], color: 0x22c55e, phase: 1.1, scale: 0.88 },
]

function ghostMat(color: number, opacity = 0.32) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity,
    roughness: 0.35,
    metalness: 0.45,
    depthWrite: false,
  })
}

function createBook(color: number): THREE.Group {
  const g = new THREE.Group()
  const cover = ghostMat(color, 0.38)
  const pages = ghostMat(0xe2e8f0, 0.25)

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, 0.6), cover)
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, 0.6), cover)
  top.position.y = 0.18
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.6), cover)
  spine.position.set(-0.38, 0.09, 0)
  const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.52), pages)
  pageBlock.position.set(0.02, 0.09, 0)

  g.add(bottom, top, spine, pageBlock)
  return g
}

function createRuler(color: number): THREE.Group {
  const g = new THREE.Group()
  const mat = ghostMat(color, 0.36)
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.06, 0.22), mat)
  g.add(body)

  for (let i = 0; i < 8; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.18), mat)
    tick.position.set(-0.85 + i * 0.24, 0.04, 0)
    g.add(tick)
  }
  return g
}

function createBrain(color: number): THREE.Group {
  const g = new THREE.Group()
  const mat = ghostMat(color, 0.34)

  const left = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 14), mat)
  left.scale.set(0.95, 0.82, 0.88)
  left.position.set(-0.18, 0, 0)

  const right = new THREE.Mesh(new THREE.SphereGeometry(0.38, 14, 14), mat)
  right.scale.set(0.95, 0.82, 0.88)
  right.position.set(0.18, 0, 0)

  const fold1 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 12), mat)
  fold1.rotation.set(1.2, 0.4, 0)
  fold1.position.set(0, 0.12, 0.1)

  const fold2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 10), mat)
  fold2.rotation.set(0.5, 1.1, 0.3)
  fold2.position.set(-0.08, -0.05, 0.15)

  g.add(left, right, fold1, fold2)
  return g
}

function buildDecorItem(cfg: DecorConfig): THREE.Group {
  let item: THREE.Group
  switch (cfg.type) {
    case 'book':
      item = createBook(cfg.color)
      break
    case 'ruler':
      item = createRuler(cfg.color)
      break
    case 'brain':
      item = createBrain(cfg.color)
      break
  }

  item.position.set(...cfg.position)
  if (cfg.rotation) item.rotation.set(...cfg.rotation)
  if (cfg.scale) item.scale.setScalar(cfg.scale)

  item.userData.animate = 'bg-float'
  item.userData.phase = cfg.phase
  item.userData.baseY = cfg.position[1]
  item.userData.baseRotX = item.rotation.x
  item.userData.baseRotZ = item.rotation.z
  item.renderOrder = -1

  return item
}

export function createBackgroundDecor(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'backgroundDecor'

  DECOR_ITEMS.forEach((cfg) => group.add(buildDecorItem(cfg)))

  return group
}

export function animateBackgroundDecor(root: THREE.Object3D, t: number) {
  root.traverse((o) => {
    if (o.userData.animate !== 'bg-float') return
    const phase = o.userData.phase ?? 0
    const baseY = o.userData.baseY ?? o.position.y
    o.position.y = baseY + Math.sin(t * 0.45 + phase) * 0.7
    o.rotation.y += 0.004
    o.rotation.x = (o.userData.baseRotX ?? 0) + Math.sin(t * 0.25 + phase) * 0.06
    o.rotation.z = (o.userData.baseRotZ ?? 0) + Math.cos(t * 0.2 + phase) * 0.04
  })
}
