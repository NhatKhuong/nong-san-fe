import { lazy } from 'react'

/**
 * Các chunk của khu quản trị, tải theo nhu cầu.
 *
 * Tách khỏi `lazyPages.ts` của storefront chứ không gộp chung, vì hai khu vực là
 * hai cây route riêng và đồ thị phụ thuộc của chúng cố ý không chạm nhau
 * (ADR 0001). Gộp một file thì khách vào trang chủ vẫn kéo theo module khai báo
 * mọi màn quản trị.
 *
 * `AdminRoute` và `AdminLayout` cũng lazy: khách hàng không bao giờ vào
 * `/quan-tri` nên chúng không có lý do gì nằm trong chunk chính. Đổi lại, cây
 * route ở `adminRoutes.tsx` bắt buộc phải có `<Suspense>` bọc ngoài — không có
 * `MainLayout` đứng trên để cung cấp nữa.
 */
export const AdminRoute = lazy(() => import('@/components/auth/AdminRoute'))
export const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))

export const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
export const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
export const AdminProductNewPage = lazy(() => import('@/pages/admin/AdminProductNewPage'))
export const AdminProductEditPage = lazy(() => import('@/pages/admin/AdminProductEditPage'))
export const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
export const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
export const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
export const AdminCustomerDetailPage = lazy(() => import('@/pages/admin/AdminCustomerDetailPage'))
