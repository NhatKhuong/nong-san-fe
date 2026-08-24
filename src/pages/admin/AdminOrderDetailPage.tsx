import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Chi tiết một đơn hàng và đổi trạng thái.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0005**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminOrderDetailPage() {
  return (
    <>
      <SeoMeta
        title="Chi tiết đơn hàng"
        description="Xem chi tiết và cập nhật trạng thái một đơn hàng."
      />

      <AdminPageHeader
        title="Chi tiết đơn hàng"
        description="Chi tiết đơn hàng — sẽ có nội dung ở backlog 0005."
      />
    </>
  )
}
