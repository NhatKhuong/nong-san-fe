import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, PackageCheck, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import QuantityPicker from '@/components/ui/QuantityPicker'
import Skeleton from '@/components/ui/Skeleton'
import SectionHeading from '@/components/ui/SectionHeading'
import { buttonStyles } from '@/components/ui/buttonStyles'
import ProductGallery from '@/components/product/ProductGallery'
import ProductGrid from '@/components/product/ProductGrid'
import ProductReviews from '@/components/product/ProductReviews'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useReviewSummary } from '@/hooks/useReviews'
import { ROUTES, shopByCategoryPath } from '@/lib/constants'
import { calcDiscountPercent, formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useUIStore } from '@/store/ui.store'

type TabKey = 'description' | 'specs' | 'reviews'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Mô tả' },
  { key: 'specs', label: 'Thông tin bổ sung' },
  { key: 'reviews', label: 'Đánh giá' },
]

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading, error } = useProduct(slug)
  const { data: related, isLoading: isLoadingRelated } = useRelatedProducts(slug)
  const { data: categories } = useCategories()
  const { data: summary } = useReviewSummary(product?.id)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  const addItem = useCartStore((state) => state.addItem)
  const openMiniCart = useUIStore((state) => state.openMiniCart)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWishlisted = useWishlistStore((state) =>
    product ? state.productIds.includes(product.id) : false,
  )

  if (isLoading) return <ProductDetailSkeleton />

  // Slug không tồn tại: getProductBySlug ném lỗi — phải bắt để không văng trắng trang.
  if (error || !product) {
    return (
      <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 max-w-md text-ink-muted">
          Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
        </p>
        <Link to={ROUTES.SHOP} className={buttonStyles('primary', 'md', 'mt-6')}>
          Xem sản phẩm khác
        </Link>
      </div>
    )
  }

  const category = categories?.find((item) => item.id === product.categoryId)
  const discount = calcDiscountPercent(product.price, product.salePrice)
  const isOutOfStock = product.stock <= 0

  function handleAddToCart() {
    if (!product || isOutOfStock) return
    addItem(product, quantity)
    openMiniCart()
  }

  function handleBuyNow() {
    if (!product || isOutOfStock) return
    addItem(product, quantity)
    navigate(ROUTES.CART)
  }

  return (
    <>
      <title>{`${product.name} — Nông Sản Sạch`}</title>
      <meta name="description" content={product.shortDescription} />

      <Breadcrumb
        items={[
          { label: 'Cửa hàng', path: ROUTES.SHOP },
          ...(category ? [{ label: category.name, path: shopByCategoryPath(category.slug) }] : []),
          { label: product.name },
        ]}
      />

      <div className="container-app py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} alt={product.name} />

          <div>
            {discount > 0 && <Badge tone="sale">Giảm {discount}%</Badge>}

            <h1 className="mt-2 text-2xl sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Rating
                value={summary?.total ? summary.average : product.rating}
                reviewCount={summary?.total ?? product.reviewCount}
                size={17}
              />
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-primary underline-offset-2 hover:underline"
              >
                Xem đánh giá
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-heading text-3xl font-bold text-primary">
                {formatVND(product.salePrice ?? product.price)}
              </span>
              {product.salePrice !== null && (
                <span className="text-lg text-ink-light line-through">
                  {formatVND(product.price)}
                </span>
              )}
              <span className="text-sm text-ink-muted">/ {product.unit}</span>
            </div>

            <p className="mt-4 leading-relaxed text-ink-muted">{product.shortDescription}</p>

            <dl className="mt-5 space-y-2 text-sm">
              <SpecRow label="Xuất xứ" value={product.origin} />
              <SpecRow label="Đơn vị" value={product.unit} />
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-ink-muted">Tình trạng</dt>
                <dd className={cn('font-medium', isOutOfStock ? 'text-danger' : 'text-success')}>
                  {isOutOfStock ? 'Tạm hết hàng' : `Còn ${product.stock} ${product.unit}`}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isOutOfStock && (
                <QuantityPicker value={quantity} onChange={setQuantity} max={product.stock} />
              )}

              <Button onClick={handleAddToCart} disabled={isOutOfStock}>
                <ShoppingCart size={17} aria-hidden="true" />
                {isOutOfStock ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
              </Button>

              <Button variant="accent" onClick={handleBuyNow} disabled={isOutOfStock}>
                Mua ngay
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                aria-pressed={isWishlisted}
                className={cn(
                  'flex size-11 items-center justify-center rounded-full border border-line transition hover:border-primary hover:text-primary',
                  isWishlisted ? 'text-accent' : 'text-ink',
                )}
              >
                <Heart size={19} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <ul className="mt-7 grid gap-3 border-t border-line pt-6 text-sm sm:grid-cols-3">
              <Perk icon={Truck} text="Miễn phí giao từ 500.000 ₫" />
              <Perk icon={ShieldCheck} text="Đạt chuẩn hữu cơ" />
              <Perk icon={PackageCheck} text="Đổi trả trong 24 giờ" />
            </ul>
          </div>
        </div>

        <div className="mt-14">
          <div role="tablist" aria-label="Thông tin sản phẩm" className="flex gap-1 border-b border-line">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  '-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-ink-muted hover:text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-7">
            {activeTab === 'description' && (
              <p className="max-w-3xl leading-relaxed text-ink-muted">{product.description}</p>
            )}

            {activeTab === 'specs' && (
              <dl className="max-w-xl divide-y divide-line text-sm">
                <SpecTableRow label="Xuất xứ" value={product.origin} />
                <SpecTableRow label="Đơn vị tính" value={product.unit} />
                <SpecTableRow label="Danh mục" value={category?.name ?? '—'} />
                <SpecTableRow label="Tồn kho" value={`${product.stock} ${product.unit}`} />
                <SpecTableRow label="Đã bán" value={`${product.sold} ${product.unit}`} />
              </dl>
            )}

            {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
          </div>
        </div>

        {(isLoadingRelated || (related && related.length > 0)) && (
          <div className="mt-10">
            <SectionHeading title="Sản phẩm liên quan" />
            <ProductGrid
              products={related}
              isLoading={isLoadingRelated}
              columns={4}
              skeletonCount={4}
            />
          </div>
        )}
      </div>
    </>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function SpecTableRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-3">
      <dt className="w-40 shrink-0 text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function Perk({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <li className="flex items-center gap-2 text-ink-muted">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={17} />
      </span>
      {text}
    </li>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container-app py-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-20" />
          <Skeleton className="h-12 w-72" />
        </div>
      </div>
    </div>
  )
}
