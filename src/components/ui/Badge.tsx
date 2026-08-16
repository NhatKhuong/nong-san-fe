import { cn } from '@/lib/utils'

type BadgeTone = 'sale' | 'new' | 'soldout' | 'success' | 'neutral'

const TONE_CLASSES: Record<BadgeTone, string> = {
  sale: 'bg-accent text-white',
  new: 'bg-primary text-white',
  soldout: 'bg-ink/70 text-white',
  success: 'bg-success text-white',
  neutral: 'bg-surface text-ink-muted',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: React.ReactNode
}

export default function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
