"use client"

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ClaudeCodeDashboard from '@/components/claude-code-dashboard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, User, LogOut, Shield } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'

// User Header Component
interface UserHeaderProps {
  user: any;
  userRole: string;
  onSignOut: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, userRole, onSignOut }) => {
  const { usage, loading: usageLoading } = useFreemiumUsage()
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getUsageBadgeColor = () => {
    if (!usage) return 'bg-gray-100 text-gray-600'
    
    if (usage.remainingProjects === 0) return 'bg-red-100 text-red-700 border-red-200'
    if (usage.remainingProjects === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getUsageText = () => {
    if (!usage) return 'Loading...'
    return `${usage.remainingProjects}/${usage.dailyLimit} Free`
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <img 
              src="/img/SDLC.dev.logo.svg" 
              alt="SDLC.dev Logo" 
              className="h-48 w-auto filter contrast-125 brightness-110" 
            />
            <div className="ml-3 font-bold text-gray-900">
              <span className="hidden lg:inline text-xl">Claude Code Assistant</span>
              <span className="hidden sm:inline lg:hidden text-lg">Claude Code</span>
              <span className="sm:hidden text-base">Claude</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welcome back,</span>
              <span className="font-medium">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            {/* Freemium Usage Indicator */}
            {!usageLoading && usage && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getUsageBadgeColor()}`}>
                {getUsageText()}
              </div>
            )}
            
            {(userRole === 'admin' || userRole === 'manager') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/admin/prompts', '_blank')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name
                        ? getInitials(user.user_metadata.full_name)
                        : user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {/* Usage info in dropdown */}
                    {usage && (
                      <div className="flex items-center justify-between mt-2 pt-1 border-t">
                        <span className="text-xs text-muted-foreground">Today's usage:</span>
                        <span className={`text-xs font-medium ${usage.remainingProjects === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {usage.projectsToday}/{usage.dailyLimit}
                        </span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open('/dashboard', '_self')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Main Dashboard</span>
                </DropdownMenuItem>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.open('/admin/prompts', '_blank')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClaudeCodePage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log('User not authenticated, redirecting to signin')
          redirect('/signin')
          return
        }

        setUser(user)

        // Get user role
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('sdlc_user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          if (!roleError && roleData) {
            setUserRole(roleData.role)
          }
        } catch (error) {
          console.log('Role fetch error (non-critical):', error)
        }

      } catch (error) {
        console.error('Auth check error:', error)
        redirect('/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Get project ID from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const project = urlParams.get('project')
      if (project) {
        setProjectId(project)
      }
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Claude Code Assistant...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader user={user} userRole={userRole} onSignOut={handleSignOut} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClaudeCodeDashboard projectId={projectId} />
      </main>
    </div>
  )
}

function AuthenticatedClaudeCodePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        redirect('/signin')
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return <ClaudeCodePage />
}

export default AuthenticatedClaudeCodePage 