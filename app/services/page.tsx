import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, SERVICE_CATEGORIES, formatDuration } from "@/lib/services";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Services & Prices — GlossnGrace Nails",
  description:
    "GlossnGrace services and starting prices: manicures, pedicures, extensions, nail art and bridal nails — each with duration and a direct booking link.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          Services &amp; prices
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          The menu
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-plum-soft">
          Every service shows its starting price and how long it takes. Pick
          one and book it straight away — no account needed.
        </p>
      </Reveal>

      {SERVICE_CATEGORIES.map((category) => {
        const items = SERVICES.filter((s) => s.category === category);
        return (
          <section key={category} className="mt-12">
            <Reveal>
              <h2 className="flex items-center gap-3 font-display text-2xl font-semibold md:text-3xl">
                {category}
                <span className="h-px flex-1 bg-gold/40" aria-hidden="true" />
              </h2>
            </Reveal>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {items.map((s, i) => (
                <Reveal key={s.name} delay={i * 50}>
                  <article className="flex h-full flex-col rounded-3xl border border-blush bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-xl font-semibold">
                        <Link
                          href={`/services/${s.slug}`}
                          className="transition hover:text-gold"
                        >
                          {s.name}
                        </Link>
                      </h3>
                      <p className="shrink-0 text-lg font-semibold text-gold">
                        from ${s.priceFrom}
                      </p>
                    </div>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-plum-soft">
                      {s.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-plum-soft">
                      {formatDuration(s.durationMin)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-plum/25 px-4 text-[15px] font-semibold transition hover:border-gold hover:text-gold"
                      >
                        View details
                      </Link>
                      <Link
                        href={`/book?service=${encodeURIComponent(s.name)}`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gold px-4 text-[15px] font-semibold text-white transition hover:bg-plum"
                      >
                        Book This Service
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}

      <Reveal className="mt-12">
        <div className="rounded-3xl border border-blush bg-blush/40 p-6 text-[15px] leading-relaxed">
          <p className="font-display text-xl font-semibold">Good to know</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-plum-soft">
            <li>
              All prices are starting prices. Your final price is confirmed at
              your appointment — it depends on length, shape and design.
            </li>
            <li>
              Please let us know about allergies or sensitivities when you book.
            </li>
            <li>
              Running late or need to change your time? DM us on Instagram{" "}
              <a
                href="https://www.instagram.com/_glossngrace"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold underline underline-offset-4"
              >
                @_glossngrace
              </a>{" "}
              as soon as you can.
            </li>
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
