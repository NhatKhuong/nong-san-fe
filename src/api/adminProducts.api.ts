import categoriesJson from '@/mocks/categories.json'
import { LOW_STOCK_THRESHOLD, PRODUCTS_PER_PAGE } from '@/lib/constants'
import { delay, slugify } from '@/lib/utils'
import { effectivePrice } from '@/lib/format'
import {
  readAllProducts,
  readProductById,
  writeCreated,
  writeDeleted,
  writeUpdated,
} from './productStore'
import type {
  AdminProductQuery,
  Paginated,
  Product,
  ProductPayload,
  ProductSort,
} from '@/types'

/**
 * Sản phẩm ở khu quản trị — `/admin/products/**`.
 *
 * Tách khỏi `products.api.ts` vì đây là **namespace khác** trên backend: mọi
 * hàm dưới đây đi qua tiền tố `/admin/**` được gác bằng một filter đòi
 * `role == "admin"` (`documents/API_CONTRACT.md` §B.12.1, §C.4.2). Trộn chung
 * file với endpoint công khai là mời gọi một lời gọi ghi lọt ra ngoài hàng rào.
 *
 * Dữ liệu vẫn đọc/ghi qua `productStore.ts` — cùng nguồn với trang cửa hàng,
 * cùng nguồn với `validateCart()`.
 */

const categories = categoriesJson as { id: number; slug: string; parentId: number | null }[]

/** Danh mục cha kéo theo cả danh mục con — lọc "Rau củ" phải ra cả rau ăn lá. */
function resolveCategoryIds(categorySlug: string): number[] {
  const matched = categories.find((category) => category.slug === categorySlug)
  if (!matched) return []
  const childIds = categories
    .filter((category) => category.parentId === matched.id)
    .map((category) => category.id)
  return [matched.id, ...childIds]
}

/** Bỏ dấu để tìm "ca rot" khớp được với "Cà rốt hữu cơ". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function applyFilters(list: Product[], query: AdminProductQuery): Product[] {
  let result = list

  if (query.q) {
    // Khác trang cửa hàng: admin tìm cả trên slug, vì slug là thứ họ sửa.
    const keyword = normalize(query.q.trim())
    result = result.filter(
      (product) =>
        normalize(product.name).includes(keyword) || product.slug.includes(keyword),
    )
  }

  if (query.category) {
    const ids = resolveCategoryIds(query.category)
    result = result.filter((product) => ids.includes(product.categoryId))
  }

  switch (query.stockStatus) {
    case 'out_of_stock':
      result = result.filter((product) => product.stock <= 0)
      break
    case 'low_stock':
      // Đúng định nghĩa của `LOW_STOCK_THRESHOLD`: hết hàng KHÔNG phải sắp hết.
      result = result.filter(
        (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
      )
      break
    case 'in_stock':
      result = result.filter((product) => product.stock > LOW_STOCK_THRESHOLD)
      break
    default:
      break
  }

  return result
}

function applySort(list: Product[], sort: ProductSort | undefined): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'price_asc':
      return sorted.sort(
        (a, b) => effectivePrice(a.price, a.salePrice) - effectivePrice(b.price, b.salePrice),
      )
    case 'price_desc':
      return sorted.sort(
        (a, b) => effectivePrice(b.price, b.salePrice) - effectivePrice(a.price, a.salePrice),
      )
    case 'best_selling':
      return sorted.sort((a, b) => b.sold - a.sold)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }
}

/**
 * Slug cuối cùng của một sản phẩm: lấy slug admin nhập, bỏ trống thì sinh từ tên.
 *
 * Trùng slug là **lỗi báo ra**, không phải thứ tự sửa bằng cách thêm `-1`: slug
 * đi thẳng lên URL công khai `/san-pham/<slug>`, và một cái slug lặng lẽ khác
 * với thứ admin vừa gõ sẽ phá link họ chuẩn bị đem đi chia sẻ.
 */
function resolveSlug(payload: ProductPayload, selfId: number | null): string {
  const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.name)
  if (!slug) throw new Error('Không sinh được slug từ tên sản phẩm. Vui lòng nhập slug thủ công.')

  const taken = readAllProducts().some(
    (product) => product.slug === slug && product.id !== selfId,
  )
  if (taken) throw new Error(`Slug "${slug}" đã được dùng cho một sản phẩm khác.`)

  return slug
}

