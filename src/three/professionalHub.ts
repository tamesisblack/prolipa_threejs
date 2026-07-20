/**
 * Campus Moderno Minimal — plataformas glass, curva, iconos flotantes.
 */

import * as THREE from 'three'
import type { BuildingModule } from '@/types'
import { TEACHER_MODULES } from '@/config/modules'
import { markInteractive } from './materials'

type GlowMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial

export interface HubResult {
  world: THREE.Group
  moduleNodes: Map<string, THREE.Group>
  materials: Map<string, GlowMaterial[]>
  iconGroups: Map<string, THREE.Group>
}

function collectGlowMaterials(group: THREE.Group): GlowMaterial[] {
  const mats: GlowMaterial[] = []
  group.traverse((c) => {
    if (c instanceof THREE.Mesh) {
      const ms = Array.isArray(c.material) ? c.material : [c.material]
      ms.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
          mats.push(m)
        }
      })
    }
  })
  return mats
}

function createLabel(text: string, subtitle: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 120
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(255,255,255,0.96)'
  ctx.shadowColor = 'rgba(15,23,42,0.08)'
  ctx.shadowBlur = 16
  ctx.beginPath()
  ctx.roundRect(16, 12, 448, 96, 20)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.fillStyle = '#0f172a'
  ctx.font = '600 28px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(text, 240, 48)
  ctx.fillStyle = '#64748b'
  ctx.font = '400 18px Inter, system-ui, sans-serif'
  ctx.fillText(subtitle, 240, 78)

  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
  )
  sprite.scale.set(2.4, 0.6, 1)
  sprite.renderOrder = 999
  return sprite
}

function createIconSprite(emoji: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120)
  grad.addColorStop(0, color + '33')
  grad.addColorStop(1, color + '08')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(128, 128, 110, 0, Math.PI * 2)
  ctx.fill()

  ctx.font = '120px system-ui, Segoe UI Emoji, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 128, 132)

  const tex = new THREE.CanvasTexture(canvas)
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }),
  )
  sprite.scale.set(1.6, 1.6, 1)
  sprite.renderOrder = 998
  return sprite
}

/** Plataforma flotante glassmorphism */
function createGlassPlatform(mod: BuildingModule): THREE.Group {
  const g = new THREE.Group()
  g.userData.moduleColor = mod.color
  g.position.set(...mod.position)
  g.position.y = 0.55

  // Sombra en el suelo
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 32),
    new THREE.MeshBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.12 }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -0.54
  g.add(shadow)

  // Anillo glow exterior
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.035, 8, 48),
    new THREE.MeshStandardMaterial({
      color: mod.color,
      emissive: mod.color,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.75,
    }),
  )
  ring.rotation.x = Math.PI / 2
  ring.userData.isGlowRing = true
  g.add(ring)

  // Disco de cristal principal
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.25, 0.22, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0,
      metalness: 0.1,
      transmission: 0.92,
      thickness: 1.2,
      ior: 1.45,
      transparent: true,
      opacity: 1,
      envMapIntensity: 1.2,
    }),
  )
  disc.castShadow = true
  disc.receiveShadow = true
  markInteractive(disc, mod.id, true)
  g.add(disc)

  // Borde emissive superior
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.025, 6, 48),
    new THREE.MeshStandardMaterial({
      color: mod.color,
      emissive: mod.color,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.6,
    }),
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.12
  rim.userData.isGlowRing = true
  markInteractive(rim, mod.id)
  g.add(rim)

  // Haz de luz vertical sutil
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 1.0, 1.8, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: mod.color,
      emissive: mod.color,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  beam.position.y = 1.0
  g.add(beam)

  // Icono grande flotante
  const iconGroup = new THREE.Group()
  iconGroup.userData.isIcon = true
  const icon = createIconSprite(mod.icon, mod.color)
  icon.position.y = 1.35
  iconGroup.add(icon)
  g.add(iconGroup)

  const label = createLabel(mod.name, mod.description, mod.color)
  label.position.y = 2.35
  g.add(label)

  const hit = new THREE.Mesh(
    new THREE.CylinderGeometry(1.3, 1.3, 2.8, 12),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  hit.position.y = 0.8
  markInteractive(hit, mod.id)
  g.add(hit)

  g.userData.iconGroup = iconGroup
  g.userData.baseY = g.position.y
  return g
}

