import Button from './Button'
import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  /** Nói rõ **hậu quả**, không chỉ hỏi "bạn có chắc không?". */
  message: string
  /** Nhãn nút xác nhận — dùng động từ đúng việc ("Xoá sản phẩm"), không phải "OK". */
  confirmLabel?: string
  /** `danger` cho hành động không hoàn tác được (xoá, huỷ đơn). */
  tone?: 'primary' | 'danger'
  /** Khoá cả hai nút trong lúc mutation đang chạy. */
  isPending?: boolean
  onConfirm: () => void
  onClose: () => void
}

/**
 * Hộp xác nhận cho hành động không hoàn tác được.
 *
 * Chỉ là lớp bọc mỏng quanh `Modal` — giam focus, đóng bằng `Esc` và khoá cuộn
 * nền đều đã nằm trong `Modal`, ở đây không dựng lại. Tồn tại vì khu quản trị
 * hỏi lại đúng một kiểu ở nhiều chỗ (xoá sản phẩm, đổi trạng thái đơn), và mỗi
 * lần tự dựng lại bằng `Modal` là một lần có thể quên khoá nút lúc đang gửi.
 *
 * **Không phải chỗ thay cho `window.confirm`.** Nó cố ý không trả Promise: mọi
 * hành động ở đây đều đi kèm một mutation, nên trạng thái mở/đóng thuộc về
 * trang, không thuộc về một lời gọi hàm.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  tone = 'primary',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ink-muted">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Huỷ bỏ
        </Button>
        <Button variant={tone} onClick={onConfirm} isLoading={isPending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
