import type { CartItem } from './cart'

export type PaymentMethod = 'cod' | 'bank_transfer'

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

export interface Order {
  id: number
  /** Mã đơn hiển thị cho khách: "NSS-20260816-0001". */
  code: string
  items: CartItem[]
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
