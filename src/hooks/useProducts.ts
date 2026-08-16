import { useQuery } from '@tanstack/react-query'
import {
  getPriceRange,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  searchSuggestions,
} from '@/api/products.api'
import { queryKeys } from './queryKeys'
import type { ProductQuery } from '@/types'

/** Danh sách sản phẩm có lọc/sắp xếp/phân trang — dùng ở trang cửa hàng và các khối trang chủ. */
export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => getProducts(query),
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug ?? ''),
    queryFn: () => getProductBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useRelatedProducts(slug: string | undefined, limit = 4) {
  return useQuery({
    queryKey: queryKeys.products.related(slug ?? ''),
    queryFn: () => getRelatedProducts(slug!, limit),
    enabled: Boolean(slug),
  })
}

/** Gợi ý cho ô tìm kiếm — chỉ chạy khi từ khoá đủ dài để tránh gọi thừa. */
export function useSearchSuggestions(keyword: string) {
  return useQuery({
    queryKey: queryKeys.products.suggestions(keyword),
    queryFn: () => searchSuggestions(keyword),
    enabled: keyword.trim().length >= 2,
  })
}

export function usePriceRange() {
  return useQuery({
    queryKey: queryKeys.products.priceRange,
    queryFn: getPriceRange,
    staleTime: Infinity,
  })
}
