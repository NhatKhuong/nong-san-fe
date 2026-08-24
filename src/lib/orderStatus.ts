import type { OrderStatus } from '@/types'

/**
 * Nhãn tiếng Việt của từng trạng thái đơn — **nguồn duy nhất**.
 *
 * Trước đây bảng này nằm trong `components/account/OrderStatusBadge.tsx`. Khu
 * quản trị cần đúng những chuỗi đó ở ô lọc, ô đổi trạng thái và hộp xác nhận —
 * chép lại là chắc chắn trôi lệch, mà lệch nhãn thì không có lỗi nào nổ ra.
 * File này không phải component nên `OrderStatusBadge.tsx` vẫn chỉ export
 * component (điều kiện của React Fast Refresh).
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
}

/**
 * Các trạng thái được phép chuyển tới từ một trạng thái cho trước.
 *
 * Đây là **luật nghiệp vụ, không phải gợi ý giao diện**: `delivered` và
 * `cancelled` là trạng thái cuối, không quay lui được — đã giao rồi thì không
 * "chưa xác nhận" lại được, đã huỷ rồi thì phải tạo đơn mới. Màn quản trị đơn
 * hàng chỉ được dựng danh sách lựa chọn từ bảng này, không tự liệt kê cả năm
 * trạng thái rồi chặn bằng thông báo.
 *
 * Backend phải gác lại đúng bảng này khi ghép Spring Boot — client chỉ ẩn nút,
 * không phải hàng rào.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}
