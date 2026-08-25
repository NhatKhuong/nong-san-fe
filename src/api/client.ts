import axios, { type InternalAxiosRequestConfig } from 'axios'
import { toApiError } from '@/lib/apiError'
import type { AuthResponse } from '@/types'

const AUTH_TOKEN_KEY = 'nss_auth_token'
const REFRESH_TOKEN_KEY = 'nss_refresh_token'

/**
 * Để TRỐNG `VITE_API_BASE_URL` lúc dev: axios dùng `/api`, đi qua proxy khai
 * trong `vite.config.ts` nên cùng origin và không dính CORS (`API_CONTRACT.md` §A.1).
 *
 * Dùng `||` chứ không `??`: `.env.example` khai `VITE_API_BASE_URL=` nên biến này
 * tới đây là **chuỗi rỗng**, không phải `undefined` — `??` sẽ để nguyên chuỗi rỗng
 * và mọi request rơi về gốc site thay vì `/api`.
 */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || '/api'

const TIMEOUT_MS = 15000

/**
 * Axios instance dùng chung. Mọi hàm trong `src/api/*.api.ts` phải đi qua đây —
 * nó lo base URL, gắn JWT, tự gia hạn phiên, và chuẩn hoá lỗi thành `ApiError`.
 */
export const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Instance **trần**: không interceptor nào.
 *
 * `POST /auth/refresh` bắt buộc phải đi qua đây. Gọi bằng `client` thì một `401`
 * của chính lời gọi refresh sẽ lại kích hoạt interceptor refresh — đệ quy.
 */
const bareClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

// ---------------------------------------------------------------- phiên đăng nhập

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Ghi **cả hai** token.
 *
 * Refresh của backend là **xoay vòng**: mỗi response cấp một cặp mới và thu hồi
 * chuỗi cũ ngay trong cùng giao dịch. Ghi thiếu `refreshToken` nghĩa là lần gia
 * hạn sau sẽ gửi một chuỗi đã bị thu hồi và ăn `401`.
 */
export function setSession(token: string, refreshToken: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** Bí danh của thời mock một-token. Dùng `setSession` khi đã ghép backend thật. */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

/** Bí danh của thời mock một-token. Dùng `clearSession` khi đã ghép backend thật. */
export function clearAuthToken(): void {
  clearSession()
}

// ------------------------------------------------------------ sự kiện hết phiên

type SessionExpiredHandler = () => void

let sessionExpiredHandlers: SessionExpiredHandler[] = []

/**
 * Đăng ký nơi nhận tin "phiên đã hết hạn thật sự".
 *
 * Thay cho `window.location.href = '/dang-nhap'` trước đây: redirect cứng tải lại
 * cả trang và **làm mất `location.state.from`** mà `ProtectedRoute` vừa đặt, nên
 * đăng nhập xong người dùng bị ném về trang chủ thay vì quay lại chỗ đang dở.
 *
 * Trả về hàm huỷ đăng ký.
 */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandlers = [...sessionExpiredHandlers, handler]
  return () => {
    sessionExpiredHandlers = sessionExpiredHandlers.filter((item) => item !== handler)
  }
}

function emitSessionExpired(): void {
  for (const handler of sessionExpiredHandlers) handler()
}

// ------------------------------------------------------------------- interceptor

/** Cờ nội bộ gắn lên config để mỗi request chỉ được phát lại đúng một lần. */
interface RetryableConfig extends InternalAxiosRequestConfig {
  /** Đã phát lại sau khi gia hạn phiên. */
  _retry?: boolean
  /** Đã phát lại lần cuối, cố ý **bỏ** header `Authorization`. */
  _anonymousRetry?: boolean
}

/**
 * Ba endpoint tự nó cấp phiên. `401` ở đây nghĩa là "sai thông tin đăng nhập"
 * hoặc "refresh token đã chết", **không** phải "access token hết hạn" — gọi
 * refresh cho chúng là vô nghĩa, và với `/auth/refresh` thì còn là đệ quy.
 */
const SESSION_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh']

function isSessionEndpoint(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0]
  return SESSION_ENDPOINTS.some((endpoint) => path === endpoint || path.endsWith(endpoint))
}

/**
 * Một lần gia hạn duy nhất dùng chung cho mọi request đang chờ (single-flight).
 *
 * N request cùng ăn `401` một lúc mà mỗi cái tự gọi refresh thì cái đầu tiên xoay
 * vòng token, N-1 cái còn lại gửi chuỗi vừa bị thu hồi và tất cả cùng hỏng.
 */
let refreshPromise: Promise<string> | null = null

async function requestNewSession(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('Không có refresh token để gia hạn phiên.')

  const { data } = await bareClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  if (!data.token || !data.refreshToken) {
    throw new Error('Phản hồi gia hạn phiên thiếu token.')
  }

  setSession(data.token, data.refreshToken)
  return data.token
}

