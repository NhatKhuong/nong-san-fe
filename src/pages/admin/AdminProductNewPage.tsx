import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductForm from '@/components/admin/products/ProductForm'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { useAdminProductMutations } from '@/hooks/useAdminProducts'
import { useBrands } from '@/hooks/useMarketing'
import { useCategories } from '@/hooks/useCategories'
import { ROUTES } from '@/lib/constants'
import type { ProductPayload } from '@/types'

/**
 * Form thêm sản phẩm mới.
 *
 * Trang cha giữ mutation, `ProductForm` chỉ nhận props — đúng lệ `AddressForm`
 * với `AddressesPage`. Tạo xong quay về danh sách: sản phẩm mới có
 * `createdAt` là lúc này nên nó đứng đầu bảng khi đang sắp theo `newest`, tức
 * là admin nhìn thấy ngay kết quả việc vừa làm.
 */
export default function AdminProductNewPage() {
  const navigate = useNavigate()
  const { create } = useAdminProductMutations()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: brands, isLoading: loadingBrands } = useBrands()

  function handleSubmit(payload: ProductPayload) {
    create.mutate(payload, { onSuccess: () => navigate(ROUTES.ADMIN_PRODUCTS) })
  }

  return (
    <>
      <SeoMeta title="Thêm sản phẩm" description="Tạo sản phẩm mới cho cửa hàng." />

      <AdminPageHeader
        title="Thêm sản phẩm"
        description="Chọn nhiều ảnh từ máy — chỉ tải lên được khi chạy npm run dev cục bộ."
        action={
          <Link
            to={ROUTES.ADMIN_PRODUCTS}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-primary"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Về danh sách
          </Link>
        }
      />

      {loadingCategories || loadingBrands ? (
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <ProductForm
          categories={categories ?? []}
          brands={brands ?? []}
          submitLabel="Tạo sản phẩm"
          isPending={create.isPending}
          error={create.error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.ADMIN_PRODUCTS)}
        />
      )}
    </>
  )
}
