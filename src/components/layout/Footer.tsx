import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '@/components/ui/SocialIcons'
import { MAIN_NAV, ROUTES, STORE_INFO, shopByCategoryPath } from '@/lib/constants'

const CATEGORY_LINKS = [
  { label: 'Rau củ hữu cơ', slug: 'rau-cu' },
  { label: 'Trái cây & hạt', slug: 'trai-cay-hat' },
  { label: 'Thịt hữu cơ', slug: 'thit-huu-co' },
  { label: 'Bơ & trứng', slug: 'bo-trung' },
  { label: 'Sữa & kem', slug: 'sua-kem' },
  { label: 'Nước ép hữu cơ', slug: 'nuoc-ep' },
]

const POLICY_LINKS = [
  { label: 'Chính sách đổi trả', path: ROUTES.ABOUT },
  { label: 'Chính sách vận chuyển', path: ROUTES.ABOUT },
  { label: 'Chính sách bảo mật', path: ROUTES.ABOUT },
  { label: 'Điều khoản sử dụng', path: ROUTES.ABOUT },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'YouTube', icon: YoutubeIcon, href: '#' },
]

export default function Footer() {
  return (
    <footer className="mt-16 bg-surface-alt">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Chúng tôi mang nông sản hữu cơ từ nông trại đến bàn ăn của bạn — tươi ngon, an toàn và
            thân thiện với môi trường.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full bg-white text-ink-muted transition hover:bg-primary hover:text-white"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Về cửa hàng">
          {MAIN_NAV.map((item) => (
            <FooterLink key={item.path} to={item.path}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Danh mục sản phẩm">
          {CATEGORY_LINKS.map((item) => (
            <FooterLink key={item.slug} to={shopByCategoryPath(item.slug)}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <div>
          <h2 className="mb-4 text-base">Thông tin liên hệ</h2>
          <ul className="space-y-3 text-sm text-ink-muted">
            <li className="flex gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {STORE_INFO.address}
            </li>
            <li className="flex gap-2.5">
              <Phone size={17} className="shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${STORE_INFO.hotline.replace(/\s/g, '')}`} className="hover:text-primary">
                {STORE_INFO.hotline}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail size={17} className="shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${STORE_INFO.email}`} className="hover:text-primary">
                {STORE_INFO.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {STORE_INFO.openingHours}
            </li>
          </ul>

          <h2 className="mt-6 mb-3 text-base">Chính sách</h2>
          <ul className="space-y-2 text-sm">
            {POLICY_LINKS.map((item) => (
              <FooterLink key={item.label} to={item.path}>
                {item.label}
              </FooterLink>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-app py-5 text-center text-sm text-ink-muted">
          © {new Date().getFullYear()} {STORE_INFO.name}. Đã đăng ký bản quyền.
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-base">{title}</h2>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-ink-muted transition hover:text-primary">
        {children}
      </Link>
    </li>
  )
}
