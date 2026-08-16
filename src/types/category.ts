export interface Category {
  id: number
  slug: string
  name: string
  description: string
  image: string
  /** null = danh mục gốc; có giá trị = danh mục con. */
  parentId: number | null
  productCount: number
}
