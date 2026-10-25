
export function Squiggle({ flip = false, size = 28 }) {
  return (
    <svg
      width={Math.round(size * 0.65)}
      height={size}
      viewBox="0 0 26 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      style={{
        color: "var(--color-primary)",
        flexShrink: 0,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <line x1="4" y1="6" x2="20" y2="10" />
      <line x1="2" y1="18" x2="18" y2="20" />
      <line x1="6" y1="32" x2="18" y2="26" />
    </svg>
  );
}

export function LeafIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 26C6 14 14 6 26 5C27 17 20 25 8 26Z"
        fill="#91A98C"
        fillOpacity="0.35"
        stroke="#91A98C"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 26C12 19 17 14 24 8"
        stroke="#91A98C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
