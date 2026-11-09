"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { INSTAGRAM_REELS_URL } from "@/lib/services";

type GalleryItem = {
  src: string;
  alt: string;
  look: string;
  service: string;
  tags: string[];
};

const ITEMS: GalleryItem[] = [
  {
    src: "/images/french.webp",
    alt: "Classic French manicure with white tips",
    look: "Classic French",
    service: "French Manicure",
    tags: ["French"],
  },
  {
    src: "/images/chrome.webp",
    alt: "Pink chrome stiletto nails",
    look: "Pink Chrome",
    service: "Gel Manicure",
    tags: ["Chrome"],
  },
  {
    src: "/images/floral.webp",
    alt: "Soft floral nail art with white daisies",
    look: "Soft Floral",
    service: "Nail Art Design",
    tags: ["Floral"],
  },
  {
    src: "/images/bridal.webp",
    alt: "Gold glitter bridal nails with pearls",
    look: "Gold Bridal Glitter",
    service: "Bridal Nails",
    tags: ["Bridal"],
  },
  {
    src: "/images/hero.webp",
    alt: "Blush nails with gold foil tips",
    look: "Blush & Gold Foil",
    service: "Nail Art Design",
    tags: ["3D Art", "Seasonal"],
  },
  {
    src: "/images/pedicure.webp",
    alt: "Rose petal pedicure spa with candles",
    look: "Rose Petal Pedicure",
    service: "Pedicure",
    tags: ["Seasonal"],
  },
];

const FILTERS = ["All", "French", "Chrome", "Floral", "Bridal", "3D Art", "Seasonal"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const shown =
    filter === "All" ? ITEMS : ITEMS.filter((i) => i.tags.includes(filter));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
        Gallery
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
        Looks we love
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-plum-soft">
        Looks we love. Like one? Book it — the link under each photo takes
        you straight to booking that service.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter looks">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`min-h-[44px] rounded-full border px-5 text-[15px] font-semibold transition ${
              filter === f
                ? "border-gold bg-gold text-white"
                : "border-blush bg-white text-plum hover:border-gold hover:text-gold"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <article
            key={item.src}
            className="overflow-hidden rounded-3xl border border-blush bg-white shadow-sm"
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={715}
              height={715}
              className="aspect-square w-full object-cover"
            />
            <div className="p-5">
              <h2 className="font-display text-xl font-semibold">{item.look}</h2>
              <p className="mt-1 text-sm text-plum-soft">{item.service}</p>
              <Link
                href={`/book?service=${encodeURIComponent(item.service)}`}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-5 text-[15px] font-semibold text-white transition hover:bg-plum"
              >
                Book this look
              </Link>
            </div>
          </article>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-8 text-plum-soft">No looks in this style yet.</p>
      )}

      <div className="mt-12 rounded-3xl bg-plum p-8 text-center text-ivory">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          Watch us on Instagram
        </h2>
        <p className="mx-auto mt-2 max-w-md text-ivory/80">
          Short videos of the work in progress, new colours and open slots.
        </p>
        <a
          href={INSTAGRAM_REELS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-gold px-7 font-semibold text-white transition hover:bg-gold-soft"
        >
          Watch our Reels @_glossngrace
        </a>
      </div>
    </div>
  );
}
