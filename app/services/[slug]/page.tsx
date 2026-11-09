import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICES, serviceBySlug, formatDuration } from '@/lib/services'
import Reveal from '@/components/reveal'
import ServiceVisual from '@/components/service-visual'

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = serviceBySlug(slug)
  if (!service) return { title: 'Service — GlossnGrace Nails' }
  return {
    title: `${service.name} — GlossnGrace Nails`,
    description: `${service.description} From $${service.priceFrom}, ${formatDuration(service.durationMin)}. Book online in under a minute.`,
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceBySlug(slug)
  if (!service) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-sm">
          <Link
            href="/services"
            className="font-semibold text-gold underline underline-offset-4"
          >
            ← All services
          </Link>
        </p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          {service.category}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          {service.name}
        </h1>
      </Reveal>

      <div className="mt-8 grid items-start gap-10 md:grid-cols-2">
        <Reveal>
          <ServiceVisual theme={service.theme} label={service.slug} />
          <p className="mt-3 text-center text-sm text-plum-soft">
            Animated preview of the look — not a video of a real appointment.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-lg leading-relaxed text-plum-soft">
            {service.description}
          </p>

          <dl className="mt-6 flex flex-wrap gap-6">
            <div>
              <dt className="text-sm font-medium text-plum-soft">Price from</dt>
              <dd className="font-display text-3xl font-semibold text-gold">
                ${service.priceFrom}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-plum-soft">Time</dt>
              <dd className="font-display text-3xl font-semibold">
                {formatDuration(service.durationMin)}
              </dd>
            </div>
          </dl>

          <h2 className="mt-8 font-display text-2xl font-semibold">
            What&apos;s included
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed">
            {service.includes.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-gold">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/book?service=${encodeURIComponent(service.name)}`}
              className="inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-semibold text-white shadow-sm transition hover:bg-plum"
            >
              Book {service.name}
            </Link>
            <Link
              href="/gallery"
              className="inline-flex min-h-[52px] items-center rounded-full border border-plum/25 px-8 text-base font-semibold transition hover:border-gold hover:text-gold"
            >
              See real looks
            </Link>
          </div>

          <p className="mt-6 rounded-2xl border border-blush bg-blush/40 p-4 text-[15px] leading-relaxed text-plum-soft">
            All prices are starting prices. Your final price is confirmed at
            your appointment — it depends on length, shape and design. We will
            confirm your booking by phone.
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-14">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          You may also like
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SERVICES.filter((s) => s.slug !== service.slug)
            .slice(0, 3)
            .map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-3xl border border-blush bg-white p-5 shadow-sm transition hover:border-gold"
              >
                <p className="font-display text-lg font-semibold">{s.name}</p>
                <p className="mt-1 text-sm text-plum-soft">{s.short}</p>
                <p className="mt-3 font-semibold text-gold">
                  from ${s.priceFrom}
                  <span className="ml-2 text-sm font-medium text-plum-soft">
                    · {formatDuration(s.durationMin)}
                  </span>
                </p>
              </Link>
            ))}
        </div>
      </Reveal>
    </div>
  )
}
