import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  description?: string
  /** Link "Xem tất cả" bên phải; bỏ qua nếu không cần. */
  viewAllPath?: string
  align?: 'left' | 'center'
  className?: string
}

/** Tiêu đề chuẩn cho các section trang chủ, giữ nhịp thị giác đồng nhất. */
export default function SectionHeading({
  title,
  description,
  viewAllPath,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-7 gap-4',
        align === 'center'
          ? 'flex flex-col items-center text-center'
          : 'flex flex-wrap items-end justify-between',
        className,
      )}
    >
      <div className={cn(align === 'center' && 'max-w-2xl')}>
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-ink-muted">{description}</p>}
        <span
          className={cn(
            'mt-3 block h-1 w-16 rounded-full bg-primary',
            align === 'center' && 'mx-auto',
          )}
          aria-hidden="true"
        />
      </div>

      {viewAllPath && (
        <Link
          to={viewAllPath}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
        >
          Xem tất cả
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
