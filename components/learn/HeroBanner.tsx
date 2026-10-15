"use client"
// The library home's banner: what sdlc.dev teaches, beside the 20-second film
// playing muted on a loop (with a sound toggle), and the two ways in. Visitors who prefer reduced
// motion get the poster and a play button instead of autoplay.
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

// Landscape for wide screens; phones get the cut laid out for a tall frame.
const FILM = {
  wide: { src: "/hero/sdlc-film.mp4", poster: "/hero/sdlc-film.jpg" },
  tall: { src: "/hero/sdlc-film-vertical.mp4", poster: "/hero/sdlc-film-vertical.jpg" },
}
const PHONE = "(max-width: 639px)"

const POINTS = [
  ["38", "design patterns", "the problem each one solves, how it works, when it fails"],
  ["20", "company architectures", "how the biggest digital companies built theirs"],
  ["10", "learning paths", "from resilience basics to running at scale"],
] as const

export default function HeroBanner() {
  const video = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  // Chosen once the browser knows the screen; until then nothing loads.
  const [shape, setShape] = useState<"wide" | "tall" | null>(null)
  useEffect(() => setShape(matchMedia(PHONE).matches ? "tall" : "wide"), [])

  useEffect(() => {
    const v = video.current
    if (!v || !shape || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    v.play().catch(() => undefined)
  }, [shape])

  const toggleSound = () => {
    const v = video.current
    if (!v) return
    // Sound on starts the film from the top, so the music and the cuts line up.
    if (v.muted) v.currentTime = 0
    v.muted = !v.muted
    setMuted(v.muted)
    v.play().catch(() => undefined)
  }

  return (
    <section className="bg-[#12201d] text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-5 px-4 py-5 sm:gap-6 sm:px-5 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:gap-10 lg:py-12">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8fc2b6]">Software design, taught visually</p>
          <h2 className="mt-2 text-[26px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">
            Learn how great software is <span className="text-[#8fc2b6]">designed and built.</span>
          </h2>
          <p className="mt-3 hidden max-w-md text-[15px] leading-relaxed text-[#c9d6d2] sm:block">
            Design patterns explained through the problems they solve, and how companies like Uber, Netflix, WhatsApp and Stripe built their
            systems. Step by step, from the first requirement to the trade-offs in production.
          </p>
          <ul className="mt-4 grid max-w-md gap-2 text-[13px] text-[#c9d6d2] sm:mt-5 sm:gap-2.5 sm:text-sm">
            {POINTS.map(([n, what, why]) => (
              <li key={what} className="flex gap-3">
                <b className="w-8 shrink-0 text-right text-lg leading-5 text-white">{n}</b>
                <span>
                  <b className="text-white">{what}</b> · {why}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#library" className="rounded-full bg-[#8fc2b6] px-5 py-2 text-sm font-semibold text-[#12201d] hover:bg-[#a6d1c7]">
              Start learning
            </a>
            <Link
              href="/request"
              className="rounded-full border border-[#8fc2b6]/50 px-5 py-2 text-sm font-semibold text-white hover:border-[#8fc2b6] hover:bg-white/5"
            >
              Map your architecture
            </Link>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-[min(100%,34vh)] overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:w-full lg:order-2">
          <video
            ref={video}
            className="block aspect-[9/16] w-full bg-black sm:aspect-video"
            src={shape ? FILM[shape].src : undefined}
            poster={shape ? FILM[shape].poster : undefined}
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            aria-label="sdlc.dev in 20 seconds: design patterns and real company architectures"
          />
          {!playing ? (
            <button
              onClick={() => video.current?.play()}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
              aria-label="Play the film"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-[#12201d]">▶</span>
            </button>
          ) : (
            <button
              onClick={toggleSound}
              className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
              aria-label={muted ? "Turn sound on" : "Mute"}
            >
              {muted ? "🔊 Sound on" : "🔇 Mute"}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
