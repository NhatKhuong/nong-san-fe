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
import SeoMeta from '@/components/ui/SeoMeta'

/**
 * Trang chủ — 12 section theo bố cục site mẫu.
 * Nền trắng và nền `surface` xen kẽ để phân tách khối thị giác.
 */
export default function HomePage() {
  return (
    <>
      {/* Không truyền `title` — trang chủ dùng tiêu đề mặc định có cả tagline. */}
      <SeoMeta description="Rau củ, trái cây và thịt cá hữu cơ đạt chuẩn, thu hoạch trong ngày và giao tận nhà. Miễn phí vận chuyển cho đơn từ 500.000 ₫." />

      {/*
        Tiêu đề cấp một của trang chủ. Ẩn về mặt thị giác vì slide hero đã đóng
        vai trò đó bằng hình ảnh — nhưng trang vẫn cần đúng một `<h1>` thật cho
        trình đọc màn hình và cho công cụ tìm kiếm.
      */}
      <h1 className="sr-only">Nông Sản Sạch — thực phẩm hữu cơ tươi mỗi ngày</h1>

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
