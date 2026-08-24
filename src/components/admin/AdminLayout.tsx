import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import PageFallback from '@/components/layout/PageFallback'

/**
 * Khung chung của khu quản trị `/quan-tri`.
 *
 * **Không dùng lại `MainLayout`, và cũng không thêm cờ `hideChrome` vào nó.**
 * `MainLayout` render `Header`/`Footer`/`TopBar`/`MiniCart` vô điều kiện; nhét
 * một cờ vào đó là đặt mối bận tâm của admin lên đường chạy nóng của mọi lần
 * render storefront và vĩnh viễn không cho khu quản trị có `errorElement` riêng
 * (ADR 0001). Đây là lý do khu này là **mục router top-level thứ hai**.
 *
 * `<Suspense>` ở đây bọc riêng `<Outlet />` — giống hệt `MainLayout` — để sidebar
 * và thanh trên không nháy mỗi lần chuyển trang. Còn `<Suspense>` bọc chính
 * layout này nằm ở `routes/adminRoutes.tsx`.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <AdminSidebar />

      <div className="flex min-h-screen min-w-0 flex-col">
        <AdminTopbar />

        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <ScrollRestoration />
    </div>
  )
}
