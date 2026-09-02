import { useQuery } from '@tanstack/react-query'
import { getPurchaseRequestStatus } from '@/api/orders.api'
import { queryKeys } from './queryKeys'
import { PURCHASE_REQUEST_POLL_INTERVAL_MS } from '@/lib/constants'
import type { PurchaseRequest } from '@/types'

/**
 * Polling `GET /orders/requests/{requestId}` sau khi `createOrderAsync()` trả
 * về `requestId` — dùng ở `CheckoutPage` để theo dõi một yêu cầu đặt hàng bất
 * đồng bộ cho tới khi có kết quả cuối.
 *
 * Tự dừng polling ngay khi `status` không còn `PENDING`: `refetchInterval`
 * đọc dữ liệu **đã fetch được** (`query.state.data`), không phải request đang
 * bay, nên không có khung hình nào bắn thêm một lượt polling thừa sau kết quả
 * cuối.
 *
 * `requestId === null` tắt hẳn query — trạng thái ban đầu của `CheckoutPage`
 * trước khi người dùng bấm "Đặt hàng".
 */
export function usePurchaseRequestStatus(requestId: string | null) {
  return useQuery({
    queryKey: queryKeys.orders.request(requestId ?? ''),
    queryFn: () => getPurchaseRequestStatus(requestId!),
    enabled: requestId !== null,
    refetchInterval: (query) => {
      const data = query.state.data as PurchaseRequest | undefined
      return data && data.status !== 'PENDING' ? false : PURCHASE_REQUEST_POLL_INTERVAL_MS
    },
    // Một yêu cầu FAILED không "sai tạm thời" — hiện lỗi ngay, đừng âm thầm thử
    // lại 404 (requestId hỏng) rồi mới báo cho người dùng.
    retry: false,
    staleTime: 0,
  })
}
