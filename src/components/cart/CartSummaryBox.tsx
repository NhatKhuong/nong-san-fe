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

      {/*
        Hộp này chỉ xuất hiện TRƯỚC khi đặt (giỏ hàng + thanh toán), nên mọi con
        số ở đây do client tự tính — phí ship qua `calcShippingFee()`, một ước
        tính, không phải con số của server (API_CONTRACT.md §C.1). Hai luật hiện
        KHỚP nhau, đã đo bằng đơn thật (§C.5, backlog 0024) — nhưng đó là sự
        khớp phải giữ, không phải điều hiển nhiên, và nếu một ngày nó lệch thì
        không lỗi nào nổ ra: khách chỉ bị trừ khác con số vừa nhìn. Dòng nhãn
        này là chỗ duy nhất người dùng được báo trước điều đó.
        Sau khi đặt, `OrderSuccessPage` đọc thẳng `Order.*` và KHÔNG có nhãn này.
      */}
      <p className="mt-3 text-xs text-ink-muted">
        Phí vận chuyển và tổng tiền ở đây là <strong className="font-medium">số tạm tính</strong>.
        Con số chính thức là con số trên đơn hàng sau khi đặt.
      </p>

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
