import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // El navegador pide /api a Vite y Vite se lo pasa al backend. Así funciona
    // también desde el móvil, que no puede llegar a "localhost:8080" del PC.
    // En Docker, API_DESTINO es http://web:80; con "npm run dev" fuera de Docker, localhost:8080.
    proxy: {
      '/api': {
        target: process.env.API_DESTINO ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa @import y funciones globales de Sass:
        // silenciamos esos avisos para que no ensucien la consola.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
})
