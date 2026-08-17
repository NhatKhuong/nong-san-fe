/**
 * Gốc URL của kho ảnh. Để trống thì ảnh được phục vụ từ chính server web
 * (thư mục `public/`). Khi đưa ảnh lên S3/CloudFront, chỉ cần đặt biến này
 * trong `.env` là toàn bộ ảnh chuyển sang CDN — không phải sửa dữ liệu hay code.
 */
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL ?? ''

/**
 * Chuyển đường dẫn ảnh trong dữ liệu thành URL dùng được cho thẻ `<img>`.
 *
 * Hàm này được gọi ở **lớp `src/api/`**, không phải ở component. Lý do: nếu để
 * component tự gọi thì chỉ cần quên một chỗ là hỏng, mà lỗi đó không lộ ra lúc
 * dev (vì base đang trống) — chỉ bung ra khi deploy với CDN.
 */
export function imageUrl(path: string): string {
  // Backend thật có thể trả URL tuyệt đối; khi đó dùng nguyên vẹn.
  if (/^https?:\/\//i.test(path)) return path
  if (!IMAGE_BASE_URL) return path

  return `${IMAGE_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
}
