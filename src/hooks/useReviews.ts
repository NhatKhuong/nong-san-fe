import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReview, getProductReviews, getReviewSummary } from '@/api/reviews.api'
import type { CreateReviewPayload } from '@/types'
import { queryKeys } from './queryKeys'

export function useProductReviews(productId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId ?? 0),
    queryFn: () => getProductReviews(productId!),
    enabled: Boolean(productId),
  })
}

export function useReviewSummary(productId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(productId ?? 0),
    queryFn: () => getReviewSummary(productId!),
    enabled: Boolean(productId),
  })
}

/**
 * Gửi đánh giá xong thì làm mới cả danh sách lẫn phần tổng hợp sao.
 *
 * `productId` của hook này (không phải một trường trong payload — xem
 * `CreateReviewPayload`) là id duy nhất dùng cho cả URL của `createReview`
 * lẫn khoá cache cần làm mới.
 */
export function useCreateReview(productId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byProduct(productId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(productId) })
    },
  })
}
