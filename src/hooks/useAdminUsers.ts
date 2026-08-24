import { useQuery } from '@tanstack/react-query'
import { getAdminUser, getAdminUsers } from '@/api/adminUsers.api'
import { queryKeys } from './queryKeys'
import type { AdminUserQuery } from '@/types'

/**
 * Khách hàng ở khu quản trị — **chỉ có hook đọc**.
 *
 * Không có `useMutation` nào ở file này, và đó là chủ đích: giai đoạn này màn
 * khách hàng chỉ đọc (backlog 0006). Thiếu hook ghi thì không component nào lỡ
 * tay gọi được, và khi Owner mở "khoá tài khoản" thành ticket riêng thì việc
 * thêm hook ở đây là một thay đổi nhìn thấy được trong diff — chứ không phải
 * một hook đã nằm sẵn chờ ai đó gọi.
 */

/** Danh sách khách hàng — từ khoá và số trang đến từ URL. */
export function useAdminUsers(query: AdminUserQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(query),
    queryFn: () => getAdminUsers(query),
  })
}

/**
 * Hồ sơ một khách hàng — khoá theo **id**, khớp tham số `:id` trên đường dẫn.
 *
 * `enabled` chặn cả `undefined` lẫn `NaN`: `/quan-tri/khach-hang/abc` cho ra
 * `Number('abc') === NaN`, và một `queryFn` chạy với `NaN` sẽ nằm mãi ở nhánh
 * loading thay vì báo lỗi.
 */
export function useAdminUser(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(id ?? 0),
    queryFn: () => getAdminUser(id!),
    enabled: id !== undefined && Number.isInteger(id),
  })
}
