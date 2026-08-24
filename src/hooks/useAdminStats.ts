import { useQuery } from '@tanstack/react-query'
import { getAdminOverview } from '@/api/adminStats.api'
import { queryKeys } from './queryKeys'

/**
 * Số liệu tổng hợp của khu quản trị — **chỉ có hook đọc**.
 *
 * Không có `useMutation` nào và sẽ không bao giờ có: đây là số liệu suy ra từ
 * đơn hàng, sản phẩm và tài khoản, không phải một bản ghi ai đó sửa được.
 *
 * Không cần `invalidate` ở đây. Khoá `['admin', 'overview', days]` nằm dưới gốc
 * `queryKeys.admin.all`, mà `useUpdateOrderStatus` và `useAdminProductMutations`
 * đều quét gốc đó sau mỗi lần ghi — nên đổi trạng thái một đơn ở
 * `/quan-tri/don-hang` là màn Tổng quan tự tính lại khi quay về.
 */
export function useAdminOverview(days: number) {
  return useQuery({
    queryKey: queryKeys.admin.overview(days),
    queryFn: () => getAdminOverview(days),
  })
}
