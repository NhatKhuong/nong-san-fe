import { LOW_STOCK_THRESHOLD } from '@/lib/constants'
import { client } from './client'
import { readPublicUsers } from './auth.api'
import { readAllProducts } from './productStore'
import type { AdminOverview } from '@/types'

/**
 * Số liệu tổng hợp của màn Tổng quan — `GET /admin/stats/overview`.
 *
 * **File này còn lai, và đó là CHỦ Ý — đừng tưởng là sót.** Sau backlog 0027,
 * bốn trường thuộc đơn hàng (`revenue`, `orderCount`, `revenueByDay`,
 * `ordersByStatus`) lấy từ backend Spring Boot thật — **cùng nguồn** với bảng đơn
 * quản trị và lịch sử đơn của khách, nên ba màn không còn nói khác nhau về cùng
 * một khoảng. Hai trường còn lại vẫn tính tại client từ lớp mock, và cố ý giữ vậy:
 *
 * - `customerCount` đọc `readPublicUsers()` (`auth.api.ts`) — **cùng kho mock**
 *   mà `/quan-tri/khach-hang` (`getAdminUsers`) đang đọc.
 * - `lowStockCount` đọc `readAllProducts()` (`productStore.ts`) — **cùng kho mock**
 *   mà `/quan-tri/san-pham` đang đọc. Nửa sản phẩm thuộc backlog 0019.
 *
 * Giữ hai trường này ở mock **chính là điều kiện để không đẻ ra lỗi lệch màn
 * mới**: lấy chúng từ DB thật trong khi hai màn kia còn mock thì ô chỉ số và danh
 * sách tương ứng sẽ nói khác nhau — đúng lớp lỗi mà 0027 vừa chữa cho đơn hàng.
 * Khi ticket của chúng lên backend thật, hai trường này chuyển nốt và file hết lai.
 *
 * Chữ ký `getAdminOverview(days?)` là hợp đồng backend phải khớp (§1.3).
 */

/** Khoảng thời gian mặc định khi client không gửi `days`. */
const DEFAULT_DAYS = 30

/**
 * Số liệu tổng hợp trong `days` ngày gần nhất — ghép 4 trường đơn hàng lấy từ
 * backend với 2 trường customers/products tính tại client.
 *
 * **Bốn trường đơn hàng do backend định nghĩa** (§B.12.4), client nhận nguyên,
 * không nắn lại: `revenue` = tổng `total` của đơn **không** ở trạng thái
 * `cancelled` trong khoảng; `orderCount` gồm **cả** đơn đã huỷ; `revenueByDay` đủ
 * `days` điểm kể cả ngày 0 đồng; `ordersByStatus` đủ cả 5 trạng thái kể cả trạng
 * thái đang 0 đơn.
 *
 * **Hai trường tính tại client, ăn khớp bộ lọc của màn tương ứng:**
 * - `customerCount` chỉ đếm `role === 'customer'` — đúng tập `getAdminUsers()`
 *   mặc định trả về (Owner chốt 2026-08-24, backlog 0008). Hai chỗ đếm hai tập
 *   khác nhau thì bảng khách hàng và ô chỉ số lệch nhau mà không lỗi nào nổ ra.
 * - `lowStockCount` dùng `LOW_STOCK_THRESHOLD` (`lib/constants.ts`) — đúng ngưỡng
 *   mà bộ lọc `stockStatus=low_stock` và `StockBadge` dùng.
 *
 * `days` sai giá trị → backend trả **`400`** `ProblemDetail`; nhưng giao diện kẹp
 * `days` về `DAY_PRESETS` trước khi request rời máy, nên nhánh lỗi đó chỉ chạm
 * được ở tầng HTTP (curl trực tiếp), không qua giao diện.
 */
export async function getAdminOverview(days: number = DEFAULT_DAYS): Promise<AdminOverview> {
  const { data } = await client.get<AdminOverview>('/admin/stats/overview', {
    params: { days },
  })

  return {
    revenue: data.revenue,
    orderCount: data.orderCount,
    revenueByDay: data.revenueByDay,
    ordersByStatus: data.ordersByStatus,
    customerCount: readPublicUsers().filter((user) => user.role === 'customer').length,
    lowStockCount: readAllProducts().filter(
      (product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD,
    ).length,
  }
}
