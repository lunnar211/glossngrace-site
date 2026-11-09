/**
 * Decorative CSS 3D polish bottle for the hero only.
 * Pure CSS/SVG, slowly floating and swaying. Hidden on small screens
 * and disabled for reduced motion (see globals.css).
 * Never interactive, never covers the Book Now button.
 */
export default function PolishBottle() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-2 top-2 hidden select-none md:block"
      style={{ perspective: "800px" }}
    >
      <div className="animate-floaty">
        <div className="animate-sway">
          <svg width="110" height="190" viewBox="0 0 120 200" role="presentation">
            <defs>
              <linearGradient id="bottleGlass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbe3ea" />
                <stop offset="50%" stopColor="#f6cdd9" />
                <stop offset="100%" stopColor="#eeb9c8" />
              </linearGradient>
              <linearGradient id="bottleGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#a9831f" />
              </linearGradient>
            </defs>
            {/* gold cap */}
            <rect x="44" y="6" width="32" height="54" rx="7" fill="url(#bottleGold)" />
            <rect x="48" y="12" width="6" height="42" rx="3" fill="#ffffff" opacity="0.35" />
            {/* neck */}
            <rect x="52" y="60" width="16" height="10" fill="#8a6d1f" />
            {/* bottle body */}
            <path
              d="M30 82 Q30 70 42 70 H78 Q90 70 90 82 V168 Q90 190 68 190 H52 Q30 190 30 168 Z"
              fill="url(#bottleGlass)"
              stroke="#c9a227"
              strokeOpacity="0.45"
            />
            {/* polish liquid */}
            <path
              d="M36 104 H84 V166 Q84 184 68 184 H52 Q36 184 36 166 Z"
              fill="#e78aa5"
              opacity="0.9"
            />
            {/* glass highlight */}
            <rect x="40" y="80" width="8" height="96" rx="4" fill="#ffffff" opacity="0.55" />
            {/* label */}
            <text
              x="60"
              y="150"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="13"
              fill="#3d2b2b"
            >
              Gloss
            </text>
          </svg>
        </div>
      </div>
      <div
        className="mx-auto mt-1 h-3 w-20 rounded-full bg-gold/25 blur-md"
        aria-hidden="true"
      />
    </div>
  );
}
