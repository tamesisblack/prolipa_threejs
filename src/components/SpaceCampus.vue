<script setup lang="ts">
/**
 * Campus 2D Espacial — Islas en órbita con ruleta (arrastrar ↔), pan vertical y zoom.
 */
import { useRouter } from 'vue-router'
import { CAMPUS_MODULES } from '@/config/modules'
import type { CampusModule } from '@/config/modules'
import { useAssistantStore } from '@/stores/assistant'
import { useDashboardStore } from '@/stores/dashboard'
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'

// Módulos visibles (excluir asistente, ya tiene su botón propio)
const visibleModules = computed(() => CAMPUS_MODULES.filter(m => m.id !== 'asistente'))

const router = useRouter()
const assistant = useAssistantStore()
const dashboard = useDashboardStore()
const user = computed(() => dashboard.data?.user)
const campusRef = ref<HTMLElement | null>(null)

// Mapa de imágenes de islas
const islandImages: Record<string, string> = {
  biblioteca: '/islands/biblioteca.png',
  evaluaciones: '/islands/evaluaciones.png',
  planificaciones: '/islands/planificaciones.png',
  certificaciones: '/islands/certificaciones.png',
  estadisticas: '/islands/estadisticas.png',
  comunidad: '/islands/comunidad.png',
  multimedia: '/islands/multimedia.png',
}

// Órbita uniforme alrededor del hub — mismo radio para todas las islas
const HUB_CENTER = { x: 50, y: 50 }
const ORBIT_RADIUS = 26
const ISLAND_ORDER = [
  'biblioteca',
  'evaluaciones',
  'planificaciones',
  'certificaciones',
  'estadisticas',
  'comunidad',
  'multimedia',
] as const

/** Ángulo entre islas y rotación tipo ruleta */
const ORBIT_STEP = (Math.PI * 2) / ISLAND_ORDER.length
const orbitRotation = ref(0)
const isSnapping = ref(false)
let orbitStart = 0
let snapTimer: ReturnType<typeof setTimeout> | null = null

function getIslandPosition(modId: string) {
  const idx = ISLAND_ORDER.indexOf(modId as (typeof ISLAND_ORDER)[number])
  if (idx < 0) return { top: '50%', left: '50%' }
  const angle = idx * ORBIT_STEP - Math.PI / 2 + orbitRotation.value
  return {
    left: `${HUB_CENTER.x + ORBIT_RADIUS * Math.cos(angle)}%`,
    top: `${HUB_CENTER.y + ORBIT_RADIUS * Math.sin(angle)}%`,
  }
}

function snapOrbit() {
  if (snapTimer) clearTimeout(snapTimer)
  isSnapping.value = true
  orbitRotation.value = Math.round(orbitRotation.value / ORBIT_STEP) * ORBIT_STEP
  snapTimer = setTimeout(() => {
    isSnapping.value = false
    snapTimer = null
  }, 520)
}

const frontModuleId = computed(() => {
  let bestId: (typeof ISLAND_ORDER)[number] = ISLAND_ORDER[0]
  let bestDist = Infinity
  ISLAND_ORDER.forEach((id, idx) => {
    const angle = idx * ORBIT_STEP - Math.PI / 2 + orbitRotation.value
    let diff = angle + Math.PI / 2
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    const dist = Math.abs(diff)
    if (dist < bestDist) {
      bestDist = dist
      bestId = id
    }
  })
  return bestId
})

/** Isla elegida por el docente — resalta la línea de conexión */
const hoveredModuleId = ref<string | null>(null)
const selectedModuleId = ref<string | null>(null)
const activeLineId = computed(() => hoveredModuleId.value ?? selectedModuleId.value ?? frontModuleId.value)

function focusIsland(modId: string) {
  const idx = ISLAND_ORDER.indexOf(modId as (typeof ISLAND_ORDER)[number])
  if (idx < 0) return
  selectedModuleId.value = modId
  if (snapTimer) clearTimeout(snapTimer)
  isSnapping.value = true
  orbitRotation.value = -idx * ORBIT_STEP
  snapTimer = setTimeout(() => {
    isSnapping.value = false
    snapTimer = null
  }, 520)
}

