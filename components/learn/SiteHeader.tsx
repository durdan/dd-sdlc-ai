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
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-5">
        <Link href="/" aria-label="sdlc.dev home" className="flex items-center">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold text-[#4f5d5a] sm:gap-2">
          <Link href="/learn" className="hidden rounded-full px-3 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63] sm:inline-block">
            Library
          </Link>
          <Link href="/learn/library/paths" className="hidden rounded-full px-3 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63] sm:inline-block">
            Paths
          </Link>
          <Link href={user ? "/requests" : "/request"} className="rounded-full px-3 py-1.5 hover:bg-[#e6efec] hover:text-[#3d6b63]">
            <span className="sm:hidden">Request</span>
            <span className="hidden sm:inline">{user ? "My requests" : "Request a walkthrough"}</span>
          </Link>
          {loading ? null : user ? (
            <>
              <span
                title={name}
                className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3d6b63] text-xs font-bold uppercase text-white"
              >
                {name.slice(0, 1) || "·"}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-[#d9dfdc] bg-white px-3 py-1.5 text-[#4f5d5a] hover:border-[#3d6b63] hover:text-[#3d6b63]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="ml-1 rounded-full bg-[#3d6b63] px-4 py-1.5 text-white hover:bg-[#2f564f]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
