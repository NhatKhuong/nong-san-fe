import type { UserRole } from '@/types'

/**
 * Giải payload của JWT ở phía client.
 *
 * **Không verify chữ ký** — chữ ký chỉ máy chủ mới kiểm được. Kết quả ở đây chỉ
 * dùng để **vẽ giao diện** (ẩn/hiện menu, chặn route ở client). Hàng rào thật là
 * filter phía server; xem ADR 0004 và JSDoc của `components/auth/AdminRoute.tsx`.
 *
 * Payload thật của backend Spring Boot, giải ngày 2026-08-25 (backlog 0010):
 *
 * ```json
 * { "iss": "nss-api", "sub": "1", "exp": 1787633465, "iat": 1787631665,
 *   "email": "demo@nongsansach.vn", "roles": ["CUSTOMER"] }
 * ```
 *
 * Ba điểm đáng nhớ: claim vai trò tên là **`roles`** (số nhiều, mảng, chữ HOA),
 * `sub` là **chuỗi** chứ không phải số, và `exp - iat = 1800` giây (30 phút).
 */

/** Payload đã giải — khoá tuỳ backend, nên giá trị để `unknown` rồi thu hẹp. */
export type JwtPayload = Record<string, unknown>

/** Giải base64url (không đệm `=`, dùng `-` và `_`) thành chuỗi UTF-8. */
function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  // `atob` trả từng byte một; tiếng Việt trong claim là UTF-8 nhiều byte nên
  // phải ghép lại qua percent-encoding, không dùng thẳng chuỗi của `atob`.
  const percentEncoded = Array.from(binary, (char) =>
    `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`,
  ).join('')
  return decodeURIComponent(percentEncoded)
}

/**
 * Giải payload của một JWT.
 *
 * **Không bao giờ throw.** Mọi ca hỏng — token rỗng, sai số đoạn, base64 hỏng,
 * JSON hỏng — đều trả `null`. Một chuỗi rác còn sót trong localStorage không
 * được phép làm trắng cả trang.
 */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (typeof token !== 'string' || token === '') return null
  try {
    const segments = token.split('.')
    if (segments.length !== 3) return null
    const parsed: unknown = JSON.parse(decodeBase64Url(segments[1]))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    return parsed as JwtPayload
  } catch {
    return null
  }
}

/**
 * Id người dùng lấy từ claim `sub`.
 *
 * Backend gửi `sub` dạng **chuỗi** (`"1"`) nên phải ép về số; không đọc được thì
 * trả `null` để chỗ gọi tự quyết, đừng đoán bừa một id.
 */
export function getUserIdFromToken(token: string | null | undefined): number | null {
  const payload = decodeJwt(token)
  if (!payload) return null

  const sub = payload.sub
  if (typeof sub === 'number') return Number.isFinite(sub) ? sub : null
  if (typeof sub !== 'string' || sub.trim() === '') return null

  const id = Number(sub)
  return Number.isFinite(id) ? id : null
}

/** `ADMIN`, `admin`, `ROLE_ADMIN`, `role_admin`… đều quy về `'admin'`. */
function normalizeRole(raw: unknown): UserRole | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim().toLowerCase().replace(/^role_/, '')
  if (value === 'admin') return 'admin'
  if (value === 'customer') return 'customer'
  return null
}

/**
 * Vai trò lấy từ claim của JWT.
 *
 * **Mapper phòng thủ có chủ đích:** đọc được cả `roles` (mảng, dạng backend đang
 * dùng) lẫn `role` (chuỗi, dạng ADR 0002 và `API_CONTRACT.md` mô tả), không phân
 * biệt hoa thường, chấp nhận cả tiền tố `ROLE_` của Spring Security.
 *
 * **Mặc định `'customer'`** khi không đọc được — quy tắc quyền thấp nhất, đồng bộ
 * với `migrate` của `auth.store.ts`: không ai được nâng quyền vì một token lạ.
 */
export function getRoleFromToken(token: string | null | undefined): UserRole {
  const payload = decodeJwt(token)
  if (!payload) return 'customer'

  const claim = payload.roles ?? payload.role
  const candidates = Array.isArray(claim) ? claim : [claim]

  for (const candidate of candidates) {
    if (normalizeRole(candidate) === 'admin') return 'admin'
  }
  return 'customer'
}