/** Distancia del centro de isla a la etiqueta (px) — siempre arriba */
const LABEL_OFFSET_Y = 98

// ===== Pan & Zoom =====
const pan = reactive({ x: 0, y: 0 })
const zoom = ref(1)
const isDragging = ref(false)
const hasDragged = ref(false)
let dragStart = { x: 0, y: 0 }
let panStart = { x: 0, y: 0 }

/** Límites de arrastre (% del viewport) — evita pan infinito */
const PAN_LIMIT_X_RATIO = 0.16
const PAN_LIMIT_Y_RATIO = 0.12

function getPanLimits() {
  const el = campusRef.value
  if (!el) return { x: 220, y: 160 }
  const scale = zoom.value
  return {
    x: el.clientWidth * PAN_LIMIT_X_RATIO * scale,
    y: el.clientHeight * PAN_LIMIT_Y_RATIO * scale,
  }
}

function clampPan() {
  const { x: maxX, y: maxY } = getPanLimits()
  pan.x = Math.max(-maxX, Math.min(maxX, pan.x))
  pan.y = Math.max(-maxY, Math.min(maxY, pan.y))
}

function setPan(x: number, y: number) {
  pan.x = x
  pan.y = y
  clampPan()
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.welcome-bar, .recenter-btn')) return

  const islandEl = target.closest('[data-island-id]') as HTMLElement | null
  if (islandEl?.dataset.islandId) {
    selectedModuleId.value = islandEl.dataset.islandId
  }

  isDragging.value = true
  hasDragged.value = false
  dragStart = { x: e.clientX, y: e.clientY }
  panStart = { x: pan.x, y: pan.y }
  orbitStart = orbitRotation.value
  if (isSnapping.value) {
    isSnapping.value = false
    if (snapTimer) {
      clearTimeout(snapTimer)
      snapTimer = null
    }
  }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function orbitDragSensitivity() {
  const el = campusRef.value
  if (!el) return 0.004
  return (Math.PI * 2) / el.clientWidth
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.value = true
  orbitRotation.value = orbitStart - dx * orbitDragSensitivity()
  setPan(panStart.x, panStart.y + dy)
}

function onPointerUp() {
  if (isDragging.value && hasDragged.value) {
    snapOrbit()
    selectedModuleId.value = frontModuleId.value
  }
  isDragging.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  zoom.value = Math.min(1.6, Math.max(0.5, zoom.value + delta))
  clampPan()
}

function resetView() {
  pan.x = 0
  pan.y = 0
  zoom.value = 1
  orbitRotation.value = 0
  selectedModuleId.value = null
}

function onIslandActivate(mod: CampusModule) {
  if (hasDragged.value) return
  if (frontModuleId.value === mod.id) {
    openModule(mod)
  } else {
    focusIsland(mod.id)
  }
}

// Touch support
let lastTouchDist = 0
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
  }
}
function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
    const scale = dist / lastTouchDist
    zoom.value = Math.min(1.6, Math.max(0.5, zoom.value * scale))
    lastTouchDist = dist
    clampPan()
  }
}

onMounted(() => {
  campusRef.value?.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('resize', clampPan)
})
onUnmounted(() => {
  campusRef.value?.removeEventListener('wheel', onWheel)
  window.removeEventListener('resize', clampPan)
  if (snapTimer) clearTimeout(snapTimer)
})

// Transform computado
const worldTransform = computed(() =>
  `translate(${pan.x}px, ${pan.y}px) scale(${zoom.value})`,
)

function openModule(mod: CampusModule) {
  if (hasDragged.value) return // No abrir si fue un drag
  if (mod.action === 'assistant') {
    assistant.open()
    return
  }
  router.push(mod.route)
}

function hasIslandImage(modId: string): boolean {
  return !!islandImages[modId]
}

// Línea activa al pasar el cursor cerca de una isla
function lineCoords(modId: string) {
  const pos = getIslandPosition(modId)
  if (!pos) return null
  return {
    x1: HUB_CENTER.x * 10,
    y1: HUB_CENTER.y * 7,
    x2: parseFloat(pos.left) * 10,
    y2: parseFloat(pos.top) * 7,
  }
}

