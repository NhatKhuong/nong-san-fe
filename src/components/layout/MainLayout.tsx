import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageFallback from './PageFallback'
import MiniCart from '@/components/cart/MiniCart'

/** Khung chung cho mọi trang: header cố định, nội dung, footer. */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/*
          `<Suspense>` đặt ở đây chứ không bọc cả trang: các route được tách bằng
          `React.lazy`, nếu bọc ngoài thì header và footer cũng biến mất mỗi lần
          chuyển trang.
        */}
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <MiniCart />
      <ScrollRestoration />
    </div>
  )
}
