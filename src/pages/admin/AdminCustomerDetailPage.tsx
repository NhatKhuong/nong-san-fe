import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Chi tiết một khách hàng và lịch sử mua hàng.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0006**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminCustomerDetailPage() {
  return (
    <>
      <SeoMeta
        title="Chi tiết khách hàng"
        description="Thông tin tài khoản và lịch sử mua hàng của một khách."
      />

      <AdminPageHeader
        title="Chi tiết khách hàng"
        description="Chi tiết khách hàng — sẽ có nội dung ở backlog 0006."
      />
    </>
  )
}
