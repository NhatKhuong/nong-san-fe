import { useQuery } from '@tanstack/react-query'
import {
  getBrands,
  getHeroSlides,
  getPromoBanners,
  getTestimonials,
} from '@/api/marketing.api'
import { queryKeys } from './queryKeys'

export function useHeroSlides() {
  return useQuery({
    queryKey: queryKeys.marketing.heroSlides,
    queryFn: getHeroSlides,
    staleTime: Infinity,
  })
}

export function usePromoBanners() {
  return useQuery({
    queryKey: queryKeys.marketing.promoBanners,
    queryFn: getPromoBanners,
    staleTime: Infinity,
  })
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.marketing.testimonials,
    queryFn: getTestimonials,
    staleTime: Infinity,
  })
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.marketing.brands,
    queryFn: getBrands,
    staleTime: Infinity,
  })
}
