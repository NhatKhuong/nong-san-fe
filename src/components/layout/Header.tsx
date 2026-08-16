import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingCart, User } from 'lucide-react'
import Logo from './Logo'
import MobileMenu from './MobileMenu'
import TopBar from './TopBar'
import { MAIN_NAV, ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { selectItemCount, useCartStore } from '@/store/cart.store'
import { selectWishlistCount, useWishlistStore } from '@/store/wishlist.store'

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const navigate = useNavigate()

  const cartCount = useCartStore(selectItemCount)
  const wishlistCount = useWishlistStore(selectWishlistCount)

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = keyword.trim()
    if (!trimmed) return
    navigate(`${ROUTES.SHOP}?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopBar />

      <div className="container-app flex h-18 items-center gap-4">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-2 rounded-lg p-2 text-ink transition hover:bg-surface lg:hidden"
          aria-label="Mở menu"
        >
          <Menu size={24} />
        </button>

        <Logo />

        <form
          onSubmit={handleSearch}
          role="search"
          className="ml-auto hidden max-w-md flex-1 md:block"
        >
          <div className="flex items-center rounded-full border border-line bg-surface pr-1 focus-within:border-primary">
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Bạn muốn tìm nông sản gì?"
              aria-label="Tìm kiếm sản phẩm"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-ink-light"
            />
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
              aria-label="Tìm kiếm"
            >
              <Search size={17} />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-4">
          <Link
            to={ROUTES.ACCOUNT}
            className="hidden rounded-lg p-2.5 text-ink transition hover:bg-surface hover:text-primary sm:block"
            aria-label="Tài khoản của tôi"
          >
            <User size={22} />
          </Link>

          <Link
            to={ROUTES.WISHLIST}
            className="relative rounded-lg p-2.5 text-ink transition hover:bg-surface hover:text-primary"
            aria-label={`Sản phẩm yêu thích (${wishlistCount})`}
          >
            <Heart size={22} />
            <CountBadge value={wishlistCount} />
          </Link>

          <Link
            to={ROUTES.CART}
            className="relative rounded-lg p-2.5 text-ink transition hover:bg-surface hover:text-primary"
            aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
          >
            <ShoppingCart size={22} />
            <CountBadge value={cartCount} />
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-line lg:block" aria-label="Điều hướng chính">
        <div className="container-app flex h-12 items-center gap-8">
          {MAIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.HOME}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition hover:text-primary',
                  isActive ? 'text-primary' : 'text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  )
}

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null
  return (
    <span className="absolute top-1 right-1 flex min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-4.5 font-semibold text-white">
      {value > 99 ? '99+' : value}
    </span>
  )
}
