import { Link } from 'react-router-dom'
import { PAYMENT_OPTIONS } from '@/components/cart/paymentOptions'
import { adminCustomerDetailPath } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { Order } from '@/types'

interface OrderCustomerCardProps {
  order: Order
}

/**
 * Người nhận, địa chỉ giao và phương thức thanh toán của một đơn.
 *
 * Thông tin lấy từ `order.shipping` — bản chụp lúc đặt hàng, **không** phải hồ
 * sơ tài khoản hiện tại. Khách đổi địa chỉ mặc định sau khi đặt thì đơn cũ vẫn
 * phải hiện đúng nơi shipper đã tới.
 *
 * `userId: null` là **khách vãng lai** (đặt hàng không đăng nhập), không phải dữ
 * liệu thiếu: nói thẳng điều đó thay vì để trống một dòng trông như lỗi.
 */
export default function OrderCustomerCard({ order }: OrderCustomerCardProps) {
  const paymentLabel =
    PAYMENT_OPTIONS.find((option) => option.value === order.paymentMethod)?.label ?? '—'

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-ink">Khách hàng &amp; giao nhận</h2>

      <dl className="mt-4 space-y-4 text-sm">
        <Field label="Người nhận">
          <p className="font-medium text-ink">{order.shipping.fullName}</p>
          <p className="text-ink-muted">{order.shipping.phone}</p>
          <p className="text-ink-muted">{order.shipping.email}</p>
        </Field>

        <Field label="Địa chỉ giao">
          <p className="text-ink-muted">
            {order.shipping.street}, {order.shipping.ward}, {order.shipping.district},{' '}
            {order.shipping.province}
          </p>
        </Field>

        {order.shipping.note && (
          <Field label="Ghi chú của khách">
            <p className="text-ink-muted">{order.shipping.note}</p>
          </Field>
        )}

        <Field label="Thanh toán">
          <p className="text-ink-muted">{paymentLabel}</p>
        </Field>

        <Field label="Tài khoản">
          {order.userId === null ? (
            <p className="text-ink-muted">Khách vãng lai — đặt hàng không đăng nhập</p>
          ) : (
            <Link
              to={adminCustomerDetailPath(order.userId)}
              className="font-medium text-primary hover:underline"
            >
              Xem hồ sơ khách hàng #{order.userId}
            </Link>
          )}
        </Field>

        <Field label="Ngày đặt">
          <p className="text-ink-muted">{formatDate(order.createdAt)}</p>
        </Field>
      </dl>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  )
}
