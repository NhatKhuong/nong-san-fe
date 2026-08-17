import Skeleton from '@/components/ui/Skeleton'

/**
 * Khung chờ khi một trang đang được tải về (route tách bằng `React.lazy`).
 *
 * Cố ý không dùng spinner toàn trang: quy tắc trong CLAUDE.md là hiện khung chờ
 * có hình dạng gần giống nội dung thật, để trang không nhảy khi dữ liệu về.
 */
export default function PageFallback() {
  return (
    <div className="container-app py-10" role="status" aria-label="Đang tải trang">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="mt-4 h-4 w-2/3" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
