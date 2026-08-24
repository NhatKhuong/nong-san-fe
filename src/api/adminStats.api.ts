import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import { delay } from '@/lib/utils'
import { readPublicUsers } from './auth.api'
import { readAllOrders } from './orderStore'
import { readAllProducts } from './productStore'
import type { AdminOverview, Order, OrderStatus } from '@/types'

/**
 * Số liệu tổng hợp của màn Tổng quan — `/admin/stats/overview`.
 *
 * Nằm dưới tiền tố `/admin/**` như mọi hàm quản trị khác, được gác bằng filter
 * đòi `role == "admin"` (`documents/API_CONTRACT.md` §B.12.4, §C.4.2).
 *
 * **Khi ghép Spring Boot, phần tính toán dưới đây biến mất khỏi client** — cùng
 * lý do với §C.3: gộp số liệu ở trình duyệt nghĩa là tải toàn bộ đơn hàng của
 * mọi khách về máy người dùng. Ở đây nó chỉ tồn tại vì lớp mock không có server
 * nào để tính hộ. Chữ ký `getAdminOverview(days?)` là thứ backend phải khớp;
 * phần thân là thứ sẽ bị thay.
 */

/** Khoảng thời gian mặc định khi client không gửi `days`. */
const DEFAULT_DAYS = 30

/**
 * Năm trạng thái đơn, **suy ra từ `ORDER_STATUS_LABELS`** chứ không chép lại.
 *
 * `ordersByStatus` phải đủ cả năm trạng thái kể cả trạng thái đang có 0 đơn
 * (`types/admin.ts`), nên ở đây cần một danh sách đầy đủ. Viết tay một mảng thứ
 * hai là mời nó trôi lệch với `types/order.ts` — thêm trạng thái mới thì bảng
 * nhãn được cập nhật còn mảng này thì không, và cột mới lặng lẽ vắng mặt.
 * `Record<OrderStatus, string>` bảo đảm mọi khoá đều có mặt, và thứ tự khoá là
 * thứ tự khai báo: đúng thứ tự vòng đời của một đơn.
 */
const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

/**
 * Khoá ngày `YYYY-MM-DD` theo **múi giờ địa phương**, không phải UTC.
 *
 * `toISOString().slice(0, 10)` sẽ đẩy đơn đặt lúc 20:00 giờ Việt Nam sang ngày
 * hôm trước, và người xem đối chiếu với cột "Ngày đặt" ở `/quan-tri/don-hang`
 * (`formatDate()` cũng dùng giờ địa phương) sẽ thấy hai màn lệch nhau một ngày.
 */
function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Đúng `days` khoá ngày liên tiếp, **tăng dần**, kết thúc ở hôm nay.
 *
 * Đây là bộ khung zero-fill: mọi mốc trong khoảng đều có mặt trước khi cộng dồn,
 * nên ngày không có đơn ra `revenue: 0` chứ không biến mất. Không zero-fill thì
 * đường biểu đồ nối thẳng qua khoảng trống và đọc thành "doanh thu đều".
 */
function buildDateWindow(days: number): string[] {
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  cursor.setDate(cursor.getDate() - (days - 1))

  const keys: string[] = []
  for (let index = 0; index < days; index += 1) {
    keys.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

/**
 * Số liệu tổng hợp trong `days` ngày gần nhất.
 *
 * **Ba định nghĩa được ghim ở đây, backend phải làm đúng từng cái** (§B.12.4):
 *
 * - **`revenue` = tổng `total` của mọi đơn KHÔNG ở trạng thái `cancelled`**
 *   trong khoảng. Đơn đã huỷ vẫn được tính vào `orderCount` và vào cột
 *   `cancelled` — nó đã xảy ra — nhưng không phải tiền cửa hàng thu được. Đây là
 *   con số sẽ có người tranh cãi, nên nó được viết ra thay vì để người đọc đoán.
 * - **`customerCount` chỉ đếm `role === 'customer'`** — Owner chốt 2026-08-24
 *   (backlog 0008), đúng tập mà `getAdminUsers()` mặc định trả về. Hai chỗ đếm
 *   hai tập khác nhau thì bảng `/quan-tri/khach-hang` ghi 11 dòng còn ô chỉ số
 *   ghi 12, không có lỗi nào nổ ra và không chỗ nào nói ra là vì sao.
 * - **`lowStockCount` dùng `LOW_STOCK_THRESHOLD`** (`lib/constants.ts`), đúng
 *   con số mà bộ lọc `stockStatus=low_stock` và `StockBadge` đang dùng. Lệch
 *   ngưỡng thì ô chỉ số nói một đằng, danh sách lọc ra một nẻo.
 *
 * **`customerCount` và `lowStockCount` KHÔNG phụ thuộc `days`** — chúng là ảnh
 * chụp hiện tại, không phải chuỗi thời gian: `User` không có `createdAt`
 * (§B.12.3) và tồn kho chỉ có giá trị "ngay lúc này". Bốn số còn lại
 * (`revenue`, `orderCount`, `revenueByDay`, `ordersByStatus`) đều nằm **trong
 * cùng một khoảng** — nếu `orderCount` đếm mọi thời kỳ trong khi `revenue` chỉ
 * tính 30 ngày thì hai ô đứng cạnh nhau sẽ mâu thuẫn nhau.
 *
 * Hai bất biến kiểm được từ chính giá trị trả về:
 * `revenue === sum(revenueByDay.revenue)` và
 * `orderCount === sum(ordersByStatus.count)`.
 *
 * Khi có backend: `const { data } = await client.get('/admin/stats/overview', { params: { days } }); return data`
 */
export async function getAdminOverview(days: number = DEFAULT_DAYS): Promise<AdminOverview> {
  await delay()

  const dateKeys = buildDateWindow(days)
  const window = new Set(dateKeys)

  /*
   * Lọc theo **khoá ngày** chứ không so sánh mốc thời gian: cùng một phép tính
   * quyết định "đơn này có trong khoảng không" và "đơn này rơi vào cột nào", nên
   * không có đơn nào cộng vào tổng mà lại không xuất hiện trên biểu đồ. Cách này
   * cũng loại luôn đơn có `createdAt` ở tương lai — dữ liệu rác thì không được
   * nhét vào cột cuối cùng.
   */
  const ordersInWindow = readAllOrders().filter((order: Order) =>
    window.has(toDateKey(new Date(order.createdAt))),
  )

  const revenueByDate = new Map<string, number>(dateKeys.map((key) => [key, 0]))
  const countByStatus = new Map<OrderStatus, number>(
    ORDER_STATUSES.map((status) => [status, 0]),
  )

  for (const order of ordersInWindow) {
    countByStatus.set(order.status, (countByStatus.get(order.status) ?? 0) + 1)

    if (order.status === 'cancelled') continue
    const key = toDateKey(new Date(order.createdAt))
    revenueByDate.set(key, (revenueByDate.get(key) ?? 0) + order.total)
  }

  const revenueByDay = dateKeys.map((date) => ({
    date,
    revenue: revenueByDate.get(date) ?? 0,
  }))

  return {
    revenue: revenueByDay.reduce((sum, point) => sum + point.revenue, 0),
    orderCount: ordersInWindow.length,
    customerCount: readPublicUsers().filter((user) => user.role === 'customer').length,
    lowStockCount: readAllProducts().filter(
      (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
    ).length,
    revenueByDay,
    ordersByStatus: ORDER_STATUSES.map((status) => ({
      status,
      count: countByStatus.get(status) ?? 0,
    })),
  }
}
