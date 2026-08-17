import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import { blogPath } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useLatestPosts, usePostCategories } from '@/hooks/usePosts'

interface PostSidebarProps {
  keyword: string | undefined
  activeCategory: string | undefined
  onSearch: (keyword: string) => void
  onSelectCategory: (slug: string | undefined) => void
}

export default function PostSidebar({
  keyword,
  activeCategory,
  onSearch,
  onSelectCategory,
}: PostSidebarProps) {
  const [draft, setDraft] = useState(keyword ?? '')
  const { data: categories, isLoading: loadingCategories } = usePostCategories()
  const { data: latest, isLoading: loadingLatest } = useLatestPosts(5)

  // Bấm Back hoặc gỡ bộ lọc thì ô tìm kiếm phải đổi theo URL.
  useEffect(() => setDraft(keyword ?? ''), [keyword])

  return (
    <aside className="space-y-6">
      <section className="rounded-xl border border-line p-4">
        <h2 className="mb-3 text-base">Tìm bài viết</h2>
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            onSearch(draft)
          }}
          className="flex gap-2"
        >
          <Input
            aria-label="Từ khoá tìm bài viết"
            placeholder="Nhập từ khoá…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            aria-label="Tìm"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark"
          >
            <Search size={18} />
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-line p-4">
        <h2 className="mb-3 text-base">Chuyên mục</h2>
        {loadingCategories ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-8" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            <li>
              <CategoryButton
                label="Tất cả"
                isActive={!activeCategory}
                onClick={() => onSelectCategory(undefined)}
              />
            </li>
            {(categories ?? []).map((category) => (
              <li key={category.slug}>
                <CategoryButton
                  label={category.name}
                  count={category.count}
                  isActive={activeCategory === category.slug}
                  onClick={() => onSelectCategory(category.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-line p-4">
        <h2 className="mb-3 text-base">Bài mới nhất</h2>
        {loadingLatest ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {(latest ?? []).map((post) => (
              <li key={post.id} className="flex gap-3">
                <img
                  src={post.thumbnail}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0">
                  <Link
                    to={blogPath(post.slug)}
                    className="line-clamp-2 text-sm font-medium transition hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <span className="mt-0.5 block text-xs text-ink-light">
                    {formatDate(post.publishedAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

function CategoryButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition',
        isActive ? 'bg-primary-soft font-semibold text-primary-dark' : 'text-ink hover:bg-surface',
      )}
    >
      {label}
      {count !== undefined && <span className="text-xs text-ink-muted">({count})</span>}
    </button>
  )
}
