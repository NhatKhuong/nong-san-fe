import AdminPageHeader from '@/components/admin/AdminPageHeader'
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Form thêm sản phẩm mới.
 *
 * **Trang rỗng có chủ đích.** Backlog 0003 chỉ dựng khung và chốt hợp đồng
 * (route, type, query key); nội dung thật thuộc **backlog 0004**. Không thêm
 * fetch dữ liệu ở đây — làm vậy là lấn phần của ticket đó.
 */
export default function AdminProductNewPage() {
  return (
    <>
      <SeoMeta
        title="Thêm sản phẩm"
        description="Tạo sản phẩm mới cho cửa hàng."
      />

      <AdminPageHeader
        title="Thêm sản phẩm"
        description="Form thêm sản phẩm — sẽ có nội dung ở backlog 0004."
      />
    </>
  )
}
