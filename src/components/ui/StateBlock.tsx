import { AlertCircle, PackageOpen } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

/** Hiển thị khi truy vấn thành công nhưng không có dữ liệu nào khớp. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-ink-light">
        <PackageOpen size={30} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  /** Thông điệp lấy từ `error.message` của TanStack Query. */
  message?: string
  onRetry?: () => void
}

/** Hiển thị khi truy vấn thất bại, luôn kèm đường thoát cho người dùng. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-white text-danger">
        <AlertCircle size={30} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg">Đã có lỗi xảy ra</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-muted">
        {message ?? 'Không tải được dữ liệu. Vui lòng thử lại sau ít phút.'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-6">
          Thử lại
        </Button>
      )}
    </div>
  )
}
