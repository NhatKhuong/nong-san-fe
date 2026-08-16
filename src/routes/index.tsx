import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { ROUTES } from '@/lib/constants'

import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrderSuccessPage from '@/pages/OrderSuccessPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import AccountPage from '@/pages/AccountPage'
import WishlistPage from '@/pages/WishlistPage'
import BlogPage from '@/pages/BlogPage'
import BlogDetailPage from '@/pages/BlogDetailPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
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
      { path: ROUTES.ACCOUNT, element: <AccountPage /> },
      { path: ROUTES.WISHLIST, element: <WishlistPage /> },
      { path: ROUTES.BLOG, element: <BlogPage /> },
      { path: ROUTES.BLOG_DETAIL, element: <BlogDetailPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
