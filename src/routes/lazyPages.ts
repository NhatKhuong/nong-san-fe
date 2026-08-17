import { lazy } from 'react'

/**
 * Các trang được tách thành chunk riêng, tải theo nhu cầu.
 *
 * Tách khỏi `routes/index.tsx` để file đó chỉ export `router` — cùng lý do đã
 * tách `buttonStyles.ts` và `paymentOptions.ts`: một file trộn lẫn component với
 * thứ khác sẽ làm React Fast Refresh mất tác dụng khi sửa code.
 *
 * `HomePage`, `ErrorPage`, `NotFoundPage` KHÔNG nằm ở đây — xem ghi chú trong
 * `routes/index.tsx`.
 */
export const ShopPage = lazy(() => import('@/pages/ShopPage'))
export const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
export const CartPage = lazy(() => import('@/pages/CartPage'))
export const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
export const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'))
export const LoginPage = lazy(() => import('@/pages/LoginPage'))
export const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
export const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
export const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
export const BlogPage = lazy(() => import('@/pages/BlogPage'))
export const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'))
export const AboutPage = lazy(() => import('@/pages/AboutPage'))
export const ContactPage = lazy(() => import('@/pages/ContactPage'))

export const ProtectedRoute = lazy(() => import('@/components/auth/ProtectedRoute'))
export const AccountLayout = lazy(() => import('@/components/account/AccountLayout'))
export const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
export const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'))
export const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
export const ChangePasswordPage = lazy(() => import('@/pages/account/ChangePasswordPage'))
