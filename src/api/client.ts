import axios from 'axios'

const AUTH_TOKEN_KEY = 'nss_auth_token'

/**
 * Axios instance dùng chung. Hiện chưa gọi request thật nào — mọi hàm trong
 * `src/api/*.api.ts` còn đọc từ mock JSON. Khi backend Spring Boot sẵn sàng,
 * chỉ cần thay thân các hàm đó bằng `client.get(...)`, phần cấu hình dưới đây
 * đã xử lý sẵn base URL và JWT.
 */
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

// Gắn JWT vào mọi request nếu đã đăng nhập.
client.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Token hết hạn → xoá phiên và đưa về trang đăng nhập.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthToken()
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap'
      }
    }
    return Promise.reject(error)
  },
)
