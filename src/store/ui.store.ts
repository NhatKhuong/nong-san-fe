import { create } from 'zustand'

interface UIState {
  isMiniCartOpen: boolean
  openMiniCart: () => void
  closeMiniCart: () => void
}

/**
 * Trạng thái UI thuần tuý — không lưu localStorage vì không cần sống qua reload.
 * Bộ lọc trang cửa hàng KHÔNG nằm ở đây: nó thuộc về URL (xem `useProductFilters`),
 * còn việc mở/đóng drawer lọc do `ShopPage` tự quản bằng state cục bộ.
 */
export const useUIStore = create<UIState>((set) => ({
  isMiniCartOpen: false,
  openMiniCart: () => set({ isMiniCartOpen: true }),
  closeMiniCart: () => set({ isMiniCartOpen: false }),
}))
