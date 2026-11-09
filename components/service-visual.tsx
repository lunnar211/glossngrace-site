/**
 * Animated 3D-style service visual — pure CSS/SVG, no video, no photo.
 * A polish bottle in the service's theme colour, slowly floating and
 * swaying, with floating nail swatches and a slow-spinning ring.
 * This is an animated preview of the look, NOT a video of a real
 * appointment (no real service videos exist).
 * Disabled for reduced motion (see globals.css).
 */
export default function ServiceVisual({
  theme,
  label,
}: {
  theme: string
  label: string
}) {
  const glassId = `glass-${label.replace(/[^a-z0-9]/gi, '')}`
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex h-[340px] w-full max-w-md items-center justify-center overflow-hidden rounded-[2rem] shadow-lg sm:h-[400px]"
      style={{
        background: `linear-gradient(160deg, #fff9f7 0%, ${theme}22 55%, ${theme}44 100%)`,
        perspective: '900px',
      }}
    >
      {/* slow-spinning dashed ring */}
      <div
        className="animate-spin-slow absolute h-[290px] w-[290px] rounded-full border-2 border-dashed opacity-40 sm:h-[330px] sm:w-[330px]"
        style={{ borderColor: theme }}
      />
      <div
        className="absolute h-[210px] w-[210px] rounded-full opacity-25 blur-2xl"
        style={{ background: theme }}
      />

      {/* floating nail swatches */}
      <div className="animate-floaty absolute left-6 top-10 sm:left-10">
        <div
          className="h-16 w-8 -rotate-12 rounded-full border border-white/70 shadow-md"
          style={{ background: theme }}
        />
      </div>
      <div
        className="animate-floaty absolute bottom-12 right-8 sm:right-12"
        style={{ animationDelay: '1.2s' }}
      >
        <div
          className="h-16 w-8 rotate-12 rounded-full border border-white/70 shadow-md"
          style={{ background: theme, opacity: 0.85 }}
        />
      </div>
      <div
        className="animate-floaty absolute right-10 top-14 sm:right-16"
        style={{ animationDelay: '2s' }}
      >
        <span className="text-2xl" style={{ color: theme }}>
          ✦
        </span>
      </div>
      <div
        className="animate-floaty absolute bottom-16 left-10 sm:left-14"
        style={{ animationDelay: '0.6s' }}
      >
        <span className="text-xl text-gold">✦</span>
      </div>

      {/* the bottle */}
      <div className="animate-floaty relative">
        <div className="animate-sway">
          <svg width="150" height="260" viewBox="0 0 120 200" role="presentation">
            <defs>
              <linearGradient id={glassId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor={theme} stopOpacity="0.35" />
                <stop offset="100%" stopColor={theme} stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="visualGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#a9831f" />
              </linearGradient>
            </defs>
            {/* gold cap */}
            <rect x="44" y="6" width="32" height="54" rx="7" fill="url(#visualGold)" />
            <rect x="48" y="12" width="6" height="42" rx="3" fill="#ffffff" opacity="0.35" />
            {/* neck */}
            <rect x="52" y="60" width="16" height="10" fill="#8a6d1f" />
            {/* bottle body */}
            <path
              d="M30 82 Q30 70 42 70 H78 Q90 70 90 82 V168 Q90 190 68 190 H52 Q30 190 30 168 Z"
              fill={`url(#${glassId})`}
              stroke="#c9a227"
              strokeOpacity="0.45"
            />
            {/* polish liquid */}
            <path
              d="M36 104 H84 V166 Q84 184 68 184 H52 Q36 184 36 166 Z"
              fill={theme}
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
        className="absolute bottom-6 h-3 w-24 rounded-full bg-gold/25 blur-md"
        aria-hidden="true"
      />
    </div>
  )
}
