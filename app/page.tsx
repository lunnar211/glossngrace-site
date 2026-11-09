import Image from "next/image";
import Link from "next/link";
import { SERVICES, INSTAGRAM_URL, formatDuration } from "@/lib/services";
import { createServiceClient } from "@/lib/supabase/service";
import { isHowToVideoAvailable } from "@/lib/video";
import Reveal from "@/components/reveal";
import TiltCard from "@/components/tilt-card";
import PolishBottle from "@/components/polish-bottle";
import GalleryMarquee from "@/components/gallery-marquee";
import HowToBookVideo from "@/components/how-to-book-video";
import FeedbackForm from "@/components/feedback-form";

// Reviews change when the salon approves new feedback, so this page is
// rendered per request. Any Supabase failure degrades to "coming soon".
export const dynamic = "force-dynamic";

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

const MARQUEE = [
  { src: "/images/hero.webp", alt: "Blush nails with gold foil tips" },
  { src: "/images/french.webp", alt: "Classic French manicure" },
  { src: "/images/chrome.webp", alt: "Pink chrome nails" },
  { src: "/images/floral.webp", alt: "Soft floral nail art" },
  { src: "/images/bridal.webp", alt: "Gold glitter bridal nails" },
  { src: "/images/pedicure.webp", alt: "Rose petal pedicure spa" },
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
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              GlossnGrace Nails
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              Nails, but make it <span className="italic text-gold">graceful</span>
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-plum-soft">
              Soft colours, neat lines and a calm chair. Pick a service, pick a
              time, and we will take care of the rest.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-7 text-base font-semibold text-white shadow-sm transition hover:bg-plum"
              >
                Book Now
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-[48px] items-center rounded-full border border-plum/25 px-7 text-base font-semibold transition hover:border-gold hover:text-gold"
              >
                View Services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-lg">
              <Image
                src="/images/hero.webp"
                alt="Hands with blush pink nails and gold foil tips"
                width={1200}
                height={800}
                priority
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <PolishBottle />
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

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
                Services
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                Pick your favourite
              </h2>
            </div>
            <Link
              href="/services"
              className="font-semibold text-gold underline underline-offset-4"
            >
              See full menu →
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <TiltCard className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-blush bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-semibold">
                    <Link
                      href={`/services/${s.slug}`}
                      className="transition hover:text-gold"
                    >
                      {s.name}
                    </Link>
                  </h3>
                  <p className="mt-1 flex-1 text-[15px] text-plum-soft">{s.short}</p>
                  <p className="mt-4 text-lg font-semibold text-gold">
                    from ${s.priceFrom}
                    <span className="ml-2 text-sm font-medium text-plum-soft">
                      · {formatDuration(s.durationMin)}
                    </span>
                  </p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-plum/25 text-[15px] font-semibold transition hover:border-gold hover:text-gold"
                  >
                    View details
                  </Link>
                  <Link
                    href={`/book?service=${encodeURIComponent(s.name)}`}
                    className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold text-[15px] font-semibold text-gold transition hover:bg-gold hover:text-white"
                  >
                    Book this service
                  </Link>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Watch how to book */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Watch how to book
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
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

      {/* Gallery marquee */}
      <section className="py-6">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Fresh from the chair
          </h2>
          <p className="mt-2 text-plum-soft">
            A few of our recent looks — tap any look in the gallery to book it.
          </p>
        </Reveal>
        <div className="mt-6">
          <GalleryMarquee images={MARQUEE} />
        </div>
        <div className="mx-auto mt-5 max-w-6xl px-4 sm:px-6">
          <Link
            href="/gallery"
            className="font-semibold text-gold underline underline-offset-4"
          >
            Open the full gallery →
          </Link>
        </div>
      </section>

      {/* Why GlossnGrace */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] shadow-lg">
              <Image
                src="/images/salon.webp"
                alt="The GlossnGrace salon — pink and gold manicure tables"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Why GlossnGrace
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              A calm chair, a careful finish
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Reviews
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
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
                    <p className="text-gold" aria-label={`${r.rating} out of 5 stars`}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Instagram
            </p>
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

      {/* Location / hours placeholder + final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            Visit us
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Location &amp; hours coming soon
          </h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-plum-soft">
            We are setting up our space. Until then, DM us on Instagram{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold underline underline-offset-4"
            >
              @_glossngrace
            </a>{" "}
            for bookings and questions.
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
