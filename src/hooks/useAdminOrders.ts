import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAdminOrderByCode,
  getAdminOrders,
  updateOrderStatus,
} from '@/api/adminOrders.api'
import { queryKeys } from './queryKeys'
import type { AdminOrderQuery, OrderStatus } from '@/types'

/** Danh sách đơn hàng ở khu quản trị — lọc và phân trang đến từ URL. */
export function useAdminOrders(query: AdminOrderQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.orders.list(query),
    queryFn: () => getAdminOrders(query),
  })
}

/** Chi tiết một đơn — khoá theo **mã đơn**, khớp tham số `:code` trên đường dẫn. */
export function useAdminOrder(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.orders.detail(code ?? ''),
    queryFn: () => getAdminOrderByCode(code!),
    enabled: code !== undefined && code !== '',
  })
}

/**
 * Đổi trạng thái một đơn.
 *
 * `invalidateQueries` phải quét **cả hai** gốc khoá:
 *
 * - `admin` — bảng danh sách và màn chi tiết đang mở,
 * - `orders` — lịch sử `/tai-khoan/don-hang` và trang tra cứu theo mã đơn của
 *   chính khách hàng đó.
 *
 * Thiếu gốc thứ hai thì khách vẫn thấy trạng thái cũ **trong cùng phiên** cho
 * tới lần F5 kế tiếp — đúng bài học của `useAdminProductMutations`, chỉ khác
 * chỗ dữ liệu bị lệch là trạng thái đơn chứ không phải giá sản phẩm.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code, status }: { code: string; status: OrderStatus }) =>
      updateOrderStatus(code, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
