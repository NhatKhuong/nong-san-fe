import { cn } from '@/lib/utils'

/** Khối xám nhấp nháy thay cho spinner trong lúc chờ dữ liệu. */
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-alt', className)} />
}

/** Bộ khung sẵn cho một thẻ sản phẩm, dùng ở lưới sản phẩm khi đang tải. */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}
