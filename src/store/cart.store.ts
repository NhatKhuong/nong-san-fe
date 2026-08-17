import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { effectivePrice } from '@/lib/format'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  /**
   * Chỉ lưu MÃ giảm giá, không lưu cả object `Coupon`.
   * Giỏ hàng nằm trong localStorage nhiều ngày nên mã có thể đã hết hạn hoặc
   * đơn không còn đủ điều kiện tối thiểu — phải xác thực lại theo giá trị đơn
   * hiện tại (xem `useCoupon`) chứ không tin dữ liệu cũ.
   */
  couponCode: string | null

  /** Thêm sản phẩm; nếu đã có thì cộng dồn số lượng, không vượt tồn kho. */
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  applyCoupon: (code: string) => void
  removeCoupon: () => void
  /** Đồng bộ tồn kho và giá theo dữ liệu mới nhất từ server. */
  syncItem: (productId: number, patch: Partial<Pick<CartItem, 'price' | 'stock' | 'quantity'>>) => void
  clear: () => void
}

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0],
    unit: product.unit,
    price: effectivePrice(product.price, product.salePrice),
    originalPrice: product.price,
    quantity,
    stock: product.stock,
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id)

          if (!existing) {
            return { items: [...state.items, toCartItem(product, Math.min(quantity, product.stock))] }
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) }
                : item,
            ),
          }
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item,
          ),
        })),

      applyCoupon: (code) => set({ couponCode: code.trim().toUpperCase() }),

      removeCoupon: () => set({ couponCode: null }),

      syncItem: (productId, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, ...patch } : item,
          ),
        })),

      clear: () => set({ items: [], couponCode: null }),
    }),
    { name: 'nss_cart' },
  ),
)

/**
 * Selector tách riêng để component chỉ re-render khi con số nó dùng thay đổi.
 * Dùng: `const count = useCartStore(selectItemCount)`
 */
export const selectItemCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const selectIsInCart =
  (productId: number) =>
  (state: CartState): boolean =>
    state.items.some((item) => item.productId === productId)
