import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Copy, QrCode } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { getOrderByCode } from '@/api/orders.api'
import { PAYMENT_OPTIONS } from '@/components/cart/paymentOptions'
import { queryKeys } from '@/hooks/queryKeys'
import { ROUTES, STORE_INFO } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import SeoMeta from '@/components/ui/SeoMeta'
import type { Order } from '@/types'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  const { data: order, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.detail(code ?? ''),
    queryFn: () => getOrderByCode(code!),
    enabled: Boolean(code),
    retry: false,
  })

  if (!code || error || (!isLoading && !order)) return <NotFound />
  if (isLoading || !order) return <LoadingState />

  const paymentLabel =
    PAYMENT_OPTIONS.find((option) => option.value === order.paymentMethod)?.label ?? '—'

  return (
    <>
      <SeoMeta
        title={`Đặt hàng thành công ${order.code}`}
        description="Cảm ơn bạn đã đặt hàng tại Nông Sản Sạch."
      />

      <div className="container-app max-w-3xl py-12">
        <div className="text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CheckCircle2 size={40} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-2xl sm:text-3xl">Đặt hàng thành công</h1>
          <p className="mt-2 text-ink-muted">
            Cảm ơn bạn đã mua sắm. Chúng tôi sẽ gọi xác nhận trong vòng 30 phút.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2">
            <span className="text-sm text-ink-muted">Mã đơn hàng:</span>
            <strong className="font-heading text-lg text-primary-dark">{order.code}</strong>
          </p>
        </div>

        {order.paymentMethod !== 'cod' && <PaymentInstruction order={order} />}

        <section className="mt-8 rounded-xl border border-line p-5">
          <h2 className="text-base">Sản phẩm đã đặt</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.productId} className="flex gap-3 py-3">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-ink-muted">
                    {item.quantity} × {formatVND(item.price)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatVND(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <SummaryRow label="Tạm tính" value={formatVND(order.subtotal)} />
            {order.discount > 0 && (
              <SummaryRow
                label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ''}`}
                value={`− ${formatVND(order.discount)}`}
              />
            )}
            <SummaryRow
              label="Phí vận chuyển"
              value={order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}
            />
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold">Tổng cộng</dt>
              <dd className="font-heading text-xl font-bold text-primary">
                {formatVND(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-line p-5">
            <h2 className="text-base">Giao đến</h2>
            <address className="mt-3 space-y-1 text-sm text-ink-muted not-italic">
              <p className="font-medium text-ink">{order.shipping.fullName}</p>
              <p>{order.shipping.phone}</p>
              <p>{order.shipping.email}</p>
              <p>
                {order.shipping.street}, {order.shipping.ward}, {order.shipping.district},{' '}
                {order.shipping.province}
              </p>
              {order.shipping.note && <p className="italic">Ghi chú: {order.shipping.note}</p>}
            </address>
          </div>

          <div className="rounded-xl border border-line p-5">
            <h2 className="text-base">Thanh toán</h2>
            <p className="mt-3 text-sm text-ink-muted">{paymentLabel}</p>
            <p className="mt-2 text-sm text-ink-muted">
              Trạng thái: <span className="font-medium text-accent">Chờ xác nhận</span>
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.SHOP} className={buttonStyles('primary', 'md')}>
            Tiếp tục mua sắm
          </Link>
          <Link to={ROUTES.HOME} className={buttonStyles('outline', 'md')}>
            Về trang chủ
          </Link>
        </div>
      </div>
    </>
  )
}

/** Hướng dẫn thanh toán cho các phương thức không phải COD. */
function PaymentInstruction({ order }: { order: Order }) {
  const isTransfer = order.paymentMethod === 'bank_transfer'

  return (
    <section className="mt-8 rounded-xl border border-accent bg-accent-soft p-5">
      <h2 className="text-base text-accent-dark">
        {isTransfer ? 'Thông tin chuyển khoản' : 'Quét mã để thanh toán'}
      </h2>

      {isTransfer ? (
        <dl className="mt-4 space-y-2 text-sm">
          <SummaryRow label="Ngân hàng" value="Vietcombank — CN TP.HCM" />
          <SummaryRow label="Chủ tài khoản" value={STORE_INFO.name} />
          <SummaryRow label="Số tài khoản" value="0071 0004 12345" />
          <SummaryRow label="Số tiền" value={formatVND(order.total)} />
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-muted">Nội dung chuyển khoản</dt>
            <dd className="flex items-center gap-2 font-mono font-semibold">
              {order.code}
              <Copy size={14} className="text-ink-light" aria-hidden="true" />
            </dd>
          </div>
        </dl>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3">
          {/* Khối QR giả lập — khi ghép cổng thanh toán thật sẽ thay bằng ảnh QR từ API */}
          <div className="flex size-40 items-center justify-center rounded-xl border-2 border-dashed border-accent bg-white text-ink-light">
            <QrCode size={64} aria-hidden="true" />
          </div>
          <p className="text-center text-sm text-ink-muted">
            Mã QR minh hoạ. Số tiền cần thanh toán:{' '}
            <strong className="text-ink">{formatVND(order.total)}</strong>
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-muted">
        Đơn hàng được xử lý ngay khi chúng tôi nhận được thanh toán.
      </p>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="container-app max-w-3xl space-y-5 py-12">
      <Skeleton className="mx-auto size-20 rounded-full" />
      <Skeleton className="mx-auto h-8 w-64" />
      <Skeleton className="h-52 rounded-xl" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl">Không tìm thấy đơn hàng</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Mã đơn không đúng hoặc đơn hàng đã bị xoá. Nếu bạn vừa đặt hàng, hãy kiểm tra lại email
        xác nhận.
      </p>
      <Link to={ROUTES.SHOP} className={buttonStyles('primary', 'md', 'mt-6')}>
        Về cửa hàng
      </Link>
    </div>
  )
}
