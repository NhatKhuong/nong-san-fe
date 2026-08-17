import Rating from '@/components/ui/Rating'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import ReviewForm from './ReviewForm'
import { useProductReviews, useReviewSummary } from '@/hooks/useReviews'
import { formatDate } from '@/lib/format'

const STAR_LEVELS = ['5', '4', '3', '2', '1'] as const

export default function ProductReviews({ productId }: { productId: number }) {
  const { data: reviews, isLoading, error, refetch } = useProductReviews(productId)
  const { data: summary } = useReviewSummary(productId)

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        {summary && summary.total > 0 && (
          <div className="rounded-xl border border-line p-5 text-center">
            <p className="font-heading text-4xl font-bold text-primary">
              {summary.average.toFixed(1)}
            </p>
            <Rating value={summary.average} size={18} className="mt-2 justify-center" />
            <p className="mt-1.5 text-sm text-ink-muted">{summary.total} lượt đánh giá</p>

            <div className="mt-4 space-y-1.5">
              {STAR_LEVELS.map((star) => {
                const count = summary.distribution[star]
                const percent = summary.total > 0 ? (count / summary.total) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-ink-muted">{star} sao</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-alt">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="w-6 text-right text-ink-muted">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <ReviewForm productId={productId} />
      </div>

      <div>
        {error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState
            title="Chưa có đánh giá nào"
            description="Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm này."
          />
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-line p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-dark">
                    {review.authorName.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold">{review.authorName}</span>
                  <Rating value={review.rating} />
                  <time className="ml-auto text-xs text-ink-light" dateTime={review.createdAt}>
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{review.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
