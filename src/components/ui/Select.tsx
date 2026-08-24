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
}

export default function Select({
  label,
  error,
  options,
  id,
  className,
  required,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="w-full">
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
