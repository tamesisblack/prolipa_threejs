/**
 * Entorno futurista del campus holográfico.
 */

import * as THREE from 'three'

export function createCampusGround(): THREE.Group {
  const g = new THREE.Group()

  // Base oscura reflectante
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(22, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.65,
      emissive: 0x0c1929,
      emissiveIntensity: 0.15,
    }),
  )
  base.rotation.x = -Math.PI / 2
  base.receiveShadow = true
  g.add(base)

  // Grid holográfico
  const grid = new THREE.GridHelper(40, 40, 0x0c87e8, 0x1e3a5f)
  grid.position.y = 0.08
  ;(grid.material as THREE.Material).transparent = true
  ;(grid.material as THREE.Material).opacity = 0.35
  g.add(grid)

  // Anillo de luz exterior
  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(20, 20.3, 64),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0c87e8,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    }),
  )
  outerRing.rotation.x = -Math.PI / 2
  outerRing.position.y = 0.09
  outerRing.userData.animate = 'pulseRing'
  g.add(outerRing)

  // Líneas radiales de conexión (9)
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2
    const line = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 18),
      new THREE.MeshStandardMaterial({
        color: 0x0c87e8,
        emissive: 0x0c87e8,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.2,
      }),
    )
    line.rotation.x = -Math.PI / 2
    line.rotation.z = -angle + Math.PI / 2
    line.position.set(Math.cos(angle) * 9, 0.1, Math.sin(angle) * 9)
    g.add(line)
  }

  return g
}

export function createAmbientParticles(count = 120): THREE.InstancedMesh {
  const geo = new THREE.SphereGeometry(0.025, 4, 4)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.6,
  })
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  const dummy = new THREE.Object3D()
  const data: Array<{ x: number; y: number; z: number; speed: number; offset: number }> = []

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 28
    const y = Math.random() * 6 + 0.5
    const z = (Math.random() - 0.5) * 28
    dummy.position.set(x, y, z)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
    data.push({ x, y, z, speed: 0.15 + Math.random() * 0.4, offset: Math.random() * Math.PI * 2 })
  }

  mesh.userData.particleData = data
  return mesh
}

export function createSkyParticles(): THREE.Points {
  const count = 200
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60
    positions[i * 3 + 1] = Math.random() * 20 + 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  })
  return new THREE.Points(geo, mat)
}
