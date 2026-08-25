import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAuthToken, onSessionExpired } from '@/api/client'
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

/**
 * `client.ts` báo phiên đã chết thật sự → dọn luôn bản cache user.
 *
 * Đăng ký ở cấp module, tại **nơi sở hữu dữ liệu**, chứ không nhét vào một
 * component: `/quan-tri` là cây router top-level riêng (ADR 0001) và không đi qua
 * `MainLayout`, nên đặt việc dọn ở layout sẽ bỏ sót nguyên khu quản trị.
 *
 * Trước đây việc này do `window.location.href` trong `client.ts` lo hộ một cách
 * tình cờ: reload cả trang chạy lại `onRehydrateStorage` bên dưới, và chính nó
 * xoá `user` khi token đã mất. Điều hướng trong router **không** chạy lại
 * `onRehydrateStorage`, nên cơ chế dọn phải được nói ra tường minh — nếu không,
 * `selectIsAuthenticated` vẫn báo "đang đăng nhập" và `LoginPage` sẽ đá người
 * dùng ngược lại trang cũ.
 *
 * Chỉ xoá bản cache. Không đụng `migrate`, không tính lại `role`.
 */
onSessionExpired(() => {
  useAuthStore.getState().clear()
})

export const selectIsAuthenticated = (state: AuthState): boolean => state.user !== null

/**
 * Tài khoản đang đăng nhập có phải quản trị không.
 *
 * Chỉ dùng để **vẽ giao diện** (ẩn/hiện menu, chặn route ở client). Đây không
 * phải hàng rào bảo mật — xem JSDoc của `components/auth/AdminRoute.tsx`.
 */
export const selectIsAdmin = (state: AuthState): boolean => state.user?.role === 'admin'
