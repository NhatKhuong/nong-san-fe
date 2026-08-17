import Carousel from '@/components/ui/Carousel'
import Skeleton from '@/components/ui/Skeleton'
import { useBrands } from '@/hooks/useMarketing'
import type { Brand } from '@/types'

/** Dải logo đối tác — thuần trang trí nên không cần error state riêng, lỗi thì ẩn luôn. */
export default function BrandLogos() {
  const { data, isLoading, error } = useBrands()

  if (error) return null

  return (
    <section className="border-y border-line bg-white py-10">
      <div className="container-app">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-6 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : (
          <Carousel<Brand>
            items={data ?? []}
            getKey={(brand) => brand.id}
            perView={{ base: 2, sm: 3, md: 4, lg: 6 }}
            autoplayMs={3500}
            showNavigation={false}
            spaceBetween={24}
            renderItem={(brand) => (
              <img
                src={brand.logo}
                alt={brand.name}
                loading="lazy"
                className="h-14 w-full object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            )}
          />
        )}
      </div>
    </section>
  )
}
