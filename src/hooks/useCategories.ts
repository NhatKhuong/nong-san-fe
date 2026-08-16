import { useQuery } from '@tanstack/react-query'
import { getCategories, getCategoryBySlug, getRootCategories } from '@/api/categories.api'
import { queryKeys } from './queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: Infinity, // danh mục gần như không đổi trong một phiên
  })
}

export function useRootCategories() {
  return useQuery({
    queryKey: queryKeys.categories.root,
    queryFn: getRootCategories,
    staleTime: Infinity,
  })
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ''),
    queryFn: () => getCategoryBySlug(slug!),
    enabled: Boolean(slug),
  })
}
