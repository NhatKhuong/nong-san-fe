import { PAYMENT_OPTIONS } from './paymentOptions'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types'

interface PaymentMethodPickerProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

export default function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-base font-bold">Phương thức thanh toán</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_OPTIONS.map(({ value: option, label, description, icon: Icon }) => {
          const isActive = value === option
          return (
            <label
              key={option}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition',
                isActive
                  ? 'border-primary bg-primary-soft'
                  : 'border-line hover:border-primary-light',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option}
                checked={isActive}
                onChange={() => onChange(option)}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  isActive ? 'bg-primary text-white' : 'bg-surface text-ink-muted',
                )}
              >
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-ink-muted">{description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
