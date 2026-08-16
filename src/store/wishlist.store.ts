import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  /** Chỉ lưu id — thông tin sản phẩm luôn lấy tươi từ lớp API. */
  productIds: number[]
  toggle: (productId: number) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),

      clear: () => set({ productIds: [] }),
    }),
    { name: 'nss_wishlist' },
  ),
)

export const selectWishlistCount = (state: WishlistState): number => state.productIds.length
