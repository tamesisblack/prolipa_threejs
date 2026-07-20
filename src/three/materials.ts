/**
 * Materiales compartidos del campus 3D.
 */

import * as THREE from 'three'

export function stdMat(color: THREE.ColorRepresentation, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.12,
    ...opts,
  })
}

export function glassMat(color = 0x88ccff) {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: color,
    emissiveIntensity: 0.55,
    roughness: 0.15,
    metalness: 0.6,
    transparent: true,
    opacity: 0.92,
  })
}

export function glowMat(color: THREE.ColorRepresentation) {
  const c = new THREE.Color(color)
  return new THREE.MeshStandardMaterial({
    color: c,
    emissive: c,
    emissiveIntensity: 0.08,
    roughness: 0.4,
    metalness: 0.2,
  })
}

export function markInteractive(mesh: THREE.Mesh, buildingId: string, main = false) {
  mesh.userData.isBuilding = true
  mesh.userData.buildingId = buildingId
  if (main) mesh.userData.mainBody = true
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function addHitbox(group: THREE.Group, buildingId: string, w: number, h: number, d: number) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const mat = new THREE.MeshBasicMaterial({ visible: false })
  const hit = new THREE.Mesh(geo, mat)
  hit.position.y = h / 2
  markInteractive(hit, buildingId)
  group.add(hit)
  return hit
}

/** Sprite con nombre del edificio (siempre mira a cámara) */
export function createBuildingLabel(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 512, 128)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  roundRect(ctx, 16, 20, 480, 88, 44)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 4
  roundRect(ctx, 16, 20, 480, 88, 44)
  ctx.stroke()

  ctx.fillStyle = '#1e293b'
  ctx.font = '600 36px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter

  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(3.2, 0.8, 1)
  sprite.renderOrder = 999
  return sprite
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
