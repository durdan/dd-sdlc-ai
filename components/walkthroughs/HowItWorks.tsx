"use client"
// The four steps of "Your system, explained", each with a small picture that
// plays while its step is highlighted. The highlight walks 1 → 4 on its own
// and follows the pointer on hover; with reduced motion everything stays still.
import { useEffect, useState, type ReactNode } from "react"

const STEPS = [
  ["You describe your system", "What it does, who the walkthrough is for, and anything worth knowing. No secrets."],
  ["You review a draft in about a minute", "An eight-chapter script, from the problem to the trade-offs, and a system diagram. Ask for changes up to three times."],
  ["You approve, your walkthrough is built", "The narration is recorded and the diagram animated step by step, with every detail checked for accuracy. You'll be notified as soon as it's ready."],
  ["You watch it here", "You get a private link by email. Only you can open it, after signing in."],
] as const

const STEP_MS = 3200
const TEAL = "#3d6b63"
const SOFT = "#e6efec"
const LINE = "#d9dfdc"
const TEXT = "#9fb3ae"

/** Animation class only while the step plays; otherwise the picture rests in its finished state. */
const a = (play: boolean, cls: string, delayMs = 0) => ({ className: play ? cls : undefined, style: play ? { animationDelay: `${delayMs}ms` } : undefined })

// 1. A description being typed.
const describe = (play: boolean) => (
  <>
    <rect x="4" y="6" width="152" height="60" rx="8" fill="#fff" stroke={LINE} />
    <rect x="14" y="17" width="108" height="5" rx="2.5" fill={TEXT} {...a(play, "hiw-grow", 0)} />
    <rect x="14" y="29" width="128" height="5" rx="2.5" fill={TEXT} {...a(play, "hiw-grow", 450)} />
    <rect x="14" y="41" width="80" height="5" rx="2.5" fill={TEXT} {...a(play, "hiw-grow", 900)} />
    {play ? <rect x="98" y="39" width="2" height="9" fill={TEAL} className="hiw-caret" /> : null}
    <rect x="112" y="52" width="36" height="8" rx="4" fill={TEAL} opacity="0.85" />
  </>
)

// 2. The script streams in while the diagram draws itself.
const draft = (play: boolean) => (
  <>
    <rect x="6" y="10" width="58" height="4" rx="2" fill={TEXT} {...a(play, "hiw-grow", 0)} />
    <rect x="6" y="20" width="50" height="4" rx="2" fill={TEXT} {...a(play, "hiw-grow", 220)} />
    <rect x="6" y="30" width="62" height="4" rx="2" fill={TEXT} {...a(play, "hiw-grow", 440)} />
    <rect x="6" y="40" width="40" height="4" rx="2" fill={TEXT} {...a(play, "hiw-grow", 660)} />
    <rect x="6" y="50" width="54" height="4" rx="2" fill={TEXT} {...a(play, "hiw-grow", 880)} />
    <path d="M125 22V35H105V48" fill="none" stroke={TEAL} strokeWidth="1.25" {...a(play, "hiw-draw", 600)} />
    <path d="M125 22V35H141V48" fill="none" stroke={TEAL} strokeWidth="1.25" {...a(play, "hiw-draw", 900)} />
    <rect x="96" y="6" width="58" height="16" rx="4" fill={SOFT} stroke={TEAL} {...a(play, "hiw-pop", 250)} />
    <rect x="90" y="48" width="30" height="16" rx="4" fill={SOFT} stroke={TEAL} {...a(play, "hiw-pop", 1000)} />
    <rect x="126" y="48" width="30" height="16" rx="4" fill={SOFT} stroke={TEAL} {...a(play, "hiw-pop", 1250)} />
  </>
)

// 3. The walkthrough is built: requests flow through the diagram, the voice is recorded.
const build = (play: boolean) => (
  <>
    <path d="M50 22H78V16H108" fill="none" stroke={LINE} strokeWidth="1.25" />
    <path d="M50 22H78V44H108" fill="none" stroke={LINE} strokeWidth="1.25" />
    <rect x="8" y="12" width="42" height="20" rx="4" fill="#fff" stroke={TEAL} />
    <rect x="108" y="6" width="46" height="20" rx="4" fill="#fff" stroke={TEAL} />
    <rect x="108" y="34" width="46" height="20" rx="4" fill="#fff" stroke={TEAL} />
    {play ? (
      <>
        <circle r="3" fill={TEAL}>
          <animateMotion dur="1.4s" repeatCount="indefinite" path="M50 22H78V16H108" />
        </circle>
        <circle r="3" fill={TEAL}>
          <animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M50 22H78V44H108" />
        </circle>
      </>
    ) : null}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
      <rect key={k} x={10 + k * 5} y="52" width="3" height="12" rx="1.5" fill={TEAL} opacity="0.75" {...a(play, "hiw-wave", (k % 4) * 120)} />
    ))}
  </>
)

