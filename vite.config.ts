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
    // Backend Spring Boot chạy ở :8080. Proxy giữ mọi request `/api/...` cùng
    // origin với trang (:5173) nên không dính CORS lúc dev — điều kiện để
    // `VITE_API_BASE_URL` được để trống (API_CONTRACT.md §A.1).
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
