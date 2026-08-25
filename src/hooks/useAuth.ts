import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
} from '@/api/auth.api'
import { getMyOrders } from '@/api/orders.api'
import { queryKeys } from './queryKeys'
import { selectIsAdmin, selectIsAuthenticated, useAuthStore } from '@/store/auth.store'

/**
 * Trạng thái đăng nhập hiện tại, dùng ở header, route bảo vệ và trang thanh toán.
 *
 * `isAdmin` chỉ dùng để vẽ giao diện (ẩn/hiện menu, `AdminRoute`) — không phải
 * kiểm quyền. Quyền thật do backend gác, xem JSDoc của `AdminRoute.tsx`.
 */
export function useCurrentUser() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isAdmin = useAuthStore(selectIsAdmin)
  return { user, isAuthenticated, isAdmin }
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      setUser(user)
      // Dữ liệu đã cache lúc chưa đăng nhập (đơn hàng rỗng, sổ địa chỉ lỗi) không còn đúng.
      queryClient.clear()
    },
  })
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: register,
    onSuccess: ({ user }) => {
      setUser(user)
      queryClient.clear()
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear()
      /*
       * Xoá sạch cache để dữ liệu của tài khoản vừa thoát không lọt sang tài
       * khoản đăng nhập kế tiếp.
       *
       * CỐ Ý KHÔNG xoá giỏ hàng và danh sách yêu thích: ở giai đoạn mock chúng
       * là dữ liệu của thiết bị, không gắn với tài khoản. Khi backend đồng bộ
       * hai thứ này theo user thì mới cần xoá ở đây.
       */
      queryClient.clear()
    },
  })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword })
}

/**
 * Đặt lại mật khẩu bằng token trong email.
 *
 * **Cố ý KHÔNG `setUser` và KHÔNG đụng tới phiên** — khác `useLogin`/`useRegister`:
 * `204` không trả token, và tự đăng nhập bằng một token dùng-một-lần là biến nó
 * thành phiên đăng nhập. Trang gọi điều hướng về `/dang-nhap` sau khi thành công.
 */
export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({ mutationFn: updateProfile, onSuccess: setUser })
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword })
}

/** Lịch sử đơn hàng của tài khoản đang đăng nhập. */
export function useMyOrders() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: queryKeys.orders.mine,
    queryFn: getMyOrders,
    enabled: isAuthenticated,
  })
}
