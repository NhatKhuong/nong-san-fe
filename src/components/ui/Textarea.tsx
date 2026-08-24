import { useId } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  /** Class cho div bọc ngoài — chỗ DUY NHẤT đặt được chiều rộng / thuộc tính flex của trường. */
  wrapperClassName?: string
}

/**
 * Ô nhập nhiều dòng, kèm label và thông báo lỗi.
 *
 * **`className` vào trường, `wrapperClassName` vào div bọc.** `className` gắn lên chính thẻ
 * `<textarea>`; `wrapperClassName` gắn lên div bọc ngoài — nơi duy nhất đặt được chiều rộng và
 * mọi thuộc tính flex (`w-*`, `flex-*`, `basis-*`, `ml-auto`). Đặt `w-*` qua `className` là
 * **vô hiệu** khi component nằm trong một flex container: div bọc vẫn `w-full` nên nuốt trọn
 * cả dòng, còn `w-*` chỉ thu nhỏ cái `<textarea>` bên trong div đã full-width đó.
 */
export default function Textarea({
  label,
  error,
  id,
  className,
  wrapperClassName,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={cn(
          'w-full resize-y rounded-lg border bg-white px-4 py-3 text-sm outline-none transition',
          'placeholder:text-ink-light focus:border-primary',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      />

      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
