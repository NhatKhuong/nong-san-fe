import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Bật lại khi backend Spring Boot sẵn sàng để tránh CORS lúc dev.
    // proxy: {
    //   '/api': { target: 'http://localhost:8080', changeOrigin: true },
    // },
  },
})
