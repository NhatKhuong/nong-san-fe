import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Rating from '@/components/ui/Rating'
import QuantityPicker from '@/components/ui/QuantityPicker'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { productPath } from '@/lib/constants'
import { calcDiscountPercent, formatVND } from '@/lib/format'
import { useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import type { Product } from '@/types'

interface ProductQuickViewProps {
  product: Product | null
  onClose: () => void
}

export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const openMiniCart = useUIStore((state) => state.openMiniCart)

  // Mở sản phẩm khác thì số lượng phải về 1, không giữ lại của lần trước.
  useEffect(() => {
    setQuantity(1)
  }, [product?.id])

  if (!product) return null

  const discount = calcDiscountPercent(product.price, product.salePrice)
  const isOutOfStock = product.stock <= 0

  function handleAddToCart() {
    if (!product || isOutOfStock) return
    addItem(product, quantity)
    onClose()
    openMiniCart()
  }

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} title="Xem nhanh" size="lg">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover"
          />
          {discount > 0 && (
            <Badge tone="sale" className="absolute top-3 left-3">
              -{discount}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <Rating value={product.rating} reviewCount={product.reviewCount} />
          <h2 className="mt-2 text-xl">{product.name}</h2>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="font-heading text-2xl font-bold text-primary">
              {formatVND(product.salePrice ?? product.price)}
            </span>
            {product.salePrice !== null && (
              <span className="text-ink-light line-through">{formatVND(product.price)}</span>
            )}
            <span className="text-sm text-ink-muted">/ {product.unit}</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {product.shortDescription}
          </p>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-muted">Xuất xứ:</dt>
              <dd className="font-medium">{product.origin}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-muted">Tình trạng:</dt>
              <dd className={isOutOfStock ? 'font-medium text-danger' : 'font-medium text-success'}>
                {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} ${product.unit}`}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-5">
            {!isOutOfStock && (
              <div className="mb-3 flex items-center gap-3">
                <span className="text-sm text-ink-muted">Số lượng:</span>
                <QuantityPicker
                  value={quantity}
                  onChange={setQuantity}
                  max={product.stock}
                  size="sm"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1">
                <ShoppingCart size={17} aria-hidden="true" />
                {isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
              </Button>
              <Link
                to={productPath(product.slug)}
                onClick={onClose}
                className={buttonStyles('outline', 'md')}
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
