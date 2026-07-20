/**
 * Cámara isométrica con rotación automática — ajuste desktop / móvil.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export interface SceneCameraConfig {
  width: number
  height: number
  offsetX?: number
  isMobile?: boolean
  domElement: HTMLElement
}

export interface SceneCameraResult {
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  lookAt: THREE.Vector3
  reset: () => void
  update: (dt: number) => void
  configure: (width: number, height: number, offsetX: number, isMobile: boolean) => void
  dispose: () => void
}

export function getSceneOffset(isMobile: boolean, panelOpen: boolean): number {
  if (isMobile) return 0
  return panelOpen ? -1.2 : 0
}

function applyCameraSettings(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  width: number,
  height: number,
  offsetX: number,
  isMobile: boolean,
) {
  const portrait = height > width
  const lookAt = new THREE.Vector3(offsetX, 0, 0)

  camera.fov = isMobile ? (portrait ? 54 : 46) : 38
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  if (isMobile) {
    const dist = portrait ? 32 : 26
    const elev = portrait ? 28 : 20
    camera.position.set(offsetX + dist * 0.72, elev, dist * 0.72)
    controls.minDistance = 18
    controls.maxDistance = 40
    controls.autoRotateSpeed = 0.22
    controls.maxPolarAngle = Math.PI / 2.05
  } else {
    camera.position.set(offsetX + 14.3, 14, 14.3)
    controls.minDistance = 14
    controls.maxDistance = 30
    controls.autoRotateSpeed = 0.35
    controls.maxPolarAngle = Math.PI / 2.2
  }

  controls.target.copy(lookAt)
  controls.update()
}

export function createSceneCamera(config: SceneCameraConfig): SceneCameraResult {
  const lookAt = new THREE.Vector3(config.offsetX ?? 0, 0, 0)

  const camera = new THREE.PerspectiveCamera(38, config.width / config.height, 0.1, 100)

  const controls = new OrbitControls(camera, config.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.04
  controls.autoRotate = true
  controls.minPolarAngle = 0.35
  controls.enablePan = false

  let lastW = config.width
  let lastH = config.height
  let lastMobile = config.isMobile ?? false

  applyCameraSettings(camera, controls, lastW, lastH, lookAt.x, lastMobile)

  function configure(width: number, height: number, offsetX: number, mobile: boolean) {
    lastW = width
    lastH = height
    lastMobile = mobile
    lookAt.set(offsetX, 0, 0)
    applyCameraSettings(camera, controls, width, height, offsetX, mobile)
  }

  function reset() {
    applyCameraSettings(camera, controls, lastW, lastH, lookAt.x, lastMobile)
  }

  return {
    camera,
    controls,
    lookAt,
    reset,
    update: () => controls.update(),
    configure,
    dispose: () => controls.dispose(),
  }
}

export function resizeCamera(
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}
