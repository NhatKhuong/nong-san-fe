import { Link } from 'react-router-dom'
import { LogOut, Store } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useCurrentUser, useLogout } from '@/hooks/useAuth'

/**
 * Thanh trên cùng của khu quản trị: đang đăng nhập bằng tài khoản nào và lối ra.
 *
 * CỐ Ý không có ô tìm kiếm, giỏ hàng hay menu cửa hàng — đó là `Header` của
 * storefront, và `AdminLayout` tồn tại chính là để không render nó (ADR 0001).
 *
 * `useLogout` xoá phiên; `AdminRoute` bắt được ngay và đá về `/dang-nhap`, nên ở
 * đây không cần tự điều hướng.
 */
export default function AdminTopbar() {
  const { user } = useCurrentUser()
  const { mutate: logout, isPending } = useLogout()

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line bg-white px-4 py-3 lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p>
        <p className="truncate text-xs text-ink-muted">{user?.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* Bản mobile của lối thoát về cửa hàng — bản desktop nằm cuối sidebar. */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface lg:hidden"
        >
          <Store size={18} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Về cửa hàng</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger transition hover:bg-surface disabled:opacity-50"
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Đăng xuất</span>
        </button>
      </div>
    </header>
  )
}
