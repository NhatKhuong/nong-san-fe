import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAuthToken } from '@/api/client'
import type { User } from '@/types'

interface AuthState {
  /**
   * Bản cache thông tin người dùng để hiển thị ngay khi mở lại trang.
   * KHÔNG phải nguồn chân lý của phiên đăng nhập — token trong `client.ts` mới là.
   */
  user: User | null
  setUser: (user: User) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: 'nss_auth',
      /**
       * Token và user nằm ở hai khoá localStorage khác nhau nên có thể lệch nhau:
       * interceptor 401 xoá token rồi tải lại trang, nhưng `user` vẫn còn — giao
       * diện sẽ tưởng là đang đăng nhập. Token là nguồn chân lý, nên mất token
       * thì bỏ luôn bản cache user.
       */
      onRehydrateStorage: () => (state) => {
        if (state && state.user && !getAuthToken()) state.clear()
      },
    },
  ),
)

export const selectIsAuthenticated = (state: AuthState): boolean => state.user !== null
