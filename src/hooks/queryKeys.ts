import type { PostQuery, ProductQuery } from '@/types'

/** Query key tập trung một chỗ để invalidate cache không bị lệch chuỗi. */
export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (query: ProductQuery) => ['products', 'list', query] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (slug: string) => ['products', 'related', slug] as const,
    suggestions: (keyword: string) => ['products', 'suggestions', keyword] as const,
    priceRange: ['products', 'price-range'] as const,
  },
  categories: {
    all: ['categories'] as const,
    root: ['categories', 'root'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },
  posts: {
    all: ['posts'] as const,
    list: (query: PostQuery) => ['posts', 'list', query] as const,
    detail: (slug: string) => ['posts', 'detail', slug] as const,
    related: (slug: string) => ['posts', 'related', slug] as const,
    latest: (limit: number) => ['posts', 'latest', limit] as const,
    categories: ['posts', 'categories'] as const,
  },
  marketing: {
    heroSlides: ['marketing', 'hero-slides'] as const,
    testimonials: ['marketing', 'testimonials'] as const,
    brands: ['marketing', 'brands'] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (code: string) => ['orders', 'detail', code] as const,
  },
  coupons: {
    active: ['coupons', 'active'] as const,
  },
} as const
