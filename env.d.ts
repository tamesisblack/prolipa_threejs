/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly AI_API_KEY?: string
  readonly VITE_AI_API_KEY?: string
  readonly AI_PROVIDER?: string
  readonly AI_MODEL?: string
  readonly AI_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
