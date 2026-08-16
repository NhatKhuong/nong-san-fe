import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  /** Trần số lượng, thường là tồn kho của sản phẩm. */
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export default function QuantityPicker({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantityPickerProps) {
  const buttonSize = size === 'sm' ? 'size-8' : 'size-10'
  const inputWidth = size === 'sm' ? 'w-10' : 'w-12'

  function clamp(next: number): number {
    if (Number.isNaN(next)) return min
    return Math.max(min, Math.min(max, next))
  }

  return (
    <div className={cn('inline-flex items-center rounded-full border border-line', className)}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Giảm số lượng"
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-full text-ink transition',
          'hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40',
        )}
      >
        <Minus size={15} />
      </button>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        aria-label="Số lượng"
        className={cn(inputWidth, 'bg-transparent text-center text-sm font-semibold outline-none')}
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Tăng số lượng"
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-full text-ink transition',
          'hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40',
        )}
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
