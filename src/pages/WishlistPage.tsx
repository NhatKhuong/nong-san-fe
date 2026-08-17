import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2 } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ROUTES } from '@/lib/constants'
import { useWishlistProducts } from '@/hooks/useWishlist'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import SeoMeta from '@/components/ui/SeoMeta'
import { useUIStore } from '@/store/ui.store'

export default function WishlistPage() {
  const { products, isLoading, error, refetch, isEmpty } = useWishlistProducts()
  const clearWishlist = useWishlistStore((state) => state.clear)
  const addItem = useCartStore((state) => state.addItem)
  const openMiniCart = useUIStore((state) => state.openMiniCart)

  /** Chỉ thêm sản phẩm còn hàng — sản phẩm hết hàng sẽ bị bỏ qua chứ không báo lỗi. */
  const inStockProducts = (products ?? []).filter((product) => product.stock > 0)

  function handleAddAll() {
    inStockProducts.forEach((product) => addItem(product))
    if (inStockProducts.length > 0) openMiniCart()
  }

  return (
    <>
      <SeoMeta
        title="Sản phẩm yêu thích"
        description="Danh sách nông sản bạn đã lưu lại để mua sau."
      />

      <Breadcrumb items={[{ label: 'Sản phẩm yêu thích' }]} />

      <div className="container-app py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl">Sản phẩm yêu thích</h1>

          {!isEmpty && (products?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleAddAll}
                disabled={inStockProducts.length === 0}
              >
                <ShoppingCart size={16} aria-hidden="true" />
                Thêm tất cả vào giỏ ({inStockProducts.length})
              </Button>
              <Button variant="ghost" onClick={clearWishlist}>
                <Trash2 size={16} aria-hidden="true" />
                Xoá tất cả
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="sr-only">Danh sách sản phẩm đã lưu</h2>
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error}
            onRetry={() => refetch()}
            skeletonCount={4}
            emptyTitle="Chưa có sản phẩm yêu thích nào"
            emptyDescription="Bấm vào biểu tượng trái tim trên thẻ sản phẩm để lưu lại xem sau."
            emptyAction={
              <Link to={ROUTES.SHOP} className={buttonStyles()}>
                Khám phá cửa hàng
              </Link>
            }
          />
        </div>
      </div>
    </>
  )
}
