import { PRODUCTS_PER_PAGE } from '@/lib/constants'
import { imageUrl } from '@/lib/image'
import { client } from './client'
import type { Paginated, Product, ProductQuery } from '@/types'

/**
 * Sản phẩm ở trang cửa hàng — `GET /products/**` (`documents/API_CONTRACT.md` §B.1).
 *
 * **Đã ghép backend Spring Boot thật (backlog 0032 §B.1).** Lọc, sắp xếp, phân
 * trang và quan hệ danh mục cha–con đều do backend làm — không còn bản sao nào
 * của những luật đó ở đây (trước 0032, `resolveCategoryIds()` tự dựng cây danh
 * mục con ở client để lọc `category` kèm danh mục dưới; việc đó nay thuộc hẳn
 * về backend, giống hệt cách `GET /admin/products?category=` đã làm).
 *
 * `client.ts` đã có `baseURL = '/api'` nên đường dẫn viết ở đây là `/products`.
 */

/**
 * Ảnh giải qua `imageUrl()` **tại lớp `src/api/`** (`coding-conventions.md` §6),
 * khớp `adminProducts.api.ts`: backend trả đường dẫn tương đối `/images/...`
 * (§A.5), client ghép base ở đây để không màn hình nào phải tự nhớ gọi.
 */
function withResolvedImages(product: Product): Product {
  return { ...product, images: product.images.map(imageUrl) }
}

/**
 * Lấy danh sách sản phẩm có lọc, sắp xếp và phân trang — `GET /products`.
 *
 * `page`/`limit` gửi tường minh (mặc định backend cũng là `1`/`12`) để URL của
 * request nói ra đúng trang đang xem. Các khoá còn lại là `undefined` khi
 * không lọc và axios tự bỏ chúng khỏi query string.
 *
 * **Lọc và sắp xếp theo giá dùng `salePrice ?? price` (`effective_price`),
 * không dùng `price` trần** — luật của backend (§B.1), FE không tự tính lại.
 *
 * `totalPages` khi tập rỗng là `0`, không phải `1` (§A.4).
 */
export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  const { data } = await client.get<Paginated<Product>>('/products', {
    params: {
      q: query.q,
      category: query.category,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minRating: query.minRating,
      inStockOnly: query.inStockOnly,
      onSaleOnly: query.onSaleOnly,
      isFeatured: query.isFeatured,
      isBestSeller: query.isBestSeller,
      sort: query.sort,
      page: query.page ?? 1,
      limit: query.limit ?? PRODUCTS_PER_PAGE,
    },
  })

  return { ...data, items: data.items.map(withResolvedImages) }
}

/**
 * Lấy chi tiết một sản phẩm theo slug — `GET /products/{slug}`.
 * Không tìm thấy → `404`.
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await client.get<Product>(`/products/${slug}`)
  return withResolvedImages(data)
}

/**
 * Lấy nhiều sản phẩm theo danh sách id — dùng cho trang yêu thích.
 *
 * `GET /products?ids=1,2,3`. Backend giữ đúng thứ tự id truyền vào và bỏ qua
 * id không còn tồn tại — sản phẩm có thể đã bị gỡ khỏi catalog trong lúc id
 * vẫn nằm trong localStorage của khách.
 */
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const { data } = await client.get<Product[]>('/products', {
    params: { ids: ids.join(',') },
  })
  return data.map(withResolvedImages)
}

/**
 * Sản phẩm liên quan — cùng danh mục, loại trừ chính nó.
 * `GET /products/{slug}/related`.
 */
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const { data } = await client.get<Product[]>(`/products/${slug}/related`, {
    params: { limit },
  })
  return data.map(withResolvedImages)
}

/**
 * Gợi ý nhanh cho ô tìm kiếm ở header.
 * `GET /products/suggest`.
 */
export async function searchSuggestions(keyword: string, limit = 5): Promise<Product[]> {
  if (!keyword.trim()) return []
  const { data } = await client.get<Product[]>('/products/suggest', {
    params: { q: keyword, limit },
  })
  return data.map(withResolvedImages)
}

/**
 * Khoảng giá thấp nhất – cao nhất, dùng khởi tạo thanh lọc giá ở trang cửa hàng.
 * `GET /products/price-range`.
 */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const { data } = await client.get<{ min: number; max: number }>('/products/price-range')
  return data
}
