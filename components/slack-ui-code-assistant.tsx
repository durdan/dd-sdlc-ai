"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  GitCommit, 
  GitPullRequest,
  Shield,
  TestTube,
  Eye,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  Code,
  Bug,
  Wrench,
  Zap,
  Settings,
  Github,
  Loader2,
  Plus,
  X,
  ExternalLink,
  Copy,
  Terminal,
  Search,
  Filter,
  BarChart3,
  Calendar,
  User,
  Slack,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SlackUITask {
  id: string
  type: 'bug-fix' | 'feature' | 'review' | 'test-generation' | 'refactor'
  status: 'pending' | 'analyzing' | 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  repository?: {
    owner: string
    name: string
    branch?: string
    url?: string
  }
  github_issue_url?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  estimatedDuration?: number
  actualDuration?: number
  progress?: number
  steps?: TaskStep[]
  result?: TaskResult
  error?: string
}

interface TaskStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  description?: string
  duration?: number
  output?: string
}

interface TaskResult {
  branch_created?: string
  files_modified?: string[]
  tests_added?: number
  pull_request?: {
    url: string
    number: number
    title: string
  }
  summary?: string
}

interface Repository {
  id: string
  name: string
  fullName: string
  private: boolean
  description: string
  language: string
  url: string
  cloneUrl: string
  sshUrl: string
  defaultBranch: string
  createdAt: string
  updatedAt: string
  pushedAt: string
  size: number
  stargazersCount: number
  watchersCount: number
  forksCount: number
  openIssuesCount: number
  hasIssues: boolean
  hasProjects: boolean
  hasWiki: boolean
  hasPages: boolean
  archived: boolean
  disabled: boolean
  permissions: any
  topics: string[]
  visibility: string
}

