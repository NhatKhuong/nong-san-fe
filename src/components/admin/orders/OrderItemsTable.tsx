import { Link } from 'react-router-dom'
import DataTable from '@/components/ui/DataTable'
import { productPath } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import type { CartItem, Order } from '@/types'
import type { DataTableColumn } from '@/components/ui/dataTable.types'

interface OrderItemsTableProps {
  order: Order
}

/**
 * Các mặt hàng của một đơn kèm phần cộng tiền.
 *
 * Con số lấy nguyên từ `order` chứ **không** tính lại từ `items`: đơn là bản
 * chụp tại thời điểm đặt, giá sản phẩm đã có thể đổi từ đó tới giờ. Tính lại ở
 * đây nghĩa là màn quản trị hiển thị một tổng tiền khác với số khách đã trả —
 * và không có lỗi nào nổ ra.
 */
export default function OrderItemsTable({ order }: OrderItemsTableProps) {
  const columns: DataTableColumn<CartItem>[] = [
    {
      key: 'product',
      header: 'Sản phẩm',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="size-11 shrink-0 rounded-lg border border-line object-cover"
          />
          <div className="min-w-0">
            <Link
              to={productPath(item.slug)}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-1 font-medium text-ink transition hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="text-xs text-ink-muted">{item.unit}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Đơn giá',
      align: 'right',
      render: (item) => <span className="whitespace-nowrap">{formatVND(item.price)}</span>,
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      align: 'right',
      render: (item) => <span className="tabular-nums">{item.quantity}</span>,
    },
    {
      key: 'lineTotal',
      header: 'Thành tiền',
      align: 'right',
      render: (item) => (
        <span className="font-semibold whitespace-nowrap">
          {formatVND(item.price * item.quantity)}
        </span>
      ),
    },
  ]

  return (
    <div>
      <DataTable
        caption={`Các mặt hàng của đơn ${order.code}`}
        columns={columns}
        rows={order.items}
        rowKey={(item) => item.productId}
      />

      <dl className="mt-4 ml-auto max-w-sm space-y-1.5 text-sm">
        <SummaryLine label="Tạm tính" value={formatVND(order.subtotal)} />
        {order.discount > 0 && (
          <SummaryLine
            label={`Giảm giá${order.couponCode ? ` (${order.couponCode})` : ''}`}
            value={`− ${formatVND(order.discount)}`}
          />
        )}
        <SummaryLine
          label="Phí vận chuyển"
          value={order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}
        />
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
          <dt>Tổng cộng</dt>
          <dd className="text-primary-dark">{formatVND(order.total)}</dd>
        </div>
      </dl>
    </div>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
