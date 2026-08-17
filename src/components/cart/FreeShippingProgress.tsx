import { Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatVND } from '@/lib/format'

/**
 * Nhắc khách còn thiếu bao nhiêu để được miễn phí vận chuyển.
 * Nhận `amount` là giá trị đơn SAU khi trừ giảm giá, khớp với cách
 * `calcShippingFee` tính phí.
 */
export default function FreeShippingProgress({ amount }: { amount: number }) {
  const isFree = amount >= FREE_SHIPPING_THRESHOLD
  const remaining = FREE_SHIPPING_THRESHOLD - amount
  const percent = Math.min(100, (amount / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="rounded-xl border border-line p-4">
      <p className="flex items-start gap-2.5 text-sm">
        <Truck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        {isFree ? (
          <span className="text-success">
            Đơn hàng của bạn được <strong>miễn phí vận chuyển</strong>.
          </span>
        ) : (
          <span className="text-ink-muted">
            Mua thêm <strong className="text-ink">{formatVND(remaining)}</strong> để được miễn
            phí vận chuyển.
          </span>
        )}
      </p>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-alt"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến trình đạt miễn phí vận chuyển"
      >
        <div
          className={isFree ? 'h-full rounded-full bg-success' : 'h-full rounded-full bg-primary'}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
