import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useCurrentUser } from '@/hooks/useAuth'

/**
 * Chặn các route cần đăng nhập.
 *
 * Ghi lại đường dẫn đang muốn vào trong `location.state.from` để `LoginPage` đưa
 * người dùng quay đúng chỗ đó sau khi đăng nhập — nếu không, khách bấm "Tài
 * khoản" rồi đăng nhập xong lại bị ném về trang chủ.
 *
 * Chỉ dùng cho `/tai-khoan/*`. Trang yêu thích KHÔNG bảo vệ: thẻ sản phẩm cho
 * bấm tim ở mọi trang mà không cần đăng nhập, chặn trang xem lại sẽ mâu thuẫn.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useCurrentUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
