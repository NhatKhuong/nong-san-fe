import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import FeatureStrip from '@/components/home/FeatureStrip'
import Testimonials from '@/components/home/Testimonials'
import Breadcrumb from '@/components/ui/Breadcrumb'
import SectionHeading from '@/components/ui/SectionHeading'
import Skeleton from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/StateBlock'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { ROUTES, STORE_INFO } from '@/lib/constants'
import SeoMeta from '@/components/ui/SeoMeta'
import { useAbout } from '@/hooks/useAbout'

export default function AboutPage() {
  const { data, isLoading, error, refetch } = useAbout()

  return (
    <>
      <SeoMeta
        title="Giới thiệu"
        description="Câu chuyện, cam kết và cách chúng tôi chọn nông trại đối tác để đưa nông sản hữu cơ đến bàn ăn của bạn."
      />

      <Breadcrumb items={[{ label: 'Giới thiệu' }]} />

      {error ? (
        <div className="container-app py-14">
          <ErrorState message={error.message} onRetry={() => refetch()} />
        </div>
      ) : isLoading || !data ? (
        <div className="container-app space-y-5 py-8">
          <Skeleton className="aspect-[16/6] rounded-xl" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ) : (
        <>
          <section className="container-app py-8">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={data.heroImage}
                alt=""
                aria-hidden="true"
                className="aspect-[16/9] w-full object-cover sm:aspect-[16/6]"
              />
              <div className="absolute inset-0 flex items-center bg-ink/55">
                <div className="max-w-2xl px-6 sm:px-10">
                  <h1 className="text-2xl text-white sm:text-4xl">{data.heroTitle}</h1>
                  <p className="mt-3 text-sm text-white/90 sm:text-base">
                    {data.heroDescription}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="container-app pb-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <SectionHeading title={data.storyTitle} />
                <div className="space-y-4 text-ink-muted">
                  {data.storyParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <Link to={ROUTES.SHOP} className={buttonStyles('primary', 'lg', 'mt-7')}>
                  Xem sản phẩm
                </Link>
              </div>

              <img
                src={data.storyImage}
                alt="Nông trại đối tác của Nông Sản Sạch"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
          </section>

          <section className="bg-primary-dark py-12">
            <div className="container-app grid grid-cols-2 gap-8 lg:grid-cols-4">
              {data.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-3xl font-bold text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <FeatureStrip />

          <section className="container-app py-12">
            <SectionHeading
              title="Chặng đường đã qua"
              description="Những mốc thay đổi cách chúng tôi làm việc."
              align="center"
            />

            <ol className="relative mx-auto max-w-2xl border-l-2 border-line pl-8">
              {data.milestones.map((milestone) => (
                <li key={milestone.year} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute top-1 -left-[41px] flex size-5 items-center justify-center rounded-full border-2 border-primary bg-white"
                  >
                    <span className="size-2 rounded-full bg-primary" />
                  </span>
                  <p className="font-heading text-lg font-bold text-primary">{milestone.year}</p>
                  <h3 className="mt-0.5 text-base">{milestone.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{milestone.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-surface py-12">
            <div className="container-app">
              <SectionHeading title="Cam kết của chúng tôi" align="center" />
              <div className="grid gap-5 md:grid-cols-3">
                {data.commitments.map((commitment) => (
                  <div key={commitment.title} className="rounded-xl bg-white p-6">
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <ShieldCheck size={24} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base">{commitment.title}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{commitment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Testimonials />

          <section className="container-app py-12 text-center">
            <h2 className="text-2xl sm:text-3xl">Còn câu hỏi nào chưa được trả lời?</h2>
            <p className="mt-2 text-ink-muted">
              Gọi {STORE_INFO.hotline} hoặc nhắn cho chúng tôi, {STORE_INFO.openingHours.toLowerCase()}.
            </p>
            <Link to={ROUTES.CONTACT} className={buttonStyles('primary', 'lg', 'mt-6')}>
              Liên hệ với chúng tôi
            </Link>
          </section>
        </>
      )}
    </>
  )
}
