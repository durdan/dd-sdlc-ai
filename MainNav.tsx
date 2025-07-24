'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserProfile } from './UserProfile'
import { useAuth } from '@/contexts/AuthContext'
import { Icons } from '@/components/icons'
import { Sparkles } from 'lucide-react'

interface NavItem {
  title: string;
  href: string;
  protected?: boolean;
  badge?: string;
  icon?: React.ReactNode;
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
      title: 'CodeYodha',
      href: '/dashboard', // Change to the specific Claude Code Assistant route if needed
      icon: <Sparkles className="h-4 w-4 mr-1 text-purple-500" />, // Add a sparkles icon
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
    <div className="flex h-20 items-center border-b px-4">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-3">
          <img 
            src="/img/logo-sdlc.png" 
            alt="SDLC Logo" 
            className="h-16 w-auto"
            style={{ 
              maxWidth: 'none'  // Override Tailwind's max-width: 100%
            }}
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
                {item.icon}
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
