import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import Drawer from '@/components/ui/Drawer'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ROUTES, productPath } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import { selectItemCount, selectSubtotal, useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'

/**
 * Giỏ hàng rút gọn, trượt ra khi thêm sản phẩm.
 * Gắn một lần ở `MainLayout` nên mọi trang đều dùng chung.
 */
export default function MiniCart() {
  const isOpen = useUIStore((state) => state.isMiniCartOpen)
  const close = useUIStore((state) => state.closeMiniCart)

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const itemCount = useCartStore(selectItemCount)
  const subtotal = useCartStore(selectSubtotal)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={`Giỏ hàng (${itemCount})`}
      footer={
        items.length > 0 ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-ink-muted">Tạm tính</span>
              <span className="font-heading text-xl font-bold text-primary">
                {formatVND(subtotal)}
              </span>
            </div>
            <p className="mb-4 text-xs text-ink-muted">
              Phí vận chuyển và giảm giá được tính ở bước thanh toán.
            </p>
            <div className="flex gap-3">
              <Link
                to={ROUTES.CART}
                onClick={close}
                className={buttonStyles('outline', 'md', 'flex-1')}
              >
                Xem giỏ hàng
              </Link>
              <Link
                to={ROUTES.CHECKOUT}
                onClick={close}
                className={buttonStyles('primary', 'md', 'flex-1')}
              >
                Thanh toán
              </Link>
            </div>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-surface text-ink-light">
            <ShoppingBag size={28} aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-lg">Giỏ hàng đang trống</h3>
          <p className="mt-1.5 text-sm text-ink-muted">
            Thêm vài món nông sản tươi để bắt đầu nhé.
          </p>
          <Link to={ROUTES.SHOP} onClick={close} className={buttonStyles('primary', 'md', 'mt-6')}>
            Xem cửa hàng
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3">
              <Link
                to={productPath(item.slug)}
                onClick={close}
                className="size-18 shrink-0 overflow-hidden rounded-lg bg-surface"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={productPath(item.slug)}
                  onClick={close}
                  className="line-clamp-2 text-sm font-medium transition hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-ink-muted">
                  {item.quantity} × {formatVND(item.price)}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-primary">
                  {formatVND(item.price * item.quantity)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                aria-label={`Xoá ${item.name} khỏi giỏ hàng`}
                className="size-9 shrink-0 self-start rounded-lg text-ink-light transition hover:bg-surface hover:text-danger"
              >
                <Trash2 size={16} className="mx-auto" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
