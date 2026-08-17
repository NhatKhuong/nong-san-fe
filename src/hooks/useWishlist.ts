import { useQuery } from '@tanstack/react-query'
import { getProductsByIds } from '@/api/products.api'
import { queryKeys } from './queryKeys'
import { useWishlistStore } from '@/store/wishlist.store'

/**
 * Sản phẩm trong danh sách yêu thích.
 *
 * Store chỉ giữ id (xem `wishlist.store.ts`), thông tin sản phẩm luôn lấy tươi
 * qua lớp API — nhờ vậy giá và tồn kho hiển thị ở đây không bao giờ là dữ liệu
 * cũ đọng lại trong localStorage.
 */
export function useWishlistProducts() {
  const productIds = useWishlistStore((state) => state.productIds)

  const query = useQuery({
    queryKey: queryKeys.wishlist.products(productIds),
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  })

  return {
    ...query,
    products: productIds.length === 0 ? [] : query.data,
    isEmpty: productIds.length === 0,
  }
}
