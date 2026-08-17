import { X } from 'lucide-react'
import { formatVND } from '@/lib/format'
import type { Category, ProductQuery } from '@/types'

/** Khoá bộ lọc mà chip có thể gỡ — khớp với `FILTER_KEYS` trong useProductFilters. */
type ChipKey = 'q' | 'category' | 'minPrice' | 'minRating' | 'inStock' | 'onSale'

interface ActiveFilterChipsProps {
  query: ProductQuery
  categories: Category[] | undefined
  onRemove: (key: ChipKey) => void
  onClearAll: () => void
}

export default function ActiveFilterChips({
  query,
  categories,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: { key: ChipKey; label: string }[] = []

  if (query.q) chips.push({ key: 'q', label: `Từ khoá: "${query.q}"` })

  if (query.category) {
    const name = categories?.find((item) => item.slug === query.category)?.name ?? query.category
    chips.push({ key: 'category', label: name })
  }

  // Giá là một cặp min–max nên gộp thành một chip duy nhất.
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const from = query.minPrice !== undefined ? formatVND(query.minPrice) : 'thấp nhất'
    const to = query.maxPrice !== undefined ? formatVND(query.maxPrice) : 'cao nhất'
    chips.push({ key: 'minPrice', label: `Giá: ${from} – ${to}` })
  }

  if (query.minRating !== undefined) {
    chips.push({ key: 'minRating', label: `Từ ${query.minRating} sao` })
  }
  if (query.inStockOnly) chips.push({ key: 'inStock', label: 'Còn hàng' })
  if (query.onSaleOnly) chips.push({ key: 'onSale', label: 'Đang giảm giá' })

  if (chips.length === 0) return null

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-sm text-ink-muted">Đang lọc:</span>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip.key)}
          aria-label={`Bỏ lọc ${chip.label}`}
          className="flex items-center gap-1.5 rounded-full bg-primary-soft py-1.5 pr-2 pl-3 text-sm font-medium text-primary-dark transition hover:bg-primary hover:text-white"
        >
          {chip.label}
          <X size={14} aria-hidden="true" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
      >
        Xoá tất cả
      </button>
    </div>
  )
}
