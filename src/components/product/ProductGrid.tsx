import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[] | undefined
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  /** Số cột ở breakpoint lớn nhất. */
  columns?: 3 | 4 | 5
  /** Số skeleton hiển thị khi đang tải. */
  skeletonCount?: number
  showSoldProgress?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  className?: string
}

const COLUMN_CLASSES: Record<3 | 4 | 5, string> = {
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
}

/** Lưới sản phẩm xử lý sẵn cả 3 nhánh loading / error / empty theo quy tắc trong CLAUDE.md. */
export default function ProductGrid({
  products,
  isLoading = false,
  error = null,
  onRetry,
  columns = 4,
  skeletonCount = 8,
  showSoldProgress = false,
  emptyTitle = 'Không tìm thấy sản phẩm nào',
  emptyDescription = 'Thử bỏ bớt bộ lọc hoặc tìm với từ khoá khác.',
  emptyAction,
  className,
}: ProductGridProps) {
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 sm:gap-5', COLUMN_CLASSES[columns], className)}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    )
  }

  return (
    <div className={cn('grid gap-4 sm:gap-5', COLUMN_CLASSES[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showSoldProgress={showSoldProgress}
        />
      ))}
    </div>
  )
}
