'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Bell, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Zap, 
  Gift, 
  Star, 
  Users,
  ArrowRight,
  Target,
  Activity,
  Sparkles,
  Crown,
  Key,
  Rocket,
  Timer,
  BarChart3,
  Info
} from 'lucide-react'

interface SmartNotificationSystemProps {
  usage?: {
    projectsToday: number
    dailyLimit: number
    remainingProjects: number
  }
  onUpgrade?: () => void
  onConfigureKeys?: () => void
  userActivity?: {
    daysActive: number
    totalProjects: number
    averageDaily: number
  }
}

interface NotificationItem {
  id: string
  type: 'usage' | 'upgrade' | 'tip' | 'feature' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  action?: {
    text: string
    handler: () => void
  }
  dismissible: boolean
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  timestamp: number
}

export default function SmartNotificationSystem({
  usage,
  onUpgrade,
  onConfigureKeys,
  userActivity
}: SmartNotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [showBadge, setShowBadge] = useState(false)

  // Generate intelligent notifications based on usage patterns
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: NotificationItem[] = []
      const now = Date.now()

      // Usage-based notifications
      if (usage) {
        const usagePercentage = (usage.projectsToday / usage.dailyLimit) * 100

        // High priority: Limit reached
        if (usage.remainingProjects === 0) {
          newNotifications.push({
            id: 'limit-reached',
            type: 'usage',
            priority: 'high',
            title: 'Daily Limit Reached',
            message: 'You\'ve used all your free projects today. Upgrade to Early Access for unlimited projects.',
            action: {
              text: 'Upgrade Now',
              handler: onUpgrade || (() => {})
            },
            dismissible: false,
            icon: <AlertCircle className="h-4 w-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            timestamp: now
          })
        }

        // Medium priority: Almost at limit
        else if (usage.remainingProjects === 1) {
          newNotifications.push({
            id: 'almost-limit',
            type: 'usage',
            priority: 'medium',
            title: 'Almost at Daily Limit',
            message: 'You have 1 project remaining. Consider upgrading to avoid interruptions.',
            action: {
              text: 'View Options',
              handler: onUpgrade || (() => {})
            },
            dismissible: true,
            icon: <Timer className="h-4 w-4" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            timestamp: now
          })
        }

        // Medium priority: Heavy usage pattern
        else if (usagePercentage >= 60) {
          newNotifications.push({
            id: 'heavy-usage',
            type: 'upgrade',
            priority: 'medium',
            title: 'Heavy Usage Detected',
            message: `You're using ${Math.round(usagePercentage)}% of your daily limit. Upgrade for unlimited access.`,
            action: {
              text: 'Learn More',
              handler: onUpgrade || (() => {})
            },
            dismissible: true,
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            timestamp: now
          })
        }
      }

      // Activity-based notifications
      if (userActivity) {
        // Achievement: Active user
        if (userActivity.daysActive >= 7 && userActivity.totalProjects >= 20) {
          newNotifications.push({
            id: 'active-user',
            type: 'achievement',
            priority: 'low',
            title: 'Active User Achievement',
            message: `You've been active for ${userActivity.daysActive} days and created ${userActivity.totalProjects} projects! You're eligible for Early Access.`,
            action: {
              text: 'Claim Benefits',
              handler: onUpgrade || (() => {})
            },
            dismissible: true,
            icon: <Star className="h-4 w-4" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            timestamp: now
          })
        }

        // Feature tip: High efficiency
        if (userActivity.averageDaily >= 3) {
          newNotifications.push({
            id: 'efficiency-tip',
            type: 'tip',
            priority: 'low',
            title: 'High Efficiency User',
            message: `Your average of ${userActivity.averageDaily.toFixed(1)} projects per day shows great efficiency. Unlock premium features!`,
            action: {
              text: 'Explore Features',
              handler: onUpgrade || (() => {})
            },
            dismissible: true,
            icon: <Target className="h-4 w-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            timestamp: now
          })
        }
      }

      // Time-based notifications
      const hour = new Date().getHours()
      
      // Morning productivity boost
      if (hour >= 9 && hour <= 11) {
        newNotifications.push({
          id: 'morning-boost',
          type: 'tip',
          priority: 'low',
          title: 'Morning Productivity',
          message: 'Perfect time for SDLC generation! Your morning sessions are typically more productive.',
          dismissible: true,
          icon: <Activity className="h-4 w-4" />,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          timestamp: now
        })
      }

      // Feature highlight: New features
      if (Math.random() < 0.3) { // 30% chance to show feature highlight
        newNotifications.push({
          id: 'new-feature',
          type: 'feature',
          priority: 'low',
          title: 'New Beta Feature Available',
          message: 'Advanced Claude Integration with custom prompts is now available in Early Access.',
          action: {
            text: 'Try Beta Features',
            handler: onUpgrade || (() => {})
          },
          dismissible: true,
          icon: <Sparkles className="h-4 w-4" />,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200',
          timestamp: now
        })
      }

      // Community notifications
      if (Math.random() < 0.2) { // 20% chance to show community update
        newNotifications.push({
          id: 'community-update',
          type: 'feature',
          priority: 'low',
          title: 'Community Milestone',
          message: 'We\'ve hit 1,500+ Early Access members! Join the growing community of SDLC automation enthusiasts.',
          action: {
            text: 'Join Community',
            handler: onUpgrade || (() => {})
          },
          dismissible: true,
          icon: <Users className="h-4 w-4" />,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200',
          timestamp: now
        })
      }

      // Filter out dismissed notifications
      const filteredNotifications = newNotifications.filter(
        notification => !dismissedIds.includes(notification.id)
      )

      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      filteredNotifications.sort((a, b) => 
        priorityOrder[b.priority] - priorityOrder[a.priority]
      )

      setNotifications(filteredNotifications)
      setShowBadge(filteredNotifications.length > 0)
    }

    generateNotifications()
  }, [usage, userActivity, dismissedIds, onUpgrade])

  const dismissNotification = (id: string) => {
    setDismissedIds(prev => [...prev, id])
  }

  const clearAllNotifications = () => {
    setDismissedIds(prev => [...prev, ...notifications.map(n => n.id)])
  }

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type)
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Notification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Smart Notifications</h3>
          {showBadge && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {notifications.length}
            </Badge>
          )}
        </div>
        {notifications.length > 1 && (
          <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* High Priority Notifications */}
      {getNotificationsByType('usage').length > 0 && (
        <div className="space-y-3">
          {getNotificationsByType('usage').map((notification) => (
            <Card key={notification.id} className={`${notification.bgColor} ${notification.borderColor} border-l-4`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`${notification.color} mt-0.5`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${notification.color}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                        {notification.dismissible && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${notification.color.replace('600', '700')}`}>
                      {notification.message}
                    </p>
                    {notification.action && (
                      <div className="mt-3">
                        <Button
                          onClick={notification.action.handler}
                          size="sm"
                          className={`${notification.color.replace('text-', 'bg-').replace('600', '600')} hover:${notification.color.replace('text-', 'bg-').replace('600', '700')}`}
                        >
                          {notification.action.text}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Other Notifications */}
      {notifications.filter(n => n.type !== 'usage').length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notifications.filter(n => n.type !== 'usage').map((notification) => (
            <Card key={notification.id} className={`${notification.bgColor} ${notification.borderColor} border-l-4`}>
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <div className={`${notification.color} mt-0.5`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${notification.color}`}>
                        {notification.title}
                      </h4>
                      {notification.dismissible && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${notification.color.replace('600', '700')}`}>
                      {notification.message}
                    </p>
                    {notification.action && (
                      <div className="mt-2">
                        <Button
                          onClick={notification.action.handler}
                          size="sm"
                          variant="outline"
                          className={`text-xs h-7 ${notification.color} ${notification.borderColor} hover:${notification.bgColor}`}
                        >
                          {notification.action.text}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Tip */}
      {usage && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <strong>Pro Tip:</strong> Users who upgrade to Early Access generate 
                  <strong> 3x more projects</strong> without daily limits. 
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={onUpgrade}>
                    Learn more →
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 