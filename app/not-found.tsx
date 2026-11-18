import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="hand-note text-2xl text-gold">oops — that page wandered off</p>
      <h1 className="mt-4 font-display text-5xl font-semibold">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-plum-soft">
        The page you were looking for isn&apos;t here. It may have moved, or
        the link may have a typo. The shade book is still open, though.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-semibold text-white shadow-sm transition hover:bg-plum"
        >
          Back home
        </Link>
        <Link
          href="/services"
          className="inline-flex min-h-[52px] items-center rounded-full border border-plum/25 px-8 text-base font-semibold transition hover:border-gold hover:text-gold"
        >
          Browse services
        </Link>
        <Link
          href="/book"
          className="inline-flex min-h-[52px] items-center rounded-full border border-plum/25 px-8 text-base font-semibold transition hover:border-gold hover:text-gold"
        >
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
