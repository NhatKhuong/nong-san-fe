import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/constants'
import { client } from './client'
import type { CartIssue, CartItem, CreateOrderPayload, Order } from '@/types'

/**
 * Thân dòng hàng đúng như `CartItemRequest` của backend — **đúng bốn trường**.
 *
 * `CartItem` ở client có tám trường; bốn trường còn lại (`slug`, `image`, `unit`,
 * `originalPrice`) là bản chụp để vẽ giỏ hàng, và `stock` thì backend cố ý không
 * nhận. Server tự tra bốn trường đó từ dữ liệu sản phẩm của nó khi dựng đơn, nên
 * gửi thêm chỉ là gửi thừa — và gửi thừa một bản chụp cũ là cách âm thầm nhất để
 * chứng từ ghi khác thứ server biết.
 */
function toCartItemRequest(item: CartItem): {
  productId: number
  name: string
  quantity: number
  price: number
} {
  return {
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }
}

/**
 * Tính phí vận chuyển: miễn phí khi đơn đạt ngưỡng.
 *
 * **Không phải endpoint** — chỉ là ước tính để hiển thị trước khi đặt. Con số
 * chính thức nằm ở `Order.shippingFee` do backend trả về; chỗ nào cần số thật
 * thì đọc trường đó, đừng gọi lại hàm này.
 */
export function calcShippingFee(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

/**
 * Đối chiếu giỏ hàng với dữ liệu sản phẩm mới nhất — `POST /cart/validate`.
 *
 * `CartItem` là bản chụp lúc thêm vào giỏ, mà giỏ nằm trong localStorage nhiều
 * ngày — giá và tồn kho có thể đã đổi. Backend trả danh sách vấn đề để trang giỏ
 * hàng cảnh báo người dùng trước khi đặt; mảng rỗng nghĩa là giỏ hợp lệ.
 *
 * Công khai: khách vãng lai cũng phải kiểm được giỏ trước khi đặt.
 */
export async function validateCart(items: CartItem[]): Promise<CartIssue[]> {
  const { data } = await client.post<CartIssue[]>('/cart/validate', {
    items: items.map(toCartItemRequest),
  })
  return data
}

/**
 * Tạo đơn hàng mới — `POST /orders`, trả **201**.
 *
 * **Công khai**: khách vãng lai đặt hàng được. Chủ đơn do backend gán từ claim
 * `sub` của JWT nếu có token — **client không gửi `userId` dưới bất kỳ hình thức
 * nào** (§C.4.1: truyền `userId` lên ở đây là rò rỉ dữ liệu, không phải lỗi hiển
 * thị). Đó cũng là lý do `CreateOrderPayload` không có trường tương ứng.
 *
 * ⚠️ Endpoint công khai nhưng trả `401` nếu client **có** gửi header
 * `Authorization` với token hỏng. Nhánh 3/6 của interceptor (`client.ts`, 0010)
 * là chỗ chữa: xoá phiên rồi phát lại một lần **không kèm header**, để một token
 * chết còn sót trong localStorage không chặn được người không cần đăng nhập.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await client.post<Order>('/orders', {
    items: payload.items.map(toCartItemRequest),
    shipping: payload.shipping,
    paymentMethod: payload.paymentMethod,
    couponCode: payload.couponCode,
  })
  return data
}

/**
 * Lịch sử đơn hàng của tài khoản đang đăng nhập — `GET /orders/me`.
 *
 * **Mảng trần, KHÔNG phân trang** — đừng bọc vào `{items,total,...}`.
 *
 * Không nhận tham số nào: chủ đơn lấy **chỉ từ claim `sub`** của token. Đơn của
 * khách vãng lai (`userId: null`) không bao giờ xuất hiện ở đây; muốn xem lại thì
 * tra bằng mã đơn qua `getOrderByCode`.
 *
 * Mảng rỗng là **kết quả hợp lệ**, không phải lỗi.
 */
export async function getMyOrders(): Promise<Order[]> {
  const { data } = await client.get<Order[]>('/orders/me')
  return data
}

/**
 * Chi tiết một đơn theo mã đơn — `GET /orders/{code}`.
 *
 * **Công khai**: đây là lối duy nhất để khách vãng lai xem lại đơn của mình, vì
 * `getMyOrders` lọc nghiêm ngặt theo chủ sở hữu. Không tìm thấy → `404`, và
 * `ApiError.message` đã mang sẵn `detail` tiếng Việt của backend.
 */
export async function getOrderByCode(code: string): Promise<Order> {
  const { data } = await client.get<Order>(`/orders/${encodeURIComponent(code)}`)
  return data
}
