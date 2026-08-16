import { useQuery } from '@tanstack/react-query'
import {
  getLatestPosts,
  getPostBySlug,
  getPostCategories,
  getPosts,
  getRelatedPosts,
} from '@/api/posts.api'
import { queryKeys } from './queryKeys'
import type { PostQuery } from '@/types'

export function usePosts(query: PostQuery = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(query),
    queryFn: () => getPosts(query),
  })
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.posts.detail(slug ?? ''),
    queryFn: () => getPostBySlug(slug!),
    enabled: Boolean(slug),
  })
}

export function useRelatedPosts(slug: string | undefined, limit = 3) {
  return useQuery({
    queryKey: queryKeys.posts.related(slug ?? ''),
    queryFn: () => getRelatedPosts(slug!, limit),
    enabled: Boolean(slug),
  })
}

export function useLatestPosts(limit = 4) {
  return useQuery({
    queryKey: queryKeys.posts.latest(limit),
    queryFn: () => getLatestPosts(limit),
  })
}

export function usePostCategories() {
  return useQuery({
    queryKey: queryKeys.posts.categories,
    queryFn: getPostCategories,
    staleTime: Infinity,
  })
}
