import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/api/addresses.api'
import { queryKeys } from './queryKeys'
import { selectIsAuthenticated, useAuthStore } from '@/store/auth.store'
import type { Address, AddressPayload } from '@/types'

export function useMyAddresses() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: getMyAddresses,
    enabled: isAuthenticated,
  })
}

/** Địa chỉ mặc định, dùng để tự điền sẵn ở trang thanh toán. */
export function useDefaultAddress(): Address | undefined {
  const { data } = useMyAddresses()
  return data?.find((address) => address.isDefault)
}

/**
 * Bốn thao tác ghi lên sổ địa chỉ.
 * Gom chung một hook vì trang nào dùng cũng cần gần đủ cả bốn, và để chỉ khai
 * báo `invalidateQueries` một lần thay vì lặp ở từng mutation.
 */
export function useAddressMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all })

  const create = useMutation({ mutationFn: createAddress, onSuccess: invalidate })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddressPayload }) =>
      updateAddress(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({ mutationFn: deleteAddress, onSuccess: invalidate })

  const setDefault = useMutation({ mutationFn: setDefaultAddress, onSuccess: invalidate })

  return { create, update, remove, setDefault }
}
