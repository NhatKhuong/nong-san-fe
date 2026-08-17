import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddressCard from '@/components/account/AddressCard'
import AddressForm from '@/components/account/AddressForm'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useAddressMutations, useMyAddresses } from '@/hooks/useAddresses'
import SeoMeta from '@/components/ui/SeoMeta'
import type { Address, AddressPayload } from '@/types'

export default function AddressesPage() {
  /** `null` = đang thêm mới, object = đang sửa, `undefined` = modal đóng. */
  const [editing, setEditing] = useState<Address | null | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: addresses, isLoading, error, refetch } = useMyAddresses()
  const { create, update, remove, setDefault } = useAddressMutations()

  const isModalOpen = editing !== undefined
  const activeMutation = editing ? update : create

  function handleSubmit(payload: AddressPayload) {
    const onSuccess = () => setEditing(undefined)
    if (editing) update.mutate({ id: editing.id, payload }, { onSuccess })
    else create.mutate(payload, { onSuccess })
  }

  return (
    <>
      <SeoMeta
        title="Sổ địa chỉ"
        description="Lưu sẵn địa chỉ giao hàng để những lần đặt sau nhanh hơn."
      />

      <section className="rounded-xl border border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl">Sổ địa chỉ</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Địa chỉ mặc định sẽ được điền sẵn khi bạn thanh toán.
            </p>
          </div>
          <Button size="sm" onClick={() => setEditing(null)}>
            <Plus size={16} aria-hidden="true" />
            Thêm địa chỉ
          </Button>
        </div>

        <div className="mt-6">
          {error ? (
            <ErrorState message={error.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <EmptyState
              title="Sổ địa chỉ đang trống"
              description="Lưu sẵn địa chỉ để những lần đặt hàng sau nhanh hơn."
              action={<Button onClick={() => setEditing(null)}>Thêm địa chỉ đầu tiên</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isBusy={remove.isPending || setDefault.isPending}
                  onEdit={() => setEditing(address)}
                  onSetDefault={() => setDefault.mutate(address.id)}
                  onDelete={() => setDeletingId(address.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setEditing(undefined)}
        title={editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      >
        {isModalOpen && (
          <AddressForm
            // Đổi `key` để form nạp lại defaultValues khi chuyển giữa thêm và sửa.
            key={editing?.id ?? 'new'}
            address={editing ?? undefined}
            isPending={activeMutation.isPending}
            error={activeMutation.error}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(undefined)}
          />
        )}
      </Modal>

      <Modal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Xoá địa chỉ"
        size="sm"
      >
        <p className="text-sm text-ink">
          Bạn có chắc muốn xoá địa chỉ này? Thao tác không thể hoàn tác.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Huỷ
          </Button>
          <Button
            variant="danger"
            isLoading={remove.isPending}
            onClick={() =>
              deletingId !== null &&
              remove.mutate(deletingId, { onSuccess: () => setDeletingId(null) })
            }
          >
            Xoá địa chỉ
          </Button>
        </div>
      </Modal>
    </>
  )
}
