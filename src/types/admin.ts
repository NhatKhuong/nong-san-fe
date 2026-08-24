import type { OrderStatus } from './order'
import type { ProductSort } from './product'
import type { UserRole } from './user'

/**
 * Kiểu dùng chung của khu quản trị `/quan-tri`.
 *
 * **Hợp đồng đã chốt (backlog 0003).** Bốn ticket 0004–0007 chạy song song trên
 * đúng những shape này; ticket nào thấy thiếu trường thì báo PM chứ **không** tự
 * thêm — sửa file này giữa chừng là ba ticket kia biên dịch bằng một hợp đồng
 * khác với ticket còn lại.
 *
 * Mọi endpoint tương ứng nằm dưới tiền tố `/admin/**` và **cố ý truy vấn chéo
 * người dùng** — xem `documents/API_CONTRACT.md` §B.12 và §C.4.2. Endpoint
 * ngoài `/admin` không được mọc thêm `?userId=` để phục vụ những kiểu này
 * (§C.4.3b).
 */

/**
 * Tham số lọc danh sách sản phẩm ở khu quản trị.
 *
 * Khác `ProductQuery` của trang cửa hàng: không có `minPrice`/`maxPrice`/
 * `minRating`/`onSaleOnly` (khách mới cần), nhưng có `stockStatus` (chỉ admin
 * mới cần) và `q` tìm được cả trên slug lẫn tên.
 */
export interface AdminProductQuery {
  /** Từ khoá — khớp tên hoặc slug. */
  q?: string
  /** Slug danh mục. */
  category?: string
  /** `low_stock` là `0 < stock <= LOW_STOCK_THRESHOLD` (`lib/constants.ts`). */
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  sort?: ProductSort
  page?: number
  limit?: number
}

/** Tham số lọc danh sách đơn hàng ở khu quản trị — liệt kê chéo mọi người dùng. */
export interface AdminOrderQuery {
  /** Từ khoá — khớp mã đơn, tên hoặc số điện thoại người nhận. */
  q?: string
  status?: OrderStatus
  /**
   * Lọc theo chủ đơn. Chỉ hợp lệ **trong** namespace `/admin` — endpoint
   * `/orders/me` lấy chủ sở hữu từ claim `sub` của JWT và không nhận tham số
   * này (§C.4.1).
   */
  userId?: number
  page?: number
  limit?: number
}

/** Tham số lọc danh sách khách hàng ở khu quản trị. */
export interface AdminUserQuery {
  /** Từ khoá — khớp họ tên, email hoặc số điện thoại. */
  q?: string
  role?: UserRole
  page?: number
  limit?: number
}

/**
 * Số liệu tổng hợp cho màn Tổng quan.
 *
 * Hai mảng dưới đây **phải đầy đủ điểm dữ liệu**, kể cả điểm bằng 0:
 * `revenueByDay` có đúng `days` phần tử (ngày không có đơn thì `revenue: 0`) và
 * `ordersByStatus` có đủ cả năm trạng thái. Nếu backend bỏ qua các mốc rỗng thì
 * biểu đồ sẽ nối thẳng qua khoảng trống và đọc thành "doanh thu đều", còn cột
 * trạng thái sẽ nhảy chỗ mỗi lần tải lại.
 */
export interface AdminOverview {
  revenue: number
  orderCount: number
  customerCount: number
  /** Số sản phẩm có `0 < stock <= LOW_STOCK_THRESHOLD`. */
  lowStockCount: number
  /** Đủ `days` điểm, sắp tăng dần theo ngày; `date` dạng `YYYY-MM-DD`. */
  revenueByDay: { date: string; revenue: number }[]
  /** Đủ cả 5 trạng thái, kể cả trạng thái đang có 0 đơn. */
  ordersByStatus: { status: OrderStatus; count: number }[]
}
