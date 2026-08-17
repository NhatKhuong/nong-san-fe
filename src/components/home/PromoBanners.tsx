import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { shopByCategoryPath } from '@/lib/constants'
import { cn } from '@/lib/utils'

const BANNERS = [
  {
    eyebrow: 'Ưu đãi 50%',
    title: 'Rau củ tươi mỗi sáng',
    image:
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&h=600&fit=crop&q=80',
    path: shopByCategoryPath('rau-cu'),
    /** Banner lớn chiếm 2 cột ở desktop. */
    wide: true,
  },
  {
    eyebrow: 'Giảm 30%',
    title: 'Trái cây theo mùa',
    image:
      'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&h=400&fit=crop&q=80',
    path: shopByCategoryPath('trai-cay-hat'),
    wide: false,
  },
  {
    eyebrow: 'Giảm 30%',
    title: 'Nước ép hữu cơ',
    image:
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=600&h=400&fit=crop&q=80',
    path: shopByCategoryPath('nuoc-ep'),
    wide: false,
  },
]

export default function PromoBanners() {
  return (
    <section className="bg-white pb-14">
      <div className="container-app grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BANNERS.map((banner) => (
          <Link
            key={banner.title}
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
