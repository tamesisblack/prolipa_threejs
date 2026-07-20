/**
 * Factory de isla futurista — plataforma circular, luz inferior, icono flotante.
 */

import * as THREE from 'three'
import type { CampusModule } from '@/config/modules'
import { markInteractive } from '@/three/materials'
import { ParticleSystem } from '@/three/scene/ParticleSystem'
import { createIslandLabel } from '@/components/three/floatingIconFactory'
import type { IslandRegistry } from '@/three/scene/InteractionManager'

function glowMat(color: string, emissive = 0.12) {
  const c = new THREE.Color(color)
  const m = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: c,
    emissiveIntensity: emissive,
    roughness: 0.35,
    metalness: 0.55,
  })
  m.userData.baseEmissive = emissive
  return m
}

export function buildIsland(mod: CampusModule): IslandRegistry {
  const group = new THREE.Group()
  group.userData.moduleId = mod.id
  const glowMats: THREE.MeshStandardMaterial[] = []

  // Luz inferior
  const rimLight = new THREE.PointLight(mod.color, 0.35, 6)
  rimLight.position.set(0, -0.15, 0)
  group.add(rimLight)

  // Anillo de luz bajo la plataforma
  const underGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.06, 8, 48),
    glowMat(mod.color, 0.2),
  )
  underGlow.rotation.x = Math.PI / 2
  underGlow.position.y = 0.05
  glowMats.push(underGlow.material as THREE.MeshStandardMaterial)
  group.add(underGlow)

  // Plataforma circular principal
  const platformMat = glowMat(mod.color, 0.1)
  glowMats.push(platformMat)
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.22, 48), platformMat)
  platform.position.y = 0.35
  platform.castShadow = true
  platform.receiveShadow = true
  markInteractive(platform, mod.id, true)
  group.add(platform)

  // Borde superior brillante
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(1.28, 0.04, 8, 48),
    glowMat(mod.color, 0.18),
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.48
  glowMats.push(rim.material as THREE.MeshStandardMaterial)
  group.add(rim)

  // Pedestal central
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 }),
  )
  pedestal.position.y = 0.75
  pedestal.castShadow = true
  group.add(pedestal)

  // Icono flotante (esfera glass + aro)
  const iconOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 24, 24),
    glowMat(mod.color, 0.15),
  )
  iconOrb.position.y = 1.35
  markInteractive(iconOrb, mod.id)
  glowMats.push(iconOrb.material as THREE.MeshStandardMaterial)
  group.add(iconOrb)

  const iconRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.025, 8, 32),
    glowMat(mod.color, 0.2),
  )
  iconRing.rotation.x = Math.PI / 2
  iconRing.position.y = 1.35
  glowMats.push(iconRing.material as THREE.MeshStandardMaterial)
  group.add(iconRing)

  // Hitbox fijo — no se mueve al hover (evita parpadeo)
  const hit = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.65, 2.6, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  hit.position.y = 0.9
  markInteractive(hit, mod.id)
  group.add(hit)

  // Label CSS2D
  group.add(createIslandLabel(mod))

  // Partículas
  const particles = new ParticleSystem({ color: mod.color })
  group.add(particles.points)

  return { group, glowMats, iconOrb, rimLight, particles }
}
