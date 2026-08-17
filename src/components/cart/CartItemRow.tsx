import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import QuantityPicker from '@/components/ui/QuantityPicker'
import Badge from '@/components/ui/Badge'
import { productPath } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import { useCartStore } from '@/store/cart.store'
import type { CartItem, CartIssue } from '@/types'

interface CartItemRowProps {
  item: CartItem
  /** Các vấn đề liên quan tới riêng sản phẩm này, lấy từ `useCartValidation`. */
  issues: CartIssue[]
}

export default function CartItemRow({ item, issues }: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const isOutOfStock = issues.some((issue) => issue.type === 'out_of_stock')
  const insufficient = issues.find((issue) => issue.type === 'insufficient_stock')
  const priceChanged = issues.find((issue) => issue.type === 'price_changed')

  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-b-0">
      <Link
        to={productPath(item.slug)}
        className="size-24 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-28"
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link
              to={productPath(item.slug)}
              className="line-clamp-2 font-semibold transition hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-sm text-ink-muted">
              {formatVND(item.price)} / {item.unit}
            </p>

            {isOutOfStock && (
              <Badge tone="soldout" className="mt-2">
                Sản phẩm đã hết hàng
              </Badge>
            )}
            {insufficient && (
              <p className="mt-2 text-sm text-danger">
                Chỉ còn {insufficient.availableStock} {item.unit} — vui lòng giảm số lượng.
              </p>
            )}
            {priceChanged && (
              <p className="mt-2 text-sm text-accent">
                Giá đã đổi thành {formatVND(priceChanged.currentPrice ?? 0)}.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Xoá ${item.name} khỏi giỏ hàng`}
            className="shrink-0 rounded-lg p-2 text-ink-light transition hover:bg-surface hover:text-danger"
          >
            <Trash2 size={17} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantityPicker
            value={item.quantity}
            onChange={(quantity) => updateQuantity(item.productId, quantity)}
            max={insufficient?.availableStock ?? item.stock}
            size="sm"
          />
          <span className="font-heading text-lg font-bold text-primary">
            {formatVND(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  )
}
