'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
  const [mounted, setMounted] = useState(false)
  const { session, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session && !loading) {
      router.push(redirectTo)
    }
  }, [session, loading, router, redirectTo])

  if (loading || !mounted) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthModal open={true} onOpenChange={() => router.push('/')} />
    </div>
  )
}
