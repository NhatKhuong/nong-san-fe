import { delay } from '@/lib/utils'
import { getCurrentUserId } from './auth.api'
import type { Address, AddressPayload } from '@/types'

const ADDRESSES_KEY = 'nss_mock_addresses'

/** Bản ghi trong mock store — thêm `userId` mà `Address` không chứa. */
interface StoredAddress extends Address {
  userId: number
}

function readAll(): StoredAddress[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_KEY)
    return raw ? (JSON.parse(raw) as StoredAddress[]) : []
  } catch {
    return []
  }
}

function writeAll(addresses: StoredAddress[]): void {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses))
}

/**
 * Id người dùng hiện tại, hoặc ném lỗi nếu chưa đăng nhập.
 * Backend sẽ trả 401 ở tình huống này; interceptor trong `client.ts` đã xử lý sẵn.
 */
function requireUserId(): number {
  const userId = getCurrentUserId()
  if (userId === null) throw new Error('Vui lòng đăng nhập để dùng sổ địa chỉ.')
  return userId
}

function toPublicAddress({ userId: _userId, ...address }: StoredAddress): Address {
  return address
}

/**
 * Sổ địa chỉ của tài khoản đang đăng nhập, địa chỉ mặc định xếp đầu.
 * Khi có backend: `const { data } = await client.get('/addresses'); return data`
 */
export async function getMyAddresses(): Promise<Address[]> {
  await delay(350)
  const userId = requireUserId()
  return readAll()
    .filter((address) => address.userId === userId)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(toPublicAddress)
}

/**
 * Thêm địa chỉ mới.
 * Khi có backend: `const { data } = await client.post('/addresses', payload); return data`
 */
export async function createAddress(payload: AddressPayload): Promise<Address> {
  await delay(500)
  const userId = requireUserId()
  const all = readAll()
  const mine = all.filter((address) => address.userId === userId)

  // Địa chỉ đầu tiên luôn là mặc định, dù người dùng không tích chọn.
  const isDefault = payload.isDefault || mine.length === 0

  const created: StoredAddress = { ...payload, isDefault, id: Date.now(), userId }
  writeAll([...clearDefaultIfNeeded(all, userId, isDefault), created])
  return toPublicAddress(created)
}

/**
 * Cập nhật một địa chỉ.
 * Khi có backend: `const { data } = await client.put(`/addresses/${id}`, payload); return data`
 */
export async function updateAddress(id: number, payload: AddressPayload): Promise<Address> {
  await delay(500)
  const userId = requireUserId()
  const all = readAll()
  const index = all.findIndex((address) => address.id === id && address.userId === userId)
  if (index === -1) throw new Error('Không tìm thấy địa chỉ.')

  // Không cho bỏ cờ mặc định của địa chỉ mặc định duy nhất — sổ luôn phải có một cái.
  const isDefault = payload.isDefault || all[index].isDefault

  const next = clearDefaultIfNeeded(all, userId, isDefault)
  const updated: StoredAddress = { ...payload, isDefault, id, userId }
  next[index] = updated
  writeAll(next)
  return toPublicAddress(updated)
}

/**
 * Xoá một địa chỉ. Nếu xoá đúng địa chỉ mặc định thì địa chỉ còn lại đầu tiên
 * được nâng lên thay thế, tránh trạng thái sổ không có địa chỉ mặc định nào.
 *
 * Khi có backend: `await client.delete(`/addresses/${id}`)`
 */
export async function deleteAddress(id: number): Promise<void> {
  await delay(400)
  const userId = requireUserId()
  const all = readAll()
  const target = all.find((address) => address.id === id && address.userId === userId)
  if (!target) throw new Error('Không tìm thấy địa chỉ.')

  const remaining = all.filter((address) => address.id !== id)
  if (target.isDefault) {
    const next = remaining.find((address) => address.userId === userId)
    if (next) next.isDefault = true
  }
  writeAll(remaining)
}

/**
 * Đặt một địa chỉ làm mặc định.
 * Khi có backend: `await client.put(`/addresses/${id}/default`)`
 */
export async function setDefaultAddress(id: number): Promise<void> {
  await delay(350)
  const userId = requireUserId()
  const all = readAll()
  if (!all.some((address) => address.id === id && address.userId === userId)) {
    throw new Error('Không tìm thấy địa chỉ.')
  }
  writeAll(
    all.map((address) =>
      address.userId === userId ? { ...address, isDefault: address.id === id } : address,
    ),
  )
}

/** Bỏ cờ mặc định của các địa chỉ khác — sổ chỉ được có đúng một địa chỉ mặc định. */
function clearDefaultIfNeeded(
  all: StoredAddress[],
  userId: number,
  isDefault: boolean,
): StoredAddress[] {
  if (!isDefault) return [...all]
  return all.map((address) =>
    address.userId === userId ? { ...address, isDefault: false } : address,
  )
}
