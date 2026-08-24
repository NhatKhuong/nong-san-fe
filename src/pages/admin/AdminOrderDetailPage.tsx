import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import OrderCustomerCard from '@/components/admin/orders/OrderCustomerCard'
import OrderItemsTable from '@/components/admin/orders/OrderItemsTable'
import OrderStatusSelect from '@/components/admin/orders/OrderStatusSelect'
import OrderStatusBadge from '@/components/account/OrderStatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/useAdminOrders'
import { ROUTES } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/orderStatus'
import type { OrderStatus } from '@/types'

/**
 * Chi tiết một đơn hàng và đổi trạng thái.
 *
 * Khoá theo **mã đơn** (`:code`), không phải id — mã đơn là thứ duy nhất khách
 * và nhân viên cùng đọc được qua điện thoại, và cũng là khoá của
 * `getOrderByCode()` bên phía khách hàng.
 *
 * Trang giữ mutation; ba component trong `components/admin/orders/` chỉ nhận
 * props và không tự fetch (CLAUDE.md §3).
 */
export default function AdminOrderDetailPage() {
  const { code } = useParams<{ code: string }>()
  const { data: order, isLoading, error, refetch } = useAdminOrder(code)
  const updateStatus = useUpdateOrderStatus()

  /** Trạng thái đang chờ xác nhận — mở hộp thoại, chưa ghi gì cả. */
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)

  return (
    <>
      <SeoMeta
        title={order ? `Đơn ${order.code}` : 'Chi tiết đơn hàng'}
        description="Xem chi tiết và cập nhật trạng thái một đơn hàng."
      />

      <AdminPageHeader
        title={order ? `Đơn ${order.code}` : 'Chi tiết đơn hàng'}
        description={
          order
            ? `Đặt ngày ${formatDate(order.createdAt)} · ${order.items.length} mặt hàng`
            : undefined
        }
        action={
          <Link to={ROUTES.ADMIN_ORDERS} className={buttonStyles('outline', 'sm')}>
            <ArrowLeft size={16} aria-hidden="true" />
            Về danh sách đơn
          </Link>
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading || !order ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base font-semibold text-ink">Trạng thái đơn</h2>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-4">
                <OrderStatusSelect
                  status={order.status}
                  isPending={updateStatus.isPending}
                  onSelect={setPendingStatus}
                />
              </div>

              {/*
                Lỗi của mutation hiện ngay tại chỗ vừa thao tác. Đây cũng là nơi
                luật chuyển trạng thái ở lớp API lộ ra khi có ai gọi vòng qua ô
                chọn — thông điệp đến thẳng từ `updateOrderStatus()`.
              */}
              {updateStatus.isError && (
                <p role="alert" className="mt-3 text-sm text-danger">
                  {updateStatus.error.message}
                </p>
              )}
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-ink">Mặt hàng đã đặt</h2>
              <OrderItemsTable order={order} />
            </section>
          </div>

          <OrderCustomerCard order={order} />
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingStatus !== null}
        title="Đổi trạng thái đơn"
        message={
          pendingStatus === 'cancelled'
            ? `Đơn ${code} sẽ chuyển sang "Đã huỷ". Đây là trạng thái cuối — muốn giao lại thì phải tạo đơn mới.`
            : `Đơn ${code} sẽ chuyển sang "${pendingStatus ? ORDER_STATUS_LABELS[pendingStatus] : ''}". Khách hàng thấy trạng thái mới ngay trong lịch sử đơn của họ.`
        }
        confirmLabel="Đổi trạng thái"
        tone={pendingStatus === 'cancelled' ? 'danger' : 'primary'}
        isPending={updateStatus.isPending}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => {
          if (!code || pendingStatus === null) return
          updateStatus.mutate(
            { code, status: pendingStatus },
            { onSettled: () => setPendingStatus(null) },
          )
        }}
      />
    </>
  )
}
