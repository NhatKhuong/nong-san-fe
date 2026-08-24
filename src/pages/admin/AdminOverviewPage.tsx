import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Tổng quan khu quản trị — số liệu doanh thu, đơn hàng, khách hàng, tồn kho.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0007**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminOverviewPage() {
  return (
    <>
      <SeoMeta
        title="Tổng quan"
        description="Số liệu tổng hợp của cửa hàng."
      />

      <AdminPageHeader
        title="Tổng quan"
        description="Màn hình số liệu tổng hợp — sẽ có nội dung ở backlog 0007."
      />
    </>
  )
}
