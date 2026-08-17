import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchSuggestions } from '@/hooks/useProducts'
import { ROUTES, productPath } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Ô tìm kiếm có dropdown gợi ý, điều hướng được bằng bàn phím. */
export default function SearchBox({ className }: { className?: string }) {
  const [keyword, setKeyword] = useState('')
  const [isOpen, setOpen] = useState(false)
  /** -1 = chưa chọn gợi ý nào, Enter sẽ tìm theo từ khoá thay vì mở sản phẩm. */
  const [highlighted, setHighlighted] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const debouncedKeyword = useDebounce(keyword, 350)
  const { data: suggestions, isFetching } = useSearchSuggestions(debouncedKeyword)

  const items = suggestions ?? []

  // Bấm ra ngoài thì đóng dropdown.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Từ khoá đổi thì bỏ mục đang tô sáng, tránh Enter mở nhầm sản phẩm cũ.
  useEffect(() => {
    setHighlighted(-1)
  }, [debouncedKeyword])

  function goToSearchPage() {
    const trimmed = keyword.trim()
    if (!trimmed) return
    setOpen(false)
    navigate(`${ROUTES.SHOP}?q=${encodeURIComponent(trimmed)}`)
  }

  function openProduct(slug: string) {
    setOpen(false)
    setKeyword('')
    navigate(productPath(slug))
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!isOpen || items.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((index) => (index + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((index) => (index <= 0 ? items.length - 1 : index - 1))
    } else if (event.key === 'Enter' && highlighted >= 0) {
      event.preventDefault()
      openProduct(items[highlighted].slug)
    }
  }

  const showDropdown = isOpen && debouncedKeyword.trim().length >= 2

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          goToSearchPage()
        }}
      >
        <div className="flex items-center rounded-full border border-line bg-surface pr-1 focus-within:border-primary">
          <input
            type="search"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Bạn muốn tìm nông sản gì?"
            aria-label="Tìm kiếm sản phẩm"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-ink-light"
          />
          <button
            type="submit"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
            aria-label="Tìm kiếm"
          >
            {isFetching ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
        >
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              {isFetching ? 'Đang tìm…' : `Không tìm thấy sản phẩm nào cho "${debouncedKeyword}"`}
            </p>
          ) : (
            <>
              <ul>
                {items.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === highlighted}
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => openProduct(product.slug)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition',
                        index === highlighted ? 'bg-primary-soft' : 'hover:bg-surface',
                      )}
                    >
                      <img
                        src={product.images[0]}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="size-11 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="block text-sm font-semibold text-primary">
                          {formatVND(product.salePrice ?? product.price)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={goToSearchPage}
                className="w-full border-t border-line px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface"
              >
                Xem tất cả kết quả cho "{debouncedKeyword}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
