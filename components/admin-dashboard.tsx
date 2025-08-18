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
import { AlertCircle, Users, TrendingUp, Activity, Settings, Calendar, BarChart3, Shield, Key, Search, Filter, UserPlus, RefreshCw, FileText } from 'lucide-react'
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
  const [consolidatedStats, setConsolidatedStats] = useState<any>(null)
  const [showMermaidViewer, setShowMermaidViewer] = useState(false)
  const [mermaidContent, setMermaidContent] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadData()
    loadConsolidatedStats()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData()
        loadConsolidatedStats()
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

  const loadConsolidatedStats = async () => {
    try {
      const res = await fetch('/api/admin/consolidated-stats')
      if (!res.ok) throw new Error('Failed to load stats')
      const data = await res.json()
      setConsolidatedStats(data)
    } catch (err) {
      setConsolidatedStats({ error: err instanceof Error ? err.message : 'Failed to load stats' })
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
            loadConsolidatedStats()
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
            <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedStats?.overview?.totalDocuments || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Today: {consolidatedStats?.overview?.todayDocuments || 0}
              </p>
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

      {/* Consolidated Platform Statistics */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Platform Statistics
          </CardTitle>
          <Badge variant="outline">All Document Types</Badge>
        </CardHeader>
        <CardContent>
          {consolidatedStats?.error ? (
            <div className="text-red-600 text-sm">{consolidatedStats.error}</div>
          ) : !consolidatedStats ? (
            <div className="text-gray-500 text-sm">Loading statistics...</div>
          ) : (
            <div className="space-y-6">
              {/* Documents by Type Grid */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-700">Documents by Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {consolidatedStats.documentTypes?.map((doc: any) => (
                    <div key={doc.type} className="bg-gradient-to-br from-white to-gray-50 border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {doc.label}
                      </div>
                      <div className="text-2xl font-bold" style={{ color: `var(--${doc.color}-600, #4B5563)` }}>
                        {doc.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Trends Chart */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-700">7-Day Activity Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={consolidatedStats.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="projects" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      name="Projects" 
                      dot={{ fill: '#6366F1', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="documents" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Documents"
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Activity Feed */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-700">Recent Activity</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {consolidatedStats.recentActivity?.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.user_type === 'logged_in' ? 'bg-green-500' : 'bg-purple-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.user_type === 'logged_in' ? 'Logged-in User' : 'Anonymous'}
                            {activity.documents && ` • ${activity.documents} docs`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              {consolidatedStats.topUsers?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-gray-700">Top Users</h3>
                  <div className="space-y-2">
                    {consolidatedStats.topUsers.map((user: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">User {user.userId.substring(0, 8)}...</span>
                        <Badge variant="secondary">{user.projectCount} projects</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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