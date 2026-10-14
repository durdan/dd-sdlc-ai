// The sdlc.dev mark in the walkthrough library's palette: speed lines in teal,
// the wordmark in ink. Works on light backgrounds.
export default function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 196 40" role="img" aria-label="sdlc.dev">
      <g stroke="#3d6b63" strokeLinecap="round">
        <line x1="2" y1="14" x2="34" y2="14" strokeWidth="2.6" />
        <line x1="10" y1="21" x2="40" y2="21" strokeWidth="3.2" />
        <line x1="4" y1="28" x2="30" y2="28" strokeWidth="2.2" opacity="0.6" />
      </g>
      <text x="48" y="29" fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" fontSize="25" fontWeight="800" letterSpacing="-0.6" fill="#1d2826">
        sdlc<tspan fill="#3d6b63">.</tspan>dev
      </text>
    </svg>
  )
}
