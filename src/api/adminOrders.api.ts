import { delay } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from '@/lib/orderStatus'
import { readAllOrders, readOrderByCode, writeOrderStatus } from './orderStore'
import type { AdminOrderQuery, Order, OrderStatus, Paginated } from '@/types'

/**
 * Đơn hàng ở khu quản trị — `/admin/orders/**`.
 *
 * Tách khỏi `orders.api.ts` vì đây là **namespace khác** trên backend: mọi hàm
 * dưới đây đi qua tiền tố `/admin/**` được gác bằng một filter đòi
 * `role == "admin"` (`documents/API_CONTRACT.md` §B.12.2, §C.4.2). `getAdminOrders`
 * là **song sinh** của `GET /orders/me` — hai endpoint tồn tại song song chính
 * là cách giữ §C.4.1 không bị nới lỏng: `/orders/me` lấy chủ đơn từ JWT và
 * không bao giờ nhận `?userId=`, còn ở đây `userId` là một bộ lọc hợp lệ.
 *
 * Dữ liệu đọc/ghi qua `orderStore.ts` — cùng nguồn với lịch sử đơn của khách.
 */

/**
 * Số đơn mỗi trang của bảng quản trị.
 *
 * Cố ý **không** thêm vào `lib/constants.ts`: file đó là hợp đồng dùng chung
 * (backend phải khớp `LOW_STOCK_THRESHOLD`, `FREE_SHIPPING_THRESHOLD`…), còn con
 * số này chỉ là `limit` mặc định khi client không gửi — backend nhận `limit` từ
 * query chứ không cần biết mặc định của một màn hình.
 */
const ORDERS_PER_PAGE = 12

/** Dải dấu thanh tổ hợp Unicode, tách ra sau khi `normalize('NFD')`. */
const COMBINING_MARKS = /[̀-ͯ]/g

/** Bỏ dấu để tìm "nguyen van an" khớp được với "Nguyễn Văn An". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase()
}

/**
 * Lọc theo `q`, `status`, `userId`.
 *
 * `q` khớp **mã đơn / tên người nhận / số điện thoại người nhận** — đúng ba thứ
 * nhân viên xử lý đơn có trong tay khi khách gọi tới. Cố ý dùng thông tin trong
 * `order.shipping` chứ không phải hồ sơ tài khoản: đơn của khách vãng lai không
 * có tài khoản nào để tra, và người đặt hộ vẫn tìm ra được đơn theo tên người
 * nhận thật.
 */
function applyFilters(list: Order[], query: AdminOrderQuery): Order[] {
  let result = list

  if (query.q) {
    const keyword = normalize(query.q.trim())
    result = result.filter(
      (order) =>
        normalize(order.code).includes(keyword) ||
        normalize(order.shipping.fullName).includes(keyword) ||
        order.shipping.phone.includes(keyword),
    )
  }

  if (query.status) {
    result = result.filter((order) => order.status === query.status)
  }

  if (query.userId !== undefined) {
    result = result.filter((order) => order.userId === query.userId)
  }

  return result
}

/**
 * Danh sách đơn hàng chéo mọi người dùng, **mới nhất trước**.
 *
 * Không có tham số `sort`: `AdminOrderQuery` cố ý không khai nó (hợp đồng chốt ở
 * backlog 0003). Thứ tự luôn là ngày đặt giảm dần — đơn mới là đơn cần xử lý.
 *
 * Khi có backend: `const { data } = await client.get('/admin/orders', { params: query }); return data`
 */
export async function getAdminOrders(query: AdminOrderQuery = {}): Promise<Paginated<Order>> {
  await delay()

  const page = query.page ?? 1
  const limit = query.limit ?? ORDERS_PER_PAGE
  // `readAllOrders()` đã sắp mới nhất trước.
  const filtered = applyFilters(readAllOrders(), query)
  const start = (page - 1) * limit

  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  }
}

/**
 * Một đơn theo **mã đơn**, không phải id — khớp URL `/quan-tri/don-hang/:code`
 * và khớp `getOrderByCode()` của phần khách hàng. Mã đơn là thứ duy nhất cả
 * nhân viên lẫn khách cùng đọc được qua điện thoại.
 *
 * Khi có backend: `const { data } = await client.get(`/admin/orders/${code}`); return data`
 */
export async function getAdminOrderByCode(code: string): Promise<Order> {
  await delay(250)
  const order = readOrderByCode(code)
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${code}.`)
  return order
}

/**
 * Đổi trạng thái một đơn.
 *
 * **Luật chuyển trạng thái nằm ở đây, không ở ô select.** `OrderStatusSelect`
 * chỉ liệt kê đúng những lựa chọn hợp lệ cho tiện tay, nhưng nó là giao diện —
 * ai gọi thẳng hàm này (hoặc gọi thẳng endpoint khi đã có backend) vẫn phải bị
 * chặn. `delivered` và `cancelled` là **trạng thái cuối**: đã giao rồi thì không
 * "chưa xác nhận" lại được, đã huỷ rồi thì phải tạo đơn mới.
 *
 * Backend trả **422** cho đúng trường hợp `throw` dưới đây (§B.12.2).
 *
 * Đơn seed trong `orders.json` là read-only: `writeOrderStatus()` ghim một patch
 * `{ status }` vào overlay `nss_mock_orders` chứ không chép cả danh sách xuống.
 *
 * Khi có backend: `const { data } = await client.patch(`/admin/orders/${code}/status`, { status }); return data`
 */
export async function updateOrderStatus(code: string, status: OrderStatus): Promise<Order> {
  await delay(600)

  const current = readOrderByCode(code)
  if (!current) throw new Error(`Không tìm thấy đơn hàng ${code}.`)

  const allowed = ORDER_STATUS_TRANSITIONS[current.status]
  if (!allowed.includes(status)) {
    throw new Error(
      allowed.length === 0
        ? `Đơn ${code} đang ở trạng thái cuối "${ORDER_STATUS_LABELS[current.status]}", không đổi được nữa.`
        : `Không thể chuyển đơn ${code} từ "${ORDER_STATUS_LABELS[current.status]}" sang "${ORDER_STATUS_LABELS[status]}".`,
    )
  }

  writeOrderStatus(code, status)
  return { ...current, status }
}