function setHoveredModule(modId: string | null) {
  hoveredModuleId.value = modId
}
</script>

<template>
  <div
    ref="campusRef"
    class="space-campus"
    :class="{ 'is-dragging': isDragging, 'is-orbit-snapping': isSnapping }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
  >
    <!-- Fondo espacial con estrellas y nebulosas (fijo, no se mueve) -->
    <div class="space-bg" aria-hidden="true">
      <div class="nebula nebula-1" />
      <div class="nebula nebula-2" />
      <div class="nebula nebula-3" />
      <div class="nebula nebula-4" />
      <div v-for="n in 100" :key="n" class="star" :style="{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${1 + Math.random() * 2}px`,
        height: `${1 + Math.random() * 2}px`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      }" />
    </div>

    <!-- Mundo paneable — todo el contenido interactivo -->
    <div class="world" :style="{ transform: worldTransform }">

      <!-- Centro PROLIPA — mundo 3D holográfico -->
      <div class="central-hub" :class="{ 'hub-energized': !!activeLineId }">
        <div class="hub-atmosphere" />
        <div class="hub-orbit hub-orbit-h" />
        <div class="hub-orbit hub-orbit-v" />
        <div class="hub-world">
          <div class="hub-world-glow" />
          <img
            src="/hub/prolipa-mundo.png"
            alt="Mundo Prolipa"
            class="hub-world-img"
            loading="eager"
          />
          <div class="hub-sphere-content">
            <span class="hub-sphere-letter">P</span>
            <p class="hub-title">PROLIPA</p>
          </div>
        </div>
        <p class="hub-subtitle">Tu mundo, tu aula, tu impacto.</p>
      </div>

      <!-- Red de conexión energética (SVG) -->
      <svg class="connection-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="energyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient
            v-for="mod in visibleModules"
            :id="`lineGrad-${mod.id}`"
            :key="`grad-${mod.id}`"
            gradientUnits="userSpaceOnUse"
            :x1="lineCoords(mod.id)?.x1 ?? 0"
            :y1="lineCoords(mod.id)?.y1 ?? 0"
            :x2="lineCoords(mod.id)?.x2 ?? 0"
            :y2="lineCoords(mod.id)?.y2 ?? 0"
          >
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15" />
            <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.15" />
          </linearGradient>
          <linearGradient
            v-for="mod in visibleModules"
            :id="`lineGradActive-${mod.id}`"
            :key="`gradActive-${mod.id}`"
            gradientUnits="userSpaceOnUse"
            :x1="lineCoords(mod.id)?.x1 ?? 0"
            :y1="lineCoords(mod.id)?.y1 ?? 0"
            :x2="lineCoords(mod.id)?.x2 ?? 0"
            :y2="lineCoords(mod.id)?.y2 ?? 0"
          >
            <stop offset="0%" :stop-color="mod.color" stop-opacity="0.35" />
            <stop offset="45%" :stop-color="mod.color" stop-opacity="1" />
            <stop offset="100%" :stop-color="mod.color" stop-opacity="0.45" />
          </linearGradient>
        </defs>

        <g
          v-for="mod in visibleModules"
          :key="`line-${mod.id}`"
          class="connection-group"
          :class="{
            'is-active': activeLineId === mod.id,
            'is-dimmed': activeLineId && activeLineId !== mod.id,
          }"
        >
          <template v-if="lineCoords(mod.id)">
            <line
              :x1="lineCoords(mod.id)!.x1"
              :y1="lineCoords(mod.id)!.y1"
              :x2="lineCoords(mod.id)!.x2"
              :y2="lineCoords(mod.id)!.y2"
              class="connection-line-glow"
              :stroke="mod.color"
              pathLength="100"
            />
            <line
              :x1="lineCoords(mod.id)!.x1"
              :y1="lineCoords(mod.id)!.y1"
              :x2="lineCoords(mod.id)!.x2"
              :y2="lineCoords(mod.id)!.y2"
              class="connection-line-core"
              :stroke="`url(#lineGrad-${mod.id})`"
              pathLength="100"
            />
            <line
              :x1="lineCoords(mod.id)!.x1"
              :y1="lineCoords(mod.id)!.y1"
              :x2="lineCoords(mod.id)!.x2"
              :y2="lineCoords(mod.id)!.y2"
              class="connection-line-core connection-line-core--active"
              :stroke="`url(#lineGradActive-${mod.id})`"
              pathLength="100"
            />
            <line
              :x1="lineCoords(mod.id)!.x1"
              :y1="lineCoords(mod.id)!.y1"
              :x2="lineCoords(mod.id)!.x2"
              :y2="lineCoords(mod.id)!.y2"
              class="connection-line-pulse"
              :stroke="mod.color"
              pathLength="100"
            />
          </template>
        </g>
      </svg>

      <!-- Islas — capa visual (debajo de etiquetas) -->
      <div
        v-for="(mod, idx) in visibleModules"
        :key="`${mod.id}-visual`"
        class="island-visual"
        :data-island-id="mod.id"
        :class="{
          'is-hovered': hoveredModuleId === mod.id,
          'is-front': frontModuleId === mod.id,
          'is-selected': selectedModuleId === mod.id,
        }"
        :style="{
          top: getIslandPosition(mod.id).top,
          left: getIslandPosition(mod.id).left,
          animationDelay: `${idx * -0.8}s`,
          '--island-color': mod.color,
        }"
        @mouseenter="setHoveredModule(mod.id)"
        @mouseleave="setHoveredModule(null)"
        @click.stop="onIslandActivate(mod)"
      >
        <div class="island-underglow" :style="{ background: `radial-gradient(circle, ${mod.color}40, transparent 70%)` }" />
        <div class="island-img-wrap">
          <img
            v-if="hasIslandImage(mod.id)"
            :src="islandImages[mod.id]"
            :alt="mod.name"
            class="island-img"
            loading="lazy"
          />
          <div v-else class="island-fallback" :style="{ '--glow': mod.color }">
            <span class="island-fallback-icon">{{ mod.icon }}</span>
          </div>
        </div>
      </div>

      <!-- Etiquetas — capa superior (no las tapa otra isla) -->
      <div
        v-for="(mod, idx) in visibleModules"
        :key="`${mod.id}-label`"
        class="island-label-anchor"
        :data-island-id="mod.id"
        :class="{
          'is-hovered': hoveredModuleId === mod.id,
          'is-front': frontModuleId === mod.id,
          'is-selected': selectedModuleId === mod.id,
        }"
        :style="{
          top: getIslandPosition(mod.id).top,
          left: getIslandPosition(mod.id).left,
          '--island-color': mod.color,
          '--label-offset': `${LABEL_OFFSET_Y}px`,
          animationDelay: `${idx * -0.8}s`,
        }"
        @mouseenter="setHoveredModule(mod.id)"
        @mouseleave="setHoveredModule(null)"
        @click.stop="onIslandActivate(mod)"
      >
        <div class="island-label">
          <div class="island-label-icon" :style="{ backgroundColor: mod.color + '33', boxShadow: `0 0 12px ${mod.color}44` }">
            {{ mod.icon }}
          </div>
          <div class="island-label-text">
            <p class="island-label-name">{{ mod.name }}</p>
            <p class="island-label-sub">{{ mod.subtitle }}</p>
            <p v-if="frontModuleId === mod.id" class="island-enter-hint">Haz clic para entrar ›</p>
          </div>
          <span class="island-label-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- Controles fijos (no se mueven con el pan) -->

    <!-- Botón Recentrar -->
    <button
      type="button"
      class="recenter-btn"
      @click="resetView"
    >
      ⊙ Recentrar vista
    </button>


    <!-- Welcome bar inferior -->
    <div class="welcome-bar">
      <span class="welcome-dot" />
      <p class="welcome-text">
        <strong>Bienvenido de vuelta, {{ user?.name?.split(' ')[0] ?? 'Docente' }}</strong>
        <span class="welcome-sub"> · Clic en una isla para elegirla · arrastra para girar · clic otra vez para entrar.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.space-campus {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #050a18;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.space-campus.is-dragging {
  cursor: grabbing;
}

