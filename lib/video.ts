/**
 * Server-only helper: is the how-to-book video file actually in the
 * public Supabase bucket yet? Probed server-side (HEAD) so the browser
 * never requests a missing file — no broken player, no console error.
 * Result is cached in memory for 5 minutes; once the bucket is created
 * the video appears on the home page by itself.
 */

export const HOW_TO_BOOK_VIDEO_URL =
  'https://omnqidmauvloedscncir.supabase.co/storage/v1/object/public/glossngrace-media/how-to-book.mp4'
export const HOW_TO_BOOK_REEL_URL =
  'https://www.instagram.com/reel/DfhdvdZD3-_/'

const CACHE_TTL_MS = 5 * 60 * 1000
let cached: { available: boolean; at: number } | null = null

export async function isHowToVideoAvailable(): Promise<boolean> {
  const now = Date.now()
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.available
  let available = false
  try {
    const res = await fetch(HOW_TO_BOOK_VIDEO_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    available = res.ok
  } catch {
    available = false
  }
  cached = { available, at: now }
  return available
}
