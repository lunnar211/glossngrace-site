/**
 * Single source of truth for GlossnGrace services.
 * Names MUST match the booking API's VALID_SERVICES exactly —
 * the booking form sends `service` as one of these strings.
 * Prices are "from $X" STARTING prices (USD references from research;
 * the owner will correct them later).
 */
export type Service = {
  name: string
  priceFrom: number
  durationMin: number
  category: 'Manicures' | 'Pedicures' | 'Extensions' | 'Nail Art & Add-ons'
  short: string
  description: string
}

export const SERVICES: Service[] = [
  {
    name: 'Classic Manicure',
    priceFrom: 25,
    durationMin: 45,
    category: 'Manicures',
    short: 'The timeless tidy-up.',
    description:
      'Shape, cuticle care, a relaxing hand massage and your choice of polish — the timeless tidy-up.',
  },
  {
    name: 'Gel Manicure',
    priceFrom: 35,
    durationMin: 60,
    category: 'Manicures',
    short: 'Glossy colour that lasts for weeks.',
    description:
      'A glossy, chip-resistant gel finish that stays beautiful for weeks. Shape and cuticle care included.',
  },
  {
    name: 'French Manicure',
    priceFrom: 35,
    durationMin: 60,
    category: 'Manicures',
    short: 'The classic clean look.',
    description:
      'The classic clean look — a soft pink base with crisp white tips, in regular or gel finish.',
  },
  {
    name: 'Pedicure',
    priceFrom: 40,
    durationMin: 60,
    category: 'Pedicures',
    short: 'Feet, fully cared for.',
    description:
      'A warm soak, gentle exfoliation, nail and cuticle care, a foot massage and polish. Feet, fully cared for.',
  },
  {
    name: 'Acrylic Nails',
    priceFrom: 45,
    durationMin: 90,
    category: 'Extensions',
    short: 'Strong, sculpted length.',
    description:
      'Strong, sculpted length in the shape you love, finished with polish or a simple design.',
  },
  {
    name: 'Nail Extensions',
    priceFrom: 60,
    durationMin: 90,
    category: 'Extensions',
    short: 'Instant length, shaped your way.',
    description:
      'Lightweight extensions for instant length, shaped to suit your hands and finished your way.',
  },
  {
    name: 'Nail Art Design',
    priceFrom: 20,
    durationMin: 30,
    category: 'Nail Art & Add-ons',
    short: 'Hand-painted details, foil or florals.',
    description:
      'Hand-painted details, foil, chrome or florals — tell us your idea or pick from our looks.',
  },
  {
    name: 'Bridal Nails',
    priceFrom: 70,
    durationMin: 120,
    category: 'Nail Art & Add-ons',
    short: 'A flawless set for your day.',
    description:
      'Your day, your nails. A calm, unhurried appointment for a flawless bridal set with delicate detail.',
  },
]

export const SERVICE_CATEGORIES = [
  'Manicures',
  'Pedicures',
  'Extensions',
  'Nail Art & Add-ons',
] as const

export const INSTAGRAM_URL = 'https://www.instagram.com/_glossngrace'
export const INSTAGRAM_REELS_URL = 'https://www.instagram.com/_glossngrace/reels/'

export function serviceByName(name: string): Service | undefined {
  return SERVICES.find((s) => s.name === name)
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}
