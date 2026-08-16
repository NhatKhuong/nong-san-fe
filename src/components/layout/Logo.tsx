import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { ROUTES, STORE_INFO } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface LogoProps {
  /** Bản rút gọn chỉ hiện icon + tên, dùng trong mobile menu. */
  compact?: boolean
  className?: string
}

export default function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      to={ROUTES.HOME}
      className={cn('flex shrink-0 items-center gap-2', className)}
      aria-label={`${STORE_INFO.name} — về trang chủ`}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
        <Leaf size={22} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-lg font-bold text-primary-dark">
          {STORE_INFO.name}
        </span>
        {!compact && (
          <span className="block text-[11px] text-ink-muted">{STORE_INFO.tagline}</span>
        )}
      </span>
    </Link>
  )
}
