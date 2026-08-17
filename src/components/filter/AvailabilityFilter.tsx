interface AvailabilityFilterProps {
  inStockOnly: boolean
  onSaleOnly: boolean
  onChange: (next: { inStockOnly?: boolean; onSaleOnly?: boolean }) => void
}

export default function AvailabilityFilter({
  inStockOnly,
  onSaleOnly,
  onChange,
}: AvailabilityFilterProps) {
  return (
    <div className="space-y-2">
      <CheckboxRow
        label="Chỉ hiện hàng còn"
        checked={inStockOnly}
        onChange={(checked) => onChange({ inStockOnly: checked })}
      />
      <CheckboxRow
        label="Đang giảm giá"
        checked={onSaleOnly}
        onChange={(checked) => onChange({ onSaleOnly: checked })}
      />
    </div>
  )
}

interface CheckboxRowProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function CheckboxRow({ label, checked, onChange }: CheckboxRowProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-surface">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  )
}
