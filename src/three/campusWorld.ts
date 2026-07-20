/**
 * Campus virtual isométrico — edificios, plaza, caminos y árboles.
 */

import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { CAMPUS_MODULES, type CampusModule } from '@/config/modules'
import { markInteractive } from './materials'

export interface CampusWorldResult {
  world: THREE.Group
  buildings: Map<string, THREE.Group>
  materials: Map<string, THREE.MeshStandardMaterial[]>
}

function mat(color: number | string, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, ...opts })
}

function glass() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.85,
    thickness: 0.8,
    transparent: true,
    opacity: 0.9,
    envMapIntensity: 1.5,
  })
}

function collectMats(g: THREE.Group): THREE.MeshStandardMaterial[] {
  const m: THREE.MeshStandardMaterial[] = []
  g.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      const ms = Array.isArray(c.material) ? c.material : [c.material]
      ms.forEach((x) => {
        if (x instanceof THREE.MeshStandardMaterial || x instanceof THREE.MeshPhysicalMaterial) {
          m.push(x as THREE.MeshStandardMaterial)
        }
      })
    }
  })
  return m
}

function addHit(g: THREE.Group, id: string, w: number, h: number, d: number) {
  const hit = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }))
  hit.position.y = h / 2
  markInteractive(hit, id, true)
  g.add(hit)
}

function faceCenter(group: THREE.Group) {
  const p = group.position.clone().multiplyScalar(-1)
  group.rotation.y = Math.atan2(p.x, p.z)
}

function buildBiblioteca(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.4), mat(0xf1f5f9))
  body.position.y = 1.1
  g.add(body)
  const front = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 0.12), glass())
  front.position.set(0, 1.2, 1.22)
  markInteractive(front, 'biblioteca')
  g.add(front)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 2.6), mat(0x2563eb, { emissive: 0x2563eb, emissiveIntensity: 0.15 }))
  roof.position.y = 2.25
  g.add(roof)
  addHit(g, 'biblioteca', 3, 2.5, 2.8)
  return g
}

function buildPlanificaciones(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.2), mat(0xffffff))
  body.position.y = 1
  g.add(body)
  const band = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 2.3), mat(0x16a34a, { emissive: 0x16a34a, emissiveIntensity: 0.2 }))
  band.position.y = 1.5
  g.add(band)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 2.4), mat(0x16a34a))
  roof.position.y = 2.15
  g.add(roof)
  addHit(g, 'planificaciones', 2.8, 2.5, 2.6)
  return g
}

function buildEvaluaciones(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2.2), mat(0x7c3aed, { emissive: 0x7c3aed, emissiveIntensity: 0.08 }))
  body.position.y = 1
  g.add(body)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.08), mat(0x1e1b4b, { emissive: 0x8b5cf6, emissiveIntensity: 0.6 }))
  screen.position.set(0, 1.3, 1.12)
  markInteractive(screen, 'evaluaciones')
  g.add(screen)
  addHit(g, 'evaluaciones', 2.8, 2.5, 2.6)
  return g
}

function buildCertificaciones(): THREE.Group {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 2.8), mat(0xf5f5f4))
  base.position.y = 0.4
  g.add(base)
  for (const x of [-1, 1]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.8, 8), mat(0xffffff, { roughness: 0.35 }))
    col.position.set(x * 1.1, 1.3, 1)
    g.add(col)
  }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd97706, { emissive: 0xd97706, emissiveIntensity: 0.12 }))
  dome.position.y = 1.6
  markInteractive(dome, 'certificaciones')
  g.add(dome)
  addHit(g, 'certificaciones', 3.2, 2.8, 3)
  return g
}

function buildEstadisticas(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), glass())
  body.position.y = 1.1
  g.add(body)
  const heights = [0.6, 1.0, 0.75]
  heights.forEach((h, i) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, 0.35), mat(0x0891b2, { emissive: 0x06b6d4, emissiveIntensity: 0.4 }))
    bar.position.set(-0.5 + i * 0.5, 0.5 + h / 2, 0)
    g.add(bar)
  })
  addHit(g, 'estadisticas', 2.6, 2.5, 2.6)
  return g
}

function buildComunidad(): THREE.Group {
  const g = new THREE.Group()
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 2.8), mat(0xd6d3d1))
  deck.position.y = 0.4
  g.add(deck)
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 6), mat(0xffffff))
    p.position.set(x * 1, 1.2, z * 1)
    g.add(p)
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.6), mat(0x4f46e5, { emissive: 0x4f46e5, emissiveIntensity: 0.15 }))
  roof.position.y = 2
  markInteractive(roof, 'comunidad')
  g.add(roof)
  addHit(g, 'comunidad', 3, 2.5, 3)
  return g
}

function buildNoticias(): THREE.Group {
  const g = new THREE.Group()
  const base = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 2), mat(0xffffff))
  base.position.y = 0.6
  g.add(base)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.1), mat(0x111827, { emissive: 0xdc2626, emissiveIntensity: 0.35 }))
  screen.position.set(0, 1.5, 0.8)
  markInteractive(screen, 'noticias')
  g.add(screen)
  addHit(g, 'noticias', 2.8, 2.5, 2.4)
  return g
}