/* ===== SPACE BACKGROUND (fijo) ===== */
.space-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  pointer-events: none;
}
.nebula-1 {
  width: 600px; height: 600px;
  top: -20%; left: -10%;
  background: radial-gradient(circle, #312e81, transparent 70%);
}
.nebula-2 {
  width: 500px; height: 400px;
  bottom: -15%; right: -8%;
  background: radial-gradient(circle, #581c87, transparent 70%);
}
.nebula-3 {
  width: 350px; height: 350px;
  top: 20%; right: 15%;
  background: radial-gradient(circle, #164e63, transparent 70%);
  opacity: 0.15;
}
.nebula-4 {
  width: 400px; height: 400px;
  bottom: 10%; left: 20%;
  background: radial-gradient(circle, #1e1b4b, transparent 70%);
  opacity: 0.2;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: white;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.9; }
}

/* ===== WORLD (paneable) ===== */
.world {
  position: absolute;
  inset: 0;
  z-index: 5;
  transition: transform 0.08s ease-out;
  transform-origin: center center;
  will-change: transform;
}
.is-dragging .world {
  transition: none;
}

/* ===== CENTRAL HUB — MUNDO 3D PROLIPA ===== */
.central-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11;
  text-align: center;
  pointer-events: none;
  width: 280px;
  height: 320px;
}

.hub-atmosphere {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(56,189,248,0.28) 0%,
    rgba(14,165,233,0.14) 45%,
    transparent 72%);
  filter: blur(10px);
  animation: hub-pulse 4s ease-in-out infinite;
}

.hub-orbit {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid transparent;
  pointer-events: none;
}

.hub-orbit-h {
  width: 190px;
  height: 52px;
  border-color: rgba(56,189,248,0.28);
  animation: ring-spin-h 10s linear infinite;
  box-shadow: 0 0 14px rgba(14,165,233,0.18);
}
.hub-orbit-v {
  width: 168px;
  height: 168px;
  border-color: rgba(14,165,233,0.16);
  animation: ring-spin-v 14s linear infinite;
  border-style: dashed;
}

.hub-world {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  height: 260px;
  z-index: 2;
  animation: float-hub 7s ease-in-out infinite;
}

.hub-world-glow {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(14,165,233,0.45), transparent 70%);
  filter: blur(18px);
  opacity: 0.7;
  pointer-events: none;
}

