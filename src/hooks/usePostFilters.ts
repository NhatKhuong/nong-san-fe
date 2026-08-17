import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { POSTS_PER_PAGE } from '@/lib/constants'
import type { PostQuery } from '@/types'

const PARAM = {
  q: 'q',
  category: 'category',
  page: 'page',
} as const

/** Đổi khoá nào trong đây thì phải reset về trang 1, nếu không sẽ rơi vào trang trống. */
const FILTER_KEYS = [PARAM.q, PARAM.category] as const

/** Parse số nguyên dương; `?page=abc` rơi về mặc định thay vì để NaN lọt xuống. */
function parsePositiveInt(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

/**
 * Trạng thái trang tin tức nằm ở URL, giống hệt cách trang cửa hàng làm
 * (xem `useProductFilters`): link chia sẻ được, F5 không mất bộ lọc, nút Back
 * của trình duyệt hoạt động đúng.
 */
export function usePostFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = useMemo<PostQuery>(
    () => ({
      q: searchParams.get(PARAM.q)?.trim() || undefined,
      category: searchParams.get(PARAM.category) || undefined,
      page: parsePositiveInt(searchParams.get(PARAM.page)) ?? 1,
      limit: POSTS_PER_PAGE,
    }),
    [searchParams],
  )

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)

        for (const [key, value] of Object.entries(updates)) {
          if (!value) next.delete(key)
          else next.set(key, value)
        }

        const touchedFilter = Object.keys(updates).some((key) =>
          (FILTER_KEYS as readonly string[]).includes(key),
        )
        if (touchedFilter) next.delete(PARAM.page)

        return next
      })
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        if (page <= 1) next.delete(PARAM.page)
        else next.set(PARAM.page, String(page))
        return next
      })
    },
    [setSearchParams],
  )

  const setCategory = useCallback(
    (slug: string | undefined) => setParams({ [PARAM.category]: slug }),
    [setParams],
  )

  const setKeyword = useCallback(
    (keyword: string) => setParams({ [PARAM.q]: keyword.trim() || undefined }),
    [setParams],
  )

  const clearAll = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.has(key))

  return { query, setPage, setCategory, setKeyword, clearAll, hasActiveFilters }
}
