import { Link } from 'react-router-dom'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import Button from '@/components/ui/Button'
import { productPath } from '@/lib/constants'
import { calcDiscountPercent, formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useUIStore } from '@/store/ui.store'
import type { Product } from '@/types'

interface ProductListItemProps {
  product: Product
  onQuickView?: (product: Product) => void
}

/** Biến thể hàng ngang của ProductCard, dùng khi trang cửa hàng ở chế độ danh sách. */
export default function ProductListItem({ product, onQuickView }: ProductListItemProps) {
  const addItem = useCartStore((state) => state.addItem)
  const openMiniCart = useUIStore((state) => state.openMiniCart)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product.id))

  const discount = calcDiscountPercent(product.price, product.salePrice)
  const isOutOfStock = product.stock <= 0

  return (
    <article className="group flex gap-4 rounded-xl border border-line bg-white p-4 transition hover:border-primary hover:shadow-md sm:gap-5">
      <Link
        to={productPath(product.slug)}
        className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-surface sm:size-40"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge tone="sale" className="absolute top-2 left-2">
            -{discount}%
          </Badge>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Rating value={product.rating} reviewCount={product.reviewCount} />

        <h3 className="mt-1.5 text-base leading-snug font-semibold">
          <Link to={productPath(product.slug)} className="transition hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{product.shortDescription}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span>Đơn vị: {product.unit}</span>
          <span className="hidden sm:inline">·</span>
          <span>Xuất xứ: {product.origin}</span>
          <span className="hidden sm:inline">·</span>
          <span className={cn(isOutOfStock ? 'text-danger' : 'text-success')}>
            {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock}`}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
          <span className="font-heading text-xl font-bold text-primary">
            {formatVND(product.salePrice ?? product.price)}
          </span>
          {product.salePrice !== null && (
            <span className="text-sm text-ink-light line-through">
              {formatVND(product.price)}
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
              aria-pressed={isWishlisted}
              className={cn(
                'flex size-10 items-center justify-center rounded-full border border-line transition hover:border-primary hover:text-primary',
                isWishlisted ? 'text-accent' : 'text-ink',
              )}
            >
              <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                aria-label={`Xem nhanh ${product.name}`}
                className="hidden size-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-primary hover:text-primary sm:flex"
              >
                <Eye size={17} />
              </button>
            )}

            <Button
              size="sm"
              disabled={isOutOfStock}
              onClick={() => {
                addItem(product, 1)
                openMiniCart()
              }}
            >
              <ShoppingCart size={16} aria-hidden="true" />
              {isOutOfStock ? 'Tạm hết' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
