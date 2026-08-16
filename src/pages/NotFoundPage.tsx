import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default function NotFoundPage() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SearchX size={36} aria-hidden="true" />
      </span>
      <p className="mt-6 font-heading text-5xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Trang bạn tìm có thể đã bị xoá, đổi tên hoặc tạm thời không truy cập được.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to={ROUTES.HOME}
          className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark"
        >
          Về trang chủ
        </Link>
        <Link
          to={ROUTES.SHOP}
          className="rounded-full border border-primary px-6 py-2.5 font-semibold text-primary transition hover:bg-primary-soft"
        >
          Xem cửa hàng
        </Link>
      </div>
    </div>
  )
}
