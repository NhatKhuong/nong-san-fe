import { Link } from 'react-router-dom'
import { CalendarDays, UserRound } from 'lucide-react'
import { blogPath } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  /** `horizontal` dùng ở trang tin tức nơi có nhiều chỗ theo chiều ngang. */
  layout?: 'vertical' | 'horizontal'
  /** Ảnh đầu trang danh sách nằm above-the-fold nên không nên lazy. */
  eager?: boolean
  className?: string
}

/**
 * Thẻ bài viết dùng chung cho trang chủ, trang tin tức và khối bài liên quan.
 * Trước Giai đoạn 8, đoạn JSX này nằm trực tiếp trong `BlogPreview.tsx`.
 */
export default function PostCard({
  post,
  layout = 'vertical',
  eager = false,
  className,
}: PostCardProps) {
  const isHorizontal = layout === 'horizontal'

  return (
    <article
      className={cn(
        'group flex overflow-hidden rounded-xl border border-line transition hover:border-primary hover:shadow-lg',
        isHorizontal ? 'flex-col sm:flex-row' : 'flex-col',
        className,
      )}
    >
      <Link
        to={blogPath(post.slug)}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          'block overflow-hidden',
          isHorizontal ? 'aspect-[8/5] shrink-0 sm:aspect-auto sm:w-56' : 'aspect-[8/5]',
        )}
      >
        <img
          src={post.thumbnail}
          alt={post.title}
          loading={eager ? undefined : 'lazy'}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="self-start rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-dark">
          {post.category}
        </span>

        <h3 className={cn('mt-2.5 leading-snug', isHorizontal ? 'text-lg' : 'line-clamp-2 text-base')}>
          <Link to={blogPath(post.slug)} className="transition hover:text-primary">
            {post.title}
          </Link>
        </h3>

        <p className={cn('mt-2 text-sm text-ink-muted', isHorizontal ? 'line-clamp-3' : 'line-clamp-2')}>
          {post.excerpt}
        </p>

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
  )
}
