import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, pageTitle } from '@/lib/seo'

interface SeoMetaProps {
  /** Tiêu đề riêng của trang; tên cửa hàng được ghép vào sau. */
  title?: string
  description: string
  /** Đường dẫn ảnh chia sẻ; bỏ trống thì dùng ảnh mặc định. */
  image?: string
  /** `article` cho bài viết, `product` cho trang sản phẩm. */
  type?: 'website' | 'article' | 'product'
}

/**
 * Thẻ metadata dùng chung cho mọi trang.
 *
 * React 19 tự nhấc `<title>` và `<meta>` lên `<head>` nên không cần thư viện SEO
 * (kế hoạch gốc định dùng `react-helmet-async`, đã bỏ từ phiên 2).
 *
 * Gom vào một component vì trước Giai đoạn 9, mỗi trang tự viết `<title>` và
 * `<meta>` rời rạc — thêm một loại thẻ mới sẽ phải sửa 15 chỗ.
 */
export default function SeoMeta({ title, description, image, type = 'website' }: SeoMetaProps) {
  const fullTitle = pageTitle(title)
  const imageUrl = absoluteUrl(image ?? DEFAULT_OG_IMAGE)

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content="vi_VN" />

      {/*
        Chỉ xuất thẻ ảnh khi dựng được URL tuyệt đối — tức là đã đặt VITE_SITE_URL.
        Xem lý do trong `lib/seo.ts`.
      */}
      {imageUrl && (
        <>
          <meta property="og:image" content={imageUrl} />
          <meta name="twitter:image" content={imageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </>
      )}
      {!imageUrl && <meta name="twitter:card" content="summary" />}

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  )
}
