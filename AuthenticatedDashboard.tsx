'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthenticatedDashboardProps {
  children: React.ReactNode
}

export function AuthenticatedDashboard({ children }: AuthenticatedDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !session && mounted) {
      router.push('/signin')
    }
  }, [session, loading, router, mounted])

  if (loading || !mounted) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
