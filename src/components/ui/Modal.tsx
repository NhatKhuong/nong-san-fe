import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  /** Chiều rộng tối đa; mặc định vừa cho form và xem nhanh sản phẩm. */
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl',
          SIZE_CLASSES[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
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
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
