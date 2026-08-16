import { create } from 'zustand'

interface UIState {
  isMiniCartOpen: boolean
  openMiniCart: () => void
  closeMiniCart: () => void

  isFilterDrawerOpen: boolean
  openFilterDrawer: () => void
  closeFilterDrawer: () => void
}

/** Trạng thái UI thuần tuý — không lưu localStorage vì không cần sống qua reload. */
export const useUIStore = create<UIState>((set) => ({
  isMiniCartOpen: false,
  openMiniCart: () => set({ isMiniCartOpen: true }),
  closeMiniCart: () => set({ isMiniCartOpen: false }),

  isFilterDrawerOpen: false,
  openFilterDrawer: () => set({ isFilterDrawerOpen: true }),
  closeFilterDrawer: () => set({ isFilterDrawerOpen: false }),
}))
