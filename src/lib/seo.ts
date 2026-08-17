const SITE_URL = import.meta.env.VITE_SITE_URL ?? ''

export const SITE_NAME = 'Nông Sản Sạch'

/** Ảnh chia sẻ mặc định — sinh bởi `node scripts/generate-og-image.mjs`. */
export const DEFAULT_OG_IMAGE = '/images/og/mac-dinh.png'

/**
 * Ghép đường dẫn tương đối thành URL tuyệt đối cho thẻ Open Graph.
 *
 * Trả `null` khi chưa cấu hình `VITE_SITE_URL`. Các nền tảng mạng xã hội yêu cầu
 * URL tuyệt đối, nên thà **không xuất thẻ** còn hơn xuất một đường dẫn tương đối
 * mà chúng không đọc được — một thẻ sai còn khó lần ra hơn là không có thẻ.
 */
export function absoluteUrl(path: string): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  if (!SITE_URL) return null

  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}

/** Tiêu đề trang, luôn kèm tên cửa hàng ở cuối. */
export function pageTitle(title?: string): string {
  return title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Thực phẩm hữu cơ tươi mỗi ngày`
}
