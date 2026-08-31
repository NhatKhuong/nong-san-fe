import { useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Thông báo lỗi validate; hiển thị đỏ và gắn aria-invalid. */
  error?: string
  hint?: string
  /** Nút hoặc icon nằm sát mép phải bên trong ô, ví dụ nút hiện/ẩn mật khẩu. */
  endAdornment?: React.ReactNode
  /** Class cho div bọc ngoài — chỗ DUY NHẤT đặt được chiều rộng / thuộc tính flex của trường. */
  wrapperClassName?: string
}

/**
 * Ô nhập một dòng, kèm label / hint / thông báo lỗi.
 *
 * **`className` vào trường, `wrapperClassName` vào div bọc.** `className` gắn lên chính thẻ
 * `<input>`; `wrapperClassName` gắn lên div bọc ngoài — nơi duy nhất đặt được chiều rộng và
 * mọi thuộc tính flex (`w-*`, `flex-*`, `basis-*`, `ml-auto`). Đặt `w-*` qua `className` là
 * **vô hiệu** khi component nằm trong một flex container: div bọc vẫn `w-full` nên nuốt trọn
 * cả dòng, còn `w-*` chỉ thu nhỏ cái `<input>` bên trong div đã full-width đó.
 */
export default function Input({
  label,
  error,
  hint,
  endAdornment,
  id,
  className,
  wrapperClassName,
  required,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedById = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            'h-11 w-full rounded-lg border bg-white px-4 text-sm outline-none transition',
            'placeholder:text-ink-light focus:border-primary',
            'disabled:cursor-not-allowed disabled:bg-surface',
            error ? 'border-danger' : 'border-line',
            endAdornment && 'pr-11',
            className,
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute top-1/2 right-1 -translate-y-1/2">{endAdornment}</div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
