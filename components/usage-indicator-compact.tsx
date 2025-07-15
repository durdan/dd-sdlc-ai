'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  Timer, 
  ExternalLink,
  TrendingUp,
  Clock,
  MessageSquare,
  Mail
} from 'lucide-react'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'

interface UsageIndicatorCompactProps {
  onViewDashboard: () => void
}

export default function UsageIndicatorCompact({ onViewDashboard }: UsageIndicatorCompactProps) {
  const { usage, loading } = useFreemiumUsage()
  const [requestingCredits, setRequestingCredits] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  const handleRequestCredits = async () => {
    setRequestingCredits(true)
    try {
      // Send request to support or admin
      const response = await fetch('/api/admin/request-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: requestMessage || 'Requesting additional credits for my account',
          currentUsage: usage
        })
      })

      if (response.ok) {
        alert('Credit request submitted successfully! Our team will review your request.')
        setRequestMessage('')
      } else {
        alert('Failed to submit request. Please try again or contact support.')
      }
    } catch (error) {
      console.error('Error requesting credits:', error)
      alert('Failed to submit request. Please try again or contact support.')
    } finally {
      setRequestingCredits(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!usage) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onViewDashboard}
        className="flex items-center gap-2"
      >
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span>Usage Error</span>
      </Button>
    )
  }

  const getStatusConfig = () => {
    if (usage.remainingProjects === 0) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeVariant: 'destructive' as const,
        status: 'Limit Reached'
      }
    } else if (usage.remainingProjects === 1) {
      return {
        icon: <Timer className="h-4 w-4" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        badgeVariant: 'secondary' as const,
        status: 'Almost Full'
      }
    } else {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeVariant: 'default' as const,
        status: 'Available'
      }
    }
  }

  const config = getStatusConfig()

  const getBadgeColor = () => {
    if (usage.remainingProjects === 0) {
      return 'bg-red-50 text-red-600 border-red-200'
    } else if (usage.remainingProjects === 1) {
      return 'bg-yellow-50 text-yellow-600 border-yellow-200'
    } else {
      return 'bg-green-50 text-green-600 border-green-200'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Status Badge */}
      <Badge variant="outline" className={`${getBadgeColor()} text-xs font-medium`}>
        {usage?.remainingProjects || 0}/{usage?.dailyLimit || 0} left
      </Badge>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDashboard}
          className="h-8 px-2 text-xs"
        >
          <BarChart3 className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Usage</span>
        </Button>

        {/* Request Credits Button - show when low or no credits */}
        {usage && (usage.remainingProjects <= 1 || usage.remainingProjects === 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const message = window.prompt(
                'Please describe why you need additional credits:',
                'I need more credits to complete my project documentation.'
              )
              if (message) {
                setRequestMessage(message)
                handleRequestCredits()
              }
            }}
            disabled={requestingCredits}
            className="h-8 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            {requestingCredits ? (
              <>
                <Clock className="h-3 w-3 mr-1 animate-spin" />
                <span className="hidden sm:inline">Requesting...</span>
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Request Credits</span>
                <span className="sm:hidden">Request</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
} 