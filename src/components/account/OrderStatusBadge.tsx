import Badge from '@/components/ui/Badge'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'

/**
 * Tông màu cho từng trạng thái đơn.
 *
 * Nhãn tiếng Việt KHÔNG còn ở đây — nó nằm ở `lib/orderStatus.ts`, vì khu quản
 * trị cũng cần đúng những chuỗi đó ở ngoài badge (ô lọc, ô đổi trạng thái, hộp
 * xác nhận). Giữ hai bản sao là cách chắc chắn để chúng trôi lệch nhau.
 *
 * Backend trả về đúng năm giá trị này (xem `OrderStatus` trong `types/order.ts`).
 */
const STATUS_TONES: Record<OrderStatus, 'neutral' | 'new' | 'success' | 'soldout'> = {
  pending: 'neutral',
  confirmed: 'new',
  shipping: 'new',
  delivered: 'success',
  cancelled: 'soldout',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>
}
