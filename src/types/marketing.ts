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
