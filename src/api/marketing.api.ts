import testimonialsJson from '@/mocks/testimonials.json'
import brandsJson from '@/mocks/brands.json'
import { ROUTES, shopByCategoryPath } from '@/lib/constants'
import { delay } from '@/lib/utils'
import type { Brand, HeroSlide, Testimonial } from '@/types'

const testimonials = testimonialsJson as Testimonial[]
const brands = brandsJson as Brand[]

/** Slide hero được khai báo tại đây vì phụ thuộc hằng số route. */
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    eyebrow: 'Thực phẩm hữu cơ',
    title: 'Sự lựa chọn tự nhiên cho sức khoẻ',
    description:
      'Rau củ, trái cây và thịt sạch từ những nông trại đạt chuẩn hữu cơ, giao tận nhà trong ngày.',
    image: 'https://picsum.photos/seed/nss-hero1/1600/700',
    ctaLabel: 'Mua sắm ngay',
    ctaPath: ROUTES.SHOP,
  },
  {
    id: 2,
    eyebrow: 'Nông sản theo mùa',
    title: 'Tươi ngon từ nông trại đến bàn ăn',
    description:
      'Thu hoạch lúc rạng sáng, làm mát ngay và giao trong ngày — giữ trọn độ tươi và dinh dưỡng.',
    image: 'https://picsum.photos/seed/nss-hero2/1600/700',
    ctaLabel: 'Xem rau củ hữu cơ',
    ctaPath: shopByCategoryPath('rau-cu'),
  },
]

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
