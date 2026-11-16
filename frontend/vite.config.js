import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
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
