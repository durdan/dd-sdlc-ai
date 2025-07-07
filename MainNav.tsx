'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import { Icons } from '@/components/icons'

export function MainNav() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const mainNavItems = [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
      protected: true,
    },
    {
      title: 'My Prompts',
      href: '/prompts',
      protected: true,
    },
  ]

  // Don't show navigation while loading auth state
  if (loading) return null

  return (
    <div className="flex h-16 items-center border-b px-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">SDLC AI</span>
        </Link>
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {mainNavItems.map((item) => {
            // Skip protected routes if user is not authenticated
            if (item.protected && !user) return null
            
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        {user ? (
          <UserProfile />
        ) : (
          <Button asChild variant="outline">
            <Link href="/signin">Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
