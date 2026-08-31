import { imageUrl } from '@/lib/image'
import { client } from './client'
import type { Category } from '@/types'

/**
 * Danh mục — `GET /categories/**` (`documents/API_CONTRACT.md` §B.2).
 *
 * **Đã ghép backend Spring Boot thật (backlog 0032 §B.2).** `productCount` do
 * backend tính; với danh mục gốc, con số này gồm cả sản phẩm của danh mục con —
 * sidebar bộ lọc hiển thị đúng như vậy, không còn phép đếm nào ở client.
 */

/**
 * Ảnh giải qua `imageUrl()` tại lớp `src/api/` (`coding-conventions.md` §6),
 * khớp `products.api.ts` — backend trả đường dẫn tương đối `/images/...`.
 */
function withResolvedImage(category: Category): Category {
  return { ...category, image: imageUrl(category.image) }
}

/**
 * Toàn bộ danh mục, cả cha lẫn con — `GET /categories`.
 */
export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get<Category[]>('/categories')
  return data.map(withResolvedImage)
}

/**
 * Chỉ danh mục gốc — dùng cho lưới danh mục ở trang chủ và tab lọc.
 * `GET /categories?root=true`.
 */
export async function getRootCategories(): Promise<Category[]> {
  const { data } = await client.get<Category[]>('/categories', {
    params: { root: true },
  })
  return data.map(withResolvedImage)
}

/**
 * Chi tiết một danh mục theo slug — `GET /categories/{slug}`.
 * Không tìm thấy → `404`.
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await client.get<Category>(`/categories/${slug}`)
  return withResolvedImage(data)
}