// 4. A private player: play, progress, lock.
const watch = (play: boolean) => (
  <>
    <rect x="4" y="6" width="152" height="60" rx="8" fill="#fff" stroke={LINE} />
    <g {...a(play, "hiw-pulse")}>
      <circle cx="80" cy="30" r="12" fill={SOFT} stroke={TEAL} />
      <path d="M76 24L86 30L76 36Z" fill={TEAL} />
    </g>
    <rect x="14" y="54" width="132" height="4" rx="2" fill={SOFT} />
    <rect x="14" y="54" width="132" height="4" rx="2" fill={TEAL} {...a(play, "hiw-grow-slow")} />
    <rect x="138" y="15" width="10" height="8" rx="1.5" fill={TEAL} />
    <path d="M140.5 15v-2.5a2.5 2.5 0 0 1 5 0V15" fill="none" stroke={TEAL} strokeWidth="1.5" />
  </>
)

const ART: ((play: boolean) => ReactNode)[] = [describe, draft, build, watch]

export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [still, setStill] = useState(false)
  useEffect(() => setStill(matchMedia("(prefers-reduced-motion: reduce)").matches), [])
  useEffect(() => {
    if (still || hovering) return
    const t = setTimeout(() => setActive((i) => (i + 1) % STEPS.length), STEP_MS)
    return () => clearTimeout(t)
  }, [active, still, hovering])

  return (
    <ol className={`hiw grid gap-3 sm:grid-cols-2${still ? " still" : ""}`} onMouseLeave={() => setHovering(false)}>
      {STEPS.map(([title, text], i) => {
        const on = i === active
        return (
          <li
            key={title}
            className={`hiw-step relative overflow-hidden rounded-2xl border bg-white p-4 transition-[border-color,box-shadow] duration-300 ${
              on ? "on border-[#3d6b63] shadow-[0_6px_24px_-12px_rgba(31,42,40,0.35)]" : "border-[#d9dfdc]"
            }`}
            style={{ animationDelay: `${i * 90}ms` }}
            onMouseEnter={() => {
              setActive(i)
              setHovering(true)
            }}
          >
            <div className="flex gap-4 sm:flex-col sm:gap-3">
              <svg viewBox="0 0 160 72" className="h-[64px] w-[112px] shrink-0 sm:h-[72px] sm:w-[128px]" aria-hidden="true">
                {ART[i](on && !still)}
              </svg>
              <div className="min-w-0">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                      on ? "bg-[#3d6b63] text-white" : "bg-[#e6efec] text-[#3d6b63]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <b className="text-[15px] leading-snug">{title}</b>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#4f5d5a]">{text}</p>
              </div>
            </div>
            {on && !still ? (
              <span className="hiw-bar" aria-hidden="true">
                <i key={active} className={hovering ? "full" : "run"} />
              </span>
            ) : null}
          </li>
        )
      })}
      <style>{`
        .hiw-step { animation: hiw-up .5s ease-out both; }
        @keyframes hiw-up { from { opacity: 0; transform: translateY(8px); } }
        .hiw .hiw-grow { transform-box: fill-box; transform-origin: left center; animation: hiw-sx .45s ease-out both; }
        .hiw .hiw-grow-slow { transform-box: fill-box; transform-origin: left center; animation: hiw-sx 2.8s linear both; }
        @keyframes hiw-sx { from { transform: scaleX(0); } }
        .hiw .hiw-pop { transform-box: fill-box; transform-origin: center; animation: hiw-pop .4s cubic-bezier(.2,.9,.3,1.3) both; }
        @keyframes hiw-pop { from { opacity: 0; transform: scale(.6); } }
        .hiw .hiw-draw { stroke-dasharray: 40; animation: hiw-draw .5s ease-out both; }
        @keyframes hiw-draw { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
        .hiw .hiw-caret { animation: hiw-blink 1s steps(2) infinite; }
        @keyframes hiw-blink { 50% { opacity: 0; } }
        .hiw .hiw-wave { transform-box: fill-box; transform-origin: center; animation: hiw-wave .55s ease-in-out infinite alternate; }
        @keyframes hiw-wave { from { transform: scaleY(.3); } }
        .hiw .hiw-pulse { transform-box: fill-box; transform-origin: center; animation: hiw-pulse 1.1s ease-in-out infinite alternate; }
        @keyframes hiw-pulse { to { transform: scale(1.12); } }
        .hiw-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; }
        .hiw-bar i { display: block; height: 100%; background: ${TEAL}; }
        .hiw-bar i.run { animation: hiw-fill ${STEP_MS}ms linear both; }
        .hiw-bar i.full { width: 100%; }
        @keyframes hiw-fill { from { width: 0; } to { width: 100%; } }
        .hiw.still, .hiw.still * { animation: none !important; }
        @media (prefers-reduced-motion: reduce) { .hiw, .hiw * { animation: none !important; } }
      `}</style>
    </ol>
  )
}
