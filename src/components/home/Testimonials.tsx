import { Quote } from 'lucide-react'
import Carousel from '@/components/ui/Carousel'
import Rating from '@/components/ui/Rating'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { useTestimonials } from '@/hooks/useMarketing'
import type { Testimonial } from '@/types'

export default function Testimonials() {
  const { data, isLoading, error, refetch } = useTestimonials()

  return (
    <section className="bg-surface py-14">
      <div className="container-app">
        <SectionHeading
          title="Khách hàng nói gì"
          description="Hơn 12.000 gia đình đang tin dùng nông sản của chúng tôi."
          align="center"
        />

        {error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : (
          <Carousel<Testimonial>
            items={data ?? []}
            getKey={(item) => item.id}
            perView={{ base: 1, md: 2, lg: 3 }}
            autoplayMs={6000}
            showPagination
            renderItem={(item) => (
              <figure className="flex h-full flex-col rounded-xl bg-white p-6">
                <Quote size={28} className="text-primary-light" aria-hidden="true" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {item.content}
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <img
                    src={item.avatar}
                    alt={item.authorName}
                    loading="lazy"
                    className="size-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.authorName}</p>
                    <p className="text-xs text-ink-muted">{item.authorRole}</p>
                  </div>
                  <Rating value={item.rating} className="ml-auto" />
                </figcaption>
              </figure>
            )}
          />
        )}
      </div>
    </section>
  )
}
