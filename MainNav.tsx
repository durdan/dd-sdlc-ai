'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserProfile } from '@/components/UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import { Icons } from '@/components/icons'

interface NavItem {
  title: string;
  href: string;
  protected?: boolean;
  badge?: string;
}

export function MainNav() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const mainNavItems: NavItem[] = [
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
        <Link href="/" className="flex items-center space-x-3">
          <img 
            src="/img/SDLC.dev.logo.svg" 
            alt="SDLC.dev Logo" 
            className="h-14 w-auto filter contrast-125 brightness-110 drop-shadow-lg" 
          />
          <div className="font-bold">
            <span className="hidden sm:inline text-lg">SDLC AI</span>
            <span className="sm:hidden text-base">SDLC</span>
          </div>
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
                  'transition-colors hover:text-foreground/80 flex items-center space-x-1',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <span>{item.title}</span>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                )}
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
