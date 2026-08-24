import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import UserProfileCard from '@/components/admin/users/UserProfileCard'
import OrderStatusBadge from '@/components/account/OrderStatusBadge'
import DataTable from '@/components/ui/DataTable'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAdminOrders } from '@/hooks/useAdminOrders'
import { useAdminUser } from '@/hooks/useAdminUsers'
import { ROUTES, adminOrderDetailPath } from '@/lib/constants'
import { formatDate, formatVND } from '@/lib/format'
import type { Order } from '@/types'
import type { DataTableColumn } from '@/components/ui/dataTable.types'

/** Số đơn gần nhất hiện trong hồ sơ — hết thì bấm sang màn Đơn hàng đã lọc sẵn. */
const RECENT_ORDERS_LIMIT = 10

/**
 * Hồ sơ một khách hàng và lịch sử đơn của **đúng khách đó** — chỉ đọc.
 *
 * **Không mở endpoint mới cho đơn hàng.** Khối lịch sử gọi lại
 * `getAdminOrders({ userId })` — đây chính là chỗ §C.4.2 của hợp đồng được dùng
 * đến, và cũng là lý do quy tắc đó tồn tại: `userId` là bộ lọc hợp lệ **trong**
 * namespace `/admin`, còn `/orders/me` lấy chủ đơn từ JWT và không bao giờ nhận
 * tham số này (§C.4.1, §C.4.3b).
 *
 * Hai truy vấn tách rời chứ không gộp một: hồ sơ và đơn hàng là hai endpoint
 * khác nhau ở backend, hỏng độc lập với nhau, nên mỗi khối tự lo ba nhánh
 * loading / lỗi / rỗng của mình. Đơn hỏng thì hồ sơ vẫn đọc được.
 *
 * **Không có tổng chi tiêu.** Tính nó ở đây nghĩa là tải toàn bộ đơn của khách
 * về trình duyệt rồi cộng tay — đúng thứ §B.12.4 nói là việc của backend. Con số
 * duy nhất hiện ở đây là `total` do chính API phân trang trả về.
 */
export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  /*
   * `/quan-tri/khach-hang/abc` cho ra `NaN`. Chặn ngay tại đây thay vì để nó
   * chạy xuống lớp API: `NaN !== NaN` nên mọi phép so id đều trượt và trang sẽ
   * nằm im ở nhánh loading thay vì nói ra là đường dẫn sai.
   */
  const parsedId = Number(id)
  const userId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined

  const { data: user, isLoading, error, refetch } = useAdminUser(userId)

  /*
   * `userId ?? 0` chứ **không** phải `{}` khi id sai: `{}` là "mọi đơn của mọi
   * khách", tức là đường dẫn hỏng sẽ đổ nguyên danh sách đơn của cửa hàng vào
   * hồ sơ một người không tồn tại. Không có khách nào mang id `0`, nên bộ lọc
   * trả rỗng — mặc định **ít lộ dữ liệu nhất**.
   */
  const ordersQuery = useAdminOrders({ userId: userId ?? 0, limit: RECENT_ORDERS_LIMIT })
  const orders = ordersQuery.data

  const orderColumns: DataTableColumn<Order>[] = [
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
      <SeoMeta
        title={user ? user.fullName : 'Chi tiết khách hàng'}
        description="Thông tin tài khoản và lịch sử mua hàng của một khách."
      />

      <AdminPageHeader
        title={user ? user.fullName : 'Chi tiết khách hàng'}
        description={user ? `Mã khách hàng #${user.id} · ${user.email}` : undefined}
        action={
          <Link to={ROUTES.ADMIN_CUSTOMERS} className={buttonStyles('outline', 'sm')}>
            <ArrowLeft size={16} aria-hidden="true" />
            Về danh sách khách hàng
          </Link>
        }
      />

      {userId === undefined ? (
        <ErrorState message={`Mã khách hàng "${id}" không hợp lệ.`} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading || !user ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl" />
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <UserProfileCard user={user} orderCount={orders?.total} />

          <section className="rounded-xl border border-line bg-white p-5 lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold text-ink">Lịch sử đơn hàng</h2>

            {ordersQuery.error ? (
              <ErrorState
                message={ordersQuery.error.message}
                onRetry={() => ordersQuery.refetch()}
              />
            ) : ordersQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : !orders || orders.items.length === 0 ? (
              <EmptyState
                title="Khách hàng chưa có đơn nào"
                description="Tài khoản đã đăng ký nhưng chưa đặt đơn hàng nào."
              />
            ) : (
              <>
                <DataTable
                  caption={`Đơn hàng của khách hàng #${user.id}`}
                  columns={orderColumns}
                  rows={orders.items}
                  rowKey={(order) => order.code}
                  onRowClick={(order) => navigate(adminOrderDetailPath(order.code))}
                />

                <p className="mt-3 text-sm text-ink-muted">
                  {orders.total > orders.items.length
                    ? `Hiện ${orders.items.length} đơn gần nhất trong tổng ${orders.total} đơn.`
                    : `Tổng ${orders.total} đơn.`}
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </>
  )
}
