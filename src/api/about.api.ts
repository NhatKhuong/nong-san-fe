import aboutJson from '@/mocks/about.json'
import { delay } from '@/lib/utils'
import { imageUrl } from '@/lib/image'
import type { AboutContent } from '@/types'

/**
 * Resolve ảnh ngay ở tầng module, giống các file api khác.
 * Lý do ở lớp API chứ không ở component: xem ghi chú trong `products.api.ts`.
 */
const content: AboutContent = {
  ...(aboutJson as AboutContent),
  heroImage: imageUrl((aboutJson as AboutContent).heroImage),
  storyImage: imageUrl((aboutJson as AboutContent).storyImage),
}

/**
 * Nội dung trang giới thiệu.
 *
 * Đặt ở lớp API thay vì viết cứng trong `AboutPage.tsx` vì đây là nội dung do
 * người vận hành cửa hàng sửa, không phải mã giao diện — cùng lý do đã chuyển
 * dữ liệu banner khỏi `PromoBanners.tsx` ở Giai đoạn 5.5.
 *
 * Khi có backend: `const { data } = await client.get('/about'); return data`
 */
export async function getAboutContent(): Promise<AboutContent> {
  await delay(200)
  return content
}