/**
 * Chỉ những trường `ProductPayload` cho phép đổi.
 *
 * `rating`, `reviewCount`, `sold`, `createdAt` **cố ý vắng mặt** — chúng là kết
 * quả tính từ đánh giá và đơn hàng, backend là nguồn chân lý duy nhất
 * (`API_CONTRACT.md` §C.3). Không spread thẳng `payload` vào patch: `slug` của
 * nó là tuỳ chọn, spread sẽ ghi đè slug đang có bằng `undefined`.
 */
function toProductFields(payload: ProductPayload, slug: string) {
  return {
    name: payload.name,
    slug,
    price: payload.price,
    salePrice: payload.salePrice,
    images: payload.images,
    categoryId: payload.categoryId,
    brandId: payload.brandId,
    stock: payload.stock,
    unit: payload.unit,
    origin: payload.origin,
    shortDescription: payload.shortDescription,
    description: payload.description,
    isFeatured: payload.isFeatured,
    isBestSeller: payload.isBestSeller,
  }
}

/**
 * Danh sách sản phẩm cho bảng quản trị — ảnh đã giải sẵn để render thumbnail.
 * Khi có backend: `const { data } = await client.get('/admin/products', { params: query }); return data`
 */
export async function getAdminProducts(
  query: AdminProductQuery = {},
): Promise<Paginated<Product>> {
  await delay()

  const page = query.page ?? 1
  const limit = query.limit ?? PRODUCTS_PER_PAGE
  const filtered = applySort(applyFilters(readAllProducts(), query), query.sort)
  const start = (page - 1) * limit

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  }
}

/**
 * Một sản phẩm theo **`id`**, không phải slug — khác hẳn `getProductBySlug()`
 * của trang cửa hàng. Admin sửa được chính cái slug, nên URL màn sửa không được
 * treo vào một trường có thể đổi: lưu link `/quan-tri/san-pham/12/chinh-sua` rồi
 * đổi slug thì link vẫn đúng, còn khoá theo slug thì hỏng ngay sau lần Lưu.
 *
 * `images` trả về là **đường dẫn tương đối**, cố ý chưa qua `imageUrl()`: giá
 * trị này đi thẳng vào form và quay lại store trong `ProductPayload` ở lần Lưu
 * kế tiếp (xem JSDoc `readProductById`).
 *
 * Khi có backend: `const { data } = await client.get(`/admin/products/${id}`); return data`
 */
export async function getAdminProduct(id: number): Promise<Product> {
  await delay(250)
  const product = readProductById(id)
  if (!product) throw new Error(`Không tìm thấy sản phẩm #${id}.`)
  return product
}

/**
 * Tạo sản phẩm mới.
 * Khi có backend: `const { data } = await client.post('/admin/products', payload); return data`
 */
export async function createProduct(payload: ProductPayload): Promise<Product> {
  await delay(600)

  const slug = resolveSlug(payload, null)
  const product: Product = {
    // `Date.now()` theo đúng lệ của `createOrder` và `register` trong lớp mock.
    id: Date.now(),
    ...toProductFields(payload, slug),
    rating: 0,
    reviewCount: 0,
    sold: 0,
    createdAt: new Date().toISOString(),
  }

  writeCreated(product)
  return product
}

/**
 * Cập nhật một sản phẩm — áp được cho cả sản phẩm seed lẫn sản phẩm đã tạo.
 * Khi có backend: `const { data } = await client.put(`/admin/products/${id}`, payload); return data`
 */
export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  await delay(600)

  const current = readProductById(id)
  if (!current) throw new Error(`Không tìm thấy sản phẩm #${id}.`)

  const patch = toProductFields(payload, resolveSlug(payload, id))
  writeUpdated(id, patch)
  return { ...current, ...patch }
}

/**
 * Xoá một sản phẩm khỏi catalog.
 * Khi có backend: `await client.delete(`/admin/products/${id}`)`
 */
export async function deleteProduct(id: number): Promise<void> {
  await delay(500)
  if (!readProductById(id)) throw new Error(`Không tìm thấy sản phẩm #${id}.`)
  writeDeleted(id)
}
