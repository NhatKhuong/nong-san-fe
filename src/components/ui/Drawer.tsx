import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: React.ReactNode
  /** Vùng cố định dưới đáy, dùng cho nút "Thanh toán" của mini-cart. */
  footer?: React.ReactNode
}

/** Panel trượt từ cạnh màn hình — dùng cho mini-cart và bộ lọc trên mobile. */
export default function Drawer({
  isOpen,
  onClose,
  title,
  side = 'right',
  children,
  footer,
}: DrawerProps) {
  const panelRef = useFocusTrap<HTMLElement>(isOpen)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        // Drawer đóng chỉ bị dịch ra ngoài màn hình chứ không ẩn hẳn, nên nếu không
        // đánh dấu `inert` thì người dùng vẫn Tab được vào các nút bên trong.
        inert={!isOpen}
        className={cn(
          'fixed inset-y-0 z-50 flex w-96 max-w-[90vw] flex-col bg-white transition-transform duration-300',
          side === 'right' ? 'right-0' : 'left-0',
          isOpen ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted transition hover:bg-surface"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && <div className="border-t border-line p-5">{footer}</div>}
      </aside>
    </>
  )
}
