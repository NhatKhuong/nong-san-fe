/**
 * Một dòng trong giỏ hàng. Lưu snapshot thông tin sản phẩm tại thời điểm thêm
 * để giỏ hàng vẫn hiển thị đúng khi sản phẩm gốc đổi giá hoặc bị gỡ.
 */
export interface CartItem {
  productId: number
  slug: string
  name: string
  image: string
  unit: string
  /** Giá thực tế phải trả (đã tính khuyến mãi). */
  price: number
  /** Giá gốc, dùng để hiển thị gạch ngang. */
  originalPrice: number
  quantity: number
  /** Tồn kho tại thời điểm thêm, dùng để chặn tăng số lượng quá mức. */
  stock: number
}

/** Tổng kết đơn hàng hiển thị ở giỏ hàng và trang thanh toán. */
export interface CartSummary {
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  itemCount: number
}

/**
 * Vấn đề phát hiện khi đối chiếu giỏ hàng với dữ liệu mới nhất.
 * `out_of_stock` và `insufficient_stock` là lỗi chặn — không cho đặt hàng.
 * `price_changed` chỉ là cảnh báo.
 */
export interface CartIssue {
  productId: number
  name: string
  type: 'out_of_stock' | 'insufficient_stock' | 'price_changed'
  /** Tồn kho thực tế, có ở `insufficient_stock`. */
  availableStock?: number
  /** Giá mới, có ở `price_changed`. */
  currentPrice?: number
  /** Giá đang lưu trong giỏ, có ở `price_changed`. */
  cartPrice?: number
}

export interface Coupon {
  code: string
  /** 'percent' giảm theo %, 'fixed' giảm số tiền cố định. */
  type: 'percent' | 'fixed'
  value: number
  minOrderValue: number
  description: string
}
