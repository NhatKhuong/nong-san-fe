import { Link, useParams } from 'react-router-dom'
import { CalendarDays, UserRound } from 'lucide-react'
import PostCard from '@/components/blog/PostCard'
import PostContent from '@/components/blog/PostContent'
import Breadcrumb from '@/components/ui/Breadcrumb'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ROUTES } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import SeoMeta from '@/components/ui/SeoMeta'
import { usePost, useRelatedPosts } from '@/hooks/usePosts'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, error } = usePost(slug)
  const { data: related } = useRelatedPosts(slug, 3)

  if (error) {
    return (
      <div className="container-app py-14">
        <ErrorState message={error.message} />
        <div className="mt-6 text-center">
          <Link to={ROUTES.BLOG} className={buttonStyles()}>
            Về trang tin tức
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !post) {
    return (
      <div className="container-app space-y-4 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="aspect-[16/7] rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    )
  }

  return (
    <>
      <SeoMeta
        title={post.title}
        description={post.excerpt}
        image={post.thumbnail}
        type="article"
      />

      <Breadcrumb
        items={[{ label: 'Tin tức', path: ROUTES.BLOG }, { label: post.title }]}
      />

      <article className="container-app py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to={`${ROUTES.BLOG}?category=${post.categorySlug}`}
            className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark transition hover:bg-primary hover:text-white"
          >
            {post.category}
          </Link>

          <h1 className="mt-3 text-2xl leading-snug sm:text-3xl">{post.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <UserRound size={15} aria-hidden="true" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} aria-hidden="true" />
              {formatDate(post.publishedAt)}
            </span>
          </div>

          {/* Ảnh bìa nằm above-the-fold nên không lazy. */}
          <img
            src={post.thumbnail}
            alt={`Ảnh minh hoạ cho bài viết: ${post.title}`}
            className="mt-6 aspect-[16/8] w-full rounded-xl object-cover"
          />

          <p className="mt-6 border-l-4 border-primary pl-4 text-base text-ink">
            {post.excerpt}
          </p>

          <div className="mt-6">
            <PostContent content={post.content} />
          </div>
        </div>
      </article>

      {related && related.length > 0 && (
        <section className="bg-surface py-12">
          <div className="container-app">
            <SectionHeading title="Bài viết liên quan" viewAllPath={ROUTES.BLOG} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
