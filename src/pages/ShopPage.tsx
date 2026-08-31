import { useState } from 'react'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import FilterSidebar from '@/components/filter/FilterSidebar'
import ActiveFilterChips from '@/components/filter/ActiveFilterChips'
import ProductGrid from '@/components/product/ProductGrid'
import ProductListItem from '@/components/product/ProductListItem'
import ProductQuickView from '@/components/product/ProductQuickView'
import { useProductFilters } from '@/hooks/useProductFilters'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import SeoMeta from '@/components/ui/SeoMeta'
import type { Product, ProductSort } from '@/types'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'best_selling', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá: thấp đến cao' },
  { value: 'price_desc', label: 'Giá: cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
]

export default function ShopPage() {
  const { query, view, setParams, setPage, setView, clearFilter, clearAll, hasActiveFilters } =
    useProductFilters()
  const { data, isLoading, error, refetch } = useProducts(query)
  const { data: categories } = useCategories()

  const [isFilterOpen, setFilterOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const currentCategory = categories?.find((item) => item.slug === query.category)

  const filterSidebar = (
    <FilterSidebar
      query={query}
      hasActiveFilters={hasActiveFilters}
      setParams={setParams}
      clearAll={clearAll}
    />
  )

  return (
    <>
      <SeoMeta
        title="Cửa hàng"
        description="Rau củ, trái cây, thịt và thực phẩm hữu cơ đạt chuẩn — lọc theo danh mục, giá và đánh giá."
      />

      <Breadcrumb
        items={[
          { label: 'Cửa hàng', path: ROUTES.SHOP },
          ...(currentCategory ? [{ label: currentCategory.name }] : []),
        ]}
      />

      <div className="container-app py-8">
        <h1 className="mb-6 text-2xl sm:text-3xl">
          {currentCategory?.name ?? (query.q ? `Kết quả cho "${query.q}"` : 'Tất cả sản phẩm')}
        </h1>

        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">{filterSidebar}</aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-surface px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterOpen(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Bộ lọc
              </Button>

              {/* Dùng <div> chứ không phải <p>: `Skeleton` render ra <div>, mà <div>
                  lồng trong <p> là HTML không hợp lệ và React sẽ báo lỗi ra console. */}
              <div className="text-sm text-ink-muted">
                {isLoading ? (
                  <Skeleton className="inline-block h-4 w-28 align-middle" />
                ) : (
                  <>
                    Tìm thấy <strong className="text-ink">{data?.total ?? 0}</strong> sản phẩm
                  </>
                )}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Select
                  aria-label="Sắp xếp sản phẩm"
                  options={SORT_OPTIONS}
                  value={query.sort}
                  onChange={(event) => setParams({ sort: event.target.value })}
                  wrapperClassName="w-44"
                  className="h-9 text-sm"
                />

                <div className="hidden items-center gap-1 sm:flex">
                  <ViewToggle
                    isActive={view === 'grid'}
                    onClick={() => setView('grid')}
                    label="Xem dạng lưới"
                    icon={LayoutGrid}
                  />
                  <ViewToggle
                    isActive={view === 'list'}
                    onClick={() => setView('list')}
                    label="Xem dạng danh sách"
                    icon={List}
                  />
                </div>
              </div>
            </div>

            <ActiveFilterChips
              query={query}
              categories={categories}
              onRemove={clearFilter}
              onClearAll={clearAll}
            />

            {/*
              Tên sản phẩm trong thẻ là `<h3>`. Không có `<h2>` ở giữa thì thứ tự
              tiêu đề nhảy từ `<h1>` xuống thẳng `<h3>`, trình đọc màn hình sẽ báo
              thiếu một cấp. Tiêu đề này ẩn về mặt thị giác vì phần trên đã nói rõ
              đang xem gì.
            */}
            <h2 className="sr-only">Danh sách sản phẩm</h2>

            {error ? (
              <ErrorState message={error.message} onRetry={() => refetch()} />
            ) : !isLoading && data && data.items.length === 0 ? (
              <EmptyState
                title="Không có sản phẩm nào khớp bộ lọc"
                description="Thử nới rộng khoảng giá hoặc bỏ bớt điều kiện lọc."
                action={
                  hasActiveFilters ? (
                    <Button variant="outline" onClick={clearAll}>
                      Xoá bộ lọc
                    </Button>
                  ) : undefined
                }
              />
            ) : view === 'list' ? (
              <ListView products={data?.items} isLoading={isLoading} onQuickView={setQuickViewProduct} />
            ) : (
              <ProductGrid
                products={data?.items}
                isLoading={isLoading}
                columns={3}
                skeletonCount={query.limit}
                onQuickView={setQuickViewProduct}
              />
            )}

            {data && data.totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setFilterOpen(false)}
        title="Bộ lọc sản phẩm"
        side="left"
      >
        {filterSidebar}
      </Drawer>

      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  )
}

interface ViewToggleProps {
  isActive: boolean
  onClick: () => void
  label: string
  icon: React.ComponentType<{ size?: number }>
}

function ViewToggle({ isActive, onClick, label, icon: Icon }: ViewToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg transition',
        isActive ? 'bg-primary text-white' : 'text-ink-muted hover:bg-white hover:text-primary',
      )}
    >
      <Icon size={17} />
    </button>
  )
}

interface ListViewProps {
  products: Product[] | undefined
  isLoading: boolean
  onQuickView: (product: Product) => void
}

function ListView({ products, isLoading, onQuickView }: ListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl sm:h-48" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products?.map((product) => (
        <ProductListItem key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  )
}
