import { HOW_TO_BOOK_VIDEO_URL, HOW_TO_BOOK_REEL_URL } from '@/lib/video'

/**
 * "Watch how to book" — the 20-second how-to video.
 * The server already probed the video URL (see lib/video.ts): if the
 * file is in the public Supabase bucket we show the player; if it is
 * not there yet (bucket still being set up) we show a card linking to
 * the same video as an Instagram Reel instead — never a broken player.
 */
export default function HowToBookVideo({ available }: { available: boolean }) {
  if (available) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-blush bg-white shadow-sm">
        <video
          controls
          preload="metadata"
          poster="/images/how-to-book.jpg"
          src={HOW_TO_BOOK_VIDEO_URL}
          className="aspect-[9/16] max-h-[560px] w-full bg-black object-contain sm:aspect-video sm:max-h-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 sm:px-6">
          <p className="text-sm text-plum-soft">
            20 seconds — from tap to booked in.
          </p>
          <a
            href={HOW_TO_BOOK_REEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gold underline underline-offset-4"
          >
            Also on Instagram →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-blush bg-white shadow-sm">
      <div className="flex flex-col items-center p-8 text-center sm:p-10">
        <p className="text-4xl">🎬</p>
        <h3 className="mt-3 font-display text-2xl font-semibold">
          Watch how to book — in 30 seconds
        </h3>
        <p className="mt-2 max-w-md leading-relaxed text-plum-soft">
          Tap Book Now, pick your service, choose a date and time, add your
          details — and you are booked in. Watch the quick video on Instagram.
        </p>
        <a
          href={HOW_TO_BOOK_REEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-semibold text-white shadow-sm transition hover:bg-plum"
        >
          ▶ Watch the Reel on Instagram
        </a>
      </div>
    </div>
  )
}
