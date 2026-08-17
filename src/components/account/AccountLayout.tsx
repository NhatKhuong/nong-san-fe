import { NavLink, Outlet } from 'react-router-dom'
import { KeyRound, LogOut, MapPin, Package, UserRound } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useCurrentUser, useLogout } from '@/hooks/useAuth'

const MENU = [
  { to: ROUTES.ACCOUNT, label: 'Thông tin cá nhân', icon: UserRound, end: true },
  { to: ROUTES.ACCOUNT_ORDERS, label: 'Đơn hàng của tôi', icon: Package, end: false },
  { to: ROUTES.ACCOUNT_ADDRESSES, label: 'Sổ địa chỉ', icon: MapPin, end: false },
  { to: ROUTES.ACCOUNT_PASSWORD, label: 'Đổi mật khẩu', icon: KeyRound, end: false },
]

/** Khung chung của khu vực tài khoản: menu bên trái, nội dung trang con bên phải. */
export default function AccountLayout() {
  const { user } = useCurrentUser()
  const { mutate: logout, isPending } = useLogout()

  return (
    <>
      <Breadcrumb items={[{ label: 'Tài khoản của tôi' }]} />

      <div className="container-app py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="min-w-0">
            <div className="rounded-xl border border-line p-4">
              <p className="truncate font-semibold text-ink">{user?.fullName}</p>
              <p className="truncate text-sm text-ink-muted">{user?.email}</p>
            </div>

            {/* Mobile: menu thành hàng tab cuộn ngang thay vì cột dọc chiếm hết màn hình. */}
            <nav
              aria-label="Menu tài khoản"
              className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible"
            >
              {MENU.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary-soft text-primary-dark'
                        : 'text-ink hover:bg-surface',
                    )
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => logout()}
                disabled={isPending}
                className="flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-surface disabled:opacity-50"
              >
                <LogOut size={18} aria-hidden="true" />
                Đăng xuất
              </button>
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
