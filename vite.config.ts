import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { uploadProductImagePlugin } from './vite-plugins/upload-product-image.ts'

// https://vite.dev/config/
export default defineConfig({
  // `uploadProductImagePlugin` chỉ đăng ký middleware qua `configureServer` — biến
  // mất hoàn toàn khỏi `vite preview`/`vite build` (backlog 0034).
  plugins: [react(), tailwindcss(), uploadProductImagePlugin()],
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
