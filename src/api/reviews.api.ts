import { client } from './client'
import type { CreateReviewPayload, Review, ReviewSummary } from '@/types'

/**
 * Danh sách đánh giá của một sản phẩm, mới nhất trước.
 *
 * `productId` là `id` số của sản phẩm — KHÁC `GET /products/{slug}` của trang
 * cửa hàng. Backend không phân trang endpoint này (0032 §B.8); sản phẩm không
 * tồn tại/đã xoá mềm trả 404, không phải mảng rỗng.
 */
export async function getProductReviews(productId: number): Promise<Review[]> {
  const { data } = await client.get<Review[]>(`/products/${productId}/reviews`)
  return data
}

/**
 * Tổng hợp điểm và phân bố sao của một sản phẩm — do backend tính (§C.3 của
 * API_CONTRACT.md), không tự cộng lại từ danh sách đánh giá ở client.
 *
 * `distribution` là object khoá chuỗi `'1'`…`'5'`, dùng thẳng để vẽ biểu đồ
 * phân bố sao.
 */
export async function getReviewSummary(productId: number): Promise<ReviewSummary> {
  const { data } = await client.get<ReviewSummary>(`/products/${productId}/reviews/summary`)
  return data
}

/**
 * Gửi đánh giá mới. **Yêu cầu đăng nhập** (`BE-ADR-0008`, khác hợp đồng gốc
 * §B.8 vốn ghi công khai) — `client.ts` tự gắn Bearer token khi đã đăng nhập.
 * `ReviewForm` gác đăng nhập trước khi gọi hàm này (điều hướng `/dang-nhap`
 * nếu chưa có phiên), nên ở đây không tự kiểm lại token.
 *
 * `productId` tách riêng khỏi `payload`: path là nguồn chân lý, backend bỏ
 * qua im lặng một trường `productId` trong body (từng là lỗ ghi nhầm đánh giá
 * sang sản phẩm khác — 0032 §B.8 điều 3), nên `CreateReviewPayload` cố ý
 * không còn trường đó nữa.
 *
 * Lỗi: `401` chưa đăng nhập · `404` sản phẩm không tồn tại · `409` tài khoản
 * này đã đánh giá sản phẩm này rồi (không có map `errors`, đi qua
 * `error.message`) · `422` validate theo ô (content < 10 ký tự…), đi qua
 * `applyServerFieldErrors()`.
 */
export async function createReview(
  productId: number,
  payload: CreateReviewPayload,
): Promise<Review> {
  const { data } = await client.post<Review>(`/products/${productId}/reviews`, payload)
  return data
}
