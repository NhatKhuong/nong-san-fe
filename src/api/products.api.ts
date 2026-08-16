import productsJson from '@/mocks/products.json'
import categoriesJson from '@/mocks/categories.json'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'
import { delay } from '@/lib/utils'
import { effectivePrice } from '@/lib/format'
import type { Paginated, Product, ProductQuery } from '@/types'

const products = productsJson as Product[]
const categories = categoriesJson as { id: number; slug: string; parentId: number | null }[]

/** Danh mục cha kèm toàn bộ id danh mục con, để lọc "Rau củ" ra cả rau ăn lá và củ quả. */
function resolveCategoryIds(categorySlug: string): number[] {
  const matched = categories.find((category) => category.slug === categorySlug)
  if (!matched) return []
  const childIds = categories
    .filter((category) => category.parentId === matched.id)
    .map((category) => category.id)
  return [matched.id, ...childIds]
}

/** Bỏ dấu để tìm kiếm "cam" khớp được với "Cam sành hữu cơ". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function applyFilters(list: Product[], query: ProductQuery): Product[] {
  let result = list

  if (query.q) {
    const keyword = normalize(query.q.trim())
    result = result.filter(
      (product) =>
        normalize(product.name).includes(keyword) ||
        normalize(product.shortDescription).includes(keyword),
    )
  }

  if (query.category) {
    const ids = resolveCategoryIds(query.category)
    result = result.filter((product) => ids.includes(product.categoryId))
  }

  if (query.minPrice !== undefined) {
    result = result.filter(
      (product) => effectivePrice(product.price, product.salePrice) >= query.minPrice!,
    )
  }

  if (query.maxPrice !== undefined) {
    result = result.filter(
      (product) => effectivePrice(product.price, product.salePrice) <= query.maxPrice!,
    )
  }

  if (query.minRating !== undefined) {
    result = result.filter((product) => product.rating >= query.minRating!)
  }

  if (query.inStockOnly) result = result.filter((product) => product.stock > 0)
  if (query.onSaleOnly) result = result.filter((product) => product.salePrice !== null)
  if (query.isFeatured) result = result.filter((product) => product.isFeatured)
  if (query.isBestSeller) result = result.filter((product) => product.isBestSeller)

  return result
}

function applySort(list: Product[], sort: ProductQuery['sort']): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'price_asc':
      return sorted.sort(
        (a, b) =>
          effectivePrice(a.price, a.salePrice) - effectivePrice(b.price, b.salePrice),
      )
    case 'price_desc':
      return sorted.sort(
        (a, b) =>
          effectivePrice(b.price, b.salePrice) - effectivePrice(a.price, a.salePrice),
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

function paginate<T>(list: T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit
  return {
    items: list.slice(start, start + limit),
    total: list.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(list.length / limit)),
  }
}

/**
 * Lấy danh sách sản phẩm có lọc, sắp xếp và phân trang.
 * Khi có backend: `const { data } = await client.get('/products', { params: query }); return data`
 */
export async function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  await delay()
  const page = query.page ?? 1
  const limit = query.limit ?? PRODUCTS_PER_PAGE
  const filtered = applySort(applyFilters(products, query), query.sort)
  return paginate(filtered, page, limit)
}

/**
 * Lấy chi tiết một sản phẩm theo slug.
 * Khi có backend: `const { data } = await client.get(`/products/${slug}`); return data`
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  await delay()
  const product = products.find((item) => item.slug === slug)
  if (!product) throw new Error(`Không tìm thấy sản phẩm "${slug}"`)
  return product
}

/**
 * Sản phẩm liên quan — cùng danh mục, loại trừ chính nó.
 * Khi có backend: `const { data } = await client.get(`/products/${slug}/related`); return data`
 */
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  await delay(200)
  const current = products.find((item) => item.slug === slug)
  if (!current) return []
  return products
    .filter((item) => item.categoryId === current.categoryId && item.id !== current.id)
    .slice(0, limit)
}

/**
 * Gợi ý nhanh cho ô tìm kiếm ở header.
 * Khi có backend: `const { data } = await client.get('/products/suggest', { params: { q: keyword } }); return data`
 */
export async function searchSuggestions(keyword: string, limit = 5): Promise<Product[]> {
  await delay(150)
  if (!keyword.trim()) return []
  return applyFilters(products, { q: keyword }).slice(0, limit)
}

/** Khoảng giá thấp nhất – cao nhất, dùng khởi tạo thanh lọc giá ở trang cửa hàng. */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  await delay(100)
  const prices = products.map((product) => effectivePrice(product.price, product.salePrice))
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
