/**
 * Iluminación suave estilo Vision Pro / Material 3.
 */

import * as THREE from 'three'

export interface SceneLightsResult {
  lights: THREE.Light[]
  dispose: () => void
}

export function createSceneLights(): SceneLightsResult {
  const lights: THREE.Light[] = []

  const ambient = new THREE.AmbientLight(0x94a3b8, 0.35)
  lights.push(ambient)

  const hemi = new THREE.HemisphereLight(0x6366f1, 0x0f172a, 0.5)
  lights.push(hemi)

  const key = new THREE.DirectionalLight(0xe2e8f0, 0.85)
  key.position.set(8, 14, 10)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 2
  key.shadow.camera.far = 40
  key.shadow.camera.left = -18
  key.shadow.camera.right = 18
  key.shadow.camera.top = 18
  key.shadow.camera.bottom = -18
  key.shadow.bias = -0.0005
  key.shadow.radius = 4
  lights.push(key)

  const fill = new THREE.DirectionalLight(0x818cf8, 0.25)
  fill.position.set(-6, 8, -4)
  lights.push(fill)

  const rim = new THREE.DirectionalLight(0x38bdf8, 0.15)
  rim.position.set(0, 6, -12)
  lights.push(rim)

  return {
    lights,
    dispose: () => {
      lights.forEach((l) => {
        if ('dispose' in l && typeof l.dispose === 'function') l.dispose()
      })
    },
  }
}
