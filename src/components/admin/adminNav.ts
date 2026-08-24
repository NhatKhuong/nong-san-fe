import { LayoutDashboard, Package, ShoppingBag, Users, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export interface AdminNavItem {
  to: string
  label: string
  icon: LucideIcon
  /**
   * `end` cho mục trỏ tới chính `/quan-tri`: thiếu nó thì "Tổng quan" sáng ở
   * **mọi** trang con, vì `NavLink` mặc định khớp theo tiền tố đường dẫn.
   */
  end: boolean
}

/**
 * Bốn mục điều hướng của khu quản trị.
 *
 * Tách khỏi `AdminSidebar.tsx` để file component chỉ export component — cùng lệ
 * với `buttonStyles.ts`, `paymentOptions.ts`, `lazyPages.ts`. Trộn hằng số vào
 * file component sẽ làm React Fast Refresh mất tác dụng và oxlint
 * (`react/only-export-components`) cảnh báo.
 *
 * Các màn không có mục menu riêng (thêm/sửa sản phẩm, chi tiết đơn, chi tiết
 * khách hàng) CỐ Ý không nằm ở đây: chúng đi tới từ trong danh sách, đưa lên
 * sidebar thì có mục menu dẫn tới một đường dẫn cần tham số.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { to: ROUTES.ADMIN, label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_PRODUCTS, label: 'Sản phẩm', icon: Package, end: false },
  { to: ROUTES.ADMIN_ORDERS, label: 'Đơn hàng', icon: ShoppingBag, end: false },
  { to: ROUTES.ADMIN_CUSTOMERS, label: 'Khách hàng', icon: Users, end: false },
]
