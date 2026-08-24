import Badge from '@/components/ui/Badge'
import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

interface StockBadgeProps {
  stock: number
}

/**
 * Nhãn trạng thái tồn kho của một sản phẩm.
 *
 * Ba mức lấy đúng định nghĩa của bộ lọc `stockStatus` trong `AdminProductQuery`
 * và cùng đọc `LOW_STOCK_THRESHOLD`. Tự viết lại ngưỡng ở đây là để bộ lọc
 * "sắp hết" trả về một tập, còn nhãn trên từng dòng lại nói khác — sai lệch
 * âm thầm, không có lỗi nào nổ ra (`lib/constants.ts`).
 */
export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) return <Badge tone="soldout">Hết hàng</Badge>
  if (stock <= LOW_STOCK_THRESHOLD) return <Badge tone="sale">Sắp hết</Badge>
  return <Badge tone="success">Còn hàng</Badge>
}
