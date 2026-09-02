import type { CartItem } from './cart'

/**
 * Phương thức thanh toán.
 * LƯU Ý: `momo` và `vnpay` được thêm ở Giai đoạn 6 — phải ghi vào
 * `docs/API_CONTRACT.md` để backend Spring Boot khai báo cùng tập giá trị.
 */
export type PaymentMethod = 'cod' | 'bank_transfer' | 'momo' | 'vnpay'

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface ShippingInfo {
  fullName: string
  phone: string
  email: string
  province: string
  district: string
  ward: string
  street: string
  note?: string
}

/**
 * Một dòng hàng trên **chứng từ đơn hàng** — giống `CartItem` nhưng **không có
 * `stock`**.
 *
 * Backend cố ý không trả tồn kho trên dòng hàng của đơn: tồn kho tại thời điểm
 * đặt là con số vô nghĩa trên một chứng từ, và nó sẽ sai ngay khi có người khác
 * mua. `CartItem.stock` chỉ phục vụ việc chặn tăng số lượng **trong giỏ**.
 */
export type OrderItem = Omit<CartItem, 'stock'>

export interface Order {
  id: number
  /** Mã đơn hiển thị cho khách: "NSS-20260816-0001". */
  code: string
  /**
   * Chủ đơn; `null` là đơn của khách vãng lai (đặt hàng không cần đăng nhập).
   * LƯU Ý: thêm ở Giai đoạn 7 — phải ghi vào `docs/API_CONTRACT.md`. Backend lấy
   * giá trị này từ JWT, **client không gửi lên**, nên `CreateOrderPayload` không
   * có trường tương ứng.
   */
  userId: number | null
  items: OrderItem[]
  shipping: ShippingInfo
  paymentMethod: PaymentMethod
  status: OrderStatus
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  couponCode: string | null
  createdAt: string
}

export interface CreateOrderPayload {
  items: CartItem[]
  shipping: ShippingInfo
  paymentMethod: PaymentMethod
  couponCode: string | null
}

/** Trạng thái của một yêu cầu đặt hàng bất đồng bộ (`POST /orders/async`). */
export type PurchaseRequestStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

/**
 * Kết quả `POST /orders/async` (202) và `GET /orders/requests/{requestId}` —
 * một yêu cầu mua hàng đang (hoặc đã) được xử lý bất đồng bộ qua Kafka.
 *
 * `orderCode` chỉ có giá trị khi `status === 'SUCCESS'`; `failureCode` và
 * `failureMessage` chỉ có giá trị khi `status === 'FAILED'`. `failureMessage`
 * đã là tiếng Việt do backend sinh sẵn — hiển thị thẳng cho người dùng, không
 * tự dịch hay soạn lại (API_CONTRACT.md §B.6a).
 */
export interface PurchaseRequest {
  requestId: string
  status: PurchaseRequestStatus
  orderCode: string | null
  failureCode: string | null
  failureMessage: string | null
}
