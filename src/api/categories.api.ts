import categoriesJson from '@/mocks/categories.json'
import productsJson from '@/mocks/products.json'
import { delay } from '@/lib/utils'
import type { Category, Product } from '@/types'

/** Dữ liệu thô trong JSON chưa có `productCount` — số này được tính tại đây để không bị lệch. */
type RawCategory = Omit<Category, 'productCount'>

const rawCategories = categoriesJson as RawCategory[]
const products = productsJson as Product[]

function countProducts(category: RawCategory): number {
  const childIds = rawCategories
    .filter((item) => item.parentId === category.id)
    .map((item) => item.id)
  const ids = [category.id, ...childIds]
  return products.filter((product) => ids.includes(product.categoryId)).length
}

const categories: Category[] = rawCategories.map((category) => ({
  ...category,
  productCount: countProducts(category),
}))

/**
 * Toàn bộ danh mục, cả cha lẫn con.
 * Khi có backend: `const { data } = await client.get('/categories'); return data`
 */
export async function getCategories(): Promise<Category[]> {
  await delay(200)
  return categories
}

/**
 * Chỉ danh mục gốc — dùng cho lưới danh mục ở trang chủ và tab lọc.
 * Khi có backend: `const { data } = await client.get('/categories', { params: { root: true } }); return data`
 */
export async function getRootCategories(): Promise<Category[]> {
  await delay(200)
  return categories.filter((category) => category.parentId === null)
}

/**
 * Chi tiết một danh mục theo slug.
 * Khi có backend: `const { data } = await client.get(`/categories/${slug}`); return data`
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  await delay(150)
  const category = categories.find((item) => item.slug === slug)
  if (!category) throw new Error(`Không tìm thấy danh mục "${slug}"`)
  return category
}
