import testimonialsJson from '@/mocks/testimonials.json'
import brandsJson from '@/mocks/brands.json'
import { ROUTES, shopByCategoryPath } from '@/lib/constants'
import { delay } from '@/lib/utils'
import { imageUrl } from '@/lib/image'
import type { Brand, HeroSlide, PromoBanner, Testimonial } from '@/types'

const testimonials = (testimonialsJson as Testimonial[]).map((item) => ({
  ...item,
  avatar: imageUrl(item.avatar),
}))

const brands = (brandsJson as Brand[]).map((brand) => ({
  ...brand,
  logo: imageUrl(brand.logo),
}))

/** Slide hero được khai báo tại đây vì phụ thuộc hằng số route. */
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    eyebrow: 'Thực phẩm hữu cơ',
    title: 'Sự lựa chọn tự nhiên cho sức khoẻ',
    description:
      'Rau củ, trái cây và thịt sạch từ những nông trại đạt chuẩn hữu cơ, giao tận nhà trong ngày.',
    image: imageUrl('/images/banners/hero-1.jpg'),
    ctaLabel: 'Mua sắm ngay',
    ctaPath: ROUTES.SHOP,
  },
  {
    id: 2,
    eyebrow: 'Nông sản theo mùa',
    title: 'Tươi ngon từ nông trại đến bàn ăn',
    description:
      'Thu hoạch lúc rạng sáng, làm mát ngay và giao trong ngày — giữ trọn độ tươi và dinh dưỡng.',
    image: imageUrl('/images/banners/hero-2.jpg'),
    ctaLabel: 'Xem rau củ hữu cơ',
    ctaPath: shopByCategoryPath('rau-cu'),
  },
]

/** Banner khuyến mãi — trước đây nằm cứng trong PromoBanners.tsx, trái quy tắc "component phải câm". */
const promoBanners: PromoBanner[] = [
  {
    id: 1,
    eyebrow: 'Ưu đãi 50%',
    title: 'Rau củ tươi mỗi sáng',
    image: imageUrl('/images/banners/promo-1.jpg'),
    path: shopByCategoryPath('rau-cu'),
    wide: true,
  },
  {
    id: 2,
    eyebrow: 'Giảm 30%',
    title: 'Trái cây theo mùa',
    image: imageUrl('/images/banners/promo-2.jpg'),
    path: shopByCategoryPath('trai-cay-hat'),
    wide: false,
  },
  {
    id: 3,
    eyebrow: 'Giảm 30%',
    title: 'Nước ép hữu cơ',
    image: imageUrl('/images/banners/promo-3.jpg'),
    path: shopByCategoryPath('nuoc-ep'),
    wide: false,
  },
]

/**
 * Banner khuyến mãi trang chủ.
 * Khi có backend: `const { data } = await client.get('/promo-banners'); return data`
 */
export async function getPromoBanners(): Promise<PromoBanner[]> {
  await delay(150)
  return promoBanners
}

/**
 * Slide banner trang chủ.
 * Khi có backend: `const { data } = await client.get('/hero-slides'); return data`
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  await delay(150)
  return heroSlides
}

/**
 * Đánh giá của khách hàng.
 * Khi có backend: `const { data } = await client.get('/testimonials'); return data`
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  await delay(200)
  return testimonials
}

/**
 * Logo thương hiệu đối tác.
 * Khi có backend: `const { data } = await client.get('/brands'); return data`
 */
export async function getBrands(): Promise<Brand[]> {
  await delay(150)
  return brands
}

/**
 * Đăng ký nhận bản tin.
 * Khi có backend: `await client.post('/newsletter/subscribe', { email })`
 */
export async function subscribeNewsletter(email: string): Promise<void> {
  await delay(700)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('Email không hợp lệ.')
  }
}
