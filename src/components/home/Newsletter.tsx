import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import { subscribeNewsletter } from '@/api/marketing.api'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: () => setEmail(''),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    mutate(email)
  }

  return (
    <section className="bg-primary-soft py-14">
      <div className="container-app flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-lg text-center lg:text-left">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-white">
            <Mail size={22} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl">Đăng ký nhận tin mỗi tuần</h2>
          <p className="mt-2 text-ink-muted">
            Nhận thông báo hàng mới về, ưu đãi riêng và công thức nấu ăn theo mùa.
          </p>
        </div>

        <div className="w-full max-w-md">
          {isSuccess ? (
            <p
              role="status"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-medium text-primary-dark"
            >
              <CheckCircle2 size={20} aria-hidden="true" />
              Đăng ký thành công! Cảm ơn bạn đã quan tâm.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email của bạn"
                aria-label="Email nhận bản tin"
                aria-invalid={error ? true : undefined}
                /*
                  `sm:flex-1` chứ không phải `flex-1`: form là `flex-col` trên
                  mobile, nên `flex-1` sẽ điều khiển CHIỀU CAO và đè lên `h-12` —
                  ô nhập co lại còn 19px, gần như không bấm trúng. Chỉ từ `sm:`
                  trở lên form mới thành hàng ngang, lúc đó `flex-1` mới đúng nghĩa.
                */
                className="h-12 rounded-full border border-line bg-white px-5 text-sm outline-none transition placeholder:text-ink-light focus:border-primary sm:flex-1"
              />
              <Button type="submit" size="md" isLoading={isPending} className="h-12">
                Đăng ký
              </Button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-2.5 text-center text-sm text-danger sm:text-left">
              {error.message}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
