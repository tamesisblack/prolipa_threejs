/**
 * Orquestador del campus de islas — escena modular.
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import * as THREE from 'three'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { CAMPUS_MODULES } from '@/config/modules'
import type { CampusModule } from '@/config/modules'
import { createSceneLights } from '@/three/scene/SceneLights'
import { createSceneCamera, getSceneOffset, resizeCamera } from '@/three/scene/SceneCamera'
import { InteractionManager } from '@/three/scene/InteractionManager'
import { buildCampus, animateCampus } from '@/three/islands/buildCampus'
import { animateBackgroundDecor } from '@/three/scene/BackgroundDecor'

const BG = 0x0f172a
const FOG = 0x1e293b

export interface CampusSceneCallbacks {
  onIslandHover: (mod: CampusModule | null, screenPos?: { x: number; y: number }) => void
  onIslandClick: (mod: CampusModule) => void
}

export interface CampusSceneOptions {
  isMobile: Ref<boolean>
  panelOpen?: Ref<boolean>
}

export function useCampusScene(
  containerRef: Ref<HTMLElement | null>,
  callbacks: CampusSceneCallbacks,
  options?: CampusSceneOptions,
) {
  let renderer: THREE.WebGLRenderer
  let labelRenderer: CSS2DRenderer
  let composer: EffectComposer
  let scene: THREE.Scene
  let cameraSetup: ReturnType<typeof createSceneCamera>
  let lightsSetup: ReturnType<typeof createSceneLights>
  let interaction: InteractionManager
  let worldGroup: THREE.Group
  let particleUpdaters: Array<(t: number) => void> = []
  let animationId = 0
  let clock = new THREE.Clock()
  let bloomPass: InstanceType<typeof UnrealBloomPass>

  const isReady = ref(false)

  function getOffset() {
    const mobile = options?.isMobile.value ?? false
    const panel = options?.panelOpen?.value ?? false
    return getSceneOffset(mobile, panel)
  }

  function syncLayout() {
    if (!containerRef.value || !cameraSetup || !worldGroup) return
    const { clientWidth: w, clientHeight: h } = containerRef.value
    const mobile = options?.isMobile.value ?? false
    const offset = getOffset()

    worldGroup.position.x = offset
    cameraSetup.configure(w, h, offset, mobile)

    scene.fog = new THREE.Fog(FOG, mobile ? 14 : 18, mobile ? 38 : 45)
  }

  function animateLoop() {
    animationId = requestAnimationFrame(animateLoop)
    const t = clock.getElapsedTime()

    particleUpdaters.forEach((fn) => fn(t))
    animateCampus(worldGroup, t)
    animateBackgroundDecor(worldGroup, t)

    cameraSetup.update(clock.getDelta())
    composer.render()
    labelRenderer.render(scene, cameraSetup.camera)
  }

  function init() {
    if (!containerRef.value) return
    const { clientWidth: w, clientHeight: h } = containerRef.value
    const mobile = options?.isMobile.value ?? false
    const offset = getOffset()

    scene = new THREE.Scene()
    scene.background = new THREE.Color(BG)
    scene.fog = new THREE.Fog(FOG, mobile ? 14 : 18, mobile ? 38 : 45)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    renderer.shadowMap.enabled = !mobile
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    containerRef.value.appendChild(renderer.domElement)

    labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(w, h)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.inset = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    containerRef.value.appendChild(labelRenderer.domElement)

    cameraSetup = createSceneCamera({
      width: w,
      height: h,
      offsetX: offset,
      isMobile: mobile,
      domElement: renderer.domElement,
    })

    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, cameraSetup.camera))
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      mobile ? 0.14 : 0.18,
      0.35,
      0.88,
    )
    composer.addPass(bloomPass)

    lightsSetup = createSceneLights()
    lightsSetup.lights.forEach((l) => scene.add(l))

    worldGroup = new THREE.Group()
    worldGroup.position.x = offset
    const { world, islands, paths, particleSystems } = buildCampus()
    worldGroup.add(world)
    scene.add(worldGroup)

    particleUpdaters = particleSystems.map((p) => p.update)

    interaction = new InteractionManager(
      cameraSetup.camera,
      renderer.domElement,
      islands,
      paths,
      CAMPUS_MODULES,
      {
        onHover: callbacks.onIslandHover,
        onClick: callbacks.onIslandClick,
      },
      cameraSetup.controls,
    )

    animateLoop()
    isReady.value = true
  }

  function resetCamera() {
    syncLayout()
    cameraSetup.reset()
  }

  function onResize() {
    if (!containerRef.value) return
    const { clientWidth: w, clientHeight: h } = containerRef.value
    resizeCamera(cameraSetup.camera, w, h)
    renderer.setSize(w, h)
    labelRenderer.setSize(w, h)
    composer.setSize(w, h)
    syncLayout()
  }

  if (options?.isMobile) {
    watch(options.isMobile, () => syncLayout())
  }
  if (options?.panelOpen) {
    watch(options.panelOpen, () => syncLayout())
  }

  onMounted(() => {
    init()
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    interaction?.dispose()
    lightsSetup?.dispose()
    cameraSetup?.dispose()
    composer?.dispose()
    renderer?.dispose()
  })

  return { isReady, resetCamera }
}
