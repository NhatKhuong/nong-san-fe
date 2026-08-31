import { client } from './client'
import { readPublicUsers } from './auth.api'
import { getAdminProducts } from './adminProducts.api'
import type { AdminOverview } from '@/types'

/**
 * Số liệu tổng hợp của màn Tổng quan — `GET /admin/stats/overview`.
 *
 * **File này vẫn lai, nhưng lý do đã đổi (backlog 0032).** Bốn trường thuộc
 * đơn hàng (`revenue`, `orderCount`, `revenueByDay`, `ordersByStatus`) lấy từ
 * backend Spring Boot thật từ backlog 0027. Hai trường còn lại:
 *
 * - `lowStockCount` — **từ 0032, cũng đọc backend thật**, qua `GET
 *   /admin/products?stockStatus=low_stock&limit=1` (gọi lại `getAdminProducts()`
 *   có sẵn ở `adminProducts.api.ts`, không tự viết `client.get` thứ hai) rồi lấy
 *   `.total`. Trước 0032 nó đọc kho catalog của lớp mock — kho đó đã bị xoá
 *   hẳn cùng lúc màn `/quan-tri/san-pham` chuyển hẳn sang backend.
 * - `customerCount` vẫn đọc `readPublicUsers()` (`auth.api.ts`) — **cùng kho
 *   mock** mà `/quan-tri/khach-hang` (`getAdminUsers`) đang đọc, vì
 *   `adminUsers.api.ts` chưa lên backend thật.
 *
 * **Lý do hai trường này "khớp nhau" đã đổi.** Trước 0032, `lowStockCount` khớp
 * `/quan-tri/san-pham` vì cả hai cùng đọc chung một kho mock. Nay cả hai cùng
 * đọc **backend thật** — đó mới là điều giữ chúng khớp nhau, không còn phải
 * "đọc cùng kho mock để hai màn không nói khác nhau" nữa. `customerCount` thì
 * lý do cũ vẫn còn nguyên vì `adminUsers.api.ts` chưa đổi.
 *
 * File phát **hai** request kể từ 0032 (`/admin/stats/overview` +
 * `/admin/products`). Chấp nhận được: chi phí một request thêm ở màn quản trị
 * ít người xem, đổi lấy việc không phải chờ backend bổ sung trường vào
 * `/admin/stats/overview` (Owner chốt hướng (b), 2026-08-26).
 *
 * Chữ ký `getAdminOverview(days?)` là hợp đồng backend phải khớp (§1.3).
 */

/** Khoảng thời gian mặc định khi client không gửi `days`. */
const DEFAULT_DAYS = 30

/**
 * Số liệu tổng hợp trong `days` ngày gần nhất — ghép 4 trường đơn hàng lấy từ
 * backend, `lowStockCount` từ một lời gọi backend riêng, và `customerCount`
 * tính tại client từ kho mock khách hàng.
 *
 * **Bốn trường đơn hàng do backend định nghĩa** (§B.12.4), client nhận nguyên,
 * không nắn lại: `revenue` = tổng `total` của đơn **không** ở trạng thái
 * `cancelled` trong khoảng; `orderCount` gồm **cả** đơn đã huỷ; `revenueByDay` đủ
 * `days` điểm kể cả ngày 0 đồng; `ordersByStatus` đủ cả 5 trạng thái kể cả trạng
 * thái đang 0 đơn.
 *
 * `lowStockCount` — **`stockStatus: 'low_stock'`, KHÔNG phải `'low'`**
 * (`AdminProductQuery.stockStatus`, `types/admin.ts`). Gõ sai không bị backend
 * từ chối, chỉ âm thầm trả về **toàn bộ** sản phẩm chưa lọc — hậu quả là ô chỉ
 * số nhảy lên bằng tổng catalog mà không lỗi nào nổ ra. `limit: 1` vì chỉ cần
 * `.total`, không cần danh sách; `getAdminProducts` mặc định `limit:
 * PRODUCTS_PER_PAGE` nên phải truyền tay.
 *
 * `customerCount` chỉ đếm `role === 'customer'` — đúng tập `getAdminUsers()`
 * mặc định trả về (Owner chốt 2026-08-24, backlog 0008). Hai chỗ đếm hai tập
 * khác nhau thì bảng khách hàng và ô chỉ số lệch nhau mà không lỗi nào nổ ra.
 *
 * `days` sai giá trị → backend trả **`400`** `ProblemDetail`; nhưng giao diện kẹp
 * `days` về `DAY_PRESETS` trước khi request rời máy, nên nhánh lỗi đó chỉ chạm
 * được ở tầng HTTP (curl trực tiếp), không qua giao diện.
 */
export async function getAdminOverview(days: number = DEFAULT_DAYS): Promise<AdminOverview> {
  const [{ data }, lowStock] = await Promise.all([
    client.get<AdminOverview>('/admin/stats/overview', { params: { days } }),
    getAdminProducts({ stockStatus: 'low_stock', limit: 1 }),
  ])

  return {
    revenue: data.revenue,
    orderCount: data.orderCount,
    revenueByDay: data.revenueByDay,
    ordersByStatus: data.ordersByStatus,
    customerCount: readPublicUsers().filter((user) => user.role === 'customer').length,
    lowStockCount: lowStock.total,
  }
}
