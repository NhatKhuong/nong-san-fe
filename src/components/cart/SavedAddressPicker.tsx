import Select from '@/components/ui/Select'
import type { Address } from '@/types'

interface SavedAddressPickerProps {
  addresses: Address[]
  /** Id địa chỉ đang chọn; chuỗi rỗng nghĩa là "nhập địa chỉ mới". */
  value: string
  onChange: (addressId: string) => void
}

/** Chọn nhanh một địa chỉ đã lưu để điền sẵn form thanh toán. */
export default function SavedAddressPicker({
  addresses,
  value,
  onChange,
}: SavedAddressPickerProps) {
  if (addresses.length === 0) return null

  return (
    <div className="mb-4 rounded-xl bg-surface p-4">
      <Select
        label="Chọn từ sổ địa chỉ"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        options={[
          { value: '', label: '— Nhập địa chỉ mới —' },
          ...addresses.map((address) => ({
            value: String(address.id),
            label: `${address.fullName} · ${address.street}, ${address.ward}, ${address.district}${
              address.isDefault ? ' (mặc định)' : ''
            }`,
          })),
        ]}
      />
    </div>
  )
}
