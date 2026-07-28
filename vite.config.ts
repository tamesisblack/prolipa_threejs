import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  envPrefix: ['VITE_', 'AI_'],
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Evita CORS: el navegador llama a localhost y Vite reenvía a OpenRouter
    proxy: {
      '/api/openrouter': {
        target: 'https://openrouter.ai/api/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/openrouter/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          vendor: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
