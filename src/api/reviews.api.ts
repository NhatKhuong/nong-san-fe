import reviewsJson from '@/mocks/reviews.json'
import { delay } from '@/lib/utils'
import type { CreateReviewPayload, Review, ReviewSummary } from '@/types'

const USER_REVIEWS_KEY = 'nss_user_reviews'

const seedReviews = reviewsJson as Review[]

/** Đánh giá do người dùng gửi trong phiên, lưu localStorage giống cách orders.api.ts làm. */
function readUserReviews(): Review[] {
  try {
    const raw = localStorage.getItem(USER_REVIEWS_KEY)
    return raw ? (JSON.parse(raw) as Review[]) : []
  } catch {
    return []
  }
}

function writeUserReviews(reviews: Review[]): void {
  localStorage.setItem(USER_REVIEWS_KEY, JSON.stringify(reviews))
}

function allReviews(): Review[] {
  return [...readUserReviews(), ...seedReviews]
}

function sortByNewest(list: Review[]): Review[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

/**
 * Danh sách đánh giá của một sản phẩm, mới nhất trước.
 * Khi có backend: `const { data } = await client.get(`/products/${productId}/reviews`); return data`
 */
export async function getProductReviews(productId: number): Promise<Review[]> {
  await delay(400)
  return sortByNewest(allReviews().filter((review) => review.productId === productId))
}

/**
 * Tổng hợp điểm và phân bố sao của một sản phẩm.
 *
 * LƯU Ý: hàm này tính từ danh sách đánh giá, còn `Product.rating`/`reviewCount`
 * trong products.json là số cố định của dữ liệu mẫu — hai con số có thể lệch nhau.
 * Khi ghép Spring Boot, backend sẽ là nguồn chân lý duy nhất cho cả hai.
 *
 * Khi có backend: `const { data } = await client.get(`/products/${productId}/reviews/summary`); return data`
 */
export async function getReviewSummary(productId: number): Promise<ReviewSummary> {
  await delay(300)
  const list = allReviews().filter((review) => review.productId === productId)

  const distribution: ReviewSummary['distribution'] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let sum = 0

  for (const review of list) {
    const star = String(Math.round(review.rating)) as keyof ReviewSummary['distribution']
    if (star in distribution) distribution[star] += 1
    sum += review.rating
  }

  return {
    average: list.length > 0 ? Number((sum / list.length).toFixed(1)) : 0,
    total: list.length,
    distribution,
  }
}

/**
 * Gửi đánh giá mới.
 * Khi có backend: `const { data } = await client.post(`/products/${payload.productId}/reviews`, payload); return data`
 */
export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  await delay(700)

  const content = payload.content.trim()
  if (content.length < 10) {
    throw new Error('Nội dung đánh giá cần ít nhất 10 ký tự.')
  }
  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error('Vui lòng chọn số sao từ 1 đến 5.')
  }

  const review: Review = {
    id: Date.now(),
    productId: payload.productId,
    authorName: payload.authorName.trim(),
    rating: payload.rating,
    content,
    createdAt: new Date().toISOString().slice(0, 10),
  }

  writeUserReviews([review, ...readUserReviews()])
  return review
}
