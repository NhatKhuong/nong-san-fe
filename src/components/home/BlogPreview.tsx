import PostCard from '@/components/blog/PostCard'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useLatestPosts } from '@/hooks/usePosts'
import { ROUTES } from '@/lib/constants'

export default function BlogPreview() {
  const { data: posts, isLoading, error, refetch } = useLatestPosts(4)

  return (
    <section className="bg-white py-14">
      <div className="container-app">
        <SectionHeading
          title="Kiến thức về nông trại"
          description="Mẹo chọn thực phẩm, cách bảo quản và chuyện hậu trường từ nông trại."
          viewAllPath={ROUTES.BLOG}
        />

        {error ? (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <EmptyState title="Chưa có bài viết nào" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
