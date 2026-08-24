import Select from '@/components/ui/Select'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TRANSITIONS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'

interface OrderStatusSelectProps {
  /** Trạng thái hiện tại của đơn — quyết định danh sách lựa chọn. */
  status: OrderStatus
  /** Khoá ô chọn trong lúc mutation của trang cha đang chạy. */
  isPending?: boolean
  /** Trang cha mở hộp xác nhận rồi mới gọi mutation — component này không tự ghi. */
  onSelect: (next: OrderStatus) => void
}

/**
 * Ô chọn trạng thái kế tiếp của một đơn.
 *
 * Danh sách lựa chọn dựng **từ `ORDER_STATUS_TRANSITIONS`**, không liệt kê cả
 * năm trạng thái rồi chặn bằng thông báo: người xử lý đơn chỉ nhìn thấy đúng
 * những bước đi được từ chỗ đang đứng.
 *
 * Đây vẫn chỉ là **tiện lợi, không phải hàng rào** — luật nằm trong
 * `updateOrderStatus()` ở `api/adminOrders.api.ts`, chỗ tương ứng với endpoint
 * mà backend sẽ phải cưỡng chế bằng 422.
 *
 * `delivered` và `cancelled` là trạng thái cuối: ô chọn bị `disabled` và nói rõ
 * lý do, thay vì biến mất — một ô trống không giải thích được vì sao nó trống.
 */
export default function OrderStatusSelect({
  status,
  isPending = false,
  onSelect,
}: OrderStatusSelectProps) {
  const allowed = ORDER_STATUS_TRANSITIONS[status]
  const isFinal = allowed.length === 0

  return (
    <div className="w-full sm:w-64">
      <Select
        label="Chuyển trạng thái"
        aria-label="Chuyển trạng thái đơn hàng"
        disabled={isFinal || isPending}
        /*
         * Luôn quay về giá trị rỗng: ô này là một *hành động*, không phải nơi
         * hiển thị trạng thái hiện tại (badge cạnh mã đơn lo việc đó). Giữ giá
         * trị vừa chọn sẽ khiến ô nói rằng đơn đã đổi trong khi hộp xác nhận
         * còn chưa được bấm.
         */
        value=""
        onChange={(event) => {
          const next = event.target.value
          if (next) onSelect(next as OrderStatus)
        }}
        options={
          isFinal
            ? [{ value: '', label: `${ORDER_STATUS_LABELS[status]} — trạng thái cuối` }]
            : [
                { value: '', label: 'Chọn trạng thái mới…' },
                ...allowed.map((next) => ({ value: next, label: ORDER_STATUS_LABELS[next] })),
              ]
        }
      />

      <p className="mt-1.5 text-xs text-ink-muted">
        {isFinal
          ? `Đơn đã ở "${ORDER_STATUS_LABELS[status]}" nên không đổi trạng thái được nữa.`
          : `Từ "${ORDER_STATUS_LABELS[status]}" chỉ đi tiếp được sang: ${allowed
              .map((next) => ORDER_STATUS_LABELS[next])
              .join(', ')}.`}
      </p>
    </div>
  )
}
