import { Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import PageFallback from '@/components/layout/PageFallback'
import ErrorPage from '@/pages/ErrorPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ROUTES } from '@/lib/constants'

import {
  AdminCustomerDetailPage,
  AdminCustomersPage,
  AdminLayout,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminOverviewPage,
  AdminProductEditPage,
  AdminProductNewPage,
  AdminProductsPage,
  AdminRoute,
} from './adminLazyPages'

/**
 * Cây route của khu quản trị — **mục top-level THỨ HAI**, sibling với
 * `MainLayout`, không lồng dưới nó (ADR 0001).
 *
 * `MainLayout` render `Header`/`Footer`/`TopBar`/`MiniCart` vô điều kiện và
 * không có cách nào tắt. Phương án "thêm cờ `hideChrome`" đã bị loại: nó nhét
 * mối bận tâm của admin vào layout cửa hàng, đặt một điều kiện lên đường chạy
 * nóng của mọi lần render storefront, và không bao giờ cho khu quản trị có
 * `errorElement` riêng như dưới đây.
 *
 * ⚠️ **Child `{ path: '*' }` ở cuối là BẮT BUỘC.** Thiếu nó, `/quan-tri/xyz`
 * không khớp gì trong cây này nên rơi xuống splat của storefront và render 404
 * kèm nguyên header/footer cửa hàng — sai mà nhìn thoáng qua tưởng đúng.
 *
 * `<Suspense>` bọc ngoài cũng bắt buộc: `AdminRoute` và `AdminLayout` đều lazy,
 * và ở mục top-level không còn `MainLayout` nào đứng trên để cung cấp khung chờ.
 * Khung chờ thứ hai — cho việc chuyển giữa các trang con — nằm trong chính
 * `AdminLayout`, để sidebar không nháy mỗi lần đổi trang.
 */
export const adminRoute: RouteObject = {
  path: ROUTES.ADMIN,
  element: (
    <Suspense fallback={<PageFallback />}>
      <AdminRoute />
    </Suspense>
  ),
  // Lỗi runtime của khu quản trị dừng ở đây, không kéo theo cây storefront.
  errorElement: <ErrorPage />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminOverviewPage /> },

        { path: ROUTES.ADMIN_PRODUCTS, element: <AdminProductsPage /> },
        /*
         * `them-moi` phải đứng TRƯỚC `:id/chinh-sua`? Không — hai path này không
         * đụng nhau (`them-moi` không có đoạn thứ hai), và React Router v7 chấm
         * điểm theo độ cụ thể chứ không theo thứ tự khai báo. Giữ thứ tự này vì
         * nó đọc thuận, không phải vì nó bắt buộc.
         */
        { path: ROUTES.ADMIN_PRODUCT_NEW, element: <AdminProductNewPage /> },
        { path: ROUTES.ADMIN_PRODUCT_EDIT, element: <AdminProductEditPage /> },

        { path: ROUTES.ADMIN_ORDERS, element: <AdminOrdersPage /> },
        { path: ROUTES.ADMIN_ORDER_DETAIL, element: <AdminOrderDetailPage /> },

        { path: ROUTES.ADMIN_CUSTOMERS, element: <AdminCustomersPage /> },
        { path: ROUTES.ADMIN_CUSTOMER_DETAIL, element: <AdminCustomerDetailPage /> },

        // Xem cảnh báo ở JSDoc phía trên — đừng bỏ dòng này.
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
}
