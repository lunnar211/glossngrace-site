import Link from "next/link";
import { INSTAGRAM_URL } from "@/lib/services";

export default function SiteFooter() {
  return (
    <footer className="bg-plum text-ivory/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-2xl font-semibold text-ivory">
            Gloss<span className="text-gold-soft">n</span>Grace
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Nails, but make it graceful. Careful work, clean tools, and colours
            that suit you.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-soft">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/services" className="hover:text-ivory">
                Services &amp; prices
              </Link>
            </li>
            <li>
              <Link href="/book" className="hover:text-ivory">
                Book an appointment
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-ivory">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ivory">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-soft">
            Visit &amp; follow
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Location &amp; hours coming soon — DM us on Instagram{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ivory underline decoration-gold-soft underline-offset-4"
            >
              @_glossngrace
            </a>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-ivory/60 sm:px-6">
          © 2026 GlossnGrace Nails. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
