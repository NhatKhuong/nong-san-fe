import { useEffect, useState } from 'react'

/** Theo dõi media query để đổi hành vi (không phải style) giữa mobile và desktop. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

/** Breakpoint `lg` của Tailwind — dùng để quyết định hiện drawer hay sidebar. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * Người dùng đã bật "giảm chuyển động" trong cài đặt hệ điều hành chưa.
 *
 * CSS đã tự xử lý phần cuộn mượt, nhưng carousel tự chạy là hành vi JavaScript —
 * `@media` không tắt được. Chuyển động tự phát ngoài tầm kiểm soát là thứ gây khó
 * chịu nhất với người nhạy cảm tiền đình, nên phải tắt autoplay theo cài đặt này.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
