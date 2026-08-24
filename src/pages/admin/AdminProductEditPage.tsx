import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductForm from '@/components/admin/products/ProductForm'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { useAdminProduct, useAdminProductMutations } from '@/hooks/useAdminProducts'
import { useBrands } from '@/hooks/useMarketing'
import { useCategories } from '@/hooks/useCategories'
import { ROUTES } from '@/lib/constants'
import type { ProductPayload } from '@/types'

/**
 * Form sửa một sản phẩm đã có.
 *
 * Đọc theo **`id`** trên đường dẫn, không phải slug: admin sửa được chính cái
 * slug, nên URL của màn sửa không được treo vào một trường có thể đổi
 * (`adminProducts.api.ts`, `getAdminProduct`).
 */
export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  const { data: product, isLoading, error, refetch } = useAdminProduct(
    isValidId ? productId : undefined,
  )
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { update } = useAdminProductMutations()

  function handleSubmit(payload: ProductPayload) {
    update.mutate(
      { id: productId, payload },
      { onSuccess: () => navigate(ROUTES.ADMIN_PRODUCTS) },
    )
  }

  /**
   * `Product` → `ProductPayload`: bỏ `id`, `rating`, `reviewCount`, `sold`,
   * `createdAt` — form không được đụng tới chúng (§C.3). `images` giữ nguyên
   * đường dẫn tương đối như lớp API trả về.
   */
  const defaultValues: ProductPayload | undefined = product && {
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.salePrice,
    images: product.images,
    categoryId: product.categoryId,
    brandId: product.brandId,
    stock: product.stock,
    unit: product.unit,
    origin: product.origin,
    shortDescription: product.shortDescription,
    description: product.description,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
  }

  return (
    <>
      <SeoMeta title="Sửa sản phẩm" description="Cập nhật thông tin một sản phẩm." />

      <AdminPageHeader
        title={product ? `Sửa: ${product.name}` : 'Sửa sản phẩm'}
        description="Điểm đánh giá và số đã bán do hệ thống tính, không sửa tại đây."
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

      {!isValidId ? (
        <ErrorState message={`Mã sản phẩm "${id}" không hợp lệ.`} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading || !defaultValues ? (
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <ProductForm
          defaultValues={defaultValues}
          categories={categories ?? []}
          brands={brands ?? []}
          submitLabel="Lưu thay đổi"
          isPending={update.isPending}
          error={update.error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.ADMIN_PRODUCTS)}
        />
      )}
    </>
  )
}
