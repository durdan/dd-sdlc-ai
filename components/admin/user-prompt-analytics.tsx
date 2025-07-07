'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  Filter,
  Calendar
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserPromptStats {
  user_id: string;
  user_email: string;
  user_name: string;
  total_prompts: number;
  active_prompts: number;
  total_usage: number;
  avg_success_rate: number;
  last_activity: string;
  favorite_document_type: string;
}

interface DocumentTypeStats {
  document_type: string;
  total_prompts: number;
  total_users: number;
  total_usage: number;
  avg_success_rate: number;
  avg_response_time: number;
}

interface TimeSeriesData {
  date: string;
  user_prompts_created: number;
  total_usage: number;
  unique_users: number;
}

export function UserPromptAnalytics() {
  const [userStats, setUserStats] = useState<UserPromptStats[]>([])
  const [documentStats, setDocumentStats] = useState<DocumentTypeStats[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('total_usage')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Load user statistics
      await loadUserStats(supabase)
      
      // Load document type statistics
      await loadDocumentStats(supabase)
      
      // Load time series data
      await loadTimeSeriesData(supabase)
      
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async (supabase: any) => {
    const { data, error } = await supabase.rpc('get_user_prompt_stats', {
      days_back: parseInt(timeRange)
    })

    if (error) {
      console.error('Error loading user stats:', error)
      return
    }

    setUserStats(data || [])
  }

  const loadDocumentStats = async (supabase: any) => {
    const { data, error } = await supabase.rpc('get_document_type_stats', {
      days_back: parseInt(timeRange)
    })

    if (error) {
      console.error('Error loading document stats:', error)
      return
    }

    setDocumentStats(data || [])
  }

  const loadTimeSeriesData = async (supabase: any) => {
    const { data, error } = await supabase.rpc('get_prompt_usage_timeseries', {
      days_back: parseInt(timeRange)
    })

    if (error) {
      console.error('Error loading time series data:', error)
      return
    }

    setTimeSeriesData(data || [])
  }

  const handleExportData = async () => {
    try {
      const exportData = {
        userStats,
        documentStats,
        timeSeriesData,
        generatedAt: new Date().toISOString(),
        timeRange: `${timeRange} days`
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-prompt-analytics-${timeRange}d-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Analytics data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const filteredUserStats = userStats
    .filter(user => 
      user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof UserPromptStats]
      const bValue = b[sortBy as keyof UserPromptStats]
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return bValue - aValue
      }
      return String(bValue).localeCompare(String(aValue))
    })

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      business: 'Business Analysis',
      functional: 'Functional Specification',
      technical: 'Technical Specification',
      ux: 'UX Specification',
      mermaid: 'Mermaid Diagrams',
      sdlc: 'SDLC Composite'
    }
    return labels[type] || type
  }

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      business: 'bg-blue-100 text-blue-800',
      functional: 'bg-green-100 text-green-800',
      technical: 'bg-purple-100 text-purple-800',
      ux: 'bg-pink-100 text-pink-800',
      mermaid: 'bg-orange-100 text-orange-800',
      sdlc: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Prompt Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics for user-created prompts across the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Users with prompts in {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.reduce((sum, user) => sum + user.total_prompts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {userStats.reduce((sum, user) => sum + user.active_prompts, 0)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.reduce((sum, user) => sum + user.total_usage, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              API calls in {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats.length > 0 
                ? (userStats.reduce((sum, user) => sum + user.avg_success_rate, 0) / userStats.length).toFixed(1)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Document Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Document Type Performance</CardTitle>
          <CardDescription>
            Usage and performance metrics by document type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentStats.map((stat) => (
              <div key={stat.document_type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getDocumentTypeColor(stat.document_type)}>
                    {getDocumentTypeLabel(stat.document_type)}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium">{stat.total_prompts} prompts</div>
                    <div className="text-muted-foreground">{stat.total_users} users</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{stat.total_usage}</div>
                    <div className="text-muted-foreground">Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{stat.avg_success_rate.toFixed(1)}%</div>
                    <div className="text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{stat.avg_response_time.toFixed(0)}ms</div>
                    <div className="text-muted-foreground">Avg Time</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>
            Detailed breakdown of prompt usage by user
          </CardDescription>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_usage">Total Usage</SelectItem>
                <SelectItem value="total_prompts">Total Prompts</SelectItem>
                <SelectItem value="avg_success_rate">Success Rate</SelectItem>
                <SelectItem value="last_activity">Last Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUserStats.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.user_name}</div>
                  <div className="text-sm text-muted-foreground">{user.user_email}</div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{user.total_prompts}</div>
                    <div className="text-muted-foreground">Prompts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{user.active_prompts}</div>
                    <div className="text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{user.total_usage}</div>
                    <div className="text-muted-foreground">Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{user.avg_success_rate.toFixed(1)}%</div>
                    <div className="text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <Badge className={getDocumentTypeColor(user.favorite_document_type)}>
                      {getDocumentTypeLabel(user.favorite_document_type)}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 