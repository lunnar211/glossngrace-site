import type { Metadata } from "next";
import Image from "next/image";
import { INSTAGRAM_URL } from "@/lib/services";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "About — GlossnGrace Nails",
  description:
    "The GlossnGrace story: a small nails studio built on careful work, clean tools and colours that suit you.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
          About
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
          Small studio, careful hands
        </h1>
      </Reveal>

      <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] shadow-lg">
            <Image
              src="/images/profile.jpg"
              alt="GlossnGrace illustrated brand art"
              width={800}
              height={800}
              className="aspect-square w-full object-cover"
            />
          </div>
          <p className="mt-3 text-center text-sm text-plum-soft">
            Illustrated brand art
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Our story
          </h2>
          <p className="mt-4 leading-relaxed text-plum-soft">
            GlossnGrace started with a simple idea: nails should feel graceful,
            not rushed. A calm chair, colours chosen with care, and a finish
            that still looks good days later. We are a small studio, and we like
            it that way — every appointment gets our full attention.
          </p>
          <p className="mt-4 leading-relaxed text-plum-soft">
            Most of our clients find us on Instagram, where we share new looks
            and open slots first. If you have a photo of nails you love, bring
            it — matching your idea is our favourite part of the job.
          </p>

          <h2 className="mt-8 font-display text-2xl font-semibold md:text-3xl">
            Hygiene &amp; products
          </h2>
          <ul className="mt-4 space-y-3 leading-relaxed text-plum-soft">
            <li className="flex gap-3">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-plum">Sterilised tools</strong> — clean
                tools for every appointment, every time.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-plum">Non-toxic polish</strong> — gentle
                formulas in soft, wearable shades.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold">✦</span>
              <span>
                <strong className="text-plum">Clean, careful work</strong> —
                neat cuticles, even shape, and a finish we check with you
                before you leave.
              </span>
            </li>
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-[2rem] shadow-lg">
          <Image
            src="/images/salon.webp"
            alt="The GlossnGrace salon — pink and gold manicure tables"
            width={1200}
            height={800}
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
        <p className="mt-3 text-center text-sm text-plum-soft">
          Our space — pink, gold, and made for slow afternoons
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="rounded-3xl border border-blush bg-blush/40 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Come say hello
          </h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-plum-soft">
            Location &amp; hours coming soon — DM us on Instagram{" "}
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
        </div>
      </Reveal>
    </div>
  );
}
