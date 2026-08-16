import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/constants'
import { delay } from '@/lib/utils'
import type { CreateOrderPayload, Order } from '@/types'
import { validateCoupon } from './coupons.api'

const ORDERS_KEY = 'nss_mock_orders'

function readOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

/** Sinh mã đơn dạng NSS-20260816-0007. */
function generateOrderCode(sequence: number): string {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  return `NSS-${datePart}-${String(sequence).padStart(4, '0')}`
}

/**
 * Tính phí vận chuyển: miễn phí khi đơn đạt ngưỡng.
 * Backend sẽ là nguồn chân lý cho con số này, hàm ở đây chỉ để hiển thị trước.
 */
export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

/**
 * Tạo đơn hàng mới.
 * Khi có backend: `const { data } = await client.post('/orders', payload); return data`
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  await delay(900)

  if (payload.items.length === 0) {
    throw new Error('Giỏ hàng đang trống, không thể đặt hàng.')
  }

  const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  let discount = 0
  if (payload.couponCode) {
    const coupon = await validateCoupon(payload.couponCode, subtotal)
    discount =
      coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
  }

  const shippingFee = calcShippingFee(subtotal - discount)
  const orders = readOrders()

  const order: Order = {
    id: Date.now(),
    code: generateOrderCode(orders.length + 1),
    items: payload.items,
    shipping: payload.shipping,
    paymentMethod: payload.paymentMethod,
    status: 'pending',
    subtotal,
    discount,
    shippingFee,
    total: subtotal - discount + shippingFee,
    couponCode: payload.couponCode,
    createdAt: new Date().toISOString(),
  }

  writeOrders([order, ...orders])
  return order
}

/**
 * Lịch sử đơn hàng của tài khoản đang đăng nhập.
 * Khi có backend: `const { data } = await client.get('/orders/me'); return data`
 */
export async function getMyOrders(): Promise<Order[]> {
  await delay(500)
  return readOrders()
}

/**
 * Chi tiết một đơn theo mã đơn.
 * Khi có backend: `const { data } = await client.get(`/orders/${code}`); return data`
 */
export async function getOrderByCode(code: string): Promise<Order> {
  await delay(400)
  const order = readOrders().find((item) => item.code === code)
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${code}`)
  return order
}
