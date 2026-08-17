import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { usePromoBanners } from '@/hooks/useMarketing'
import { cn } from '@/lib/utils'

export default function PromoBanners() {
  const { data: banners, isLoading, error } = usePromoBanners()

  // Khối thuần trang trí — lỗi thì ẩn luôn thay vì chiếm chỗ bằng thông báo.
  if (error) return null

  return (
    <section className="bg-white pb-14">
      <div className="container-app grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={index}
                className={cn('h-56 rounded-xl', index === 0 && 'sm:col-span-2')}
              />
            ))
          : banners?.map((banner) => (
              <Link
                key={banner.id}
                to={banner.path}
                className={cn(
                  'group relative flex h-56 items-center overflow-hidden rounded-xl',
                  banner.wide && 'sm:col-span-2',
                )}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/10" />

                <div className="relative p-6 text-white">
                  <p className="text-sm font-semibold text-primary-light">{banner.eyebrow}</p>
                  <h3 className="mt-1.5 font-heading text-xl font-bold text-white">
                    {banner.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-3">
                    Mua ngay
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  )
}
