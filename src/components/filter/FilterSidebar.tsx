import CategoryFilter from './CategoryFilter'
import PriceRangeSlider from './PriceRangeSlider'
import RatingFilter from './RatingFilter'
import AvailabilityFilter from './AvailabilityFilter'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { usePriceRange } from '@/hooks/useProducts'
import type { ProductQuery } from '@/types'

interface FilterSidebarProps {
  query: ProductQuery
  hasActiveFilters: boolean
  /** `replace` = true khi ghi URL từ thanh trượt giá, để không làm ngập lịch sử trình duyệt. */
  setParams: (
    updates: Record<string, string | number | boolean | undefined>,
    replace?: boolean,
  ) => void
  clearAll: () => void
}

/** Toàn bộ bộ lọc trang cửa hàng. Dùng chung cho sidebar desktop và drawer mobile. */
export default function FilterSidebar({
  query,
  hasActiveFilters,
  setParams,
  clearAll,
}: FilterSidebarProps) {
  const { data: priceRange, isLoading: isLoadingPrice } = usePriceRange()

  return (
    <div className="space-y-7">
      <FilterGroup title="Danh mục">
        <CategoryFilter
          value={query.category}
          onChange={(slug) => setParams({ category: slug })}
        />
      </FilterGroup>

      <FilterGroup title="Khoảng giá">
        {isLoadingPrice || !priceRange ? (
          <Skeleton className="h-14" />
        ) : (
          <PriceRangeSlider
            min={priceRange.min}
            max={priceRange.max}
            value={{
              min: query.minPrice ?? priceRange.min,
              max: query.maxPrice ?? priceRange.max,
            }}
            onCommit={(next) =>
              setParams(
                {
                  // Trùng với biên thì bỏ hẳn khỏi URL cho link gọn.
                  minPrice: next.min > priceRange.min ? next.min : undefined,
                  maxPrice: next.max < priceRange.max ? next.max : undefined,
                },
                true,
              )
            }
          />
        )}
      </FilterGroup>

      <FilterGroup title="Đánh giá">
        <RatingFilter
          value={query.minRating}
          onChange={(rating) => setParams({ minRating: rating })}
        />
      </FilterGroup>

      <FilterGroup title="Tình trạng">
        <AvailabilityFilter
          inStockOnly={query.inStockOnly ?? false}
          onSaleOnly={query.onSaleOnly ?? false}
          onChange={(next) =>
            setParams({
              inStock: next.inStockOnly,
              onSale: next.onSaleOnly,
            })
          }
        />
      </FilterGroup>

      {hasActiveFilters && (
        <Button variant="outline" fullWidth onClick={clearAll}>
          Xoá tất cả bộ lọc
        </Button>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-base">{title}</h3>
      {children}
    </section>
  )
}
