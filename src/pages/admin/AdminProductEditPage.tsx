import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Form sửa một sản phẩm đã có.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0004**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminProductEditPage() {
  return (
    <>
      <SeoMeta
        title="Sửa sản phẩm"
        description="Cập nhật thông tin một sản phẩm."
      />

      <AdminPageHeader
        title="Sửa sản phẩm"
        description="Form sửa sản phẩm — sẽ có nội dung ở backlog 0004."
      />
    </>
  )
}
