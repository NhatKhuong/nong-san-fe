import { client } from './client'
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
 * **Đã ghép backend Spring Boot thật (backlog 0023).** Tìm kiếm, lọc, phân
 * trang, thứ tự "mới nhất trước" và **luật chuyển trạng thái** đều do backend
 * làm — không còn bản sao nào của những luật đó ở đây. `client.ts` đã có
 * `baseURL = '/api'` nên đường dẫn viết ở đây là `/admin/orders`.
 *
 * Cùng nguồn dữ liệu với `orders.api.ts`: đơn khách đặt ở `/thanh-toan` hiện
 * ngay ở bảng quản trị, và trạng thái admin vừa đổi hiện ngay ở
 * `/tai-khoan/don-hang` của chính khách đó.
 *
 * `403` (sai vai trò) **không** kích hoạt đăng xuất: nó rơi thẳng xuống
 * `toApiError` trong `client.ts`, đúng như §B.12 đã chốt.
 *
 * Ảnh dòng hàng **không** đi qua `imageUrl()` ở đây — giống hệt `orders.api.ts`
 * sau backlog 0012, để hai đầu của cùng một đơn không bao giờ vẽ ra hai URL
 * khác nhau. Backend trả đường dẫn tương đối `/images/...` đúng §A.5.
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

/**
 * Danh sách đơn hàng chéo mọi người dùng, **mới nhất trước** — `GET /admin/orders`.
 *
 * Không có tham số `sort`: `AdminOrderQuery` cố ý không khai nó (hợp đồng chốt ở
 * backlog 0003). Thứ tự luôn là ngày đặt giảm dần — đơn mới là đơn cần xử lý.
 *
 * `page`/`limit` gửi tường minh để URL của request nói ra đúng trang đang xem
 * thay vì phụ thuộc vào mặc định phía server. `q`/`status`/`userId` là
 * `undefined` khi không lọc và axios tự bỏ chúng khỏi query string — gửi `q=`
 * rỗng lên là một bộ lọc khác với "không lọc".
 *
 * `totalPages` khi tập rỗng là **`0`** (§A.4), và `Pagination` mở đầu bằng
 * `if (totalPages <= 1) return null` nên không render gì.
 */
export async function getAdminOrders(query: AdminOrderQuery = {}): Promise<Paginated<Order>> {
  const { data } = await client.get<Paginated<Order>>('/admin/orders', {
    params: {
      q: query.q,
      status: query.status,
      userId: query.userId,
      page: query.page ?? 1,
      limit: query.limit ?? ORDERS_PER_PAGE,
    },
  })
  return data
}

/**
 * Một đơn theo **mã đơn**, không phải id — `GET /admin/orders/{code}`.
 *
 * Khớp URL `/quan-tri/don-hang/:code` và khớp `getOrderByCode()` của phần khách
 * hàng. Mã đơn là thứ duy nhất cả nhân viên lẫn khách cùng đọc được qua điện
 * thoại. Không tìm thấy → `404`, và `ApiError.message` đã mang sẵn `detail`
 * tiếng Việt của backend.
 */
export async function getAdminOrderByCode(code: string): Promise<Order> {
  const { data } = await client.get<Order>(`/admin/orders/${encodeURIComponent(code)}`)
  return data
}

/**
 * Đổi trạng thái một đơn — `PATCH /admin/orders/{code}/status`.
 *
 * ⚠️ **`PATCH`, không phải `PUT`.** Bản mock trước đây không phát request nào
 * nên chỗ này chưa bao giờ phải đúng.
 *
 * **Luật chuyển trạng thái nằm ở backend, không ở đây và càng không ở ô select.**
 * `OrderStatusSelect` dựng danh sách lựa chọn từ `ORDER_STATUS_TRANSITIONS` cho
 * tiện tay, nhưng đó là **tiện lợi, không phải hàng rào** (§B.12.2): ô chọn có
 * thể đang vẽ theo một bản đơn đã cũ, và ai gọi thẳng endpoint thì không đi qua
 * nó. Bước chuyển ngoài bảng → **422** kèm `ProblemDetail` tiếng Việt, và câu đó
 * phải tới được người dùng — vì vậy hàm này **không kiểm lại** luật ở client:
 * thêm một `throw` ở đây là nuốt mất chính câu của server.
 */
export async function updateOrderStatus(code: string, status: OrderStatus): Promise<Order> {
  const { data } = await client.patch<Order>(`/admin/orders/${encodeURIComponent(code)}/status`, {
    status,
  })
  return data
}
