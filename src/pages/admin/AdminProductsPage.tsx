import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Danh sách sản phẩm — lọc, phân trang, sửa, xoá.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0004**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminProductsPage() {
  return (
    <>
      <SeoMeta
        title="Sản phẩm"
        description="Quản lý danh mục sản phẩm của cửa hàng."
      />

      <AdminPageHeader
        title="Sản phẩm"
        description="Danh sách sản phẩm — sẽ có nội dung ở backlog 0004."
      />
    </>
  )
}
