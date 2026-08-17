import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import { PAYMENT_OPTIONS } from '@/components/cart/paymentOptions'
import { productPath, ROUTES } from '@/lib/constants'
import { formatDate, formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

/**
 * Một dòng trong lịch sử đơn hàng, bấm vào mở rộng xem chi tiết ngay tại chỗ.
 *
 * Cố ý không làm trang chi tiết đơn riêng: nội dung sẽ trùng gần hết với trang
 * đặt hàng thành công, mà trang đó đã tra được theo mã đơn qua `?code=`.
 */
export default function OrderRow({ order }: { order: Order }) {
  const [isOpen, setOpen] = useState(false)
  const paymentLabel =
    PAYMENT_OPTIONS.find((option) => option.value === order.paymentMethod)?.label ?? '—'

  return (
    <li className="rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left transition hover:bg-surface"
      >
        <span className="font-semibold text-ink">{order.code}</span>
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-ink-muted">{formatDate(order.createdAt)}</span>

        <span className="ml-auto flex items-center gap-3">
          <span className="text-sm text-ink-muted">{order.items.length} mặt hàng</span>
          <span className="font-semibold text-primary-dark">{formatVND(order.total)}</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn('text-ink-muted transition-transform', isOpen && 'rotate-180')}
          />
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-line p-4">
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.productId} className="flex gap-3 text-sm">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <Link
                    to={productPath(item.slug)}
                    className="line-clamp-1 font-medium transition hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <span className="block text-xs text-ink-muted">
                    {item.quantity} × {formatVND(item.price)}
                  </span>
                </span>
                <span className="shrink-0 font-semibold">
                  {formatVND(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <Line label="Tạm tính" value={formatVND(order.subtotal)} />
            {order.discount > 0 && (
              <Line
                label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ''}`}
                value={`− ${formatVND(order.discount)}`}
              />
            )}
            <Line
              label="Phí vận chuyển"
              value={order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}
            />
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Tổng cộng</dt>
              <dd className="text-primary-dark">{formatVND(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="font-medium text-ink">Giao đến</p>
              <p className="mt-1 text-ink-muted">
                {order.shipping.fullName} · {order.shipping.phone}
                <br />
                {order.shipping.street}, {order.shipping.ward}, {order.shipping.district},{' '}
                {order.shipping.province}
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">Thanh toán</p>
              <p className="mt-1 text-ink-muted">{paymentLabel}</p>
              <Link
                to={`${ROUTES.ORDER_SUCCESS}?code=${order.code}`}
                className="mt-2 inline-block font-medium text-primary hover:underline"
              >
                Xem chi tiết đơn hàng
              </Link>
            </div>
          </div>
        </div>
      )}
    </li>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
