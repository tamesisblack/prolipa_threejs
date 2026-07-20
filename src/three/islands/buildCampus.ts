/**
 * Campus digital — hub central + islas conectadas por caminos luminosos.
 */

import * as THREE from 'three'
import gsap from 'gsap'
import { CAMPUS_MODULES } from '@/config/modules'
import { buildIsland } from '@/three/islands/Island'
import type { IslandRegistry, PathRegistry } from '@/three/scene/InteractionManager'
import { createBackgroundDecor } from '@/three/scene/BackgroundDecor'

export interface CampusBuildResult {
  world: THREE.Group
  islands: Map<string, IslandRegistry>
  paths: Map<string, PathRegistry>
  particleSystems: Array<{ update: (t: number) => void; dispose: () => void }>
}

const PATH_DIM = { emissive: 0.05, opacity: 0.28 }
const RING_DIM = { emissive: 0.12, opacity: 0.35 }
const PATH_OFF_EMISSIVE = 0.06
/** Radio interior — caminos no convergen en el centro (evita z-fighting) */
const PATH_INNER_R = 3.4

/** Mismo enfoque que el planeta/icono — emissive opaco, sin transparencia */
function pathGlowMat(color: THREE.Color) {
  const m = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: color.clone(),
    emissiveIntensity: PATH_OFF_EMISSIVE,
    roughness: 0.45,
    metalness: 0.35,
  })
  m.userData.baseEmissive = PATH_OFF_EMISSIVE
  return m
}

function glowPathMat(color: number, emissive = PATH_DIM.emissive, opacity = PATH_DIM.opacity) {
  const m = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: color,
    emissiveIntensity: emissive,
    roughness: 0.5,
    metalness: 0.3,
    transparent: true,
    opacity,
  })
  m.userData.baseEmissive = emissive
  m.userData.baseOpacity = opacity
  return m
}

function createHub(): THREE.Group {
  const g = new THREE.Group()

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, 0.15, 64),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85, metalness: 0.2 }),
  )
  floor.position.y = -0.05
  floor.receiveShadow = true
  g.add(floor)

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.5, 0.18, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x2563eb,
      emissiveIntensity: 0.3,
      roughness: 0.35,
      metalness: 0.55,
    }),
  )
  hub.position.y = 0.1
  hub.receiveShadow = true
  g.add(hub)

  const hubRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.05, 8, 64),
    new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.5,
    }),
  )
  hubRing.rotation.x = Math.PI / 2
  hubRing.position.y = 0.12
  g.add(hubRing)

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 72px Inter,sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 64, 68)
  const tex = new THREE.CanvasTexture(canvas)
  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  )
  logo.rotation.x = -Math.PI / 2
  logo.position.y = 0.22
  g.add(logo)

  return g
}

function createLuminousPaths(): { group: THREE.Group; paths: Map<string, PathRegistry> } {
  const g = new THREE.Group()
  const paths = new Map<string, PathRegistry>()

  // Anillo base — estático, sin parpadeo
  const walkway = new THREE.Mesh(
    new THREE.TorusGeometry(9.2, 0.12, 8, 80),
    glowPathMat(0x3b82f6, RING_DIM.emissive, RING_DIM.opacity),
  )
  walkway.rotation.x = Math.PI / 2
  walkway.position.y = 0.035
  g.add(walkway)

  // Anillo de unión en el hub — un solo mesh, sin solapamiento de radiales
  const hubJunction = new THREE.Mesh(
    new THREE.TorusGeometry(PATH_INNER_R, 0.09, 8, 64),
    glowPathMat(0x3b82f6, RING_DIM.emissive, RING_DIM.opacity),
  )
  hubJunction.rotation.x = Math.PI / 2
  hubJunction.position.y = 0.22
  g.add(hubJunction)

  CAMPUS_MODULES.forEach((mod) => {
    const color = new THREE.Color(mod.color)
    const dx = mod.position[0]
    const dz = mod.position[2]
    const fullLen = Math.hypot(dx, dz)
    const angle = Math.atan2(dx, dz)
    const pathLen = fullLen - PATH_INNER_R
    const ux = dx / fullLen
    const uz = dz / fullLen
    const midR = PATH_INNER_R + pathLen / 2

    const pathMat = pathGlowMat(color)
    const path = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, pathLen), pathMat)
    path.rotation.y = angle
    path.position.set(ux * midR, 0.22, uz * midR)
    path.renderOrder = 3
    path.userData.moduleId = mod.id
    g.add(path)

    const ringMat = pathGlowMat(color)
    const ringAngle = Math.atan2(mod.position[2], mod.position[0])
    const ringDot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), ringMat)
    ringDot.position.set(Math.cos(ringAngle) * 9.2, 0.22, Math.sin(ringAngle) * 9.2)
    ringDot.renderOrder = 3
    g.add(ringDot)

    paths.set(mod.id, { pathMat, ringMat, color: color.clone() })
  })

  return { group: g, paths }
}

function createAmbientParticles(): THREE.Points {
  const count = 80
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30
    positions[i * 3 + 1] = 0.5 + Math.random() * 8
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
}

export function buildCampus(): CampusBuildResult {
  const world = new THREE.Group()
  const islands = new Map<string, IslandRegistry>()
  const particleSystems: CampusBuildResult['particleSystems'] = []

  world.add(createHub())
  const { group: pathGroup, paths } = createLuminousPaths()
  world.add(pathGroup)
  world.add(createAmbientParticles())
  world.add(createBackgroundDecor())

  CAMPUS_MODULES.forEach((mod, i) => {
    const island = buildIsland(mod)
    island.group.position.set(...mod.position)
    world.add(island.group)
    islands.set(mod.id, island)
    particleSystems.push({
      update: (t) => island.particles.update(t),
      dispose: () => island.particles.dispose(),
    })

    island.group.scale.set(0, 0, 0)
    gsap.to(island.group.scale, {
      x: 1, y: 1, z: 1,
      duration: 0.8,
      delay: i * 0.08,
      ease: 'back.out(1.4)',
    })
  })

  return { world, islands, paths, particleSystems }
}

/** Sin animaciones de camino — brillo estático controlado por hover */
export function animateCampus(_world: THREE.Group, _t: number) {
  // Intencionalmente vacío: el hover maneja el brillo sin parpadeo
}
