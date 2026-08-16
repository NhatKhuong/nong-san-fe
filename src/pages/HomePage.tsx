import SectionHeading from '@/components/ui/SectionHeading'
import ProductGrid from '@/components/product/ProductGrid'
import { useProducts } from '@/hooks/useProducts'
import { ROUTES } from '@/lib/constants'

// TẠM THỜI: dùng để kiểm tra ProductCard ở Giai đoạn 3.
// Sẽ được thay bằng 12 section đầy đủ ở Giai đoạn 4.
export default function HomePage() {
  const { data, isLoading, error, refetch } = useProducts({ limit: 10, sort: 'newest' })

  return (
    <div className="container-app py-10">
      <SectionHeading
        title="Sản phẩm mới nhất"
        description="Kiểm tra hiển thị ProductCard: có giảm giá, hết hàng, và thanh tiến trình đã bán."
        viewAllPath={ROUTES.SHOP}
      />
      <ProductGrid
        products={data?.items}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        columns={5}
        skeletonCount={10}
        showSoldProgress
      />
    </div>
  )
}
