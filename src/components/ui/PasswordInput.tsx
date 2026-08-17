import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from './Input'

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'endAdornment'>

/**
 * Ô nhập mật khẩu kèm nút hiện/ẩn.
 * `ref` được chuyển thẳng xuống `<input>` để `register()` của React Hook Form
 * hoạt động y như với `<Input>` thường.
 */
export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setVisible] = useState(false)

  return (
    <Input
      {...props}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="rounded-lg p-2 text-ink-muted transition hover:bg-surface hover:text-ink"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  )
}
