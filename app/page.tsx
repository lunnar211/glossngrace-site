import Image from "next/image";
import Link from "next/link";
import { SERVICES, INSTAGRAM_URL, formatDuration } from "@/lib/services";
import { createServiceClient } from "@/lib/supabase/service";
import { isHowToVideoAvailable } from "@/lib/video";
import Reveal from "@/components/reveal";
import HowToBookVideo from "@/components/how-to-book-video";
import FeedbackForm from "@/components/feedback-form";

// Reviews change when the salon approves new feedback, so this page is
// revalidated every 60 seconds instead of rendered per request. The
// how-to video probe in lib/video.ts only runs at revalidation time,
// not on every visit.
export const revalidate = 60;

type VisibleFeedback = {
  id: string;
  name: string;
  rating: number;
  message: string;
  service: string | null;
  created_at: string;
};

async function getVisibleFeedback(): Promise<VisibleFeedback[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("glossngrace_feedback")
      .select("id, name, rating, message, service, created_at")
      .eq("visible", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error || !data) return [];
    return data as VisibleFeedback[];
  } catch {
    return [];
  }
}

const PREVIEW = [
  "Classic Manicure",
  "Gel Manicure",
  "Acrylic Nails",
  "French Manicure",
  "Pedicure",
  "Nail Art Design",
];

// The shade book: one entry per look, shown once (no duplicated marquee).
const LOOKS = [
  { src: "/images/hero.webp", alt: "Blush nails with gold foil tips", look: "Blush & Gold Foil", service: "Nail Art Design" },
  { src: "/images/french.webp", alt: "Classic French manicure", look: "Classic French", service: "French Manicure" },
  { src: "/images/chrome.webp", alt: "Pink chrome nails", look: "Pink Chrome", service: "Gel Manicure" },
  { src: "/images/floral.webp", alt: "Soft floral nail art", look: "Soft Floral", service: "Nail Art Design" },
  { src: "/images/bridal.webp", alt: "Gold glitter bridal nails", look: "Gold Bridal Glitter", service: "Bridal Nails" },
  { src: "/images/pedicure.webp", alt: "Rose petal pedicure spa", look: "Rose Petal Pedicure", service: "Pedicure" },
];

const TRUST = [
  { title: "Sterilised tools", text: "Clean tools for every appointment." },
  { title: "Non-toxic polish", text: "Gentle formulas, kind to your nails." },
  { title: "Clean, careful work", text: "Slow, neat and never rushed." },
];

