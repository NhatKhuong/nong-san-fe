import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Rút gọn dải trang khi có quá nhiều trang: 1 … 4 5 6 … 20.
 * Luôn giữ trang đầu, trang cuối và 1 trang kề hai bên trang hiện tại.
 */
function buildPageList(currentPage: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage])
  if (currentPage - 1 > 1) pages.add(currentPage - 1)
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1)

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'gap')[] = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('gap')
    result.push(page)
  })

  return result
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
        className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page, index) =>
        page === 'gap' ? (
          <span key={`gap-${index}`} className="px-1 text-ink-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'size-10 rounded-full border text-sm font-semibold transition',
              page === currentPage
                ? 'border-primary bg-primary text-white'
                : 'border-line text-ink hover:border-primary hover:text-primary',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
        className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
