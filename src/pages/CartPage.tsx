import { Link } from 'react-router-dom'
import { AlertTriangle, ShoppingBag } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Button from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { EmptyState } from '@/components/ui/StateBlock'
import CartItemRow from '@/components/cart/CartItemRow'
import CartSummaryBox from '@/components/cart/CartSummaryBox'
import CouponForm from '@/components/cart/CouponForm'
import FreeShippingProgress from '@/components/cart/FreeShippingProgress'
import { useCartSummary, useCartValidation } from '@/hooks/useCart'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useCartStore } from '@/store/cart.store'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const syncItem = useCartStore((state) => state.syncItem)
  const removeItem = useCartStore((state) => state.removeItem)

  const summary = useCartSummary()
  const { issues, blockingIssues } = useCartValidation()

  const issuesOf = (productId: number) =>
    issues.filter((issue) => issue.productId === productId)

  /** Đưa giỏ về đúng tồn kho và giá hiện tại, để khách đặt được ngay. */
  function fixCart() {
    for (const issue of issues) {
      if (issue.type === 'out_of_stock') {
        removeItem(issue.productId)
      } else if (issue.type === 'insufficient_stock' && issue.availableStock !== undefined) {
        syncItem(issue.productId, {
          quantity: issue.availableStock,
          stock: issue.availableStock,
        })
      } else if (issue.type === 'price_changed' && issue.currentPrice !== undefined) {
        syncItem(issue.productId, { price: issue.currentPrice })
      }
    }
  }

  return (
    <>
      <SeoMeta
        title="Giỏ hàng"
        description="Xem lại sản phẩm đã chọn, áp mã giảm giá và kiểm tra phí vận chuyển."
      />

      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />

      <div className="container-app py-8">
        <h1 className="mb-6 text-2xl sm:text-3xl">Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <EmptyState
            title="Giỏ hàng đang trống"
            description="Bạn chưa thêm sản phẩm nào. Ghé cửa hàng chọn vài món nông sản tươi nhé."
            action={
              <Link to={ROUTES.SHOP} className={buttonStyles('primary', 'md')}>
                <ShoppingBag size={17} aria-hidden="true" />
                Bắt đầu mua sắm
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              {issues.length > 0 && (
                <div className="mb-5 rounded-xl border border-accent bg-accent-soft p-4">
                  <p className="flex items-start gap-2.5 text-sm">
                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0 text-accent-dark"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="text-accent-dark">
                        Một vài sản phẩm đã thay đổi
                      </strong>
                      <br />
                      Giỏ hàng được lưu từ lần trước nên tồn kho hoặc giá có thể đã khác. Xem
                      chi tiết ở từng sản phẩm bên dưới.
                    </span>
                  </p>
                  <Button variant="outline" size="sm" onClick={fixCart} className="mt-3">
                    Cập nhật giỏ theo dữ liệu mới
                  </Button>
                </div>
              )}

              <ul className="rounded-xl border border-line px-5">
                {items.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    issues={issuesOf(item.productId)}
                  />
                ))}
              </ul>

              <div className="mt-5">
                <Link to={ROUTES.SHOP} className={buttonStyles('ghost', 'md', '-ml-4')}>
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            <aside className="space-y-5">
              <FreeShippingProgress amount={summary.subtotal - summary.discount} />
              <CouponForm />

              <CartSummaryBox>
                {blockingIssues.length > 0 ? (
                  <>
                    <Button fullWidth disabled>
                      Không thể thanh toán
                    </Button>
                    <p className="mt-2 text-center text-xs text-danger">
                      Vui lòng cập nhật giỏ hàng trước khi đặt.
                    </p>
                  </>
                ) : (
                  <Link
                    to={ROUTES.CHECKOUT}
                    className={buttonStyles('primary', 'lg', 'w-full')}
                  >
                    Tiến hành thanh toán
                  </Link>
                )}
              </CartSummaryBox>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
