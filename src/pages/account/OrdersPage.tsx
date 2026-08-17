import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderRow from '@/components/account/OrderRow'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { ROUTES } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useMyOrders } from '@/hooks/useAuth'

export default function OrdersPage() {
  const { data: orders, isLoading, error, refetch } = useMyOrders()

  return (
    <>
      <SeoMeta
        title="Đơn hàng của tôi"
        description="Theo dõi lịch sử đơn hàng và trạng thái giao hàng."
      />

      <section className="rounded-xl border border-line p-5 sm:p-6">
        <h1 className="text-xl">Đơn hàng của tôi</h1>

        <div className="mt-6">
          {error ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <EmptyState
              title="Bạn chưa có đơn hàng nào"
              description="Đơn đặt lúc chưa đăng nhập không nằm trong danh sách này — bạn vẫn tra cứu được bằng mã đơn."
              action={<OrderLookup />}
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <OrderRow key={order.code} order={order} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

/**
 * Lối thoát cho đơn của khách vãng lai: lịch sử chỉ lọc theo tài khoản, nhưng
 * mã đơn thì tra được. Không có ô này thì đơn đặt lúc chưa đăng nhập coi như mất.
 */
function OrderLookup() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = code.trim()
        if (trimmed) navigate(`${ROUTES.ORDER_SUCCESS}?code=${encodeURIComponent(trimmed)}`)
      }}
      className="flex w-full max-w-sm items-start gap-2"
    >
      <Input
        aria-label="Mã đơn hàng"
        placeholder="NSS-20260817-0001"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <Button type="submit" className="shrink-0">
        Tra cứu
      </Button>
    </form>
  )
}
