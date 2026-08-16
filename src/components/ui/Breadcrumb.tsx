import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export interface BreadcrumbItem {
  label: string
  /** Bỏ trống ở mục cuối cùng — mục hiện tại không phải link. */
  path?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Đường dẫn" className="bg-surface">
      <div className="container-app flex flex-wrap items-center gap-1.5 py-3 text-sm">
        <Link to={ROUTES.HOME} className="text-ink-muted transition hover:text-primary">
          Trang chủ
        </Link>

        {items.map((item, index) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-ink-light" aria-hidden="true" />
            {item.path && index < items.length - 1 ? (
              <Link to={item.path} className="text-ink-muted transition hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  )
}
