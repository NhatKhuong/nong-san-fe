import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useCurrentUser, useLogout } from '@/hooks/useAuth'

const ICON_BUTTON_CLASSES =
  'rounded-lg p-2.5 text-ink transition hover:bg-surface hover:text-primary'

/**
 * Icon tài khoản trên header. Chưa đăng nhập thì là link tới trang đăng nhập,
 * đã đăng nhập thì mở menu thả xuống.
 */
export default function AccountMenu() {
  const { user, isAuthenticated, isAdmin } = useCurrentUser()
  const { mutate: logout } = useLogout()
  const [isOpen, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Đóng menu khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!isAuthenticated) {
    return (
      <Link to={ROUTES.LOGIN} className={ICON_BUTTON_CLASSES} aria-label="Đăng nhập">
        <User size={22} />
      </Link>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Tài khoản của ${user?.fullName}`}
        className={ICON_BUTTON_CLASSES}
      >
        <User size={22} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-1 w-56 rounded-xl border border-line bg-white py-2 shadow-lg"
        >
          <p className="truncate border-b border-line px-4 pb-2 text-sm font-semibold text-ink">
            {user?.fullName}
          </p>

          <MenuLink to={ROUTES.ACCOUNT} onSelect={() => setOpen(false)}>
            Thông tin cá nhân
          </MenuLink>
          <MenuLink to={ROUTES.ACCOUNT_ORDERS} onSelect={() => setOpen(false)}>
            Đơn hàng của tôi
          </MenuLink>
          <MenuLink to={ROUTES.ACCOUNT_ADDRESSES} onSelect={() => setOpen(false)}>
            Sổ địa chỉ
          </MenuLink>

          {/*
            Lối vào khu quản trị, chỉ hiện với tài khoản admin. Đây là **ẩn giao
            diện cho gọn**, không phải kiểm quyền: `AdminRoute` chặn ở route và
            hàng rào thật là filter Spring Security trên `/admin/**` (ADR 0002).
            Khách gõ thẳng `/quan-tri` vẫn bị đá về trang chủ dù không thấy mục này.
          */}
          {isAdmin && (
            <MenuLink to={ROUTES.ADMIN} onSelect={() => setOpen(false)}>
              Quản trị
            </MenuLink>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="mt-1 block w-full border-t border-line px-4 pt-2.5 pb-1 text-left text-sm font-medium text-danger transition hover:bg-surface"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  onSelect,
  children,
}: {
  to: string
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onSelect}
      className="block px-4 py-2 text-sm text-ink transition hover:bg-surface"
    >
      {children}
    </Link>
  )
}
