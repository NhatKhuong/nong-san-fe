import { MapPin } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { Address } from '@/types'

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isBusy?: boolean
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isBusy = false,
}: AddressCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-line p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-primary">
          <MapPin size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            {address.fullName}
            <span className="ml-2 font-normal text-ink-muted">{address.phone}</span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {address.street}, {address.ward}, {address.district}, {address.province}
          </p>
        </div>
        {address.isDefault && <Badge tone="new">Mặc định</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-sm">
        <button
          type="button"
          onClick={onEdit}
          className="font-medium text-primary transition hover:underline"
        >
          Sửa
        </button>
        {!address.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={isBusy}
            className="font-medium text-ink-muted transition hover:text-ink disabled:opacity-50"
          >
            Đặt làm mặc định
          </button>
        )}

        {/* Xoá được cả địa chỉ mặc định — `deleteAddress` tự nâng địa chỉ còn lại
            lên thay thế. Nếu ẩn nút ở đây thì người chỉ có một địa chỉ sẽ không
            bao giờ xoá được nó. */}
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          className="ml-auto font-medium text-danger transition hover:underline disabled:opacity-50"
        >
          Xoá
        </button>
      </div>
    </div>
  )
}
