'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Target,
  BarChart3,
  Calendar,
  Gift,
  Star,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Timer,
  Activity,
  Users,
  Sparkles,
  Crown,
  Rocket,
  Key,
  Info
} from 'lucide-react'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'

interface EnhancedUsageDashboardProps {
  onConfigureKeys?: () => void
  onUpgrade?: () => void
  compact?: boolean
}

export default function EnhancedUsageDashboard({ 
  onConfigureKeys, 
  onUpgrade, 
  compact = false 
}: EnhancedUsageDashboardProps) {
  const { usage, loading, error } = useFreemiumUsage()
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [usageHistory, setUsageHistory] = useState<any[]>([])
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

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
    const interval = setInterval(updateResetTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Show upgrade prompt when usage is high
  useEffect(() => {
    if (usage && usage.remainingProjects <= 1) {
      setShowUpgradePrompt(true)
    }
  }, [usage])

  // Mock usage history for demonstration
  useEffect(() => {
    const generateMockHistory = () => {
      const history = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        history.push({
          date: date.toISOString().split('T')[0],
          projects: Math.floor(Math.random() * 5) + 1,
          limit: 5
        })
      }
      setUsageHistory(history)
    }
    generateMockHistory()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usage) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Unable to load usage data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usagePercentage = (usage.projectsToday / usage.dailyLimit) * 100
  const isLimitReached = usage.remainingProjects === 0
  const isAlmostFull = usage.remainingProjects === 1

  const getStatusConfig = () => {
    if (isLimitReached) {
      return {
        color: 'red',
        icon: <AlertTriangle className="h-5 w-5" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        title: 'Daily Limit Reached',
        description: 'You\'ve used all your free projects for today',
        progressColor: 'bg-red-500'
      }
    } else if (isAlmostFull) {
      return {
        color: 'yellow',
        icon: <Timer className="h-5 w-5" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        title: 'Almost at Limit',
        description: 'You have 1 project remaining today',
        progressColor: 'bg-yellow-500'
      }
    } else {
      return {
        color: 'green',
        icon: <CheckCircle className="h-5 w-5" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        title: 'Available',
        description: `You have ${usage.remainingProjects} projects remaining today`,
        progressColor: 'bg-green-500'
      }
    }
  }

  const status = getStatusConfig()

  if (compact) {
    return (
      <Card className={`w-full ${status.bgColor} ${status.borderColor} border-l-4`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {status.icon}
              <div>
                <p className={`font-medium ${status.textColor}`}>
                  {usage.projectsToday}/{usage.dailyLimit} Projects Used
                </p>
                <p className="text-sm text-gray-600">
                  Resets in {timeUntilReset}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Progress value={usagePercentage} className="w-20 h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(usagePercentage)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Usage Card */}
      <Card className={`${status.bgColor} ${status.borderColor} border-l-4`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.icon}
              <span className={status.textColor}>{status.title}</span>
            </div>
            <Badge variant="outline" className={status.textColor}>
              {usage.projectsToday}/{usage.dailyLimit} Used
            </Badge>
          </CardTitle>
          <CardDescription>
            {status.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Usage</span>
                <span>{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
            </div>

            {/* Reset Timer */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Resets in {timeUntilReset}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onConfigureKeys}
                className="flex-1"
              >
                <Key className="h-4 w-4 mr-2" />
                Use Own API Key
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Upgrade Prompt */}
      {showUpgradePrompt && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900">Unlock More with Early Access</span>
            </CardTitle>
            <CardDescription>
              Don't let daily limits slow you down. Join our Early Access program for unlimited projects and exclusive features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 flex items-center">
                  <Crown className="h-4 w-4 mr-2" />
                  Premium Benefits
                </h4>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Unlimited daily projects
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Priority processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Advanced AI features
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Premium templates
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Early Access Only
                </h4>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Beta features access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Direct developer feedback
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Gift className="h-4 w-4 mr-2" />
                Join Early Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <span>Usage Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Last 7 Days</h4>
                <div className="space-y-3">
                  {usageHistory.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={(day.projects / day.limit) * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm w-12 text-right">
                          {day.projects}/{day.limit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {usageHistory.reduce((sum, day) => sum + day.projects, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Projects created</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Average</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(usageHistory.reduce((sum, day) => sum + day.projects, 0) / 7)}
                  </p>
                  <p className="text-xs text-gray-500">Per day</p>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Usage Insights</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    You're using {Math.round(usagePercentage)}% of your daily limit. 
                    Consider upgrading to Early Access for unlimited projects.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Community</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Join 1,000+ developers who've upgraded to Early Access for unlimited SDLC generation.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 