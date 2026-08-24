import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAuthToken } from '@/api/client'
import type { User, UserRole } from '@/types'

interface AuthState {
  /**
   * Bản cache thông tin người dùng để hiển thị ngay khi mở lại trang.
   * KHÔNG phải nguồn chân lý của phiên đăng nhập — token trong `client.ts` mới là.
   */
  user: User | null
  setUser: (user: User) => void
  clear: () => void
}

/** Phần thật sự nằm trong localStorage — hàm không serialize được nên không tính. */
interface PersistedAuthState {
  user: User | null
}

/** Bản ghi `nss_auth` sinh ra ở version 0, khi `User` chưa có `role`. */
interface LegacyPersistedAuthState {
  user?: (Omit<User, 'role'> & { role?: UserRole }) | null
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
      version: 1,
      /**
       * v0 → v1: bản ghi cũ không có `role`, gán `'customer'`.
       *
       * Dùng `migrate` chứ **không** ép đăng xuất, vì hai lý do: nó mặc định về
       * **quyền thấp nhất** nên không ai bị nâng quyền nhầm, và nó không đá
       * người đang làm việc dở ra ngoài chỉ vì hợp đồng type đổi.
       *
       * Không cần nhánh theo `version`: hàm này idempotent, bản ghi đã có `role`
       * thì giữ nguyên.
       */
      migrate: (persistedState): PersistedAuthState => {
        const legacy = persistedState as LegacyPersistedAuthState | null
        const user = legacy?.user
        if (!user) return { user: null }
        return { user: { ...user, role: user.role ?? 'customer' } }
      },
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

/**
 * Tài khoản đang đăng nhập có phải quản trị không.
 *
 * Chỉ dùng để **vẽ giao diện** (ẩn/hiện menu, chặn route ở client). Đây không
 * phải hàng rào bảo mật — xem JSDoc của `components/auth/AdminRoute.tsx`.
 */
export const selectIsAdmin = (state: AuthState): boolean => state.user?.role === 'admin'
