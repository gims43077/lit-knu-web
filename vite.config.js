import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://yellow-plant-0de446a00.2.azurestaticapps.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

