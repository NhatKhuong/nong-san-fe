/** Kết quả phân trang chuẩn — khớp với `Page<T>` của Spring Data. */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
