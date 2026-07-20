# Prolipa — Campus Virtual Docentes

Demo frontend del Dashboard educativo para docentes. Experiencia tipo **Campus Virtual Inteligente** con escena 3D interactiva.

## Stack

- Vue 3 + TypeScript
- Vite
- Three.js (escena low-poly)
- Vue Router (lazy loading)
- Pinia
- GSAP
- TailwindCSS v4

## Inicio rápido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`

## Estructura

```
src/
├── api/           # Cliente HTTP + mocks (Laravel futuro)
├── components/    # UI, layout, three/
├── composables/   # GSAP, escena 3D
├── config/        # Edificios del campus
├── pages/         # Rutas por módulo
├── router/        # Vue Router
├── services/      # IntentEngine (IA)
├── stores/        # Pinia
└── types/         # TypeScript
```

## Demo vs Producción

Los datos vienen de `src/api/mock/dashboard.ts`. Para conectar Laravel:

1. Define `VITE_API_URL` en `.env`
2. Cambia `USE_MOCK = false` en `src/api/client.ts`
3. Reemplaza las funciones mock por llamadas `apiGet()`

## Asistente IA

Motor de intenciones local en `src/services/IntentEngine.ts`. Ejemplos:

- "Quiero ir a libros" → `/libros`
- "Necesito mis certificados" → `/certificados`

Arquitectura lista para integrar OpenAI, Gemini o Claude.

## Módulos del campus

| Edificio | Ruta |
|---|---|
| Biblioteca | `/libros` |
| Aula de Evaluaciones | `/evaluaciones` |
| Oficina de Planificaciones | `/planificaciones` |
| Centro Multimedia | `/multimedia` |
| Auditorio de Certificados | `/certificados` |
| Centro de Ayuda | `/ayuda` |
