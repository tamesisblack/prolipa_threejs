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

## Asistente IA (Proli)

1. Copia `.env.example` → `.env`
2. Configura **OpenRouter** (recomendado) o **Gemini directo**:

```env
AI_PROVIDER=openrouter
AI_API_KEY=sk-or-v1-tu-key
AI_MODEL=google/gemini-2.0-flash-001
```

3. Reinicia `npm run dev`

Proli conversa con IA y puede **navegar** por el campus ("llévame a biblioteca").
Sin API key funciona en modo demo local.

> La key en `.env` se expone en el navegador. En producción usa un proxy Laravel.

## Módulos del campus

| Edificio | Ruta |
|---|---|
| Biblioteca | `/libros` |
| Aula de Evaluaciones | `/evaluaciones` |
| Oficina de Planificaciones | `/planificaciones` |
| Centro Multimedia | `/multimedia` |
| Auditorio de Certificados | `/certificados` |
| Centro de Ayuda | `/ayuda` |
