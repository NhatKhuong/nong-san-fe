import categoriesJson from '@/mocks/categories.json'
import { delay } from '@/lib/utils'
import { imageUrl } from '@/lib/image'
import { readAllProducts } from './productStore'
import type { Category, Product } from '@/types'

/** Dữ liệu thô trong JSON chưa có `productCount` — số này được tính tại đây để không bị lệch. */
type RawCategory = Omit<Category, 'productCount'>

const rawCategories = categoriesJson as RawCategory[]

/** Danh mục đã giải ảnh — phần **không** đổi theo catalog, giải đúng một lần. */
const baseCategories = rawCategories.map((category) => ({
  ...category,
  image: imageUrl(category.image),
}))

function countProducts(category: RawCategory, products: Product[]): number {
  const childIds = rawCategories
    .filter((item) => item.parentId === category.id)
    .map((item) => item.id)
  const ids = [category.id, ...childIds]
  return products.filter((product) => ids.includes(product.categoryId)).length
}

/**
 * Danh mục kèm `productCount` tính **tại thời điểm gọi**.
 *
 * Trước ticket 0004 mảng này được dựng một lần lúc nạp module từ
 * `products.json`. Từ khi khu quản trị thêm/xoá được sản phẩm, đếm một lần
 * nghĩa là sidebar bộ lọc ở `/cua-hang` vĩnh viễn báo con số của lúc mở tab —
 * sai lệch âm thầm, không có lỗi nào nổ ra. Nguồn phải là **chính** nguồn mà
 * `products.api.ts` đang đọc, nếu không hai màn hình sẽ đếm hai tập khác nhau.
 */
function listCategories(): Category[] {
  const products = readAllProducts()
  return baseCategories.map((category) => ({
    ...category,
    productCount: countProducts(category, products),
  }))
}

/**
 * Toàn bộ danh mục, cả cha lẫn con.
 * Khi có backend: `const { data } = await client.get('/categories'); return data`
 */
export async function getCategories(): Promise<Category[]> {
  await delay(200)
  return listCategories()
}

/**
 * Chỉ danh mục gốc — dùng cho lưới danh mục ở trang chủ và tab lọc.
 * Khi có backend: `const { data } = await client.get('/categories', { params: { root: true } }); return data`
 */
export async function getRootCategories(): Promise<Category[]> {
  await delay(200)
  return listCategories().filter((category) => category.parentId === null)
}

/**
 * Chi tiết một danh mục theo slug.
 * Khi có backend: `const { data } = await client.get(`/categories/${slug}`); return data`
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  await delay(150)
  const category = listCategories().find((item) => item.slug === slug)
  if (!category) throw new Error(`Không tìm thấy danh mục "${slug}"`)
  return category
}
