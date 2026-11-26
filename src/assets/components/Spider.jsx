export default function Spider({ className = "" }) {
  return (
    <svg
      viewBox="0 0 40 84"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <line
        x1="20"
        y1="0"
        x2="20"
        y2="44"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 48 L8 42" />
        <path d="M20 48 L6 48" />
        <path d="M20 48 L8 54" />
        <path d="M20 48 L11 60" />
        <path d="M20 48 L32 42" />
        <path d="M20 48 L34 48" />
        <path d="M20 48 L32 54" />
        <path d="M20 48 L29 60" />
      </g>
      <ellipse cx="20" cy="52" rx="6" ry="8" fill="currentColor" />
      <circle cx="20" cy="43" r="3.5" fill="currentColor" />
    </svg>
  );
}