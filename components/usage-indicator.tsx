'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Clock, Key, TrendingUp } from 'lucide-react'

interface UsageStats {
  can_create: boolean
  projects_today: number
  daily_limit: number
  remaining: number
}

interface UserStats {
  today: UsageStats
  total_projects: number
  last_30_days: number
}

export default function UsageIndicator() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/usage/stats')
      if (!response.ok) {
        throw new Error('Failed to load usage stats')
      }

      const data = await response.json()
      setStats(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading usage stats...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const { today, total_projects, last_30_days } = stats
  const usagePercentage = (today.projects_today / today.daily_limit) * 100

  const getStatusColor = () => {
    if (today.remaining === 0) return 'text-red-600'
    if (today.remaining === 1) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = () => {
    if (today.remaining === 0) return <AlertCircle className="h-4 w-4 text-red-600" />
    if (today.remaining === 1) return <Clock className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Key className="h-5 w-5 text-blue-600" />
          <span>Daily Usage</span>
          <Badge variant={today.can_create ? 'default' : 'destructive'}>
            {today.can_create ? 'Available' : 'Limit Reached'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Projects</span>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {today.projects_today} / {today.daily_limit}
              </span>
            </div>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Free daily limit</span>
            <span>{today.remaining} remaining</span>
          </div>
        </div>

        {/* Usage Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Key className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              {today.can_create ? (
                <span className="text-blue-800">
                  You can create <strong>{today.remaining}</strong> more projects today using our system OpenAI key.
                </span>
              ) : (
                <span className="text-blue-800">
                  Daily limit reached. Provide your own OpenAI API key or try again tomorrow.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total_projects}</div>
            <div className="text-xs text-gray-500">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{last_30_days}</div>
            <div className="text-xs text-gray-500">Last 30 Days</div>
          </div>
        </div>

        {/* Upgrade Message */}
        {today.remaining <= 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Need more projects?</strong> Provide your own OpenAI API key in the Integration Hub for unlimited usage.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 