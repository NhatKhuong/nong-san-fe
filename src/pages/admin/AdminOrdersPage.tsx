import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import OrderStatusBadge from '@/components/account/OrderStatusBadge'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { adminOrderDetailPath } from '@/lib/constants'
import { formatDate, formatVND } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { AdminOrderQuery, Order, OrderStatus } from '@/types'
import type { DataTableColumn } from '@/components/ui/dataTable.types'

const STATUS_VALUES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

const STATUS_OPTIONS = [
  { value: '', label: 'Mọi trạng thái' },
  ...STATUS_VALUES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] })),
]

function parseStatus(raw: string | null): OrderStatus | undefined {
  return STATUS_VALUES.includes(raw as OrderStatus) ? (raw as OrderStatus) : undefined
}

/**
 * Danh sách đơn hàng của **mọi** khách hàng — lọc, tìm kiếm, mở chi tiết.
 *
 * Bộ lọc và số trang nằm trên **URL** chứ không trong `useState` (CLAUDE.md §5):
 * F5 giữ nguyên chỗ đang đứng, nút Back chạy đúng, và link gửi cho đồng nghiệp
 * mở ra đúng cái bảng đang nhìn.
 *
 * Không có ô sắp xếp: `AdminOrderQuery` cố ý không khai `sort` (hợp đồng chốt ở
 * backlog 0003) — đơn luôn xếp mới nhất trước, vì đơn mới là đơn cần xử lý.
 */
export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = useMemo<AdminOrderQuery>(() => {
    const page = Number(searchParams.get('page'))
    return {
      q: searchParams.get('q')?.trim() || undefined,
      status: parseStatus(searchParams.get('status')),
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [searchParams])

  const [keyword, setKeyword] = useState(query.q ?? '')
  // Bấm Back hoặc gỡ bộ lọc thì ô tìm kiếm phải đổi theo URL.
  useEffect(() => setKeyword(query.q ?? ''), [query.q])

  const { data, isLoading, error, refetch } = useAdminOrders(query)

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

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'code',
      header: 'Mã đơn',
      render: (order) => (
        <div className="min-w-0">
          <p className="font-semibold text-primary-dark">{order.code}</p>
          <p className="text-xs text-ink-muted">{order.items.length} mặt hàng</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Người nhận',
      render: (order) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{order.shipping.fullName}</p>
          <p className="text-xs text-ink-muted">{order.shipping.phone}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày đặt',
      render: (order) => <span className="whitespace-nowrap">{formatDate(order.createdAt)}</span>,
    },
    {
      key: 'total',
      header: 'Tổng tiền',
      align: 'right',
      render: (order) => (
        <span className="font-semibold whitespace-nowrap text-ink">{formatVND(order.total)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'right',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
  ]

  return (
    <>
      <SeoMeta title="Đơn hàng" description="Theo dõi và xử lý đơn hàng của cửa hàng." />

      <AdminPageHeader
        title="Đơn hàng"
        description="Xem đơn của mọi khách hàng, lọc theo trạng thái và cập nhật tiến trình xử lý."
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setFilter('q', keyword.trim())
          }}
          className="flex min-w-0 flex-[2_1_18rem] gap-2"
        >
          <Input
            aria-label="Tìm đơn theo mã đơn, tên hoặc số điện thoại người nhận"
            placeholder="Tìm theo mã đơn, tên hoặc SĐT…"
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
          aria-label="Lọc theo trạng thái đơn"
          options={STATUS_OPTIONS}
          value={query.status ?? ''}
          onChange={(event) => setFilter('status', event.target.value)}
          wrapperClassName="min-w-0 flex-[1_1_12rem]"
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
          title="Không có đơn hàng nào khớp"
          description={
            query.q
              ? `Không tìm thấy đơn nào cho từ khoá "${query.q}". Thử tìm bằng mã đơn hoặc số điện thoại người nhận.`
              : 'Thử bỏ bớt bộ lọc trạng thái để xem toàn bộ đơn hàng.'
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-muted">
            Tìm thấy <strong className="text-ink">{data.total}</strong> đơn hàng
          </p>

          <DataTable
            caption="Danh sách đơn hàng của mọi khách hàng"
            columns={columns}
            rows={data.items}
            rowKey={(order) => order.code}
            /*
             * Cả dòng bấm được thay vì thêm một cột "Xem": bảng đã có năm cột và
             * mọi ô trên dòng đều nói về cùng một đơn. `DataTable` tự lo phần bàn
             * phím (tabIndex + Enter) nên không mất khả năng tiếp cận.
             */
            onRowClick={(order) => navigate(adminOrderDetailPath(order.code))}
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
    </>
  )
}
