import { formatVND } from '@/lib/format'
import { useCartSummary, useCoupon } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface CartSummaryBoxProps {
  title?: string
  children?: React.ReactNode
  className?: string
}

/** Bảng tổng kết đơn — dùng chung ở trang giỏ hàng và trang thanh toán. */
export default function CartSummaryBox({
  title = 'Tổng kết đơn hàng',
  children,
  className,
}: CartSummaryBoxProps) {
  const { subtotal, discount, shippingFee, total, itemCount } = useCartSummary()
  const { coupon } = useCoupon()

  return (
    <div className={cn('rounded-xl border border-line bg-surface p-5', className)}>
      <h2 className="text-lg">{title}</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <Row label={`Tạm tính (${itemCount} sản phẩm)`} value={formatVND(subtotal)} />

        {discount > 0 && (
          <Row
            label={`Giảm giá${coupon ? ` (${coupon.code})` : ''}`}
            value={`− ${formatVND(discount)}`}
            tone="accent"
          />
        )}

        <Row
          label="Phí vận chuyển"
          value={shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
          tone={shippingFee === 0 ? 'success' : undefined}
        />
      </dl>

      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-semibold">Tổng cộng</span>
        <span className="font-heading text-2xl font-bold text-primary">{formatVND(total)}</span>
      </div>

      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

interface RowProps {
  label: string
  value: string
  tone?: 'accent' | 'success'
}

function Row({ label, value, tone }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={cn(
          'font-medium',
          tone === 'accent' && 'text-accent',
          tone === 'success' && 'text-success',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
