import Carousel from '@/components/ui/Carousel'
import SectionHeading from '@/components/ui/SectionHeading'
import ProductCard from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useProducts } from '@/hooks/useProducts'
import { ROUTES } from '@/lib/constants'
import type { Product } from '@/types'

export default function SaleSection() {
  const { data, isLoading, error, refetch } = useProducts({
    onSaleOnly: true,
    sort: 'best_selling',
    limit: 10,
  })

  return (
    <section className="bg-white py-14">
      <div className="container-app">
        <SectionHeading
          title="Đang giảm giá"
          description="Ưu đãi thay đổi mỗi tuần — nhanh tay trước khi hết hàng."
          viewAllPath={`${ROUTES.SHOP}?onSale=true`}
        />

        {error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Hiện chưa có chương trình giảm giá"
            description="Ghé lại sau nhé, ưu đãi mới được cập nhật hằng tuần."
          />
        ) : (
          <Carousel<Product>
            items={data.items}
            getKey={(product) => product.id}
            renderItem={(product) => <ProductCard product={product} className="h-full" />}
            perView={{ base: 2, md: 3, lg: 4, xl: 5 }}
          />
        )}
      </div>
    </section>
  )
}
