import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  getAdminProduct,
  getAdminProducts,
  updateProduct,
} from '@/api/adminProducts.api'
import { queryKeys } from './queryKeys'
import type { AdminProductQuery, ProductPayload } from '@/types'

/** Danh sách sản phẩm ở khu quản trị — lọc, sắp xếp và phân trang đến từ URL. */
export function useAdminProducts(query: AdminProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.admin.products.list(query),
    queryFn: () => getAdminProducts(query),
  })
}

/** Chi tiết một sản phẩm để đổ vào form sửa — khoá theo **id**, không phải slug. */
export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.products.detail(id ?? 0),
    queryFn: () => getAdminProduct(id!),
    enabled: id !== undefined,
  })
}

/**
 * Ba thao tác ghi lên catalog.
 *
 * Gom một hook để `invalidateQueries` khai đúng **một** lần: mỗi lần ghi phải
 * quét cả **ba** gốc khoá, không chỉ khoá của khu quản trị.
 *
 * - `admin` — bảng danh sách và form đang mở,
 * - `products` — lưới `/cua-hang`, trang chi tiết, gợi ý tìm kiếm, khoảng giá,
 * - `categories` — `productCount` ở sidebar bộ lọc, tính từ chính catalog vừa đổi.
 *
 * Thiếu hai gốc sau thì storefront hiện dữ liệu cũ **trong cùng phiên** cho tới
 * lần F5 kế tiếp — mà F5 lại là thao tác đầu tiên người kiểm thử làm, nên lỗi
 * này rất dễ lọt qua.
 */
export function useAdminProductMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
  }

  const create = useMutation({ mutationFn: createProduct, onSuccess: invalidate })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({ mutationFn: deleteProduct, onSuccess: invalidate })

  return { create, update, remove }
}
