import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'

interface PriceRangeSliderProps {
  min: number
  max: number
  value: { min: number; max: number }
  /** Chỉ gọi khi người dùng thả chuột / nhả phím — tránh ghi URL liên tục lúc đang kéo. */
  onCommit: (next: { min: number; max: number }) => void
  step?: number
}

/** Hai thumb không được vượt qua nhau, luôn cách nhau ít nhất một bước. */
const THUMB_CLASSES = cn(
  'pointer-events-none absolute h-1.5 w-full appearance-none bg-transparent',
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4',
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
  '[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow',
  '[&::-webkit-slider-thumb]:cursor-grab',
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4',
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
  '[&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-grab',
  /*
   * Tắt outline mặc định của trình duyệt vì nó bao quanh CẢ thanh trượt (rộng hết
   * chiều ngang) chứ không quanh tay cầm, nhìn rất khó hiểu. Nhưng phải thay bằng
   * ring trên chính tay cầm — trước Giai đoạn 9 chỗ này chỉ có `outline-none` và
   * không có gì thay thế, nên người dùng bàn phím không thấy mình đang ở tay cầm nào.
   */
  'focus-visible:outline-none',
  '[&:focus-visible::-webkit-slider-thumb]:ring-4 [&:focus-visible::-webkit-slider-thumb]:ring-primary/40',
  '[&:focus-visible::-moz-range-thumb]:ring-4 [&:focus-visible::-moz-range-thumb]:ring-primary/40',
)

export default function PriceRangeSlider({
  min,
  max,
  value,
  onCommit,
  step = 1000,
}: PriceRangeSliderProps) {
  const [local, setLocal] = useState<[number, number]>([value.min, value.max])

  // Đồng bộ khi giá trị bị đổi từ bên ngoài (bấm "Xoá bộ lọc", điều hướng Back…)
  useEffect(() => {
    setLocal([value.min, value.max])
  }, [value.min, value.max])

  const [low, high] = local
  const range = Math.max(1, max - min)
  const leftPercent = ((low - min) / range) * 100
  const rightPercent = ((high - min) / range) * 100

  function commit() {
    if (low !== value.min || high !== value.max) {
      onCommit({ min: low, max: high })
    }
  }

  return (
    <div>
      <div className="relative h-4">
        <span className="absolute top-1.5 h-1.5 w-full rounded-full bg-surface-alt" />
        <span
          className="absolute top-1.5 h-1.5 rounded-full bg-primary"
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          aria-label="Giá thấp nhất"
          onChange={(event) =>
            setLocal(([, currentHigh]) => [
              Math.min(Number(event.target.value), currentHigh - step),
              currentHigh,
            ])
          }
          onPointerUp={commit}
          onKeyUp={commit}
          onTouchEnd={commit}
          className={cn(THUMB_CLASSES, 'top-1.5')}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          aria-label="Giá cao nhất"
          onChange={(event) =>
            setLocal(([currentLow]) => [
              currentLow,
              Math.max(Number(event.target.value), currentLow + step),
            ])
          }
          onPointerUp={commit}
          onKeyUp={commit}
          onTouchEnd={commit}
          className={cn(THUMB_CLASSES, 'top-1.5')}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-primary-dark">{formatVND(low)}</span>
        <span className="text-ink-light">—</span>
        <span className="font-semibold text-primary-dark">{formatVND(high)}</span>
      </div>
    </div>
  )
}
