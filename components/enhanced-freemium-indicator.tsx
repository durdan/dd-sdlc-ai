'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Key, 
  TrendingUp, 
  Zap, 
  Gift,
  Settings,
  ChevronRight,
  Calendar,
  Sparkles,
  Timer,
  Info
} from 'lucide-react'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'

interface EnhancedFreemiumIndicatorProps {
  compact?: boolean
  showActions?: boolean
  onConfigureKeys?: () => void
  onUpgrade?: () => void
}

export default function EnhancedFreemiumIndicator({ 
  compact = false, 
  showActions = true,
  onConfigureKeys,
  onUpgrade
}: EnhancedFreemiumIndicatorProps) {
  const { usage, loading, error } = useFreemiumUsage()
  const [timeUntilReset, setTimeUntilReset] = useState('')

  // Calculate time until reset (midnight UTC)
  useEffect(() => {
    const updateResetTime = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCDate(now.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateResetTime()
    const interval = setInterval(updateResetTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error || !usage) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Unable to load usage</span>
      </div>
    )
  }

  const usagePercentage = (usage.projectsToday / usage.dailyLimit) * 100
  const remainingPercentage = (usage.remainingProjects / usage.dailyLimit) * 100

  const getStatusConfig = () => {
    if (usage.remainingProjects === 0) {
      return {
        color: 'red',
        icon: <AlertCircle className="h-4 w-4" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeVariant: 'destructive' as const,
        title: 'Limit Reached',
        message: 'You\'ve used all your free projects for today'
      }
    } else if (usage.remainingProjects === 1) {
      return {
        color: 'yellow',
        icon: <Timer className="h-4 w-4" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        badgeVariant: 'secondary' as const,
        title: 'Almost Full',
        message: 'You have 1 project left today'
      }
    } else {
      return {
        color: 'green',
        icon: <CheckCircle className="h-4 w-4" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        badgeVariant: 'default' as const,
        title: 'Available',
        message: `You have ${usage.remainingProjects} projects left today`
      }
    }
  }

  const status = getStatusConfig()

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`relative flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.borderColor} ${status.textColor}`}>
          {status.icon}
          <span>{usage.remainingProjects}/{usage.dailyLimit}</span>
          
          {/* Animated pulse for attention */}
          {usage.remainingProjects === 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        
        {/* Reset timer bubble */}
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          <Clock className="h-3 w-3 inline mr-1" />
          {timeUntilReset}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Daily Usage</span>
          </div>
          <Badge variant={status.badgeVariant} className="flex items-center space-x-1">
            {status.icon}
            <span>{status.title}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress with Visual Enhancement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Projects</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  {[...Array(usage.dailyLimit)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < usage.projectsToday 
                          ? 'bg-blue-500' 
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-medium ${status.textColor}`}>
                  {usage.projectsToday} / {usage.dailyLimit}
                </span>
              </div>
            </div>
          </div>
          
          <Progress value={usagePercentage} className="h-3" />
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Free daily limit</span>
            <div className="flex items-center space-x-2">
              <span className={status.textColor}>
                {usage.remainingProjects} remaining
              </span>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Resets in {timeUntilReset}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message with Enhanced Visual Feedback */}
        <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-3`}>
          <div className="flex items-start space-x-3">
            <div className={`${status.textColor} mt-0.5`}>
              {status.icon}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${status.textColor}`}>
                {status.message}
              </div>
              {usage.remainingProjects === 0 && (
                <div className="text-xs mt-1 text-gray-600">
                  Your usage will reset at midnight UTC ({timeUntilReset} from now)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Actions */}
        {showActions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              What's next?
            </h4>
            
            <div className="space-y-2">
              {usage.remainingProjects === 0 ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onConfigureKeys}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Use your own API key for unlimited projects
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={onUpgrade}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Enroll for early access (coming soon)
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Create your next project ({usage.remainingProjects} left)
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                  {usage.remainingProjects === 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={onConfigureKeys}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure your API key for unlimited usage
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        <div className="border-t pt-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{usage.projectsToday}</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{usage.dailyLimit}</div>
              <div className="text-xs text-gray-500">Daily Limit</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{usage.remainingProjects}</div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>
        </div>

        {/* Pro tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Pro tip:</strong> Add your OpenAI API key in Configuration to get unlimited projects and faster processing.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 