import { Suspense, useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageFallback from './PageFallback'
import MiniCart from '@/components/cart/MiniCart'
import { onSessionExpired } from '@/api/client'
import { ROUTES } from '@/lib/constants'

/** Khung chung cho mọi trang: header cố định, nội dung, footer. */
export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Đọc trong callback nên phải qua ref: đăng ký lại listener mỗi lần đổi trang
  // sẽ khiến một request đang bay treo trên bản listener đã bị huỷ.
  const pathnameRef = useRef(location.pathname)
  pathnameRef.current = location.pathname

  /**
   * `client.ts` báo phiên hết hạn thật sự → điều hướng **trong router**, không
   * `window.location.href`. Redirect cứng tải lại cả trang và làm mất
   * `location.state.from`, nên đăng nhập xong người dùng bị ném về trang chủ
   * thay vì quay lại chỗ đang dở.
   */
  useEffect(
    () =>
      onSessionExpired(() => {
        if (pathnameRef.current === ROUTES.LOGIN) return
        navigate(ROUTES.LOGIN, { state: { from: pathnameRef.current } })
      }),
    [navigate],
  )

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
