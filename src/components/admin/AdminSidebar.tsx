import { NavLink } from 'react-router-dom'
import { Leaf, Store } from 'lucide-react'
import { ADMIN_NAV } from './adminNav'
import { ROUTES, STORE_INFO } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Menu bên trái của khu quản trị.
 *
 * Mobile: cuộn ngang thành hàng tab thay vì cột dọc chiếm hết màn hình — cùng
 * cách xử lý với `AccountLayout`, để hai khu vực hành xử giống nhau trên điện
 * thoại.
 *
 * Link "Về cửa hàng" là đường thoát duy nhất ra ngoài khu quản trị: `AdminLayout`
 * cố ý không render `Header` nên không còn logo bấm được nào.
 */
export default function AdminSidebar() {
  return (
    <aside className="border-b border-line bg-white lg:border-r lg:border-b-0">
      <div className="flex items-center gap-2 px-4 py-4 lg:px-5">
        <Leaf size={22} className="text-primary" aria-hidden="true" />
        <span className="font-heading font-bold text-ink">
          {STORE_INFO.name}
          <span className="ml-1.5 text-sm font-medium text-ink-muted">Quản trị</span>
        </span>
      </div>

      <nav
        aria-label="Menu quản trị"
        className="flex gap-2 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible lg:px-3"
      >
        {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-primary-soft text-primary-dark' : 'text-ink hover:bg-surface',
              )
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="hidden border-t border-line px-3 py-3 lg:block">
        <NavLink
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-surface"
        >
          <Store size={18} aria-hidden="true" />
          Về cửa hàng
        </NavLink>
      </div>
    </aside>
  )
}
