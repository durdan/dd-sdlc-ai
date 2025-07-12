"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slack } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SlackOAuthButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function SlackOAuthButton({ 
  onSuccess, 
  onError, 
  className, 
  variant = "default",
  size = "default"
}: SlackOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  const handleSlackOAuth = async () => {
    try {
      setIsLoading(true)
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      // Build OAuth URL
      const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
      const redirectUri = process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI
      
      if (!clientId) {
        throw new Error('Slack OAuth not configured - missing client ID')
      }
      
      if (!redirectUri) {
        throw new Error('Slack OAuth not configured - missing redirect URI')
      }

      const scopes = [
        'chat:write',
        'commands',
        'channels:read',
        'groups:read',
        'users:read',
        'team:read'
      ].join(',')

      // Include user ID in state parameter
      const state = `${Math.random().toString(36).substring(7)}_${userId}`
      
      const oauthUrl = `https://slack.com/oauth/v2/authorize?${new URLSearchParams({
        client_id: clientId,
        scope: scopes,
        redirect_uri: redirectUri,
        state: state
      })}`

      // Open OAuth in popup
      const popup = window.open(
        oauthUrl,
        'slack-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsLoading(false)
          
          // Check if OAuth was successful by reloading the page
          setTimeout(() => {
            console.log('🔄 OAuth popup closed, reloading to check connection status...')
            // Call onSuccess callback if provided
            onSuccess?.()
            // Force page reload to refresh integration status
            window.location.reload()
          }, 1000)
        }
      }, 1000)

      // Cleanup if user closes popup manually
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          clearInterval(checkClosed)
          setIsLoading(false)
        }
      }, 300000) // 5 minutes timeout

    } catch (error) {
      console.error('Slack OAuth error:', error)
      setIsLoading(false)
      onError?.(error instanceof Error ? error.message : 'OAuth failed')
    }
  }

  return (
    <Button
      onClick={handleSlackOAuth}
      disabled={isLoading || !userId}
      className={className}
      variant={variant}
      size={size}
    >
      <Slack className="h-4 w-4 mr-2" />
      {isLoading ? 'Connecting...' : !userId ? 'Loading...' : variant === 'outline' ? 'Reconfigure' : 'Add to Slack'}
    </Button>
  )
}
