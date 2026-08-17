import Badge from '@/components/ui/Badge'
import type { OrderStatus } from '@/types'

/**
 * Nhãn tiếng Việt và tông màu cho từng trạng thái đơn.
 * Backend trả về đúng năm giá trị này (xem `OrderStatus` trong `types/order.ts`).
 */
const STATUS_MAP: Record<OrderStatus, { label: string; tone: 'neutral' | 'new' | 'success' | 'soldout' }> = {
  pending: { label: 'Chờ xác nhận', tone: 'neutral' },
  confirmed: { label: 'Đã xác nhận', tone: 'new' },
  shipping: { label: 'Đang giao', tone: 'new' },
  delivered: { label: 'Đã giao', tone: 'success' },
  cancelled: { label: 'Đã huỷ', tone: 'soldout' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone } = STATUS_MAP[status]
  return <Badge tone={tone}>{label}</Badge>
}
