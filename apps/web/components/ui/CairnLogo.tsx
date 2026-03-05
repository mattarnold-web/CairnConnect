/**
 * Cairn Connect brand logo — stacked cairn stones with mountain silhouette.
 * Renders as an inline SVG so it inherits `currentColor` by default.
 * Pass `className` to control size (e.g. "h-6 w-6") and color.
 */
export function CairnLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bottom stone — widest, with mountain peaks carved in */}
      <path
        d="M8 48c0-3 2-6 5-7h38c3 1 5 4 5 7 0 4-3 7-7 7H15c-4 0-7-3-7-7z"
        fill="currentColor"
        opacity={0.85}
      />
      {/* Mountain silhouette inside bottom stone */}
      <path
        d="M14 52l8-10 4 4 6-7 5 6 3-3 8 10H14z"
        fill="currentColor"
        opacity={0.25}
      />

      {/* Middle stone */}
      <path
        d="M16 37c0-3 3-6 6-6h20c3 0 6 3 6 6s-3 6-6 6H22c-3 0-6-3-6-6z"
        fill="currentColor"
        opacity={0.75}
      />

      {/* Top stone — smallest */}
      <path
        d="M22 26c0-3 2-5 5-5h10c3 0 5 2 5 5s-2 5-5 5H27c-3 0-5-2-5-5z"
        fill="currentColor"
        opacity={0.65}
      />

      {/* Compass / direction pointer on top */}
      <path
        d="M32 6l-5 13h10L32 6z"
        fill="currentColor"
      />
      <path
        d="M29 17l3-7 3 7"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity={0.3}
      />
    </svg>
  );
}