export default async function Home() {
  const [reviews, videoAvailable] = await Promise.all([
    getVisibleFeedback(),
    isHowToVideoAvailable(),
  ]);
  const preview = PREVIEW.map(
    (name) => SERVICES.find((s) => s.name === name)!
  );

  return (
    <div>
      {/* Hero — the shade book: pick a service from the ledger, not a
          generic hero + card grid. Slowness is the identity. */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 md:pt-16">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <Reveal>
            <p className="hand-note text-2xl text-gold">
              slow afternoons, careful hands
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              A calm chair, a careful finish
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-plum-soft">
              Soft colours, neat lines and a calm chair. Pick a service, pick a
              time, and we will take care of the rest.
            </p>

            {/* Swatch ledger — the navigation motif. Real swatch chips,
                one row per service, instead of pill buttons. */}
            <ul className="mt-8 max-w-md border-t border-blush" aria-label="Services">
              {preview.map((s) => (
                <li key={s.name} className="border-b border-blush">
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-3 py-3 transition hover:bg-blush/30"
                  >
                    <span
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 rounded-full border border-white shadow-sm"
                      style={{ background: s.theme }}
                    />
                    <span className="flex-1 font-display text-lg font-semibold">
                      {s.name}
                    </span>
                    <span className="text-sm text-plum-soft">
                      {formatDuration(s.durationMin)} · from ${s.priceFrom}
                    </span>
                    <span aria-hidden="true" className="text-gold">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Link
                href="/book"
                className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-7 text-base font-semibold text-white shadow-sm transition hover:bg-plum"
              >
                Book an appointment
              </Link>
              <Link
                href="/services"
                className="font-semibold text-gold underline underline-offset-4"
              >
                See the full menu →
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="foil-edge relative overflow-hidden rounded-[2rem] shadow-lg">
              <Image
                src="/images/hero.webp"
                alt="Hands with blush pink nails and gold foil tips"
                width={1200}
                height={800}
                priority
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <p className="hand-note mt-4 text-center text-lg text-plum-soft">
              blush + gold foil — from the shade book
            </p>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-blush bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-gold">
                ✓
              </span>
              <div>
                <p className="font-display text-lg font-semibold">{t.title}</p>
                <p className="text-sm text-plum-soft">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The shade book — an editorial strip of looks, each shown once,
          with its name and service. Replaces the duplicated marquee. */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal>
          <p className="hand-note text-2xl text-gold">from the shade book</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Looks we love
          </h2>
          <p className="mt-2 max-w-xl text-plum-soft">
            A few looks we love — tap any look to book that service.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOOKS.map((item, i) => (
            <Reveal key={item.src} delay={i * 60}>
              <article>
                <Link href={`/book?service=${encodeURIComponent(item.service)}`}>
                  <div className="foil-edge overflow-hidden rounded-[2rem] shadow-sm">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={715}
                      height={715}
                      className="aspect-square w-full object-cover transition hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <p className="hand-note mt-3 text-xl">{item.look}</p>
                <p className="text-sm text-plum-soft">
                  {item.service} ·{" "}
                  <Link
                    href={`/book?service=${encodeURIComponent(item.service)}`}
                    className="font-semibold text-gold underline underline-offset-4"
                  >
                    Book this look
                  </Link>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/gallery"
            className="font-semibold text-gold underline underline-offset-4"
          >
            Open the full gallery →
          </Link>
        </div>
      </section>

      {/* Watch how to book */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Booked in, in 30 seconds
          </h2>
          <p className="mt-2 max-w-xl text-plum-soft">
            A quick look at booking on this site — no account, no phone call
            needed to start.
          </p>
        </Reveal>
        <Reveal delay={80} className="mt-6">
          <HowToBookVideo available={videoAvailable} />
        </Reveal>
      </section>

      {/* Why GlossnGrace */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <div className="foil-edge overflow-hidden rounded-[2rem] shadow-lg">
              <Image
                src="/images/salon.webp"
                alt="The GlossnGrace salon — pink and gold manicure tables"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <p className="hand-note mt-4 text-center text-lg text-plum-soft">
              our space — made for slow afternoons
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Slow, neat, never rushed
            </h2>
            <ul className="mt-5 space-y-4 text-[15px] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-gold">✦</span>
                <span>
                  <strong>Hygiene first.</strong> Tools are sterilised and the
                  station is cleaned for every appointment.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">✦</span>
                <span>
                  <strong>Products we trust.</strong> Non-toxic polishes in soft,
                  wearable shades — plus gold, chrome and glitter when you want
                  to shine.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold">✦</span>
                <span>
                  <strong>Never rushed.</strong> Your time is yours. We shape,
                  tidy and finish with care, then check every nail with you.
                </span>
              </li>
            </ul>
            <Link
              href="/about"
              className="mt-6 inline-block font-semibold text-gold underline underline-offset-4"
            >
              More about us →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Reviews + Instagram */}
      <section className="border-y border-blush bg-blush/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold">
              {reviews.length > 0 ? "What our clients say" : "Reviews coming soon"}
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 leading-relaxed text-plum-soft">
                We are new, and our first reviews are still on their way. Had
                your nails done with us? Be the first to share yours.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-blush bg-white p-5 shadow-sm"
                  >
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-gold" aria-label={`${r.rating} out of 5 stars`}>
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                      {/* Shown reviews are approved by the salon in /admin
                          (visible=true) — that approval is the verification. */}
                      <span className="inline-flex items-center rounded-full bg-blush px-2.5 py-0.5 text-xs font-semibold text-plum">
                        ✓ Verified client
                      </span>
                    </p>
                    <p className="mt-2 leading-relaxed">“{r.message}”</p>
                    <p className="mt-2 text-sm font-medium text-plum-soft">
                      — {r.name}
                      {r.service ? ` · ${r.service}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6">
              <FeedbackForm />
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[44px] items-center font-semibold text-gold underline underline-offset-4"
            >
              Share yours on Instagram @_glossngrace →
            </a>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Follow the gloss
            </h2>
            <p className="mt-3 leading-relaxed text-plum-soft">
              New looks, behind-the-scenes moments and open slots — first on
              Instagram.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-3"
            >
              <Image
                src="/images/profile.jpg"
                alt="GlossnGrace profile art"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-gold object-cover"
              />
              <span className="min-h-[44px] font-semibold text-gold underline underline-offset-4">
                @_glossngrace
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* Final CTA — booking only. Location & hours already appear in the
          footer and on About; not repeated a third time here. */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
        <Reveal>
          <p className="hand-note text-2xl text-gold">your chair is waiting</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Book your appointment
          </h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-plum-soft">
            Pick a service, pick a time — no account needed. We will confirm
            your booking by phone.
          </p>
          <Link
            href="/book"
            className="mt-7 inline-flex min-h-[52px] items-center rounded-full bg-gold px-9 text-lg font-semibold text-white shadow-md transition hover:bg-plum"
          >
            Book Now
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
