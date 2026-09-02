import { Loader2 } from 'lucide-react'

interface OrderProcessingPanelProps {
  /** Đã polling quá `PURCHASE_REQUEST_SLOW_WARNING_MS` mà vẫn `PENDING`. */
  isSlow: boolean
}

/**
 * Hiện trong lúc `CheckoutPage` chờ kết quả cuối của `POST /orders/async` qua
 * polling `usePurchaseRequestStatus`. Component câm — không tự fetch, không tự
 * đặt hẹn giờ.
 */
export default function OrderProcessingPanel({ isSlow }: OrderProcessingPanelProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-1 rounded-xl bg-surface px-6 py-16 text-center"
    >
      <Loader2 size={40} className="mb-3 animate-spin text-primary" aria-hidden="true" />
      <h2 className="text-lg">Đang xử lý đơn hàng…</h2>
      <p className="mt-1.5 max-w-md text-sm text-ink-muted">
        Vui lòng đợi trong giây lát, đừng tắt hay tải lại trang.
      </p>
      {isSlow && (
        <p className="mt-4 max-w-md text-sm text-accent-dark">
          Việc xử lý đang mất nhiều thời gian hơn dự kiến. Chúng tôi vẫn đang tiếp tục kiểm tra,
          bạn có thể chờ thêm hoặc quay lại sau.
        </p>
      )}
    </div>
  )
}
