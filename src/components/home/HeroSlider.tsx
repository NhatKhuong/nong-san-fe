import { Link } from 'react-router-dom'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ArrowRight } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useHeroSlides } from '@/hooks/useMarketing'

import 'swiper/css'
import 'swiper/css/pagination'

/**
 * Banner đầu trang. Ảnh ở đây là above-the-fold nên KHÔNG dùng `loading="lazy"`
 * — slide đầu tiên được ưu tiên tải để tránh khoảng trắng khi mở trang.
 */
export default function HeroSlider() {
  const { data: slides, isLoading } = useHeroSlides()

  if (isLoading) return <Skeleton className="h-[380px] rounded-none sm:h-[460px] lg:h-[540px]" />
  if (!slides || slides.length === 0) return null

  return (
    <section aria-label="Giới thiệu nổi bật">
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className="hero-swiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[380px] sm:h-[460px] lg:h-[540px]">
              <img
                src={slide.image}
                alt={slide.title}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="absolute inset-0 size-full object-cover"
              />
              {/* Lớp phủ tối để chữ trắng luôn đủ tương phản dù ảnh nền sáng hay tối */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />

              <div className="relative flex h-full items-center">
                <div className="container-app">
                  <div className="max-w-xl text-white">
                    <p className="text-sm font-semibold tracking-wider text-primary-light uppercase">
                      {slide.eyebrow}
                    </p>
                    <h1 className="mt-3 font-heading text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                    <p className="mt-4 text-base text-white/90 sm:text-lg">
                      {slide.description}
                    </p>
                    <Link to={slide.ctaPath} className={buttonStyles('primary', 'lg', 'mt-7')}>
                      {slide.ctaLabel}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
