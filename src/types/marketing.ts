export interface Testimonial {
  id: number
  authorName: string
  authorRole: string
  avatar: string
  rating: number
  content: string
}

export interface Brand {
  id: number
  name: string
  logo: string
}

/** Banner khuyến mãi ở trang chủ. */
export interface PromoBanner {
  id: number
  eyebrow: string
  title: string
  image: string
  path: string
  /** Banner lớn chiếm 2 cột ở desktop. */
  wide: boolean
}

/** Slide của hero banner trang chủ. */
export interface HeroSlide {
  id: number
  eyebrow: string
  title: string
  description: string
  image: string
  ctaLabel: string
  ctaPath: string
}
