import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZooming, setZooming] = useState(false)
  /** Vị trí con trỏ tính theo %, dùng làm tâm phóng to. */
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  // Chuyển sang sản phẩm khác thì quay về ảnh đầu tiên.
  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-xl bg-surface"
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[activeIndex]}
          alt={alt}
          className={cn(
            'size-full object-cover transition-transform duration-200',
            isZooming && 'scale-175',
          )}
          style={isZooming ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem ảnh ${index + 1} của ${alt}`}
              aria-pressed={index === activeIndex}
              className={cn(
                'size-20 overflow-hidden rounded-lg border-2 transition',
                index === activeIndex
                  ? 'border-primary'
                  : 'border-line hover:border-primary-light',
              )}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                aria-hidden="true"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
