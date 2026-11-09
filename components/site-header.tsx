"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-blush bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex flex-col leading-none" aria-label="GlossnGrace Nails — home">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Gloss<span className="text-gold">n</span>Grace
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
            Nails
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-plum-soft transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            className="hidden min-h-[44px] items-center rounded-full bg-gold px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-plum md:inline-flex"
          >
            Book Now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-blush text-plum md:hidden"
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-blush bg-ivory px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[48px] items-center border-b border-blush/60 text-base font-medium"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-[48px] items-center justify-center rounded-full bg-gold text-base font-semibold text-white"
          >
            Book Now
          </Link>
        </nav>
      )}
    </header>
  );
}
