import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ProductRowActions from '@/components/admin/products/ProductRowActions'
import StockBadge from '@/components/admin/products/StockBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAdminProductMutations, useAdminProducts } from '@/hooks/useAdminProducts'
import { useCategories } from '@/hooks/useCategories'
import { ROUTES } from '@/lib/constants'
import { formatVND } from '@/lib/format'
import type { AdminProductQuery, Product, ProductSort } from '@/types'
import type { DataTableColumn } from '@/components/ui/dataTable.types'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: thấp đến cao' },
  { value: 'price_desc', label: 'Giá: cao đến thấp' },
  { value: 'best_selling', label: 'Bán chạy nhất' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
]

const STOCK_OPTIONS = [
  { value: '', label: 'Mọi mức tồn kho' },
  { value: 'in_stock', label: 'Còn hàng' },
  { value: 'low_stock', label: 'Sắp hết' },
  { value: 'out_of_stock', label: 'Hết hàng' },
]

const STOCK_VALUES = ['in_stock', 'low_stock', 'out_of_stock'] as const

function parseSort(raw: string | null): ProductSort {
  return SORT_OPTIONS.some((option) => option.value === raw) ? (raw as ProductSort) : 'newest'
}

function parseStock(raw: string | null): AdminProductQuery['stockStatus'] {
  return STOCK_VALUES.includes(raw as (typeof STOCK_VALUES)[number])
    ? (raw as AdminProductQuery['stockStatus'])
    : undefined
}

/**
 * Danh sách sản phẩm — lọc, phân trang, sửa, xoá.
 *
 * Bộ lọc và số trang nằm trên **URL** chứ không trong `useState` (CLAUDE.md §5):
 * F5 giữ nguyên chỗ đang đứng, nút Back của trình duyệt chạy đúng, và link gửi
 * cho đồng nghiệp mở ra đúng cái bảng đang nhìn.
 */
export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [deleting, setDeleting] = useState<Product | null>(null)

  const query = useMemo<AdminProductQuery>(() => {
    const page = Number(searchParams.get('page'))
    return {
      q: searchParams.get('q')?.trim() || undefined,
      category: searchParams.get('category') || undefined,
      stockStatus: parseStock(searchParams.get('stock')),
      sort: parseSort(searchParams.get('sort')),
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [searchParams])

  const [keyword, setKeyword] = useState(query.q ?? '')
  // Bấm Back hoặc gỡ bộ lọc thì ô tìm kiếm phải đổi theo URL.
  useEffect(() => setKeyword(query.q ?? ''), [query.q])

  const { data, isLoading, error, refetch } = useAdminProducts(query)
  const { data: categories } = useCategories()
  const { remove } = useAdminProductMutations()

  /** Đổi bộ lọc thì luôn về trang 1, nếu không sẽ rơi vào một trang trống. */
  function setFilter(key: string, value: string) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  const categoryOptions = [
    { value: '', label: 'Mọi danh mục' },
    ...(categories ?? []).map((category) => ({
      value: category.slug,
      label: category.parentId === null ? category.name : `— ${category.name}`,
    })),
  ]

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'product',
      header: 'Sản phẩm',
      render: (product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="size-11 shrink-0 rounded-lg border border-line object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{product.name}</p>
            <p className="truncate text-xs text-ink-muted">/{product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      render: (product) =>
        categories?.find((category) => category.id === product.categoryId)?.name ?? '—',
    },
    {
      key: 'price',
      header: 'Giá',
      align: 'right',
      render: (product) => (
        <div className="whitespace-nowrap">
          <span className="font-semibold text-ink">
            {formatVND(product.salePrice ?? product.price)}
          </span>
          {product.salePrice !== null && (
            <span className="ml-2 text-xs text-ink-muted line-through">
              {formatVND(product.price)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Tồn kho',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <span className="tabular-nums">{product.stock}</span>
          <StockBadge stock={product.stock} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'right',
      render: (product) => (
        <ProductRowActions product={product} isBusy={remove.isPending} onDelete={setDeleting} />
      ),
    },
  ]

  return (
    <>
      <SeoMeta title="Sản phẩm" description="Quản lý danh mục sản phẩm của cửa hàng." />

      <AdminPageHeader
        title="Sản phẩm"
        description="Thêm, sửa, xoá sản phẩm đang bán trên cửa hàng."
        action={
          <Link to={ROUTES.ADMIN_PRODUCT_NEW} className={buttonStyles('primary', 'sm')}>
            <Plus size={16} aria-hidden="true" />
            Thêm sản phẩm
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setFilter('q', keyword.trim())
          }}
          className="flex w-full gap-2 sm:w-72"
        >
          <Input
            aria-label="Tìm sản phẩm theo tên hoặc slug"
            placeholder="Tìm theo tên hoặc slug…"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button
            type="submit"
            aria-label="Tìm"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark"
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </form>

        <Select
          aria-label="Lọc theo danh mục"
          options={categoryOptions}
          value={query.category ?? ''}
          onChange={(event) => setFilter('category', event.target.value)}
          className="w-full sm:w-52"
        />
        <Select
          aria-label="Lọc theo tồn kho"
          options={STOCK_OPTIONS}
          value={query.stockStatus ?? ''}
          onChange={(event) => setFilter('stock', event.target.value)}
          className="w-full sm:w-44"
        />
        <Select
          aria-label="Sắp xếp sản phẩm"
          options={SORT_OPTIONS}
          value={query.sort}
          onChange={(event) => setFilter('sort', event.target.value)}
          className="w-full sm:ml-auto sm:w-52"
        />
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="Không có sản phẩm nào khớp"
          description={
            query.q
              ? `Không tìm thấy sản phẩm nào cho từ khoá "${query.q}".`
              : 'Thử bỏ bớt bộ lọc, hoặc thêm sản phẩm mới cho cửa hàng.'
          }
          action={
            <Link to={ROUTES.ADMIN_PRODUCT_NEW} className={buttonStyles()}>
              Thêm sản phẩm
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-muted">
            Tìm thấy <strong className="text-ink">{data.total}</strong> sản phẩm
          </p>

          <DataTable
            caption="Danh sách sản phẩm của cửa hàng"
            columns={columns}
            rows={data.items}
            rowKey={(product) => product.id}
          />

          <div className="mt-6">
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={(page) => setFilter('page', page > 1 ? String(page) : '')}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Xoá sản phẩm"
        message={`"${deleting?.name}" sẽ biến mất khỏi cả khu quản trị lẫn trang cửa hàng. Thao tác không thể hoàn tác.`}
        confirmLabel="Xoá sản phẩm"
        tone="danger"
        isPending={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting !== null && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </>
  )
}
