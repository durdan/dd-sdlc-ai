'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Activity,
  Zap,
  Users,
  Star,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface UsageAnalyticsChartProps {
  usage?: {
    projectsToday: number
    dailyLimit: number
    remainingProjects: number
  }
  onUpgrade?: () => void
}

interface UsageDataPoint {
  date: string
  projects: number
  limit: number
  success: boolean
}

export default function UsageAnalyticsChart({ usage, onUpgrade }: UsageAnalyticsChartProps) {
  const [usageHistory, setUsageHistory] = useState<UsageDataPoint[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  // Generate mock usage history
  useEffect(() => {
    const generateUsageHistory = () => {
      const history: UsageDataPoint[] = []
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // Generate realistic usage patterns
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const baseUsage = isWeekend ? 1 : 3
        const randomVariation = Math.floor(Math.random() * 3)
        const projects = Math.min(baseUsage + randomVariation, 5)
        
        history.push({
          date: date.toISOString().split('T')[0],
          projects,
          limit: 5,
          success: projects <= 5
        })
      }
      
      setUsageHistory(history)
    }
    
    generateUsageHistory()
  }, [selectedPeriod])

  // Generate insights
  useEffect(() => {
    if (usageHistory.length === 0) return

    const totalProjects = usageHistory.reduce((sum, day) => sum + day.projects, 0)
    const averageDaily = totalProjects / usageHistory.length
    const daysAtLimit = usageHistory.filter(day => day.projects >= day.limit).length
    const weekdayAverage = usageHistory
      .filter(day => new Date(day.date).getDay() >= 1 && new Date(day.date).getDay() <= 5)
      .reduce((sum, day) => sum + day.projects, 0) / usageHistory.filter(day => new Date(day.date).getDay() >= 1 && new Date(day.date).getDay() <= 5).length
    
    const newInsights = [
      {
        type: 'usage_pattern',
        title: 'Daily Average',
        value: `${averageDaily.toFixed(1)} projects`,
        icon: <Target className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        type: 'peak_usage',
        title: 'Peak Days',
        value: `${daysAtLimit} days at limit`,
        icon: <TrendingUp className="h-4 w-4" />,
        color: daysAtLimit > 3 ? 'text-red-600' : 'text-green-600',
        bgColor: daysAtLimit > 3 ? 'bg-red-50' : 'bg-green-50'
      },
      {
        type: 'weekday_pattern',
        title: 'Weekday Usage',
        value: `${weekdayAverage.toFixed(1)} projects`,
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ]

    // Add recommendations
    if (daysAtLimit > 3) {
      newInsights.push({
        type: 'recommendation',
        title: 'Upgrade Recommended',
        value: 'Frequent limit hits detected',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      })
    }

    setInsights(newInsights)
  }, [usageHistory])

  const getUsageColor = (projects: number, limit: number) => {
    const percentage = (projects / limit) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    if (percentage >= 60) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getInsightRecommendation = () => {
    if (!usage) return null

    const percentage = (usage.projectsToday / usage.dailyLimit) * 100
    
    if (percentage >= 100) {
      return {
        title: 'Daily Limit Reached',
        description: 'You\'ve used all your free projects today. Upgrade to Early Access for unlimited projects.',
        action: 'Upgrade Now',
        color: 'red',
        priority: 'high'
      }
    } else if (percentage >= 80) {
      return {
        title: 'Approaching Limit',
        description: 'You\'re close to your daily limit. Consider upgrading to avoid interruptions.',
        action: 'View Options',
        color: 'yellow',
        priority: 'medium'
      }
    } else if (percentage >= 60) {
      return {
        title: 'Good Usage',
        description: 'You\'re making good use of your daily allocation. Upgrade for unlimited access.',
        action: 'Learn More',
        color: 'blue',
        priority: 'low'
      }
    }
    
    return null
  }

  const recommendation = getInsightRecommendation()

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.slice(0, 3).map((insight, index) => (
          <Card key={index} className={`${insight.bgColor} border-l-4 border-l-current`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`${insight.color}`}>
                  {insight.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                  <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Usage Analytics</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
              >
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Daily Projects</span>
                <span>Limit: 5</span>
              </div>
              <div className="space-y-2">
                {usageHistory.slice(-14).map((day, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-20 text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUsageColor(day.projects, day.limit)}`}
                            style={{ width: `${(day.projects / day.limit) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {day.projects}/{day.limit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Light usage</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Moderate usage</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Heavy usage</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>At limit</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {recommendation && (
        <Card className={`border-l-4 ${
          recommendation.color === 'red' ? 'border-l-red-500 bg-red-50' :
          recommendation.color === 'yellow' ? 'border-l-yellow-500 bg-yellow-50' :
          'border-l-blue-500 bg-blue-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className={`h-5 w-5 ${
                  recommendation.color === 'red' ? 'text-red-600' :
                  recommendation.color === 'yellow' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <span className={`${
                  recommendation.color === 'red' ? 'text-red-900' :
                  recommendation.color === 'yellow' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>{recommendation.title}</span>
              </div>
              <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'}>
                {recommendation.priority}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm mb-4 ${
              recommendation.color === 'red' ? 'text-red-800' :
              recommendation.color === 'yellow' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {recommendation.description}
            </p>
            <Button
              onClick={onUpgrade}
              className={`${
                recommendation.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                recommendation.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {recommendation.action}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Usage Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Peak Hours</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>9:00 AM - 11:00 AM</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>2:00 PM - 4:00 PM</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>7:00 PM - 9:00 PM</span>
                      <span className="font-medium">22%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Common Usage</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Weekday Average</span>
                      <span className="font-medium">3.2 projects</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Weekend Average</span>
                      <span className="font-medium">1.8 projects</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Monthly Total</span>
                      <span className="font-medium">~75 projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="space-y-4">
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const usage = [4, 3, 5, 4, 3, 2, 1][index]
                  return (
                    <div key={day} className="flex items-center space-x-3">
                      <div className="w-8 text-sm font-medium">{day}</div>
                      <div className="flex-1">
                        <Progress value={(usage / 5) * 100} className="h-2" />
                      </div>
                      <div className="text-sm font-medium w-12 text-right">
                        {usage}/5
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Usage Trend</span>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">
                    Your usage has increased 23% this month. Consider upgrading for unlimited access.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Efficiency</span>
                  </div>
                  <p className="text-sm text-green-800 mt-1">
                    You're using 89% of your daily allocation efficiently. Great job!
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Community</span>
                  </div>
                  <p className="text-sm text-purple-800 mt-1">
                    You're in the top 25% of active users. Join Early Access for premium features.
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