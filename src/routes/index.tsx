import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { ROUTES } from '@/lib/constants'

import HomePage from '@/pages/HomePage'
import ErrorPage from '@/pages/ErrorPage'
import NotFoundPage from '@/pages/NotFoundPage'

import {
  AboutPage,
  AccountLayout,
  AddressesPage,
  BlogDetailPage,
  BlogPage,
  CartPage,
  ChangePasswordPage,
  CheckoutPage,
  ContactPage,
  ForgotPasswordPage,
  LoginPage,
  OrderSuccessPage,
  OrdersPage,
  ProductDetailPage,
  ProfilePage,
  ProtectedRoute,
  RegisterPage,
  ShopPage,
  WishlistPage,
} from './lazyPages'

/*
 * Tách code theo route — các trang lazy khai báo ở `lazyPages.ts`.
 *
 * Ba trang dưới đây nạp thẳng: trang chủ là màn hình đầu của phần lớn khách, còn
 * trang lỗi và trang 404 phải hiện được ngay cả khi việc tải một chunk khác thất
 * bại — nếu chúng cũng lazy thì lỗi mạng sẽ dẫn tới trang trắng thay vì trang báo lỗi.
 *
 * ĐÁNH ĐỔI đã đo: vì `HeroSlider` nằm trên màn hình đầu của trang chủ, Swiper bị
 * kéo vào chunk chính (~72 KB) nên mọi route đều tải nó. Cho `HomePage` lazy thì
 * chunk chính còn 350 KB và trang cửa hàng không phải tải Swiper, nhưng trang chủ
 * mất thêm hai lượt request trước khi hiện được gì. Ưu tiên lần hiển thị đầu của
 * trang chủ, vì đó là nơi khách vào nhiều nhất.
 *
 * Khung chờ nằm ở `<Suspense>` trong `MainLayout` nên header và footer không nháy
 * khi chuyển trang.
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    // Lỗi runtime và lỗi loader rơi vào đây. KHÔNG dùng NotFoundPage: mọi lỗi sẽ
    // hiện thành "404 Không tìm thấy trang", vừa sai thông điệp vừa giấu lỗi thật.
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.SHOP, element: <ShopPage /> },
      { path: ROUTES.PRODUCT, element: <ProductDetailPage /> },
      { path: ROUTES.CART, element: <CartPage /> },
      { path: ROUTES.CHECKOUT, element: <CheckoutPage /> },
      { path: ROUTES.ORDER_SUCCESS, element: <OrderSuccessPage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },

      /*
       * Khu vực tài khoản: `ProtectedRoute` chặn khi chưa đăng nhập, `AccountLayout`
       * dựng menu bên trái. Trang yêu thích CỐ Ý nằm ngoài vùng bảo vệ — thẻ sản
       * phẩm cho bấm tim mà không cần đăng nhập nên chặn trang xem lại sẽ mâu thuẫn.
       */
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.ACCOUNT,
            element: <AccountLayout />,
            children: [
              { index: true, element: <ProfilePage /> },
              { path: ROUTES.ACCOUNT_ORDERS, element: <OrdersPage /> },
              { path: ROUTES.ACCOUNT_ADDRESSES, element: <AddressesPage /> },
              { path: ROUTES.ACCOUNT_PASSWORD, element: <ChangePasswordPage /> },
            ],
          },
        ],
      },

      { path: ROUTES.WISHLIST, element: <WishlistPage /> },
      { path: ROUTES.BLOG, element: <BlogPage /> },
      { path: ROUTES.BLOG_DETAIL, element: <BlogDetailPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
