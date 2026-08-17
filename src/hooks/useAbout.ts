import { useQuery } from '@tanstack/react-query'
import { getAboutContent } from '@/api/about.api'
import { queryKeys } from './queryKeys'

export function useAbout() {
  return useQuery({
    queryKey: queryKeys.about.content,
    queryFn: getAboutContent,
    staleTime: Infinity, // nội dung tĩnh, không cần tải lại trong một phiên
  })
}