.hub-world-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  mix-blend-mode: screen;
  filter: saturate(1.18) contrast(1.08) brightness(1.06);
  -webkit-mask-image: radial-gradient(
    ellipse 78% 78% at 50% 42%,
    rgba(0, 0, 0, 1) 18%,
    rgba(0, 0, 0, 0.9) 52%,
    transparent 76%
  );
  mask-image: radial-gradient(
    ellipse 78% 78% at 50% 42%,
    rgba(0, 0, 0, 1) 18%,
    rgba(0, 0, 0, 0.9) 52%,
    transparent 76%
  );
  pointer-events: none;
}

.hub-sphere-content {
  position: absolute;
  top: 22%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}

.hub-sphere-letter {
  font-size: 28px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.55), 0 0 24px rgba(186,230,253,0.65);
  line-height: 1;
}

.hub-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  color: white;
  text-shadow: 0 1px 8px rgba(0,0,0,0.6), 0 0 16px rgba(56,189,248,0.5);
  margin: 0;
}

.hub-subtitle {
  position: absolute;
  top: 78%;
  bottom: auto;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8px;
  color: #bae6fd;
  font-style: italic;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(14,165,233,0.55), 0 1px 4px rgba(0,0,0,0.6);
  margin: 0;
  z-index: 5;
  pointer-events: none;
  letter-spacing: 0.02em;
}

.central-hub.hub-energized .hub-atmosphere {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.12);
  transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1), transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.central-hub.hub-energized .hub-world-img {
  filter: saturate(1.32) contrast(1.12) brightness(1.12);
  transition: filter 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.central-hub.hub-energized .hub-world-glow {
  opacity: 1;
  filter: blur(22px);
  transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1), filter 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.hub-atmosphere,
.hub-world,
.hub-world-glow {
  transition:
    opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
    transform 1s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 1s cubic-bezier(0.22, 1, 0.36, 1),
    filter 1s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes float-hub {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-8px); }
}

