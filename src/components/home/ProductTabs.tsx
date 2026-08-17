import { useState } from 'react'
import SectionHeading from '@/components/ui/SectionHeading'
import ProductGrid from '@/components/product/ProductGrid'
import Skeleton from '@/components/ui/Skeleton'
import { useRootCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { shopByCategoryPath } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { Link } from 'react-router-dom'

/** Số danh mục hiển thị làm tab; còn lại xem ở trang cửa hàng. */
const MAX_TABS = 5

export default function ProductTabs() {
  const { data: categories, isLoading: isLoadingCategories } = useRootCategories()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const tabs = categories?.slice(0, MAX_TABS) ?? []
  // Chưa bấm tab nào thì mặc định lấy danh mục đầu tiên.
  const currentSlug = activeSlug ?? tabs[0]?.slug

  const { data, isLoading, error, refetch } = useProducts({
    category: currentSlug,
    limit: 8,
    sort: 'newest',
  })

  return (
    <section className="bg-surface py-14">
      <div className="container-app">
        <SectionHeading
          title="Thực phẩm hữu cơ"
          description="Chọn nhóm sản phẩm để xem hàng mới về."
          align="center"
        />

        <div
          role="tablist"
          aria-label="Lọc sản phẩm theo danh mục"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {isLoadingCategories
            ? Array.from({ length: MAX_TABS }, (_, index) => (
                <Skeleton key={index} className="h-10 w-28 rounded-full" />
              ))
            : tabs.map((category) => {
                const isActive = category.slug === currentSlug
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveSlug(category.slug)}
                    className={cn(
                      'h-10 rounded-full px-5 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-white text-ink hover:bg-primary-soft hover:text-primary-dark',
                    )}
                  >
                    {category.name}
                  </button>
                )
              })}
        </div>

        <ProductGrid
          products={data?.items}
          isLoading={isLoading || isLoadingCategories}
          error={error}
          onRetry={() => refetch()}
          columns={4}
          skeletonCount={8}
          emptyTitle="Danh mục này chưa có sản phẩm"
          emptyDescription="Chọn một danh mục khác hoặc xem toàn bộ cửa hàng."
        />

        {currentSlug && (
          <div className="mt-9 text-center">
            <Link
              to={shopByCategoryPath(currentSlug)}
              className={buttonStyles('outline', 'md')}
            >
              Xem tất cả sản phẩm nhóm này
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
