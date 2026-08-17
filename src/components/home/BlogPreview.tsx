import { Link } from 'react-router-dom'
import { CalendarDays, UserRound } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/StateBlock'
import { useLatestPosts } from '@/hooks/usePosts'
import { ROUTES, blogPath } from '@/lib/constants'
import { formatDate } from '@/lib/format'

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
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-line transition hover:border-primary hover:shadow-lg"
              >
                <Link to={blogPath(post.slug)} className="block aspect-[8/5] overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    loading="lazy"
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <span className="self-start rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {post.category}
                  </span>

                  <h3 className="mt-2.5 line-clamp-2 text-base leading-snug">
                    <Link to={blogPath(post.slug)} className="transition hover:text-primary">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{post.excerpt}</p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-ink-light">
                    <span className="flex items-center gap-1.5">
                      <UserRound size={13} aria-hidden="true" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} aria-hidden="true" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
