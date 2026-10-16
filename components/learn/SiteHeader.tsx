"use client"
// Site header for the walkthrough library: logo, library links, sign in / out.
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Logo from "./Logo"

export default function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const name = (user?.user_metadata?.full_name as string | undefined) || user?.email || ""
  const router = useRouter()
  // Back from Google sign-in: go where the user was heading (see app/signin).
  useEffect(() => {
    const next = user ? localStorage.getItem("auth.next") : null
    if (!next) return
    localStorage.removeItem("auth.next")
    if (next !== location.pathname + location.search) router.replace(next)
  }, [user, router])
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#d9dfdc] bg-[#f4f5f2]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-5">
        <Link href="/" aria-label="sdlc.dev home" className="flex shrink-0 items-center">
          <Logo />
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 whitespace-nowrap text-[13px] font-semibold text-[#4f5d5a] sm:gap-2 sm:text-sm">
          <Link href="/learn" className="hidden rounded-full px-3 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63] sm:inline-block">
            Library
          </Link>
          <Link href="/learn/paths" className="hidden rounded-full px-3 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63] sm:inline-block">
            Paths
          </Link>
          <Link href={user ? "/requests" : "/request"} className="rounded-full px-2.5 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63] max-[359px]:hidden sm:px-3">
            <span className="sm:hidden">{user ? "Requests" : "Your system"}</span>
            <span className="hidden sm:inline">{user ? "My requests" : "Your system, explained"}</span>
          </Link>
          {loading ? null : user ? (
            <>
              <span
                title={name}
                className="ml-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3d6b63] text-xs font-bold uppercase text-white sm:inline-flex"
              >
                {name.slice(0, 1) || "·"}
              </span>
              <button
                onClick={() => signOut()}
                className="shrink-0 rounded-full border border-[#d9dfdc] bg-white px-3 py-1.5 text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="ml-1 shrink-0 rounded-full bg-[#3d6b63] px-3.5 py-1.5 text-white hover:bg-[#2f564f] sm:px-4"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