export function SlackUICodeAssistant() {
  const [currentTask, setCurrentTask] = useState<SlackUITask | null>(null)
  const [tasks, setTasks] = useState<SlackUITask[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'tasks' | 'repos' | 'config'>('create')
  
  // Create task state
  const [taskForm, setTaskForm] = useState({
    description: '',
    type: 'feature' as SlackUITask['type'],
    priority: 'medium' as SlackUITask['priority'],
    repository: 'auto-detect',
    github_issue_url: '',
    context: ''
  })
  
  // Task filtering and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  
  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(false)
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  // Auto-refresh for active tasks
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadTasks()
    }, 3000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Enable auto-refresh when there are executing tasks
  useEffect(() => {
    const hasExecutingTasks = tasks.some(task => 
      ['analyzing', 'planning', 'executing', 'reviewing'].includes(task.status)
    )
    setAutoRefresh(hasExecutingTasks)
  }, [tasks])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadTasks(),
        loadRepositories(),
        checkGithubConnection()
      ])
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/slack/tasks')
      if (!response.ok) throw new Error('Failed to load tasks')
      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Error loading tasks:', err)
    }
  }

  const loadRepositories = async () => {
    if (isLoadingRepos) return
    setIsLoadingRepos(true)
    try {
      const response = await fetch('/api/auth/github/repos')
      if (!response.ok) throw new Error('Failed to load repositories')
      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (err) {
      console.error('Error loading repositories:', err)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const checkGithubConnection = async () => {
    try {
      const response = await fetch('/api/auth/github/status')
      if (!response.ok) throw new Error('Failed to check GitHub status')
      const data = await response.json()
      setGithubConnected(data.connected)
    } catch (err) {
      console.error('Error checking GitHub connection:', err)
    }
  }

  const createTask = async () => {
    if (!taskForm.description.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/slack/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...taskForm
        })
      })

      if (!response.ok) throw new Error('Failed to create task')
      
      const data = await response.json()
      
      // Add new task to state
      setTasks(prev => [data.task, ...prev])
      
      // Clear form
      setTaskForm({
        description: '',
        type: 'feature',
        priority: 'medium',
        repository: 'auto-detect',
        github_issue_url: '',
        context: ''
      })
      
      // Switch to tasks tab
      setActiveTab('tasks')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  const viewTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/slack/tasks/${taskId}`)
      if (!response.ok) throw new Error('Failed to get task status')
      const data = await response.json()
      setCurrentTask(data.task)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get task status')
    }
  }

  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/slack/tasks/${taskId}/cancel`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to cancel task')
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'cancelled' as const }
          : task
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task')
    }
  }

  const retryTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/slack/tasks/${taskId}/retry`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to retry task')
      
      const data = await response.json()
      setTasks(prev => [data.task, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry task')
    }
  }

  const getStatusColor = (status: SlackUITask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      case 'executing': case 'analyzing': case 'planning': case 'reviewing': return 'bg-blue-500'
      default: return 'bg-yellow-500'
    }
  }

  const getStatusIcon = (status: SlackUITask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      case 'executing': case 'analyzing': case 'planning': case 'reviewing': return <Loader2 className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: SlackUITask['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: SlackUITask['type']) => {
    switch (type) {
      case 'bug-fix': return <Bug className="h-4 w-4" />
      case 'feature': return <Zap className="h-4 w-4" />
      case 'review': return <Eye className="h-4 w-4" />
      case 'test-generation': return <TestTube className="h-4 w-4" />
      case 'refactor': return <Wrench className="h-4 w-4" />
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    active: tasks.filter(t => ['analyzing', 'planning', 'executing', 'reviewing'].includes(t.status)).length
  }

  if (isLoading && tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading AI Code Assistant...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-blue-600" />
            AI Code Assistant
            <Badge variant="outline" className="ml-2">
              <Slack className="h-3 w-3 mr-1" />
              Web UI
            </Badge>
          </h2>
          <p className="text-gray-600 mt-1">
            Use the same powerful Claude + GitHub integration through a web interface
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadTasks()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant={githubConnected ? 'default' : 'destructive'}>
            <Github className="h-3 w-3 mr-1" />
            {githubConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.active}</p>
              </div>
              <Loader2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{taskStats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Claude AI Code Assistant
          </CardTitle>
          <CardDescription>
            Create and manage AI-powered coding tasks with automatic GitHub integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <MessageSquare className="h-4 w-4 mr-2" />
                Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="repos">
                <Github className="h-4 w-4 mr-2" />
                Repositories
              </TabsTrigger>
              <TabsTrigger value="config">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Create Task Tab */}
            <TabsContent value="create" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Slack-style Commands</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      This interface provides the same functionality as Slack commands like:
                    </p>
                    <div className="bg-blue-100 rounded p-2 mt-2 font-mono text-sm">
                      /sdlc create Fix the login authentication bug<br/>
                      /sdlc create Add password reset functionality<br/>
                      /sdlc create Implement unit tests for payment service
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Task Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you want Claude to do (e.g., 'Fix the login authentication bug where users can't log in with special characters')"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Be specific about what you want to accomplish. Claude will analyze your repositories and create a plan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Task Type</Label>
                    <Select value={taskForm.type} onValueChange={(value) => setTaskForm({...taskForm, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug-fix">🐛 Bug Fix</SelectItem>
                        <SelectItem value="feature">⚡ Feature Implementation</SelectItem>
                        <SelectItem value="review">👁️ Code Review</SelectItem>
                        <SelectItem value="test-generation">🧪 Test Generation</SelectItem>
                        <SelectItem value="refactor">🔧 Code Refactoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="repository">Repository (Optional)</Label>
                  <Select value={taskForm.repository} onValueChange={(value) => setTaskForm({...taskForm, repository: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect from description or select manually" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-detect">Auto-detect repository</SelectItem>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.fullName}>
                          {repo.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="github-issue">GitHub Issue URL (Optional)</Label>
                  <Input
                    id="github-issue"
                    placeholder="https://github.com/owner/repo/issues/123"
                    value={taskForm.github_issue_url}
                    onChange={(e) => setTaskForm({...taskForm, github_issue_url: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="Any additional context, requirements, or constraints..."
                    value={taskForm.context}
                    onChange={(e) => setTaskForm({...taskForm, context: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setTaskForm({
                      description: '',
                      type: 'feature',
                      priority: 'medium',
                      repository: 'auto-detect',
                      github_issue_url: '',
                      context: ''
                    })}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={createTask}
                    disabled={!taskForm.description.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="analyzing">Analyzing</SelectItem>
                    <SelectItem value="executing">Executing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">
                    {tasks.length === 0 ? 'Create your first AI task' : 'Try adjusting your search or filters'}
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {getStatusIcon(task.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
                                  {task.status.replace('-', ' ')}
                                </span>
                              </div>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <div className="flex items-center gap-1 text-gray-500">
                                {getTypeIcon(task.type)}
                                <span className="text-xs">{task.type.replace('-', ' ')}</span>
                              </div>
                            </div>
                            
                            <h3 className="font-medium mb-1">{task.description}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Task ID: <code className="bg-gray-100 px-1 rounded">{task.id}</code>
                            </p>
                            
                            {task.repository && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <Github className="h-3 w-3" />
                                <span>{task.repository.owner}/{task.repository.name}</span>
                                {task.repository.branch && (
                                  <>
                                    <GitBranch className="h-3 w-3 ml-1" />
                                    <span>{task.repository.branch}</span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {task.progress !== undefined && (
                              <div className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <Progress value={task.progress} className="h-2" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
                              {task.completedAt && (
                                <span>Completed: {new Date(task.completedAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewTaskStatus(task.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            {task.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => retryTask(task.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Retry
                              </Button>
                            )}
                            
                            {['pending', 'analyzing', 'executing'].includes(task.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelTask(task.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                            
                            {task.result?.pull_request && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(task.result?.pull_request?.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                PR
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Repositories Tab */}
            <TabsContent value="repos" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Connected Repositories</h3>
                  <p className="text-sm text-gray-600">Repositories available for AI tasks</p>
                </div>
                <Button onClick={loadRepositories} disabled={isLoadingRepos}>
                  {isLoadingRepos ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>

              {!githubConnected ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>GitHub Not Connected</AlertTitle>
                  <AlertDescription>
                    Please connect your GitHub account to access repositories.
                  </AlertDescription>
                </Alert>
              ) : repositories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Github className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-2">No repositories found</h3>
                  <p className="text-gray-600">Make sure you have access to repositories</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositories.map((repo) => (
                    <Card key={repo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{repo.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{repo.fullName}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {repo.defaultBranch}
                              </span>
                              <span className={`px-2 py-1 rounded ${repo.private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {repo.private ? 'Private' : 'Public'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(repo.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <div>
                        <p className="font-medium">GitHub Integration</p>
                        <p className="text-sm text-gray-600">Repository access and automation</p>
                      </div>
                    </div>
                    <Badge variant={githubConnected ? 'default' : 'destructive'}>
                      {githubConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Claude AI</p>
                        <p className="text-sm text-gray-600">AI-powered code analysis and generation</p>
                      </div>
                    </div>
                    <Badge variant="default">Connected</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Slack className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Slack Integration</p>
                        <p className="text-sm text-gray-600">Real-time notifications and commands</p>
                      </div>
                    </div>
                    <Badge variant="default">Connected</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{taskStats.total}</p>
                      <p className="text-sm text-gray-600">Total Tasks</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      {currentTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Task Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentTask(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Task Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>ID:</strong> {currentTask.id}</p>
                    <p><strong>Description:</strong> {currentTask.description}</p>
                    <p><strong>Status:</strong> {currentTask.status}</p>
                    <p><strong>Priority:</strong> {currentTask.priority}</p>
                    <p><strong>Type:</strong> {currentTask.type}</p>
                  </div>
                </div>

                {currentTask.steps && currentTask.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Execution Steps</h4>
                    <div className="space-y-2">
                      {currentTask.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                          <div className="flex-shrink-0">
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : step.status === 'running' ? (
                              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            ) : step.status === 'failed' ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.name}</p>
                            {step.description && (
                              <p className="text-sm text-gray-600">{step.description}</p>
                            )}
                            {step.output && (
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {step.output}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentTask.result && (
                  <div>
                    <h4 className="font-medium mb-2">Results</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {currentTask.result.pull_request && (
                        <div className="mb-2">
                          <p className="font-medium">Pull Request Created:</p>
                          <a 
                            href={currentTask.result.pull_request.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            #{currentTask.result.pull_request.number} - {currentTask.result.pull_request.title}
                          </a>
                        </div>
                      )}
                      {currentTask.result.files_modified && (
                        <div className="mb-2">
                          <p className="font-medium">Files Modified:</p>
                          <ul className="list-disc pl-5">
                            {currentTask.result.files_modified.map((file, index) => (
                              <li key={index} className="text-sm">{file}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {currentTask.result.summary && (
                        <div>
                          <p className="font-medium">Summary:</p>
                          <p className="text-sm">{currentTask.result.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentTask.error && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Error Details</h4>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-red-800">{currentTask.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 