import PostCard from '@/components/blog/PostCard'
import PostSidebar from '@/components/blog/PostSidebar'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { usePostFilters } from '@/hooks/usePostFilters'
import SeoMeta from '@/components/ui/SeoMeta'
import { usePostCategories, usePosts } from '@/hooks/usePosts'

export default function BlogPage() {
  const { query, setPage, setCategory, setKeyword, clearAll, hasActiveFilters } = usePostFilters()
  const { data, isLoading, error, refetch } = usePosts(query)
  const { data: categories } = usePostCategories()

  const activeCategoryName = categories?.find(
    (category) => category.slug === query.category,
  )?.name

  return (
    <>
      <SeoMeta
        title="Tin tức"
        description="Kiến thức về thực phẩm hữu cơ, mẹo chọn và bảo quản nông sản, chuyện hậu trường từ nông trại."
      />

      <Breadcrumb items={[{ label: 'Tin tức' }]} />

      <div className="container-app py-8">
        <h1 className="text-2xl sm:text-3xl">
          {activeCategoryName ?? 'Tin tức'}
        </h1>
        <p className="mt-2 text-ink-muted">
          Mẹo chọn thực phẩm, cách bảo quản và chuyện hậu trường từ nông trại.
        </p>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            {error ? (
              <ErrorState message={error.message} onRetry={() => refetch()} />
            ) : isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                title="Không tìm thấy bài viết nào"
                description={
                  query.q
                    ? `Không có bài nào khớp với từ khoá "${query.q}".`
                    : 'Chuyên mục này chưa có bài viết.'
                }
                action={
                  hasActiveFilters ? (
                    <Button onClick={clearAll}>Xoá bộ lọc</Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <p className="mb-4 text-sm text-ink-muted">
                  Tìm thấy <strong className="text-ink">{data.total}</strong> bài viết
                </p>

                <h2 className="sr-only">Danh sách bài viết</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {data.items.map((post, index) => (
                    <PostCard key={post.id} post={post} eager={index < 2} />
                  ))}
                </div>

                <div className="mt-8">
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(page) => {
                      setPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <PostSidebar
            keyword={query.q}
            activeCategory={query.category}
            onSearch={setKeyword}
            onSelectCategory={setCategory}
          />
        </div>
      </div>
    </>
  )
}
