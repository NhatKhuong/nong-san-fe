import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  register,
  updateProfile,
} from '@/api/auth.api'
import { getMyOrders } from '@/api/orders.api'
import { queryKeys } from './queryKeys'
import { selectIsAuthenticated, useAuthStore } from '@/store/auth.store'

/** Trạng thái đăng nhập hiện tại, dùng ở header, route bảo vệ và trang thanh toán. */
export function useCurrentUser() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  return { user, isAuthenticated }
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
