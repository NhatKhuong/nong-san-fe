import SectionHeading from '@/components/ui/SectionHeading'
import ProductGrid from '@/components/product/ProductGrid'
import { useProducts } from '@/hooks/useProducts'
import { ROUTES } from '@/lib/constants'

export default function BestSellers() {
  const { data, isLoading, error, refetch } = useProducts({
    isBestSeller: true,
    sort: 'best_selling',
    limit: 8,
  })

  return (
    <section className="bg-white py-14">
      <div className="container-app">
        <SectionHeading
          title="Sản phẩm bán chạy"
          description="Được khách hàng đặt lại nhiều nhất trong 30 ngày qua."
          viewAllPath={`${ROUTES.SHOP}?sort=best_selling`}
        />

        <ProductGrid
          products={data?.items}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          columns={4}
          skeletonCount={8}
          showSoldProgress
        />
      </div>
    </section>
  )
}
