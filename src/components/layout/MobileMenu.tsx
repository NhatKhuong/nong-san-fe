import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import Logo from './Logo'
import { MAIN_NAV, ROUTES, STORE_INFO } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

/** Menu điều hướng dạng drawer trượt từ trái, chỉ dùng ở màn hình < lg. */
export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Khoá cuộn trang nền và cho phép đóng bằng phím Esc.
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <Logo compact />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink transition hover:bg-surface"
            aria-label="Đóng menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.HOME}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-4 py-3 font-medium transition',
                  isActive ? 'bg-primary-soft text-primary-dark' : 'text-ink hover:bg-surface',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-4 text-sm">
          <NavLink
            to={ROUTES.LOGIN}
            onClick={onClose}
            className="block rounded-full bg-primary py-2.5 text-center font-semibold text-white transition hover:bg-primary-dark"
          >
            Đăng nhập
          </NavLink>
          <p className="mt-4 text-ink-muted">
            Hotline: <span className="font-semibold text-primary">{STORE_INFO.hotline}</span>
          </p>
        </div>
      </div>
    </>
  )
}
