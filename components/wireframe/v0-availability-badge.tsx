'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Sparkles, Info, AlertCircle } from 'lucide-react'

interface V0AvailabilityBadgeProps {
  userId: string
  onSettingsClick?: () => void
}

export function V0AvailabilityBadge({ userId, onSettingsClick }: V0AvailabilityBadgeProps) {
  const [status, setStatus] = useState<{
    available: boolean
    hasOwnKey: boolean
    remainingUsage: number
    message?: string
  }>({
    available: false,
    hasOwnKey: false,
    remainingUsage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAvailability()
  }, [userId])

  const checkAvailability = async () => {
    try {
      const response = await fetch('/api/v0/usage')
      if (!response.ok) {
        throw new Error('Failed to check v0 usage')
      }
      
      const result = await response.json()
      setStatus({
        available: result.hasOwnKey || result.canUseSystemKey,
        hasOwnKey: result.hasOwnKey,
        remainingUsage: result.remainingUsage,
        message: result.message,
      })
    } catch (error) {
      console.error('Error checking v0 availability:', error)
      setStatus({
        available: false,
        hasOwnKey: false,
        remainingUsage: 0,
        message: 'Error checking v0.dev availability',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  const getBadgeVariant = () => {
    if (status.hasOwnKey) return 'default'
    if (status.remainingUsage > 0) return 'secondary'
    return 'destructive'
  }

  const getBadgeContent = () => {
    if (status.hasOwnKey) {
      return (
        <>
          <Sparkles className="h-3 w-3" />
          <span>v0.dev Ready</span>
        </>
      )
    }
    if (status.remainingUsage > 0) {
      return (
        <>
          <Sparkles className="h-3 w-3" />
          <span>v0.dev ({status.remainingUsage} left today)</span>
        </>
      )
    }
    return (
      <>
        <AlertCircle className="h-3 w-3" />
        <span>v0.dev Limit Reached</span>
      </>
    )
  }

  const getTooltipContent = () => {
    if (status.hasOwnKey) {
      return 'You have unlimited v0.dev access with your API key'
    }
    if (status.remainingUsage > 0) {
      return `You have ${status.remainingUsage} free v0.dev generation${status.remainingUsage !== 1 ? 's' : ''} remaining today`
    }
    return 'Daily limit reached. Add your API key for unlimited access or try again tomorrow.'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getBadgeVariant()} 
              className="flex items-center gap-1 cursor-help"
            >
              {getBadgeContent()}
            </Badge>
            {onSettingsClick && !status.hasOwnKey && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSettingsClick}
                className="h-6 text-xs"
              >
                Add API Key
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{getTooltipContent()}</p>
            {status.message && (
              <p className="text-xs text-muted-foreground">{status.message}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}