function refreshSessionOnce(): Promise<string> {
  refreshPromise ??= requestNewSession().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

/** Access token mà request này đã mang theo lúc bay đi. */
function bearerTokenOf(config: RetryableConfig): string | null {
  const raw = config.headers.get('Authorization')
  return typeof raw === 'string' && raw.startsWith('Bearer ') ? raw.slice('Bearer '.length) : null
}

// Gắn JWT vào mọi request khi đã đăng nhập.
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const request = config as RetryableConfig

  // Lượt phát lại cuối cùng cố ý đi như khách vãng lai: header cũ còn dính trên
  // config từ lần thử đầu nên phải xoá tay, không chỉ dựa vào việc token đã bị xoá.
  if (request._anonymousRetry) {
    request.headers.delete('Authorization')
    return request
  }

  const token = getAuthToken()
  if (token) request.headers.Authorization = `Bearer ${token}`
  return request
})

/**
 * Chuẩn hoá lỗi và tự gia hạn phiên.
 *
 * **`403` không đi vào nhánh nào ở đây** — backend chọn `403` thay `401` chính là
 * để client đừng hiểu nhầm thành "token hết hạn" rồi tự đăng xuất người dùng. Nó
 * rơi thẳng xuống `toApiError`.
 */
client.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error))

    const original = error.config as RetryableConfig | undefined
    if (error.response?.status !== 401 || !original) {
      return Promise.reject(toApiError(error))
    }

    // 1. Endpoint cấp phiên: không gia hạn, trả lỗi luôn.
    if (isSessionEndpoint(original.url)) {
      return Promise.reject(toApiError(error))
    }

    // 2. Đã phát lại rồi thì dừng.
    if (original._anonymousRetry) {
      // Lượt đi không kèm token cũng `401` ⇒ endpoint này thật sự cần đăng nhập.
      // Đây mới là lúc được phép nói "hết phiên".
      emitSessionExpired()
      return Promise.reject(toApiError(error))
    }
    if (original._retry) {
      return Promise.reject(toApiError(error))
    }

    /**
     * Nhánh "phiên đã chết": xoá phiên rồi phát lại **như khách vãng lai**, đúng
     * một lần, bỏ header `Authorization`.
     *
     * `POST /api/orders` là endpoint công khai nhưng trả `401` nếu client CÓ gửi
     * header `Authorization` với token hỏng. Reject thẳng ở đây sẽ chặn luồng đặt
     * hàng của người không cần đăng nhập, chỉ vì máy họ còn sót một token chết
     * (ADR 0004).
     */
    const replayWithoutAuth = () => {
      clearSession()
      original._retry = true
      original._anonymousRetry = true
      original.headers.delete('Authorization')
      return client(original)
    }

    // 3. Không có gì để gia hạn — **cùng một tình huống** với "gia hạn thất bại"
    // ở dưới, nên xử lý y hệt.
    //
    // Đây KHÔNG phải ca hiếm: mọi phiên đang tồn tại hôm nay đều ở đúng trạng thái
    // này. Code cũ chỉ ghi `nss_auth_token`, nên lần đầu tải trang sau khi bản này
    // lên, ai cũng có access token mà không có refresh token. Reject thẳng ở đây
    // nghĩa là request 401 đầu tiên của họ hỏng cứng — với `POST /orders` là mất
    // đơn hàng, đúng cái ca nhánh này sinh ra để chặn.
    if (!getRefreshToken()) {
      return await replayWithoutAuth()
    }

    // 4. Phiên đã được gia hạn xong TRONG LÚC request này đang bay: token nó mang
    // theo không còn là token đang lưu. Dùng ngay cái mới, tuyệt đối không gia hạn
    // lần nữa — refresh là xoay vòng, gọi thêm một lần sẽ thu hồi đúng cặp token mà
    // các request vừa được phát lại đang dùng, và làm hỏng cả loạt.
    //
    // Chỉ chia sẻ `refreshPromise` là chưa đủ: N request không ăn 401 cùng một
    // mili-giây, nên cái tới muộn hơn một lượt gia hạn đã kết thúc sẽ mở lượt mới.
    const sentWith = bearerTokenOf(original)
    const stored = getAuthToken()
    if (sentWith && stored && sentWith !== stored) {
      original._retry = true
      original.headers.Authorization = `Bearer ${stored}`
      return await client(original)
    }

    try {
      // 4 + 5. Gia hạn (dùng chung một lần) rồi phát lại đúng một lần.
      const token = await refreshSessionOnce()
      original._retry = true
      original.headers.Authorization = `Bearer ${token}`
      return await client(original)
    } catch {
      // 6. Gia hạn thất bại — cùng lối ra với nhánh 3.
      return await replayWithoutAuth()
    }
  },
)
