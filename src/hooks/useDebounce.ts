import { useEffect, useState } from 'react'

/** Trì hoãn giá trị để tránh gọi API mỗi lần gõ phím (ô tìm kiếm, thanh lọc giá). */
export function useDebounce<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
