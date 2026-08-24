import { Link } from 'react-router-dom'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { adminProductEditPath, productPath } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductRowActionsProps {
  product: Product
  /** Mở hộp xác nhận ở trang cha — component này không tự gọi mutation. */
  onDelete: (product: Product) => void
  /** Khoá nút trong lúc một mutation của bảng đang chạy. */
  isBusy?: boolean
}

const ACTION_CLASS =
  'flex size-9 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Ba hành động trên một dòng của bảng sản phẩm: xem ở cửa hàng, sửa, xoá.
 *
 * Nút chỉ có icon nên bắt buộc có `aria-label` tiếng Việt — bảng có hàng chục
 * dòng giống hệt nhau, nhãn phải kèm tên sản phẩm thì trình đọc màn hình mới
 * phân biệt được đang ở dòng nào (CLAUDE.md §7).
 */
export default function ProductRowActions({
  product,
  onDelete,
  isBusy = false,
}: ProductRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        to={productPath(product.slug)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Xem "${product.name}" ở cửa hàng`}
        title="Xem ở cửa hàng"
        className={ACTION_CLASS}
      >
        <ExternalLink size={16} aria-hidden="true" />
      </Link>

      <Link
        to={adminProductEditPath(product.id)}
        aria-label={`Sửa "${product.name}"`}
        title="Sửa"
        className={ACTION_CLASS}
      >
        <Pencil size={16} aria-hidden="true" />
      </Link>

      <button
        type="button"
        disabled={isBusy}
        onClick={() => onDelete(product)}
        aria-label={`Xoá "${product.name}"`}
        title="Xoá"
        className={cn(ACTION_CLASS, 'hover:border-danger hover:text-danger')}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
