import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Danh sách khách hàng, chỉ đọc.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0006**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminCustomersPage() {
  return (
    <>
      <SeoMeta
        title="Khách hàng"
        description="Danh sách tài khoản khách hàng của cửa hàng."
      />

      <AdminPageHeader
        title="Khách hàng"
        description="Danh sách khách hàng — sẽ có nội dung ở backlog 0006."
      />
    </>
  )
}
