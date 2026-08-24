import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, ShoppingBag, Users, Wallet } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import OrdersByStatusChart from '@/components/admin/dashboard/OrdersByStatusChart'
import RevenueChart from '@/components/admin/dashboard/RevenueChart'
import StatTile from '@/components/admin/dashboard/StatTile'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useAdminOverview } from '@/hooks/useAdminStats'
import { formatVND } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Khoảng thời gian chọn sẵn — **preset, không phải bộ lọc ngày tuỳ ý**.
 *
 * Backlog 0007 ghi rõ lọc theo khoảng ngày tuỳ ý là non-goal: hai nút này trả
 * lời đúng hai câu hỏi người vận hành thật sự hỏi ("tuần này thế nào?", "tháng
 * này thế nào?"), còn một cặp date-picker thì thêm cả lịch, cả validate, cả một
 * trạng thái URL mới để nuôi.
 *
 * Hằng số nằm ngoài component nhưng **không export**: file component chỉ được
 * export component (`documents/coding-conventions.md` §3). Ai cần chia sẻ danh
 * sách này với màn khác thì tách file riêng như `adminNav.ts`.
 */
const DAY_PRESETS = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' },
] as const

const DEFAULT_DAYS = 30

/**
 * Tổng quan khu quản trị — 4 ô chỉ số + 2 biểu đồ.
 *
 * **Trang duy nhất trong dự án được `import` recharts** (gián tiếp, qua
 * `components/admin/dashboard/`). Trang này đã `lazy()` ở `adminLazyPages.ts`,
 * nên thư viện nằm trong một chunk chỉ tải khi có người mở `/quan-tri`. Ba luật
 * giữ được điều đó — component biểu đồ chỉ nằm trong `components/admin/dashboard/`,
 * chỉ file này import chúng, và không barrel file nào re-export — được ghi ở
 * ADR 0003. **Mất một luật là recharts rơi vào chunk chính và mọi khách hàng
 * phải tải ~100 KB cho một màn họ không bao giờ mở.**
 *
 * Khoảng thời gian nằm trên **URL** (`?days=7`) chứ không trong `useState`
 * (§5): F5 giữ nguyên khoảng đang xem, nút Back chạy đúng, và link gửi cho đồng
 * nghiệp mở ra đúng cái bảng số đang nhìn.
 *
 * `customerCount` và `lowStockCount` **không đổi theo khoảng** — chúng là ảnh
 * chụp hiện tại, nên hai ô đó cố ý không mang dòng phụ "N ngày gần nhất". Ghi
 * nhãn thời gian lên một con số không có chiều thời gian là nói dối người đọc.
 */
export default function AdminOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  /**
   * Chỉ nhận đúng giá trị có trong `DAY_PRESETS`. `?days=99` hay `?days=abc` rơi
   * về mặc định thay vì gọi API với một khoảng không ai chọn được trên giao diện
   * — URL là dữ liệu do người dùng gõ, không phải dữ liệu tin được.
   */
  const days = useMemo(() => {
    const raw = Number(searchParams.get('days'))
    return DAY_PRESETS.some((preset) => preset.days === raw) ? raw : DEFAULT_DAYS
  }, [searchParams])

  const { data, isLoading, error, refetch } = useAdminOverview(days)

  function selectDays(next: number) {
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous)
      if (next === DEFAULT_DAYS) params.delete('days')
      else params.set('days', String(next))
      return params
    })
  }

  const rangeLabel = `${days} ngày gần nhất`

  return (
    <>
      <SeoMeta title="Tổng quan" description="Số liệu tổng hợp của cửa hàng." />

      <AdminPageHeader
        title="Tổng quan"
        description="Doanh thu, đơn hàng, khách hàng và tồn kho trong khoảng thời gian đang chọn."
        action={
          <div
            role="group"
            aria-label="Khoảng thời gian"
            className="flex gap-1 rounded-full border border-line bg-white p-1"
          >
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset.days}
                type="button"
                aria-pressed={preset.days === days}
                onClick={() => selectDays(preset.days)}
                className={cn(
                  'h-9 rounded-full px-4 text-sm font-semibold transition',
                  preset.days === days
                    ? 'bg-primary text-white'
                    : 'text-ink-muted hover:bg-surface',
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        }
      />

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-32 rounded-card" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-80 rounded-card" />
            <Skeleton className="h-80 rounded-card" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Doanh thu"
              value={formatVND(data.revenue)}
              icon={Wallet}
              hint={`${rangeLabel} · không tính đơn đã huỷ`}
            />
            <StatTile
              label="Đơn hàng"
              value={data.orderCount.toLocaleString('vi-VN')}
              icon={ShoppingBag}
              hint={`${rangeLabel} · gồm cả đơn đã huỷ`}
            />
            <StatTile
              label="Khách hàng"
              value={data.customerCount.toLocaleString('vi-VN')}
              icon={Users}
              hint="Tổng tài khoản khách hàng"
            />
            <StatTile
              label="Sắp hết hàng"
              value={data.lowStockCount.toLocaleString('vi-VN')}
              icon={AlertTriangle}
              hint="Sản phẩm còn tối đa 10"
              tone={data.lowStockCount > 0 ? 'alert' : 'default'}
            />
          </div>

          {data.orderCount === 0 ? (
            <EmptyState
              title="Chưa có đơn nào trong khoảng này"
              description={`Không có đơn hàng nào trong ${rangeLabel}. Thử chọn khoảng 30 ngày để xem bức tranh rộng hơn.`}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <section className="rounded-card border border-line bg-white p-4 sm:p-5">
                <h2 className="text-base">Doanh thu theo ngày</h2>
                <p className="mt-1 mb-4 text-xs text-ink-light">
                  {rangeLabel} · ngày không có đơn hiện mốc 0
                </p>
                <RevenueChart data={data.revenueByDay} />
              </section>

              <section className="rounded-card border border-line bg-white p-4 sm:p-5">
                <h2 className="text-base">Đơn theo trạng thái</h2>
                <p className="mt-1 mb-4 text-xs text-ink-light">
                  {rangeLabel} · đủ 5 trạng thái, kể cả trạng thái đang có 0 đơn
                </p>
                <OrdersByStatusChart data={data.ordersByStatus} />
              </section>
            </div>
          )}
        </div>
      )}
    </>
  )
}
