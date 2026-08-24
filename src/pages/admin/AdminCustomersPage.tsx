import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/ui/DataTable'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import SeoMeta from '@/components/ui/SeoMeta'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import { adminCustomerDetailPath } from '@/lib/constants'
import type { AdminUserQuery, User } from '@/types'
import type { DataTableColumn } from '@/components/ui/dataTable.types'

/**
 * Danh sách tài khoản khách hàng — **chỉ đọc**.
 *
 * Không cột "Thao tác", không nút sửa / xoá / khoá tài khoản: giai đoạn này Owner
 * chốt màn khách hàng chỉ đọc (backlog 0006). Cả dòng bấm được để mở hồ sơ,
 * giống bảng đơn hàng — đó là **điều hướng**, không phải thao tác ghi.
 *
 * Từ khoá và số trang nằm trên **URL** chứ không trong `useState` (CLAUDE.md
 * §5): F5 giữ nguyên chỗ đang đứng, nút Back chạy đúng, và link gửi cho đồng
 * nghiệp mở ra đúng cái bảng đang nhìn.
 *
 * Bảng chỉ liệt kê **khách hàng** (`role === 'customer'`) — Owner chốt 2026-08-24
 * (backlog 0008): tài khoản quản trị là nhân viên nội bộ, không phải khách. Việc
 * lọc nằm ở `getAdminUsers()` chứ **không** ở component, nhờ vậy số đếm dưới đây
 * và `customerCount` của màn Tổng quan (§B.12.4) đọc cùng một tập.
 *
 * Cột "Vai trò" vẫn giữ: đó là **mặc định** của lớp API chứ không phải hàng rào,
 * và cột này sẽ nói đúng ngay khi có vai trò thứ ba.
 */
export default function AdminCustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = useMemo<AdminUserQuery>(() => {
    const page = Number(searchParams.get('page'))
    return {
      q: searchParams.get('q')?.trim() || undefined,
      page: Number.isInteger(page) && page > 0 ? page : 1,
    }
  }, [searchParams])

  const [keyword, setKeyword] = useState(query.q ?? '')
  // Bấm Back hoặc xoá từ khoá khỏi URL thì ô tìm kiếm phải đổi theo URL.
  useEffect(() => setKeyword(query.q ?? ''), [query.q])

  const { data, isLoading, error, refetch } = useAdminUsers(query)

  /** Đổi từ khoá thì luôn về trang 1, nếu không sẽ rơi vào một trang trống. */
  function setFilter(key: string, value: string) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  const columns: DataTableColumn<User>[] = [
    {
      key: 'fullName',
      header: 'Khách hàng',
      render: (user) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-primary-dark">{user.fullName}</p>
          <p className="text-xs text-ink-muted">#{user.id}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <span className="text-ink-muted">{user.email}</span>,
    },
    {
      key: 'phone',
      header: 'Số điện thoại',
      render: (user) => <span className="whitespace-nowrap text-ink-muted">{user.phone}</span>,
    },
    {
      key: 'role',
      header: 'Vai trò',
      align: 'right',
      render: (user) => (
        <Badge tone={user.role === 'admin' ? 'new' : 'neutral'}>
          {user.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
        </Badge>
      ),
    },
  ]

  return (
    <>
      <SeoMeta title="Khách hàng" description="Danh sách tài khoản khách hàng của cửa hàng." />

      <AdminPageHeader
        title="Khách hàng"
        description="Tra cứu tài khoản theo tên, email hoặc số điện thoại và mở hồ sơ chi tiết."
      />

      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4">
        {/* `noValidate`: xem ghi chú cùng lý do trong CheckoutPage.tsx */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            setFilter('q', keyword.trim())
          }}
          className="flex w-full gap-2 sm:w-96"
        >
          <Input
            aria-label="Tìm khách hàng theo tên, email hoặc số điện thoại"
            placeholder="Tìm theo tên, email hoặc SĐT…"
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
          title="Không có khách hàng nào khớp"
          description={
            query.q
              ? `Không tìm thấy khách hàng nào cho từ khoá "${query.q}". Thử tìm bằng email hoặc số điện thoại.`
              : 'Chưa có khách hàng nào trong hệ thống.'
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-muted">
            Tìm thấy <strong className="text-ink">{data.total}</strong> khách hàng
          </p>

          <DataTable
            caption="Danh sách tài khoản khách hàng"
            columns={columns}
            rows={data.items}
            rowKey={(user) => user.id}
            onRowClick={(user) => navigate(adminCustomerDetailPath(user.id))}
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
