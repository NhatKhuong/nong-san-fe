import { useCategories } from '@/hooks/useCategories'
import Skeleton from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryFilterProps {
  /** Slug danh mục đang chọn; undefined = tất cả. */
  value: string | undefined
  onChange: (slug: string | undefined) => void
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-8" />
        ))}
      </div>
    )
  }

  const roots = categories?.filter((category) => category.parentId === null) ?? []
  const childrenOf = (parentId: number) =>
    categories?.filter((category) => category.parentId === parentId) ?? []

  return (
    <ul className="space-y-1">
      <li>
        <CategoryRow
          label="Tất cả sản phẩm"
          isActive={value === undefined}
          onClick={() => onChange(undefined)}
        />
      </li>

      {roots.map((root) => (
        <li key={root.id}>
          <CategoryRow
            label={root.name}
            count={root.productCount}
            isActive={value === root.slug}
            onClick={() => onChange(root.slug)}
          />

          {childrenOf(root.id).length > 0 && (
            <ul className="mt-1 ml-4 space-y-1 border-l border-line pl-3">
              {childrenOf(root.id).map((child: Category) => (
                <li key={child.id}>
                  <CategoryRow
                    label={child.name}
                    count={child.productCount}
                    isActive={value === child.slug}
                    onClick={() => onChange(child.slug)}
                    isChild
                  />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

interface CategoryRowProps {
  label: string
  count?: number
  isActive: boolean
  isChild?: boolean
  onClick: () => void
}

function CategoryRow({ label, count, isActive, isChild = false, onClick }: CategoryRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition',
        isChild ? 'text-sm' : 'text-sm font-medium',
        isActive
          ? 'bg-primary-soft text-primary-dark'
          : 'text-ink hover:bg-surface hover:text-primary',
      )}
    >
      <span>{label}</span>
      {count !== undefined && <span className="text-xs text-ink-light">({count})</span>}
    </button>
  )
}
