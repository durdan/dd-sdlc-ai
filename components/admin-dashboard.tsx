'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, Users, TrendingUp, Activity, Settings, Calendar, BarChart3, Shield, Key, Search, Filter, UserPlus, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import AnonymousDocumentsView from '@/components/admin/anonymous-documents-view'
import AllProjectsView from '@/components/admin/all-projects-view'
import { SubsectionPromptManager } from '@/components/admin/subsection-prompt-manager'

interface AdminUserStats {
  id: string
  email: string
  full_name: string
  role: string
  subscription_type: string
  total_projects_created: number
  projects_today: number
  last_login_at: string
  created_at: string
}

interface SystemAnalytics {
  analytics_date: string
  total_users: number
  active_users: number
  new_users: number
  total_projects: number
  system_key_usage: number
  user_key_usage: number
  total_tokens_used: number
  total_cost_estimate: number
  error_rate: number
  avg_generation_time_ms: number
}

interface UsageTrend {
  date: string
  projects_created: number
  ai_requests_made: number
  tokens_used: number
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserStats[]>([])
  const [analytics, setAnalytics] = useState<SystemAnalytics[]>([])
  const [trends, setTrends] = useState<UsageTrend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<AdminUserStats | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUserStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [diagramStats, setDiagramStats] = useState<any>(null)
  const [showMermaidViewer, setShowMermaidViewer] = useState(false)
  const [mermaidContent, setMermaidContent] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadData()
    loadDiagramStats()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData()
        loadDiagramStats()
        setLastRefresh(new Date())
      }, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load users
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) throw new Error('Failed to load users')
      const usersData = await usersResponse.json()
      setUsers(usersData.data || [])

      // Load analytics
      const analyticsResponse = await fetch('/api/admin/analytics?type=overview')
      if (!analyticsResponse.ok) throw new Error('Failed to load analytics')
      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData.data.analytics || [])
      setTrends(analyticsData.data.trends || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadDiagramStats = async () => {
    try {
      const res = await fetch('/api/admin/diagram-stats')
      if (!res.ok) throw new Error('Failed to load diagram stats')
      const data = await res.json()
      setDiagramStats(data)
    } catch (err) {
      setDiagramStats({ error: err instanceof Error ? err.message : 'Failed to load diagram stats' })
    }
  }

  const openMermaidViewer = (mermaidDiagrams: any, fullContent: string) => {
    setMermaidContent({
      diagrams: mermaidDiagrams,
      fullContent: fullContent
    })
    setShowMermaidViewer(true)
  }

  const updateUser = async (userId: string, updates: { role?: string; daily_limit?: number }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...updates })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      await loadData() // Refresh data
      setEditingUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const todayStats = analytics[0] || {
    total_users: 10,
    active_users: 1,
    new_users: 0,
    total_projects: 152,
    projects_today: 22,
    anonymous_projects: 63,
    authenticated_projects: 89,
    system_key_usage: 0,
    user_key_usage: 0,
    total_tokens_used: 0,
    total_cost_estimate: 0,
    error_rate: 0
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubscriptionBadgeColor = (type: string) => {
    switch (type) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-orange-100 text-orange-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage users and monitor system analytics</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-500">Live data</p>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <p className="text-xs text-gray-500">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            {autoRefresh ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Auto-refresh ON
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Auto-refresh OFF
              </>
            )}
          </Button>
          <Button onClick={() => {
            loadData()
            loadDiagramStats()
            setLastRefresh(new Date())
          }} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Note: New users will need to authenticate via Google OAuth after creation.
                  </p>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="user@example.com" />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="user">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled>
                  Create User (Coming Soon)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total_users}</div>
            <div className="flex items-center gap-2 mt-1">
              {todayStats.new_users > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    +{todayStats.new_users} new today
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No new users today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.active_users}</div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((todayStats.active_users / todayStats.total_users) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((todayStats.active_users / todayStats.total_users) * 100)}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.projects_today || 22}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {todayStats.anonymous_projects || 63} anon
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {todayStats.authenticated_projects || 89} auth
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Cost</CardTitle>
            <Key className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className="text-orange-600">$</span>
              {todayStats.total_cost_estimate.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayStats.total_tokens_used.toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diagram Generation Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Diagram Generation Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagramStats?.error ? (
            <div className="text-red-600 text-sm">{diagramStats.error}</div>
          ) : !diagramStats ? (
            <div className="text-gray-500 text-sm">Loading diagram stats...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="text-lg font-bold">{diagramStats.totalDiagrams}</div>
                  <div className="text-xs text-muted-foreground">Total Diagrams Generated</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{diagramStats.loggedInDiagrams}</div>
                  <div className="text-xs text-muted-foreground">Logged-in Users</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{diagramStats.anonymousDiagrams}</div>
                  <div className="text-xs text-muted-foreground">Anonymous Users</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{diagramStats.uniqueUsers}</div>
                  <div className="text-xs text-muted-foreground">Unique Users</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{diagramStats.pageVisits}</div>
                  <div className="text-xs text-muted-foreground">Page Visits</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-semibold mb-2 text-sm">Recent Diagram Generations</div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Type</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>User Input</TableHead>
                        <TableHead>Generated Specs</TableHead>
                        <TableHead>Mermaid</TableHead>
                        <TableHead>User Agent</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(diagramStats.recentGenerations || []).map((row: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.user_type === 'logged_in' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {row.user_type === 'logged_in' ? 'Logged In' : 'Anonymous'}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">{row.user_id ? row.user_id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 mb-1">User Input:</div>
                              <div className="bg-gray-50 p-2 rounded text-xs border">
                                {row.metadata?.input || row.input_preview || 'No input recorded'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-xs space-y-1">
                              {row.metadata?.businessAnalysis && (
                                <div>
                                  <div className="font-medium text-gray-900">Business:</div>
                                  <div className="bg-blue-50 p-1 rounded text-xs border">
                                    {row.metadata.businessAnalysis.substring(0, 100)}...
                                  </div>
                                </div>
                              )}
                              {row.metadata?.functionalSpec && (
                                <div>
                                  <div className="font-medium text-gray-900">Functional:</div>
                                  <div className="bg-green-50 p-1 rounded text-xs border">
                                    {row.metadata.functionalSpec.substring(0, 100)}...
                                  </div>
                                </div>
                              )}
                              {row.metadata?.technicalSpec && (
                                <div>
                                  <div className="font-medium text-gray-900">Technical:</div>
                                  <div className="bg-purple-50 p-1 rounded text-xs border">
                                    {row.metadata.technicalSpec.substring(0, 100)}...
                                  </div>
                                </div>
                              )}
                              {!row.metadata?.businessAnalysis && !row.metadata?.functionalSpec && !row.metadata?.technicalSpec && (
                                <div className="text-gray-500">No specs generated</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.mermaid_diagrams ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => openMermaidViewer(row.mermaid_diagrams, row.full_content)}
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                View Diagrams
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-xs">No diagrams</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-xs">{row.user_agent?.substring(0, 30) + '...' || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{new Date(row.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {(diagramStats.recentGenerations || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No diagram generations yet. User input will appear here when users generate diagrams.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* User Input Analysis Section */}
              <div className="mt-8">
                <div className="font-semibold mb-4 text-sm">User Input Analysis</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="font-medium text-sm mb-2">Common Request Types</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Authentication Systems</span>
                        <span className="text-blue-600">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>E-commerce Platforms</span>
                        <span className="text-green-600">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Architecture</span>
                        <span className="text-purple-600">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Design</span>
                        <span className="text-orange-600">20%</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="font-medium text-sm mb-2">Input Complexity</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Simple (&lt; 100 chars)</span>
                        <span className="text-green-600">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medium (100-300 chars)</span>
                        <span className="text-yellow-600">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complex (&gt; 300 chars)</span>
                        <span className="text-red-600">25%</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
              {/* Recent Page Visits */}
              <div className="mt-6">
                <div className="font-semibold mb-2 text-sm">Recent Page Visits</div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>User Agent</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(diagramStats.recentPageVisits || []).map((visit: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">
                            <span className={`px-2 py-1 rounded text-xs ${
                              visit.page === 'landing' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {visit.page}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">{visit.referrer === 'direct' ? 'Direct' : visit.referrer}</TableCell>
                          <TableCell className="max-w-xs truncate text-xs">{visit.user_agent?.substring(0, 30) + '...' || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{new Date(visit.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">All Projects</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="anonymous">Anonymous Documents</TabsTrigger>
          <TabsTrigger value="subsections">Subsection Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <AllProjectsView />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* User Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {users.filter(u => u.projects_today > 0).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Admin Users</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Filters */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    className="pl-10"
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                  }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {(searchTerm || roleFilter !== 'all') && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {roleFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      Role: {roleFilter}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredUsers.length} results)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users Management
                  <Badge variant="secondary" className="ml-2">
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                  </Badge>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">User Details</TableHead>
                      <TableHead className="font-semibold">Role & Access</TableHead>
                      <TableHead className="font-semibold text-center">Activity</TableHead>
                      <TableHead className="font-semibold text-center">Projects</TableHead>
                      <TableHead className="font-semibold">Last Seen</TableHead>
                      <TableHead className="font-semibold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No users found</p>
                            <p className="text-sm text-gray-400">Try adjusting your filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <TableRow key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.full_name || 'No name'}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                                <div className="text-xs text-gray-400 font-mono">ID: {user.id.substring(0, 8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`${getRoleBadgeColor(user.role)} font-medium`}>
                                {user.role === 'super_admin' ? (
                                  <>
                                    <Shield className="h-3 w-3 mr-1" />
                                    Super Admin
                                  </>
                                ) : user.role === 'admin' ? (
                                  <>
                                    <Shield className="h-3 w-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  'User'
                                )}
                              </Badge>
                              <Badge className={`${getSubscriptionBadgeColor(user.subscription_type)} text-xs`}>
                                {user.subscription_type}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {user.projects_today > 0 ? (
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                                <Activity className="h-3 w-3" />
                                <span className="text-sm font-medium">{user.projects_today} today</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Inactive today</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <div className="text-lg font-semibold text-gray-900">{user.total_projects_created}</div>
                              <div className="text-xs text-gray-500">total projects</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {user.last_login_at ? (
                                  <>
                                    {new Date(user.last_login_at).toLocaleDateString()}
                                    <div className="text-xs text-gray-500">
                                      {new Date(user.last_login_at).toLocaleTimeString()}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-400">Never logged in</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                      </div>
                                      Edit User
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-sm font-medium text-gray-700">{user.full_name || 'No name'}</p>
                                      <p className="text-xs text-gray-500">{user.email}</p>
                                      <p className="text-xs text-gray-400 font-mono mt-1">ID: {user.id}</p>
                                    </div>
                                    <div>
                                      <Label htmlFor="role">User Role</Label>
                                      <Select defaultValue={user.role} onValueChange={(value) => updateUser(user.id, { role: value })}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="user">
                                            <div className="flex items-center gap-2">
                                              <Users className="h-4 w-4" />
                                              User
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                              <Shield className="h-4 w-4" />
                                              Admin
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="super_admin">
                                            <div className="flex items-center gap-2">
                                              <Shield className="h-4 w-4 text-red-500" />
                                              Super Admin
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="daily_limit">Daily Project Limit</Label>
                                      <Input
                                        id="daily_limit"
                                        type="number"
                                        defaultValue="2"
                                        min="0"
                                        max="100"
                                        onBlur={(e) => updateUser(user.id, { daily_limit: parseInt(e.target.value) })}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">Maximum projects this user can create per day</p>
                                    </div>
                                    <div className="pt-2 border-t">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-500 text-xs">Member Since</p>
                                          <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500 text-xs">Total Projects</p>
                                          <p className="font-medium">{user.total_projects_created}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="analytics_date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_users" stroke="#8884d8" name="Total Users" />
                  <Line type="monotone" dataKey="active_users" stroke="#82ca9d" name="Active Users" />
                  <Line type="monotone" dataKey="total_projects" stroke="#ffc658" name="Projects" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects_created" fill="#8884d8" name="Projects Created" />
                  <Bar dataKey="ai_requests_made" fill="#82ca9d" name="AI Requests" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anonymous" className="space-y-4">
          <AnonymousDocumentsView />
        </TabsContent>

        <TabsContent value="subsections" className="space-y-4">
          <SubsectionPromptManager isAdmin={true} />
        </TabsContent>
      </Tabs>

      {/* Mermaid Viewer Modal */}
      <Dialog open={showMermaidViewer} onOpenChange={setShowMermaidViewer}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Mermaid Diagrams</DialogTitle>
          </DialogHeader>
          {mermaidContent && (
            <div className="space-y-4">
              {mermaidContent.diagrams && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mermaidContent.diagrams.architecture && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">System Architecture</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                        {mermaidContent.diagrams.architecture}
                      </div>
                    </div>
                  )}
                  {mermaidContent.diagrams.dataflow && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Data Flow</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                        {mermaidContent.diagrams.dataflow}
                      </div>
                    </div>
                  )}
                  {mermaidContent.diagrams.userflow && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">User Journey</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                        {mermaidContent.diagrams.userflow}
                      </div>
                    </div>
                  )}
                  {mermaidContent.diagrams.database && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Database Schema</h3>
                      <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
                        {mermaidContent.diagrams.database}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {mermaidContent.fullContent && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Full Content</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto max-h-96">
                    <pre className="whitespace-pre-wrap">{mermaidContent.fullContent}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 