export function buildProfessionalHub(): HubResult {
  const world = new THREE.Group()
  const moduleNodes = new Map<string, THREE.Group>()
  const materials = new Map<string, GlowMaterial[]>()
  const iconGroups = new Map<string, THREE.Group>()

  // Suelo reflectante con gradiente simulado
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(18, 64),
    new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.35,
      metalness: 0.15,
      envMapIntensity: 0.8,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  world.add(floor)

  // Anillo decorativo central
  const centerRing = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 3.0, 64),
    new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      emissive: 0x1e40af,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    }),
  )
  centerRing.rotation.x = -Math.PI / 2
  centerRing.position.y = 0.02
  world.add(centerRing)

  // Logo Prolipa flotante sutil
  const logoCanvas = document.createElement('canvas')
  logoCanvas.width = 256
  logoCanvas.height = 256
  const lctx = logoCanvas.getContext('2d')!
  lctx.fillStyle = 'rgba(30, 64, 175, 0.06)'
  lctx.beginPath()
  lctx.arc(128, 128, 100, 0, Math.PI * 2)
  lctx.fill()
  lctx.fillStyle = 'rgba(30, 64, 175, 0.2)'
  lctx.font = 'bold 100px Inter, sans-serif'
  lctx.textAlign = 'center'
  lctx.textBaseline = 'middle'
  lctx.fillText('P', 128, 132)
  const logoTex = new THREE.CanvasTexture(logoCanvas)
  const logo = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 48),
    new THREE.MeshStandardMaterial({ map: logoTex, transparent: true, roughness: 0.5, metalness: 0.1 }),
  )
  logo.rotation.x = -Math.PI / 2
  logo.position.y = 0.03
  world.add(logo)

  // Curva visual en el suelo conectando plataformas
  const curvePoints: THREE.Vector3[] = []
  TEACHER_MODULES.forEach((m) => {
    curvePoints.push(new THREE.Vector3(m.position[0], 0.04, m.position[2]))
  })
  const curve = new THREE.CatmullRomCurve3(curvePoints)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 64, 0.04, 8, false),
    new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 0.6,
    }),
  )
  world.add(tube)

  TEACHER_MODULES.forEach((mod) => {
    const node = createGlassPlatform(mod)
    world.add(node)
    moduleNodes.set(mod.id, node)
    materials.set(mod.id, collectGlowMaterials(node))
    if (node.userData.iconGroup) iconGroups.set(mod.id, node.userData.iconGroup as THREE.Group)
  })

  return { world, moduleNodes, materials, iconGroups }
}

/** Partículas de luz sutiles */
export function createLightDust(count = 45): THREE.InstancedMesh {
  const geo = new THREE.SphereGeometry(0.025, 4, 4)
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  const dummy = new THREE.Object3D()
  const data: Array<{ x: number; y: number; z: number; s: number; o: number }> = []

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 16
    const y = Math.random() * 4 + 0.5
    const z = (Math.random() - 0.5) * 10
    dummy.position.set(x, y, z)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
    data.push({ x, y, z, s: 0.15 + Math.random() * 0.3, o: Math.random() * 6 })
  }
  mesh.userData.dust = data
  return mesh
}

export function createFloorGradient(): THREE.Mesh {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  grad.addColorStop(0, '#f8fafc')
  grad.addColorStop(0.6, '#e0f2fe')
  grad.addColorStop(1, '#dbeafe')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)
  const tex = new THREE.CanvasTexture(canvas)
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(22, 64),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4, metalness: 0.05 }),
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -0.01
  mesh.receiveShadow = true
  return mesh
}
