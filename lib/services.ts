/**
 * Single source of truth for GlossnGrace services.
 * Names MUST match the booking API's VALID_SERVICES exactly —
 * the booking form sends `service` as one of these strings.
 * Prices are "from $X" STARTING prices (USD references from research;
 * the owner will correct them later).
 */
export type Service = {
  name: string
  slug: string
  priceFrom: number
  durationMin: number
  category: 'Manicures' | 'Pedicures' | 'Extensions' | 'Nail Art & Add-ons'
  short: string
  description: string
  /** Theme colour for the animated service visual (hex). */
  theme: string
  /** Short, honest list of what the appointment includes. */
  includes: string[]
}

export const SERVICES: Service[] = [
  {
    name: 'Classic Manicure',
    slug: 'classic-manicure',
    priceFrom: 25,
    durationMin: 45,
    category: 'Manicures',
    short: 'The timeless tidy-up.',
    description:
      'Shape, cuticle care, a relaxing hand massage and your choice of polish — the timeless tidy-up.',
    theme: '#e78aa5',
    includes: [
      'Nail shaping and filing',
      'Cuticle care',
      'Relaxing hand massage',
      'Your choice of polish',
    ],
  },
  {
    name: 'Gel Manicure',
    slug: 'gel-manicure',
    priceFrom: 35,
    durationMin: 60,
    category: 'Manicures',
    short: 'Glossy colour that lasts for weeks.',
    description:
      'A glossy, chip-resistant gel finish that stays beautiful for weeks. Shape and cuticle care included.',
    theme: '#d6336c',
    includes: [
      'Nail shaping and filing',
      'Cuticle care',
      'Gel base, colour and top coat',
      'Cured under a lamp for a long-lasting finish',
    ],
  },
  {
    name: 'French Manicure',
    slug: 'french-manicure',
    priceFrom: 35,
    durationMin: 60,
    category: 'Manicures',
    short: 'The classic clean look.',
    description:
      'The classic clean look — a soft pink base with crisp white tips, in regular or gel finish.',
    theme: '#d4a373',
    includes: [
      'Nail shaping and filing',
      'Cuticle care',
      'Soft pink base with crisp white tips',
      'Regular or gel finish',
    ],
  },
  {
    name: 'Pedicure',
    slug: 'pedicure',
    priceFrom: 40,
    durationMin: 60,
    category: 'Pedicures',
    short: 'Feet, fully cared for.',
    description:
      'A warm soak, gentle exfoliation, nail and cuticle care, a foot massage and polish. Feet, fully cared for.',
    theme: '#2a9d8f',
    includes: [
      'Warm foot soak',
      'Gentle exfoliation',
      'Nail and cuticle care',
      'Foot massage and polish',
    ],
  },
  {
    name: 'Acrylic Nails',
    slug: 'acrylic-nails',
    priceFrom: 45,
    durationMin: 90,
    category: 'Extensions',
    short: 'Strong, sculpted length.',
    description:
      'Strong, sculpted length in the shape you love, finished with polish or a simple design.',
    theme: '#9b5de5',
    includes: [
      'Sculpted acrylic length',
      'Shape of your choice',
      'Polish or a simple design',
      'Finished and checked with you',
    ],
  },
  {
    name: 'Nail Extensions',
    slug: 'nail-extensions',
    priceFrom: 60,
    durationMin: 90,
    category: 'Extensions',
    short: 'Instant length, shaped your way.',
    description:
      'Lightweight extensions for instant length, shaped to suit your hands and finished your way.',
    theme: '#4361ee',
    includes: [
      'Lightweight extension tips',
      'Shaped to suit your hands',
      'Your choice of polish',
      'Natural-feeling finish',
    ],
  },
  {
    name: 'Nail Art Design',
    slug: 'nail-art-design',
    priceFrom: 20,
    durationMin: 30,
    category: 'Nail Art & Add-ons',
    short: 'Hand-painted details, foil or florals.',
    description:
      'Hand-painted details, foil, chrome or florals — tell us your idea or pick from our looks.',
    theme: '#f15bb5',
    includes: [
      'Your idea, or a look from our gallery',
      'Hand-painted details, foil, chrome or florals',
      'Finished with a protective top coat',
    ],
  },
  {
    name: 'Bridal Nails',
    slug: 'bridal-nails',
    priceFrom: 70,
    durationMin: 120,
    category: 'Nail Art & Add-ons',
    short: 'A flawless set for your day.',
    description:
      'Your day, your nails. A calm, unhurried appointment for a flawless bridal set with delicate detail.',
    theme: '#c9a227',
    includes: [
      'A calm, unhurried appointment',
      'A flawless set shaped to your hands',
      'Delicate detail planned with you',
      'Checked with you before you leave',
    ],
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

export function serviceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}
