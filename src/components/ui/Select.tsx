import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  /** Thông báo lỗi validate; hiển thị đỏ và gắn `aria-invalid`, giống `Input`/`Textarea`. */
  error?: string
  options: SelectOption[]
  /** Class cho div bọc ngoài — chỗ DUY NHẤT đặt được chiều rộng / thuộc tính flex của trường. */
  wrapperClassName?: string
}

/**
 * Dropdown một lựa chọn, kèm label và thông báo lỗi.
 *
 * **`className` vào trường, `wrapperClassName` vào div bọc.** `className` gắn lên chính thẻ
 * `<select>`; `wrapperClassName` gắn lên div bọc ngoài — nơi duy nhất đặt được chiều rộng và
 * mọi thuộc tính flex (`w-*`, `flex-*`, `basis-*`, `ml-auto`). Đặt `w-*` qua `className` là
 * **vô hiệu** khi component nằm trong một flex container: div bọc vẫn `w-full` nên nuốt trọn
 * cả dòng, còn `w-*` chỉ thu nhỏ cái `<select>` bên trong div đã full-width đó.
 */
export default function Select({
  label,
  error,
  options,
  id,
  className,
  wrapperClassName,
  required,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border bg-white pr-10 pl-4',
            'text-sm outline-none transition focus:border-primary',
            error ? 'border-danger' : 'border-line',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted"
        />
      </div>

      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
