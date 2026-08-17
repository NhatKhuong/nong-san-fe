import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export interface CarouselBreakpoints {
  /** Số slide hiển thị ở mobile (< 640px). */
  base: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

interface CarouselProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  getKey: (item: T) => React.Key
  perView?: CarouselBreakpoints
  /** Bật tự chạy; đơn vị ms. Bỏ qua thì không tự chạy. */
  autoplayMs?: number
  showNavigation?: boolean
  showPagination?: boolean
  spaceBetween?: number
  className?: string
}

/**
 * Bọc Swiper một lần cho toàn dự án — các section chỉ truyền dữ liệu và cách render.
 * Nút điều hướng dùng class riêng để style theo design token thay vì CSS mặc định của Swiper.
 */
export default function Carousel<T>({
  items,
  renderItem,
  getKey,
  perView = { base: 2, md: 3, lg: 4 },
  autoplayMs,
  showNavigation = true,
  showPagination = false,
  spaceBetween = 20,
  className,
}: CarouselProps<T>) {
  // Tắt tự chạy khi người dùng đã bật "giảm chuyển động" — nút điều hướng vẫn dùng được.
  const prefersReducedMotion = usePrefersReducedMotion()
  const isAutoplayOn = Boolean(autoplayMs) && !prefersReducedMotion

  const modules = [Navigation, Pagination]
  if (isAutoplayOn) modules.push(Autoplay)

  return (
    <div className={cn('group/carousel relative', className)}>
      <Swiper
        modules={modules}
        spaceBetween={spaceBetween}
        slidesPerView={perView.base}
        breakpoints={{
          640: { slidesPerView: perView.sm ?? perView.base },
          768: { slidesPerView: perView.md ?? perView.sm ?? perView.base },
          1024: { slidesPerView: perView.lg ?? perView.md ?? perView.base },
          1280: { slidesPerView: perView.xl ?? perView.lg ?? perView.base },
        }}
        autoplay={isAutoplayOn ? { delay: autoplayMs, disableOnInteraction: false } : false}
        navigation={
          showNavigation
            ? { prevEl: '.carousel-prev', nextEl: '.carousel-next' }
            : false
        }
        pagination={showPagination ? { clickable: true } : false}
        className={cn(showPagination && '!pb-11')}
      >
        {items.map((item) => (
          <SwiperSlide key={getKey(item)} className="!h-auto">
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>

      {showNavigation && (
        <>
          <CarouselButton direction="prev" />
          <CarouselButton direction="next" />
        </>
      )}
    </div>
  )
}

function CarouselButton({ direction }: { direction: 'prev' | 'next' }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Xem mục trước' : 'Xem mục tiếp theo'}
      className={cn(
        `carousel-${direction}`,
        'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center',
        'rounded-full border border-line bg-white text-ink shadow-md transition',
        'hover:border-primary hover:bg-primary hover:text-white',
        'disabled:cursor-not-allowed disabled:opacity-0',
        'lg:flex',
        direction === 'prev' ? '-left-4' : '-right-4',
      )}
    >
      <Icon size={19} />
    </button>
  )
}
