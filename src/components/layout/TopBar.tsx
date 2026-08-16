import { Link } from 'react-router-dom'
import { Clock, Phone } from 'lucide-react'
import { ROUTES, STORE_INFO } from '@/lib/constants'

/** Thanh thông tin mảnh phía trên cùng, ẩn trên mobile để tiết kiệm không gian. */
export default function TopBar() {
  return (
    <div className="hidden bg-primary-dark text-white lg:block">
      <div className="container-app flex h-10 items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Phone size={14} aria-hidden="true" />
            Hotline: {STORE_INFO.hotline}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {STORE_INFO.openingHours}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to={ROUTES.ABOUT} className="transition hover:text-primary-light">
            Về chúng tôi
          </Link>
          <span className="text-white/40" aria-hidden="true">
            |
          </span>
          <Link to={ROUTES.CONTACT} className="transition hover:text-primary-light">
            Liên hệ
          </Link>
          <span className="text-white/40" aria-hidden="true">
            |
          </span>
          <Link to={ROUTES.LOGIN} className="transition hover:text-primary-light">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