@keyframes hub-pulse {
  0%, 100% { opacity: 0.65; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
}
@keyframes beam-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes ring-spin-h {
  from { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
  to   { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(360deg); }
}
@keyframes ring-spin-v {
  from { transform: translate(-50%, -50%) rotateY(0deg); }
  to   { transform: translate(-50%, -50%) rotateY(360deg); }
}

/* ===== CONNECTION LINES ===== */
.connection-lines {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%; height: 100%;
  pointer-events: none;
}

.connection-line-glow,
.connection-line-core,
.connection-line-pulse {
  fill: none;
  stroke-linecap: round;
  transition:
    opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1),
    stroke-width 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.connection-line-glow {
  stroke-width: 8;
  opacity: 0;
  filter: url(#energyGlow);
}

.connection-line-core {
  stroke-width: 1.2;
  opacity: 0.55;
}

.connection-line-core--active {
  opacity: 0;
  stroke-width: 2.5;
}

.connection-line-pulse {
  stroke-width: 2.5;
  opacity: 0;
  stroke-dasharray: 0 100;
}

.connection-group.is-dimmed .connection-line-core {
  opacity: 0.12;
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.connection-group.is-active .connection-line-glow {
  opacity: 0.7;
  animation: line-glow-pulse 3.2s ease-in-out 0.4s infinite;
}

.connection-group.is-active .connection-line-core {
  opacity: 0;
}

.connection-group.is-active .connection-line-core--active {
  opacity: 1;
  transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.connection-group.is-active .connection-line-pulse {
  opacity: 0.85;
  stroke-dasharray: 10 90;
  animation: energy-flow 2.8s ease-in-out 0.5s infinite;
}

@keyframes energy-flow {
  0% { stroke-dashoffset: 100; opacity: 0.5; }
  15% { opacity: 0.85; }
  85% { opacity: 0.85; }
  100% { stroke-dashoffset: 0; opacity: 0.5; }
}

@keyframes line-glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.75; }
}

/* ===== ISLAND VISUALS & LABELS ===== */
.island-visual,
.island-label-anchor {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.space-campus.is-orbit-snapping .island-visual,
.space-campus.is-orbit-snapping .island-label-anchor {
  transition:
    top 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    left 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.island-label-anchor.is-front .island-label {
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow:
    0 0 24px color-mix(in srgb, var(--island-color) 35%, transparent),
    0 8px 32px rgba(0, 0, 0, 0.35);
}

.island-visual.is-selected .island-img-wrap,
.island-visual.is-front .island-img-wrap {
  transform: scale(1.06);
}

.island-enter-hint {
  margin: 4px 0 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--island-color) 85%, white);
  opacity: 0.95;
}

.island-visual {
  z-index: 8;
  animation: float-island 6s ease-in-out infinite;
}

.island-label-anchor {
  z-index: 16;
  pointer-events: none;
  transform: translate(-50%, calc(-50% - var(--label-offset, 98px)));
  animation: float-island-label 6s ease-in-out infinite;
}

.island-label-anchor .island-label {
  pointer-events: auto;
  margin: 0;
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, box-shadow;
}

.island-visual.is-hovered,
.island-label-anchor.is-hovered {
  z-index: 18;
  transition: z-index 0s;
}

/* Hover suave en capa interna — la flotación sigue activa */
.island-visual .island-img-wrap {
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, filter;
}

.island-visual.is-hovered .island-img-wrap {
  transform: scale(1.05);
  filter: drop-shadow(0 0 18px color-mix(in srgb, var(--island-color) 45%, transparent));
}

.island-visual.is-hovered .island-img,
.island-visual.is-hovered .island-fallback {
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.island-visual.is-hovered .island-img {
  transform: scale(1.05);
  filter: saturate(1.32) contrast(1.12) brightness(1.15);
}

.island-visual.is-hovered .island-underglow {
  opacity: 1;
  filter: blur(22px);
}

.island-label-anchor.is-hovered .island-label {
  transform: translateY(-2px) scale(1.02);
  border-color: color-mix(in srgb, var(--island-color) 40%, transparent);
  box-shadow:
    0 0 20px color-mix(in srgb, var(--island-color) 25%, transparent),
    0 4px 16px rgba(0, 0, 0, 0.2);
  background: rgba(15, 23, 42, 0.62);
}

@keyframes float-island {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50% { transform: translate(-50%, -50%) translateY(-10px); }
}

@keyframes float-island-label {
  0%, 100% { transform: translate(-50%, calc(-50% - var(--label-offset, 98px))) translateY(0); }
  50% { transform: translate(-50%, calc(-50% - var(--label-offset, 98px))) translateY(-10px); }
}

/* Resplandor debajo de la isla */
.island-underglow {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 48px;
  border-radius: 50%;
  filter: blur(16px);
  opacity: 0.5;
  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.island-img-wrap {
  width: 172px;
  height: 172px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.island-img {
  width: 108%;
  height: 108%;
  object-fit: contain;
  object-position: center center;
  transform: none;
  /* Negro del PNG desaparece sobre el espacio */
  mix-blend-mode: screen;
  filter: saturate(1.2) contrast(1.1) brightness(1.08);
  -webkit-mask-image: radial-gradient(
    ellipse 72% 72% at 50% 50%,
    rgba(0, 0, 0, 1) 22%,
    rgba(0, 0, 0, 0.85) 48%,
    transparent 70%
  );
  mask-image: radial-gradient(
    ellipse 72% 72% at 50% 50%,
    rgba(0, 0, 0, 1) 22%,
    rgba(0, 0, 0, 0.85) 48%,
    transparent 70%
  );
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.island-img-wrap::after {
  display: none;
}

.island-fallback {
  width: 100%; height: 100%;
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 40% 40%, var(--glow), transparent 70%);
  box-shadow: 0 0 30px color-mix(in srgb, var(--glow) 30%, transparent),
              inset 0 0 20px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.island-fallback::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), transparent 60%);
}
.island-fallback-icon {
  font-size: 48px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
}

.island-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.85rem 0.35rem 0.45rem;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.island-label-icon {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
}
.island-label-text { min-width: 0; }
.island-label-name {
  font-size: 11px; font-weight: 700; color: white; line-height: 1.2;
}
.island-label-sub {
  font-size: 8px;
  color: rgba(148, 163, 184, 0.85);
  line-height: 1.2;
}
.island-label-arrow {
  font-size: 16px; color: #475569; margin-left: auto;
  transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), color 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}
.island-label-anchor.is-hovered .island-label-arrow,
.island-label:hover .island-label-arrow {
  transform: translateX(4px); color: #a5b4fc;
}

/* ===== RECENTER BUTTON (fijo) ===== */
.recenter-btn {
  position: absolute;
  bottom: 3.5rem;
  right: 1.25rem;
  z-index: 30;
  padding: 0.4rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(30,41,59,0.85);
  backdrop-filter: blur(8px);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.recenter-btn:hover {
  color: white;
  border-color: rgba(99,102,241,0.4);
}

/* ===== PROLI BOT BUTTON (fijo) ===== */
.proli-bot-btn {
  position: absolute;
  bottom: 3.5rem;
  left: 1.25rem;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 16px;
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(99,102,241,0.25);
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}
.proli-bot-btn:hover {
  border-color: rgba(99,102,241,0.5);
  transform: translateY(-2px);
}
.proli-bot-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
}
.proli-bot-name { font-size: 11px; font-weight: 700; color: white; }
.proli-bot-sub { font-size: 8px; color: #94a3b8; }

/* ===== WELCOME BAR (fijo) ===== */
.welcome-bar {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 16px;
  background: rgba(15,23,42,0.85);
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  max-width: 560px;
}
.welcome-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  box-shadow: 0 0 8px #22c55e;
}
.welcome-text {
  font-size: 11px; color: white; line-height: 1.4;
}
.welcome-sub { color: #94a3b8; }

/* ===== RESPONSIVE ===== */
@media (max-width: 1023px) {
  .island-img-wrap { width: 138px; height: 138px; }
  .island-label-name { font-size: 10px; }
  .island-label-sub { display: none; }
  .central-hub { display: none; }
  .welcome-bar { max-width: 88%; font-size: 10px; }
  .proli-bot-btn { bottom: 4.5rem; }
  .recenter-btn { bottom: 4.5rem; }
  .connection-lines { display: none; }
}
</style>
