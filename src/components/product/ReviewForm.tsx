import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { useCreateReview } from '@/hooks/useReviews'
import { useCurrentUser } from '@/hooks/useAuth'
import { applyServerFieldErrors, hasServerFieldError } from '@/lib/fieldErrors'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const reviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập tên từ 2 ký tự trở lên.')
    .max(50, 'Tên quá dài.'),
  rating: z
    .number({ message: 'Vui lòng chọn số sao.' })
    .int()
    .min(1, 'Vui lòng chọn số sao.')
    .max(5),
  content: z
    .string()
    .trim()
    .min(10, 'Nội dung đánh giá cần ít nhất 10 ký tự.')
    .max(500, 'Nội dung tối đa 500 ký tự.'),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

/** Trường có ô nhập trên màn hình — dùng để nối `errors` của 422 vào đúng ô. */
const REVIEW_FIELDS = ['authorName', 'rating', 'content'] as const

export default function ReviewForm({ productId }: { productId: number }) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const { isAuthenticated } = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  const { mutate, isPending, isSuccess, error } = useCreateReview(productId)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { authorName: '', rating: 0, content: '' },
  })

  const rating = watch('rating')
  const hasMappedFieldError = hasServerFieldError(error, REVIEW_FIELDS)

  function onSubmit(values: ReviewFormValues) {
    mutate(values, {
      onSuccess: () => reset(),
      onError: (err) => applyServerFieldErrors(err, setError, REVIEW_FIELDS),
    })
  }

  /**
   * Gác đăng nhập lúc bấm "Gửi" — không ẩn form (Owner chốt 2026-08-26, xem
   * 0032 §B.8 điều 1). Kiểm **trước** cả zod, đúng nghĩa "bấm Gửi mà chưa đăng
   * nhập" bất kể form đang hợp lệ hay chưa — cùng mẫu `ProtectedRoute.tsx`
   * đang gác route, tái dùng `useCurrentUser()`.
   */
  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!isAuthenticated) {
      event.preventDefault()
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } })
      return
    }
    void handleSubmit(onSubmit)(event)
  }

  return (
    // `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx
    <form noValidate onSubmit={handleFormSubmit} className="rounded-xl bg-surface p-5">
      <h3 className="text-base">Viết đánh giá của bạn</h3>

      <div className="mt-4">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Chấm điểm <span className="text-danger">*</span>
        </span>
        <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Chấm ${star} sao`}
              aria-pressed={rating === star}
              onMouseEnter={() => setHoveredStar(star)}
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              className="transition hover:scale-110"
            >
              <Star
                size={26}
                strokeWidth={0}
                fill="currentColor"
                className={cn(
                  (hoveredStar || rating) >= star ? 'text-accent' : 'text-line',
                )}
              />
            </button>
          ))}
        </div>
        {errors.rating && <p className="mt-1.5 text-sm text-danger">{errors.rating.message}</p>}
      </div>

      <div className="mt-4">
        <Input
          label="Tên của bạn"
          required
          placeholder="Nguyễn Văn A"
          error={errors.authorName?.message}
          {...register('authorName')}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Nội dung đánh giá"
          required
          rows={4}
          placeholder="Sản phẩm có tươi không? Đóng gói thế nào? Bạn có mua lại không?"
          error={errors.content?.message}
          {...register('content')}
        />
      </div>

      {error && !hasMappedFieldError && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error.message}
        </p>
      )}
      {isSuccess && (
        <p role="status" className="mt-3 text-sm font-medium text-primary-dark">
          Cảm ơn bạn! Đánh giá đã được gửi.
        </p>
      )}

      <Button type="submit" isLoading={isPending} className="mt-4">
        Gửi đánh giá
      </Button>
    </form>
  )
}
