import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Danh sách đơn hàng của mọi khách hàng.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0005**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminOrdersPage() {
  return (
    <>
      <SeoMeta
        title="Đơn hàng"
        description="Theo dõi và xử lý đơn hàng của cửa hàng."
      />

      <AdminPageHeader
        title="Đơn hàng"
        description="Danh sách đơn hàng — sẽ có nội dung ở backlog 0005."
      />
    </>
  )
}
