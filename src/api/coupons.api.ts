import { client } from './client'
import type { Coupon } from '@/types'

/**
 * Kiểm tra mã giảm giá theo giá trị đơn hàng hiện tại.
 *
 * Backend là nguồn chân lý: nó tự chuẩn hoá `code` về chữ HOA và tự quyết định
 * ngưỡng tối thiểu, nên ở đây **không nắn dữ liệu** trước khi gửi.
 *
 * Lỗi đi ra dưới dạng `ApiError` do interceptor của `client.ts` chuẩn hoá —
 * `404` mã không tồn tại, `422` chưa đủ ngưỡng. Cả hai đều mang `detail` tiếng
 * Việt (RFC 7807) và được `CouponForm` hiển thị thẳng cho người dùng.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<Coupon> {
  const { data } = await client.post<Coupon>('/coupons/validate', { code, subtotal })
  return data
}

/** Danh sách mã đang chạy, dùng hiển thị gợi ý ở trang giỏ hàng. */
export async function getActiveCoupons(): Promise<Coupon[]> {
  const { data } = await client.get<Coupon[]>('/coupons/active')
  return data
}
