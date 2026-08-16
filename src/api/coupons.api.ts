import couponsJson from '@/mocks/coupons.json'
import { delay } from '@/lib/utils'
import type { Coupon } from '@/types'

const coupons = couponsJson as Coupon[]

/**
 * Kiểm tra mã giảm giá theo giá trị đơn hàng hiện tại.
 * Ném lỗi kèm thông điệp tiếng Việt để hiển thị thẳng cho người dùng.
 *
 * Khi có backend: `const { data } = await client.post('/coupons/validate', { code, subtotal }); return data`
 */
export async function validateCoupon(code: string, subtotal: number): Promise<Coupon> {
  await delay(400)
  const coupon = coupons.find(
    (item) => item.code.toLowerCase() === code.trim().toLowerCase(),
  )
  if (!coupon) throw new Error('Mã giảm giá không tồn tại.')
  if (subtotal < coupon.minOrderValue) {
    throw new Error(
      `Đơn hàng cần tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')} ₫ để dùng mã này.`,
    )
  }
  return coupon
}

/** Danh sách mã đang chạy, dùng hiển thị gợi ý ở trang giỏ hàng. */
export async function getActiveCoupons(): Promise<Coupon[]> {
  await delay(200)
  return coupons
}
