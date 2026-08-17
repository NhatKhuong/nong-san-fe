import { useQuery } from '@tanstack/react-query'
import { getActiveCoupons, validateCoupon } from '@/api/coupons.api'
import { calcShippingFee, validateCart } from '@/api/orders.api'
import { selectItemCount, selectSubtotal, useCartStore } from '@/store/cart.store'
import { queryKeys } from './queryKeys'
import type { CartSummary, Coupon } from '@/types'

/**
 * Xác thực lại mã giảm giá theo giá trị đơn hiện tại.
 *
 * Store chỉ lưu mã chứ không lưu cả object coupon, nên mỗi lần giỏ đổi giá trị
 * là mã được kiểm tra lại. Nhờ vậy tình huống "thêm mã lúc đơn 300k rồi xoá bớt
 * hàng còn 100k" sẽ tự động báo không đủ điều kiện thay vì âm thầm giảm giá sai.
 */
export function useCoupon() {
  const couponCode = useCartStore((state) => state.couponCode)
  const subtotal = useCartStore(selectSubtotal)

  const query = useQuery({
    queryKey: queryKeys.coupons.validate(couponCode ?? '', subtotal),
    queryFn: () => validateCoupon(couponCode!, subtotal),
    enabled: Boolean(couponCode) && subtotal > 0,
    retry: false,
  })

  const coupon: Coupon | null = query.data ?? null
  const discount = coupon
    ? coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value
    : 0

  return {
    couponCode,
    coupon,
    discount,
    isChecking: query.isFetching,
    /** Thông điệp lý do mã không dùng được, hiển thị thẳng cho người dùng. */
    error: query.error?.message ?? null,
  }
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons.active,
    queryFn: getActiveCoupons,
    staleTime: Infinity,
  })
}

/** Tổng kết đơn dùng chung cho trang giỏ hàng và trang thanh toán. */
export function useCartSummary(): CartSummary {
  const subtotal = useCartStore(selectSubtotal)
  const itemCount = useCartStore(selectItemCount)
  const { discount } = useCoupon()

  // Không cho giảm giá vượt quá giá trị hàng.
  const safeDiscount = Math.min(discount, subtotal)
  const shippingFee = subtotal > 0 ? calcShippingFee(subtotal - safeDiscount) : 0

  return {
    subtotal,
    discount: safeDiscount,
    shippingFee,
    total: subtotal - safeDiscount + shippingFee,
    itemCount,
  }
}

/**
 * Đối chiếu giỏ với dữ liệu sản phẩm mới nhất.
 * Query key gắn với "dấu vân tay" của giỏ để tự chạy lại khi giỏ đổi.
 */
export function useCartValidation() {
  const items = useCartStore((state) => state.items)
  const fingerprint = items.map((item) => `${item.productId}:${item.quantity}`).join(',')

  const query = useQuery({
    queryKey: queryKeys.cart.validate(fingerprint),
    queryFn: () => validateCart(items),
    enabled: items.length > 0,
  })

  const issues = query.data ?? []

  return {
    issues,
    /** Lỗi chặn đặt hàng (hết hàng / vượt tồn). Giá đổi chỉ là cảnh báo. */
    blockingIssues: issues.filter((issue) => issue.type !== 'price_changed'),
    isChecking: query.isLoading,
  }
}