function buildGamificacion(): THREE.Group {
  const g = new THREE.Group()
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 24), mat(0xfef3c7))
  platform.position.y = 0.1
  g.add(platform)
  for (let i = 0; i < 5; i++) {
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), mat(0xfbbf24, { emissive: 0xf59e0b, emissiveIntensity: 0.5 }))
    const a = (i / 5) * Math.PI * 2
    star.position.set(Math.cos(a) * 0.9, 0.6 + (i % 2) * 0.4, Math.sin(a) * 0.9)
    star.userData.animate = 'star'
    g.add(star)
  }
  addHit(g, 'gamificacion', 3.2, 1.5, 3.2)
  return g
}

function buildLaboratorio(): THREE.Group {
  const g = new THREE.Group()
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass())
  dome.position.y = 0.2
  g.add(dome)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), mat(0x0ea5e9, { emissive: 0x0ea5e9, emissiveIntensity: 0.8 }))
  core.position.y = 0.8
  core.userData.animate = 'pulse'
  markInteractive(core, 'laboratorio')
  g.add(core)
  addHit(g, 'laboratorio', 3, 2, 3)
  return g
}

const BUILDERS: Record<string, () => THREE.Group> = {
  biblioteca: buildBiblioteca,
  planificaciones: buildPlanificaciones,
  evaluaciones: buildEvaluaciones,
  certificaciones: buildCertificaciones,
  estadisticas: buildEstadisticas,
  comunidad: buildComunidad,
  noticias: buildNoticias,
  gamificacion: buildGamificacion,
  laboratorio: buildLaboratorio,
}

export function createFloatingLabel(mod: CampusModule): CSS2DObject {
  const el = document.createElement('div')
  el.className = 'campus-floating-label'
  el.innerHTML = `
    <div class="campus-label-icon" style="background:${mod.color}18;color:${mod.color}">${mod.icon}</div>
    <div class="campus-label-text">
      <strong>${mod.name}</strong>
      <span>${mod.subtitle}</span>
    </div>
  `
  const obj = new CSS2DObject(el)
  obj.position.set(0, 3.2, 0)
  return obj
}

function createPlaza(): THREE.Group {
  const g = new THREE.Group()
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 48),
    mat(0x86efac, { roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  g.add(ground)

  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.4, 0.2, 32),
    mat(0xffffff, { roughness: 0.4 }),
  )
  plaza.position.y = 0.1
  plaza.receiveShadow = true
  g.add(plaza)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.3, 0.06, 8, 48),
    mat(0x2563eb, { emissive: 0x2563eb, emissiveIntensity: 0.45 }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.22
  g.add(ring)

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2563eb'
  ctx.font = 'bold 72px Inter,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 64, 68)
  const tex = new THREE.CanvasTexture(canvas)
  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 32),
    mat(0xffffff, { roughness: 0.5 }),
  )
  logo.rotation.x = -Math.PI / 2
  logo.position.y = 0.22
  const logoDecal = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 32),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  )
  logoDecal.rotation.x = -Math.PI / 2
  logoDecal.position.y = 0.24
  g.add(logo, logoDecal)

  return g
}

function createPaths(): THREE.Group {
  const g = new THREE.Group()
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(10.5, 0.35, 4, 64),
    mat(0xe7e5e4, { roughness: 0.85 }),
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.05
  g.add(ring)

  CAMPUS_MODULES.forEach((mod) => {
    const len = Math.hypot(mod.position[0], mod.position[2])
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, len),
      mat(0xf5f5f4, { roughness: 0.9 }),
    )
    path.rotation.x = -Math.PI / 2
    path.rotation.z = Math.atan2(mod.position[0], mod.position[2])
    path.position.set(mod.position[0] / 2, 0.04, mod.position[2] / 2)
    g.add(path)
  })
  return g
}

function createTrees(count = 36): THREE.Group {
  const g = new THREE.Group()
  const trunkMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.09, 0.5, 5), mat(0x92400e, { roughness: 0.9 }), count)
  const leafMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.35, 0.9, 6), mat(0x22c55e, { roughness: 0.85 }), count)
  const dummy = new THREE.Object3D()

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const r = 13 + (i % 3) * 0.8
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    dummy.position.set(x, 0.25, z)
    dummy.scale.setScalar(0.8 + (i % 4) * 0.1)
    dummy.updateMatrix()
    trunkMesh.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, 0.85, z)
    dummy.updateMatrix()
    leafMesh.setMatrixAt(i, dummy.matrix)
  }
  trunkMesh.castShadow = true
  leafMesh.castShadow = true
  g.add(trunkMesh, leafMesh)
  return g
}

export function buildCampusWorld(): CampusWorldResult {
  const world = new THREE.Group()
  const buildings = new Map<string, THREE.Group>()
  const materials = new Map<string, THREE.MeshStandardMaterial[]>()

  world.add(createPlaza())
  world.add(createPaths())

  const trees = createTrees()
  world.add(trees)

  CAMPUS_MODULES.forEach((mod) => {
    const builder = BUILDERS[mod.id]
    if (!builder) return
    const building = builder()
    building.position.set(...mod.position)
    faceCenter(building)
    building.add(createFloatingLabel(mod))
    building.userData.baseY = 0
    world.add(building)
    buildings.set(mod.id, building)
    materials.set(mod.id, collectMats(building))
  })

  return { world, buildings, materials }
}
