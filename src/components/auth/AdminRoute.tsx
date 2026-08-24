import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useCurrentUser } from '@/hooks/useAuth'

/**
 * Chặn các route chỉ dành cho quản trị.
 *
 * ⚠️ **VÒNG CHẶN NÀY KHÔNG PHẢI BẢO MẬT.** Nó chỉ là trải nghiệm người dùng:
 * giữ người không có quyền khỏi lạc vào màn hình họ không dùng được.
 *
 * Mọi dữ liệu quyết định ở đây — `nss_auth` và `nss_mock_users` — nằm trong
 * localStorage của **chính máy người dùng**. Mở DevTools sửa `nss_auth` thành
 * `role: "admin"` mất đúng 5 giây, và không có gì ở phía client ngăn được điều
 * đó, dù có viết thêm bao nhiêu lớp kiểm tra.
 *
 * **Hàng rào thật duy nhất là filter Spring Security trên tiền tố `/admin/**`
 * ở backend** (ADR 0002, `documents/API_CONTRACT.md` §C.4.2). Token hợp lệ mà
 * sai vai trò → 403; không token → 401. Rủi ro thật ở đây là **nhầm lẫn**: sẽ
 * có người tưởng vòng chặn này có nghĩa gì đó và bỏ qua bước kiểm quyền ở
 * server. Đừng.
 *
 * Chưa đăng nhập thì ghi lại đường dẫn đang muốn vào trong `location.state.from`
 * để `LoginPage` đưa quay đúng chỗ đó sau khi đăng nhập, giống `ProtectedRoute`.
 * Đã đăng nhập nhưng sai vai trò thì về trang chủ — không đẩy sang trang đăng
 * nhập, vì đăng nhập lại cũng không đổi được vai trò.
 */
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useCurrentUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}
