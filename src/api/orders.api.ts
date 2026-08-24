import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/constants'
import { delay } from '@/lib/utils'
import { effectivePrice } from '@/lib/format'
import { readAllProducts } from './productStore'
import { readAllOrders, readOrderByCode, writeCreatedOrder } from './orderStore'
import type { CartIssue, CartItem, CreateOrderPayload, Order } from '@/types'
import { getCurrentUserId } from './auth.api'
import { validateCoupon } from './coupons.api'

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
 * Đối chiếu giỏ hàng với dữ liệu sản phẩm mới nhất.
 *
 * `CartItem` là bản chụp lúc thêm vào giỏ, mà giỏ nằm trong localStorage nhiều
 * ngày — giá và tồn kho có thể đã đổi. Hàm này trả về danh sách vấn đề để trang
 * giỏ hàng cảnh báo người dùng trước khi đặt.
 *
 * Khi có backend: `const { data } = await client.post('/cart/validate', { items }); return data`
 */
export async function validateCart(items: CartItem[]): Promise<CartIssue[]> {
  await delay(400)

  /*
   * Đọc qua `productStore` chứ KHÔNG đọc thẳng `products.json`: sản phẩm admin
   * vừa tạo phải thêm được vào giỏ, và tồn kho admin vừa sửa phải chặn được
   * đúng lúc. Đọc hai nguồn khác nhau là kiểu hỏng tệ nhất — build xanh, danh
   * sách sản phẩm đúng, chỉ vỡ khi có người thật bấm mua.
   */
  const products = readAllProducts()
  const issues: CartIssue[] = []

  for (const item of items) {
    const product = products.find((candidate) => candidate.id === item.productId)

    // Sản phẩm bị gỡ khỏi hệ thống cũng coi như hết hàng.
    if (!product || product.stock <= 0) {
      issues.push({ productId: item.productId, name: item.name, type: 'out_of_stock' })
      continue
    }

    if (item.quantity > product.stock) {
      issues.push({
        productId: item.productId,
        name: item.name,
        type: 'insufficient_stock',
        availableStock: product.stock,
      })
    }

    const currentPrice = effectivePrice(product.price, product.salePrice)
    if (currentPrice !== item.price) {
      issues.push({
        productId: item.productId,
        name: item.name,
        type: 'price_changed',
        currentPrice,
        cartPrice: item.price,
      })
    }
  }

  return issues
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

  /*
   * Số thứ tự đếm trên **toàn bộ** đơn đang tồn tại, kể cả đơn seed: đếm riêng
   * đơn của localStorage thì đơn đầu tiên đặt trên máy này lại mang số 0001
   * trong khi bảng quản trị đã có 35 đơn — mã đơn trông như bị đặt trùng.
   */
  const sequence = readAllOrders().length + 1

  const order: Order = {
    id: Date.now(),
    code: generateOrderCode(sequence),
    // Lấy từ token chứ không nhận từ payload — mô phỏng đúng cách backend làm.
    userId: getCurrentUserId(),
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

  writeCreatedOrder(order)
  return order
}

/**
 * Lịch sử đơn hàng của tài khoản đang đăng nhập.
 *
 * Lọc nghiêm ngặt theo `userId`: đơn đặt lúc chưa đăng nhập không thuộc về tài
 * khoản nào, chỉ tra cứu được bằng mã đơn qua `getOrderByCode`.
 *
 * Đọc qua `orderStore` nên danh sách này gồm **cả đơn seed thuộc tài khoản đang
 * đăng nhập** — tài khoản demo (`userId: 1`) vì vậy có sẵn lịch sử đơn, và
 * trạng thái admin vừa đổi hiện ra ở đây ngay lần tải kế tiếp. Đơn của tài khoản
 * khác vẫn bị lọc ra như cũ: hàng rào là `order.userId === userId`, không phải
 * việc dữ liệu đến từ đâu.
 *
 * Khi có backend: `const { data } = await client.get('/orders/me'); return data`
 */
export async function getMyOrders(): Promise<Order[]> {
  await delay(500)
  const userId = getCurrentUserId()
  if (userId === null) return []
  return readAllOrders().filter((order) => order.userId === userId)
}

/**
 * Chi tiết một đơn theo mã đơn.
 * Khi có backend: `const { data } = await client.get(`/orders/${code}`); return data`
 */
export async function getOrderByCode(code: string): Promise<Order> {
  await delay(400)
  const order = readOrderByCode(code)
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${code}`)
  return order
}
