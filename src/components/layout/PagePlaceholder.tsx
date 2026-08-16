import { Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

interface PagePlaceholderProps {
  title: string
  /** Giai đoạn trong docs/PLAN.md sẽ hoàn thiện trang này. */
  phase: string
}

/**
 * Khung tạm cho các trang chưa xây xong, để router hoạt động đầy đủ từ Giai đoạn 1.
 * Xoá file này khi cả 10 giai đoạn hoàn tất.
 */
export default function PagePlaceholder({ title, phase }: PagePlaceholderProps) {
  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Hammer size={28} aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl">{title}</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Trang này sẽ được hoàn thiện ở <strong className="text-ink">{phase}</strong> theo kế hoạch
        trong <code className="rounded bg-surface px-1.5 py-0.5 text-sm">docs/PLAN.md</code>.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-6 rounded-full bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
