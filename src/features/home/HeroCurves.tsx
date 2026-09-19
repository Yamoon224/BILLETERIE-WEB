/**
 * Traits decoratifs du hero d'accueil : la trajectoire du voyage, en fond,
 * jamais interactive. Degrades bases sur les memes jetons que `grad-brand`
 * (cyan, fuchsia, jaune) pour rester coherente si la charte evolue. A poser
 * dans une section `relative overflow-hidden`, avec le contenu reel dans un
 * enfant `relative` pour rester au-dessus (ordre du DOM, pas de z-index).
 */
export function HeroCurves() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 460"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="hero-trail-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "var(--color-brand-500)" }} />
          <stop offset="50%" style={{ stopColor: "var(--color-fuchsia)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-yellow)" }} />
        </linearGradient>
        <linearGradient id="hero-trail-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--color-yellow)" }} />
          <stop offset="50%" style={{ stopColor: "var(--color-brand-500)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-fuchsia)" }} />
        </linearGradient>
        <filter id="hero-trail-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#hero-trail-glow)">
        <path
          d="M-60,120 C220,20 380,300 660,150 S 1140,40 1260,190"
          fill="none"
          stroke="url(#hero-trail-1)"
          strokeWidth="2.5"
        />
        <path
          d="M-60,240 C260,140 440,380 760,260 S 1220,180 1320,320"
          fill="none"
          stroke="url(#hero-trail-2)"
          strokeWidth="2"
          opacity="0.85"
        />
        <path
          d="M-60,360 C280,300 460,440 720,380 S 1180,300 1320,380"
          fill="none"
          stroke="url(#hero-trail-1)"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <circle cx="660" cy="150" r="4" style={{ fill: "var(--color-yellow)" }} />
        <circle cx="760" cy="260" r="3.5" style={{ fill: "var(--color-fuchsia)" }} />
        <circle cx="720" cy="380" r="3" style={{ fill: "var(--color-brand-500)" }} />
      </g>
    </svg>
  );
}
