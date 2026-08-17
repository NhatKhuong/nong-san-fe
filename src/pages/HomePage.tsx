import HeroSlider from '@/components/home/HeroSlider'
import FeatureStrip from '@/components/home/FeatureStrip'
import CategoryGrid from '@/components/home/CategoryGrid'
import SaleSection from '@/components/home/SaleSection'
import PromoBanners from '@/components/home/PromoBanners'
import ProductTabs from '@/components/home/ProductTabs'
import BestSellers from '@/components/home/BestSellers'
import CountdownPromo from '@/components/home/CountdownPromo'
import Testimonials from '@/components/home/Testimonials'
import BrandLogos from '@/components/home/BrandLogos'
import BlogPreview from '@/components/home/BlogPreview'
import Newsletter from '@/components/home/Newsletter'

/**
 * Trang chủ — 12 section theo bố cục site mẫu.
 * Nền trắng và nền `surface` xen kẽ để phân tách khối thị giác.
 */
export default function HomePage() {
  return (
    <>
      <title>Nông Sản Sạch — Thực phẩm hữu cơ tươi mỗi ngày</title>
      <meta
        name="description"
        content="Rau củ, trái cây và thịt cá hữu cơ đạt chuẩn, thu hoạch trong ngày và giao tận nhà. Miễn phí vận chuyển cho đơn từ 500.000 ₫."
      />

      <HeroSlider />
      <FeatureStrip />
      <CategoryGrid />
      <SaleSection />
      <PromoBanners />
      <ProductTabs />
      <BestSellers />
      <CountdownPromo />
      <Testimonials />
      <BrandLogos />
      <BlogPreview />
      <Newsletter />
    </>
  )
}
