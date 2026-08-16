import { Link } from 'react-router-dom'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import { productPath } from '@/lib/constants'
import { calcDiscountPercent, formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useUIStore } from '@/store/ui.store'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  /** Hiện thanh tiến trình "đã bán / còn lại" — dùng ở khối Sản phẩm bán chạy. */
  showSoldProgress?: boolean
  onQuickView?: (product: Product) => void
  className?: string
}

export default function ProductCard({
  product,
  showSoldProgress = false,
  onQuickView,
  className,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const openMiniCart = useUIStore((state) => state.openMiniCart)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product.id))

  const discount = calcDiscountPercent(product.price, product.salePrice)
  const isOutOfStock = product.stock <= 0
  const hoverImage = product.images[1] ?? product.images[0]

  // Tỉ lệ đã bán trên tổng nguồn cung, để vẽ thanh tiến trình.
  const totalSupply = product.sold + product.stock
  const soldPercent = totalSupply > 0 ? Math.round((product.sold / totalSupply) * 100) : 100

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem(product, 1)
    openMiniCart()
  }

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:border-primary hover:shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Link to={productPath(product.slug)} tabIndex={-1} aria-hidden="true">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={hoverImage}
            alt=""
            loading="lazy"
            aria-hidden="true"
            className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && <Badge tone="sale">-{discount}%</Badge>}
          {isOutOfStock && <Badge tone="soldout">Hết hàng</Badge>}
        </div>

        {/* Nút phụ trượt vào từ phải khi hover; trên mobile luôn hiển thị. */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transition duration-300 md:translate-x-12 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            aria-pressed={isWishlisted}
            className={cn(
              'flex size-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-primary hover:text-white',
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
              className="flex size-9 items-center justify-center rounded-full bg-white text-ink shadow transition hover:bg-primary hover:text-white"
            >
              <Eye size={17} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Rating value={product.rating} reviewCount={product.reviewCount} />

        <h3 className="mt-2 line-clamp-2 text-sm leading-snug font-semibold">
          <Link to={productPath(product.slug)} className="transition hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 mb-auto text-xs text-ink-muted">{product.unit}</p>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="font-heading text-lg font-bold text-primary">
            {formatVND(product.salePrice ?? product.price)}
          </span>
          {product.salePrice !== null && (
            <span className="text-sm text-ink-light line-through">
              {formatVND(product.price)}
            </span>
          )}
        </div>

        {showSoldProgress && (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              Đã bán <span className="font-semibold text-ink">{product.sold}</span> · Còn{' '}
              <span className="font-semibold text-ink">{product.stock}</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'mt-4 flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition',
            isOutOfStock
              ? 'cursor-not-allowed bg-surface text-ink-light'
              : 'bg-primary-soft text-primary-dark hover:bg-primary hover:text-white',
          )}
        >
          <ShoppingCart size={16} aria-hidden="true" />
          {isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>
  )
}
