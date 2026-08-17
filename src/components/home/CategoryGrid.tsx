import { Link } from 'react-router-dom'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { useRootCategories } from '@/hooks/useCategories'
import { ROUTES, shopByCategoryPath } from '@/lib/constants'

export default function CategoryGrid() {
  const { data: categories, isLoading, error, refetch } = useRootCategories()

  return (
    <section className="bg-surface py-14">
      <div className="container-app">
        <SectionHeading
          title="Mua sắm theo danh mục"
          description="Từ rau củ tươi hái trong ngày đến thịt cá sạch — chọn nhanh nhóm bạn cần."
          viewAllPath={ROUTES.SHOP}
        />

        {error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {isLoading
              ? Array.from({ length: 7 }, (_, index) => (
                  <Skeleton key={index} className="h-44 rounded-xl" />
                ))
              : categories?.map((category) => (
                  <Link
                    key={category.id}
                    to={shopByCategoryPath(category.slug)}
                    className="group flex flex-col items-center rounded-xl bg-white p-4 text-center transition hover:shadow-lg"
                  >
                    <span className="size-20 overflow-hidden rounded-full">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    </span>
                    <h3 className="mt-3 text-sm leading-snug transition group-hover:text-primary">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-ink-muted">
                      {category.productCount} sản phẩm
                    </p>
                  </Link>
                ))}
          </div>
        )}
      </div>
    </section>
  )
}
