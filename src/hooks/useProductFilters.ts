import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'
import type { ProductQuery, ProductSort } from '@/types'

export type ShopView = 'grid' | 'list'

const SORT_VALUES: ProductSort[] = [
  'newest',
  'price_asc',
  'price_desc',
  'best_selling',
  'rating',
]

/** Khoá dùng trên URL — đặt tên ngắn gọn cho link dễ đọc. */
const PARAM = {
  q: 'q',
  category: 'category',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  minRating: 'minRating',
  inStock: 'inStock',
  onSale: 'onSale',
  sort: 'sort',
  page: 'page',
  view: 'view',
} as const

/** Các khoá là bộ lọc thực sự — đổi bất kỳ khoá nào trong đây thì phải reset về trang 1. */
const FILTER_KEYS = [
  PARAM.q,
  PARAM.category,
  PARAM.minPrice,
  PARAM.maxPrice,
  PARAM.minRating,
  PARAM.inStock,
  PARAM.onSale,
] as const

/** Parse số nguyên dương; trả undefined nếu rác (`?page=abc`) thay vì để NaN lọt xuống. */
function parsePositiveInt(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : undefined
}

function parseMoney(raw: string | null): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : undefined
}

/** Rating chỉ nhận 1–5; giá trị ngoài khoảng bị bỏ qua. */
function parseRating(raw: string | null): number | undefined {
  const value = Number(raw)
  return raw && Number.isFinite(value) && value >= 1 && value <= 5 ? value : undefined
}

function parseBool(raw: string | null): boolean | undefined {
  return raw === '1' ? true : undefined
}

function parseSort(raw: string | null): ProductSort | undefined {
  return raw && (SORT_VALUES as string[]).includes(raw) ? (raw as ProductSort) : undefined
}

export interface ActiveFilter {
  key: (typeof FILTER_KEYS)[number]
  label: string
}

/**
 * Nguồn chân lý duy nhất cho trạng thái trang cửa hàng: URL.
 * Nhờ vậy link chia sẻ được, F5 không mất bộ lọc, nút Back của trình duyệt hoạt động đúng.
 */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = useMemo<ProductQuery>(() => {
    const minPrice = parseMoney(searchParams.get(PARAM.minPrice))
    const maxPrice = parseMoney(searchParams.get(PARAM.maxPrice))

    return {
      q: searchParams.get(PARAM.q)?.trim() || undefined,
      category: searchParams.get(PARAM.category) || undefined,
      // Nếu người dùng nhập ngược (min > max) thì bỏ qua cả cặp, tránh trả về lưới rỗng khó hiểu.
      minPrice: maxPrice !== undefined && minPrice !== undefined && minPrice > maxPrice
        ? undefined
        : minPrice,
      maxPrice: maxPrice !== undefined && minPrice !== undefined && minPrice > maxPrice
        ? undefined
        : maxPrice,
      minRating: parseRating(searchParams.get(PARAM.minRating)),
      inStockOnly: parseBool(searchParams.get(PARAM.inStock)),
      onSaleOnly: parseBool(searchParams.get(PARAM.onSale)),
      sort: parseSort(searchParams.get(PARAM.sort)) ?? 'newest',
      page: parsePositiveInt(searchParams.get(PARAM.page)) ?? 1,
      limit: PRODUCTS_PER_PAGE,
    }
  }, [searchParams])

  const view: ShopView = searchParams.get(PARAM.view) === 'list' ? 'list' : 'grid'

  /**
   * Ghi nhiều khoá cùng lúc.
   * `replace` dùng cho thanh trượt giá — nếu không, mỗi bước kéo tạo một mục lịch sử
   * và người dùng phải bấm Back hàng chục lần mới thoát được trang.
   */
  const setParams = useCallback(
    (updates: Record<string, string | number | boolean | undefined>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)

          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === '' || value === false) {
              next.delete(key)
            } else {
              next.set(key, value === true ? '1' : String(value))
            }
          }

          // Đổi bộ lọc thì luôn quay về trang 1, nếu không sẽ rơi vào trang trống.
          const touchedFilter = Object.keys(updates).some((key) =>
            (FILTER_KEYS as readonly string[]).includes(key),
          )
          if (touchedFilter) next.delete(PARAM.page)

          return next
        },
        { replace },
      )
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

  const setView = useCallback(
    (nextView: ShopView) => setParams({ [PARAM.view]: nextView === 'list' ? 'list' : undefined }),
    [setParams],
  )

  const clearFilter = useCallback(
    (key: (typeof FILTER_KEYS)[number]) => {
      // Giá là một cặp — gỡ chip "khoảng giá" phải xoá cả hai đầu.
      if (key === PARAM.minPrice || key === PARAM.maxPrice) {
        setParams({ [PARAM.minPrice]: undefined, [PARAM.maxPrice]: undefined })
        return
      }
      setParams({ [key]: undefined })
    },
    [setParams],
  )

  /** Xoá hết bộ lọc nhưng giữ nguyên chế độ xem và cách sắp xếp. */
  const clearAll = useCallback(() => {
    setSearchParams((previous) => {
      const next = new URLSearchParams()
      const sort = previous.get(PARAM.sort)
      const currentView = previous.get(PARAM.view)
      if (sort) next.set(PARAM.sort, sort)
      if (currentView) next.set(PARAM.view, currentView)
      return next
    })
  }, [setSearchParams])

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.has(key))

  return {
    query,
    view,
    searchParams,
    setParams,
    setPage,
    setView,
    clearFilter,
    clearAll,
    hasActiveFilters,
  }
}
