"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  GitBranch,
  Code2,
  Bug,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  RefreshCw,
  Plus,
  Loader2,
  X,
  Zap,
  FileCode,
  Github,
  Play,
  Pause,
  BarChart3,
  Shield,
  ChevronRight,
  Eye,
  Download,
  Copy,
  Link
} from "lucide-react"
import { createClient } from '@/lib/supabase/client'

interface AITask {
  id: string
  type: 'bug-fix' | 'feature' | 'review' | 'test-generation' | 'refactor'
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  context: {
    description: string
    github_issue_url?: string
    repository_url?: string
    file_paths?: string[]
  }
  provider_used?: string
  result?: any
  created_at: string
  started_at?: string
  completed_at?: string
  estimated_cost?: number
  actual_cost?: number
}

interface GitHubIntegration {
  id: string
  repository_url: string
  repository_id: string
  permissions: any
  is_active: boolean
  last_sync?: string
}

interface AICodeAssistantProps {
  user: any
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'repos' | 'analytics' | 'claude'>('overview')
  const [tasks, setTasks] = useState<AITask[]>([])
  const [repositories, setRepositories] = useState<GitHubIntegration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Task tracking state
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [taskExecutions, setTaskExecutions] = useState<any[]>([])
  const [isExecutingTask, setIsExecutingTask] = useState(false)

  // Create new task state
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [newTask, setNewTask] = useState({
    type: 'bug-fix' as const,
    priority: 'medium' as const,
    description: '',
    repository_url: '',
    repository_id: '',
    repository_name: '',
    github_issue_url: '',
    file_paths: ''
  })
  
  // GitHub repositories state
  const [availableRepos, setAvailableRepos] = useState<any[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)

  // Claude integration state
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude'>('claude')
  const [claudeAnalysisResult, setClaudeAnalysisResult] = useState<any>(null)
  const [claudeCodeResult, setClaudeCodeResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showClaudeAnalysis, setShowClaudeAnalysis] = useState(false)
  const [analysisInput, setAnalysisInput] = useState({
    codeContent: '',
    analysisType: 'bug_fix' as 'bug_fix' | 'feature_implementation' | 'code_review' | 'refactoring',
    context: '',
    requirements: ''
  })

  // Configuration and validation state
  const [claudeConfig, setClaudeConfig] = useState<any>(null)
  const [githubConnected, setGithubConnected] = useState(false)
  const [showConfigPrompt, setShowConfigPrompt] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showClaudeConfigDialog, setShowClaudeConfigDialog] = useState(false)
  const [claudeConfigForm, setClaudeConfigForm] = useState({
    apiKey: '',
    selectedModel: 'claude-3-5-sonnet-20241022',
    enableGitHubIntegration: false
  })
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  useEffect(() => {
    loadClaudeConfiguration()
    loadGitHubConfiguration()
    checkGitHubConnection()
  }, [])

  // Load Claude configuration from localStorage
  const loadClaudeConfiguration = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfigs = localStorage.getItem('integrationConfigs')
        if (savedConfigs) {
          const configs = JSON.parse(savedConfigs)
          const claudeSettings = configs.claude?.settings
          
          if (claudeSettings?.connected && claudeSettings?.apiKey) {
            setClaudeConfig(claudeSettings)
          }
        }
      } catch (error) {
        console.error('Failed to load Claude configuration:', error)
      }
    }
  }

  // Load GitHub connection state from localStorage
  const loadGitHubConfiguration = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfigs = localStorage.getItem('integrationConfigs')
        if (savedConfigs) {
          const configs = JSON.parse(savedConfigs)
          const githubSettings = configs.github?.settings
          
          if (githubSettings?.connected) {
            setGithubConnected(true)
            // Also load available repos if they exist
            if (githubSettings.repositories?.length > 0) {
              setAvailableRepos(githubSettings.repositories)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load GitHub configuration:', error)
      }
    }
  }

  // Check GitHub connection status
  const checkGitHubConnection = async () => {
    try {
      const response = await fetch('/api/auth/github/status', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        const isConnected = data.connected || false
        setGithubConnected(isConnected)
        
        // Sync with localStorage for consistency with Integration Hub
        if (typeof window !== 'undefined') {
          const existingConfigs = JSON.parse(localStorage.getItem('integrationConfigs') || '{}')
          const updatedConfigs = {
            ...existingConfigs,
            github: {
              ...existingConfigs.github,
              enabled: isConnected,
              settings: {
                ...existingConfigs.github?.settings,
                connected: isConnected,
                username: data.user?.login || existingConfigs.github?.settings?.username,
                repositories: data.repositories || existingConfigs.github?.settings?.repositories
              }
            }
          }
          localStorage.setItem('integrationConfigs', JSON.stringify(updatedConfigs))
        }
      } else {
        setGithubConnected(false)
        // Update localStorage to reflect disconnected state
        if (typeof window !== 'undefined') {
          const existingConfigs = JSON.parse(localStorage.getItem('integrationConfigs') || '{}')
          const updatedConfigs = {
            ...existingConfigs,
            github: {
              ...existingConfigs.github,
              enabled: false,
              settings: {
                ...existingConfigs.github?.settings,
                connected: false
              }
            }
          }
          localStorage.setItem('integrationConfigs', JSON.stringify(updatedConfigs))
        }
      }
    } catch (error) {
      console.error('Failed to check GitHub connection:', error)
      setGithubConnected(false)
    }
  }

  // Navigate to Integration Hub
  const navigateToIntegrationHub = async () => {
    setIsNavigating(true)
    try {
      // Add a small delay for better UX to show the spinner
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsNavigating(false)
    }
  }

  // Open Claude configuration dialog
  const openClaudeConfigDialog = () => {
    setShowClaudeConfigDialog(true)
    setConfigError(null)
  }

  // Save Claude configuration
  const saveClaudeConfig = async () => {
    if (!claudeConfigForm.apiKey.trim()) {
      setConfigError('API key is required')
      return
    }

    if (!claudeConfigForm.apiKey.startsWith('sk-ant-')) {
      setConfigError('Invalid API key format. Claude API keys start with "sk-ant-"')
      return
    }

    setIsSavingConfig(true)
    setConfigError(null)

    try {
      // Test the API key by making a simple request
      const testResponse = await fetch('/api/claude-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: claudeConfigForm.apiKey,
          model: claudeConfigForm.selectedModel
        })
      })

      const testResult = await testResponse.json()

      if (!testResult.success) {
        setConfigError(testResult.error || 'Invalid API key or connection failed')
        return
      }

      // Save to localStorage
      const existingConfigs = JSON.parse(localStorage.getItem('integrationConfigs') || '{}')
      const updatedConfigs = {
        ...existingConfigs,
        claude: {
          settings: {
            connected: true,
            apiKey: claudeConfigForm.apiKey,
            selectedModel: claudeConfigForm.selectedModel,
            enableGitHubIntegration: claudeConfigForm.enableGitHubIntegration
          }
        }
      }

      localStorage.setItem('integrationConfigs', JSON.stringify(updatedConfigs))
      
      // Update state
      setClaudeConfig(updatedConfigs.claude.settings)
      setShowClaudeConfigDialog(false)
      setShowConfigPrompt(false)
      
      // Reset form
      setClaudeConfigForm({
        apiKey: '',
        selectedModel: 'claude-3-5-sonnet-20241022',
        enableGitHubIntegration: false
      })

    } catch (error) {
      console.error('Error saving Claude config:', error)
      setConfigError('Failed to save configuration. Please try again.')
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Connect to GitHub
  const connectToGitHub = async () => {
    setIsConnecting(true)
    try {
      // Add a small delay for better UX to show the spinner
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/api/auth/github/exchange'
    } catch (error) {
      console.error('GitHub connection error:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Refresh GitHub connection status
  const refreshGitHubStatus = async () => {
    setIsConnecting(true)
    try {
      await checkGitHubConnection()
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for UX
    } catch (error) {
      console.error('Error refreshing GitHub status:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Load GitHub repositories
  const loadGitHubRepositories = async () => {
    if (!githubConnected) return

    setIsLoadingRepos(true)
    try {
      const response = await fetch('/api/auth/github/repos', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const repos = await response.json()
        setAvailableRepos(repos)
      } else {
        console.error('Failed to load repositories')
        setAvailableRepos([])
      }
    } catch (error) {
      console.error('Error loading repositories:', error)
      setAvailableRepos([])
    } finally {
      setIsLoadingRepos(false)
    }
  }

  // Load data and repos
  const loadData = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Load AI tasks
      const tasksResult = await createClient().from('sdlc_ai_tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      
      if (tasksResult.data) {
        setTasks(tasksResult.data as AITask[])
      }

      // Load GitHub integrations
      const reposResult = await createClient().from('sdlc_github_integrations').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false })
      
      if (reposResult.data) {
        setRepositories(reposResult.data as GitHubIntegration[])
      }
    } catch (err) {
      setError('Failed to load AI code assistant data')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'bug-fix': return <Bug className="h-4 w-4" />
      case 'feature': return <Sparkles className="h-4 w-4" />
      case 'review': return <Eye className="h-4 w-4" />
      case 'test-generation': return <FileCode className="h-4 w-4" />
      case 'refactor': return <Code2 className="h-4 w-4" />
      default: return <Code2 className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <X className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 text-red-700 bg-red-50'
      case 'high': return 'border-orange-500 text-orange-700 bg-orange-50'
      case 'medium': return 'border-blue-500 text-blue-700 bg-blue-50'
      case 'low': return 'border-gray-500 text-gray-700 bg-gray-50'
      default: return 'border-gray-500 text-gray-700 bg-gray-50'
    }
  }

  // Open Create Task Modal and load repositories
  const openCreateTaskModal = () => {
    setShowCreateTask(true)
    if (githubConnected && availableRepos.length === 0) {
      loadGitHubRepositories()
    }
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-purple-600" />
          AI Code Assistant
          <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm">
              <Code2 className="h-4 w-4 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="repos" className="text-xs sm:text-sm">
              <Github className="h-4 w-4 mr-1" />
              Repos
            </TabsTrigger>
            <TabsTrigger value="claude" className="text-xs sm:text-sm">
              <Sparkles className="h-4 w-4 mr-1" />
              Claude AI
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Total Tasks</h3>
                </div>
                <p className="text-2xl font-bold text-blue-700">{tasks.length}</p>
                <p className="text-sm text-blue-600">Active AI code tasks</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Completed</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-green-600">Successfully automated</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Repositories</h3>
                </div>
                <p className="text-2xl font-bold text-purple-700">{repositories.length}</p>
                <p className="text-sm text-purple-600">Connected repos</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-purple-600 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-purple-900">AI-Powered Code Automation</h3>
                  <p className="text-sm text-purple-800">
                    Automatically fix bugs, implement features, and generate tests using advanced AI models. 
                    Connect your GitHub repositories for seamless integration and automated pull requests.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      onClick={openCreateTaskModal}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Task
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('repos')}>
                      <Github className="h-4 w-4 mr-1" />
                      Connect Repository
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks Preview */}
            {tasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recent Tasks</h3>
                <div className="space-y-2">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTaskIcon(task.type)}
                        <div>
                          <p className="font-medium text-gray-900">{task.context.description.slice(0, 60)}...</p>
                          <p className="text-sm text-gray-500">
                            {task.type.replace('-', ' ')} • {task.priority} priority
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        {getStatusIcon(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('tasks')}
                  className="w-full mt-3"
                >
                  View All Tasks
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">AI Code Tasks</h3>
              <Button onClick={openCreateTaskModal} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">No AI tasks yet</h3>
                <p className="text-gray-600 mb-4">Create your first AI code automation task</p>
                <Button onClick={openCreateTaskModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getTaskIcon(task.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {task.context.description}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="capitalize">{task.type.replace('-', ' ')}</span>
                            <span>•</span>
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                              {task.priority}
                            </Badge>
                            {task.context.repository_url && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">{task.context.repository_url.split('/').slice(-2).join('/')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-600 capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Repositories Tab */}
          <TabsContent value="repos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Connected Repositories</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Connect Repository
              </Button>
            </div>

            {repositories.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Github className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">No repositories connected</h3>
                <p className="text-gray-600 mb-4">Connect GitHub repositories to enable AI code automation</p>
                <Button variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub Repository
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {repositories.map((repo) => (
                  <div key={repo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {repo.repository_id}
                          </h4>
                          <p className="text-sm text-gray-600">{repo.repository_url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={repo.is_active ? "default" : "secondary"}>
                          {repo.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Claude Analysis Tab */}
          <TabsContent value="claude" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Claude AI Code Analysis</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by Claude 3.5 Sonnet
                </Badge>
              </div>
            </div>

            {/* Configuration Prompt */}
            {(!claudeConfig?.apiKey || showConfigPrompt) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900">Claude AI Configuration Required</h4>
                    <p className="text-sm text-purple-800">
                      To use Claude AI code analysis and agentic workflows, you need to configure your Claude API key.
                    </p>
                    {configError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {configError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={openClaudeConfigDialog}
                        disabled={isSavingConfig}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSavingConfig ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4 mr-1" />
                        )}
                        {isSavingConfig ? 'Saving...' : 'Configure Claude API'}
                      </Button>
                      <Button
                        onClick={() => setShowConfigPrompt(false)}
                        variant="outline"
                        size="sm"
                        disabled={isSavingConfig}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Integration Validation */}
            {claudeConfig?.apiKey && claudeConfig?.enableGitHubIntegration && !githubConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Github className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-yellow-900">GitHub Integration Required</h4>
                    <p className="text-sm text-yellow-800">
                      Claude AI GitHub integration is enabled but your GitHub account is not connected. 
                      For bug fixes and feature requests on existing repositories, GitHub connection is required.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={connectToGitHub}
                        disabled={isConnecting}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Github className="h-4 w-4 mr-1" />
                        )}
                        {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                      </Button>
                      <Button
                        onClick={refreshGitHubStatus}
                        disabled={isConnecting}
                        variant="outline"
                        size="sm"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        {isConnecting ? 'Checking...' : 'Refresh Status'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Claude Connection Status & Features */}
            {claudeConfig?.apiKey && (
              <div className="space-y-4">
                {/* Connection Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Claude API Status */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <Sparkles className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900">Claude AI Connected</h4>
                        <p className="text-sm text-green-700">
                          Model: {claudeConfig.selectedModel || 'claude-3-5-sonnet-20241022'}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          API Key: ****{claudeConfig.apiKey?.slice(-8) || ''}
                        </p>
                      </div>
                      <Button
                        onClick={openClaudeConfigDialog}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* GitHub Integration Status */}
                  <div className={`p-4 rounded-lg border ${
                    githubConnected && claudeConfig?.enableGitHubIntegration
                      ? 'bg-green-50 border-green-200'
                      : claudeConfig?.enableGitHubIntegration
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        githubConnected && claudeConfig?.enableGitHubIntegration
                          ? 'bg-green-500'
                          : claudeConfig?.enableGitHubIntegration
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}></div>
                      <Github className={`h-5 w-5 ${
                        githubConnected && claudeConfig?.enableGitHubIntegration
                          ? 'text-green-600'
                          : claudeConfig?.enableGitHubIntegration
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          githubConnected && claudeConfig?.enableGitHubIntegration
                            ? 'text-green-900'
                            : claudeConfig?.enableGitHubIntegration
                            ? 'text-yellow-900'
                            : 'text-gray-700'
                        }`}>
                          GitHub Integration
                        </h4>
                        <p className={`text-sm ${
                          githubConnected && claudeConfig?.enableGitHubIntegration
                            ? 'text-green-700'
                            : claudeConfig?.enableGitHubIntegration
                            ? 'text-yellow-700'
                            : 'text-gray-600'
                        }`}>
                          {claudeConfig?.enableGitHubIntegration
                            ? githubConnected
                              ? 'Connected & Ready'
                              : 'Enabled but not connected'
                            : 'Disabled'
                          }
                        </p>
                        <p className={`text-xs mt-1 ${
                          githubConnected && claudeConfig?.enableGitHubIntegration
                            ? 'text-green-600'
                            : claudeConfig?.enableGitHubIntegration
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                        }`}>
                          {claudeConfig?.enableGitHubIntegration
                            ? githubConnected
                              ? 'Can create PRs and access repos'
                              : 'Connect GitHub to enable repo access'
                            : 'Code analysis only, no repo access'
                          }
                        </p>
                      </div>
                      {claudeConfig?.enableGitHubIntegration && !githubConnected && (
                        <Button
                          onClick={connectToGitHub}
                          disabled={isConnecting}
                          variant="outline"
                          size="sm"
                          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        >
                          {isConnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <Sparkles className="h-10 w-10 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900 mb-2">Ready for Agentic Code Workflows</h3>
                  <p className="text-purple-800 mb-4 max-w-md mx-auto">
                    Claude AI is configured and ready to help with bug fixes, feature development, code reviews, and more.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={() => setActiveTab('tasks')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create AI Task
                    </Button>
                    <Button
                      onClick={() => setActiveTab('overview')}
                      variant="outline"
                    >
                      View Overview
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <h3 className="font-semibold text-gray-900">Usage Analytics</h3>
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">Track costs, success rates, and performance metrics</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Task Modal */}
        {showCreateTask && typeof window !== 'undefined' && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Create New AI Task</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateTask(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <Label>Task Type</Label>
                  <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug-fix">Bug Fix</SelectItem>
                      <SelectItem value="feature">Feature Implementation</SelectItem>
                      <SelectItem value="review">Code Review</SelectItem>
                      <SelectItem value="test-generation">Test Generation</SelectItem>
                      <SelectItem value="refactor">Code Refactoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what you want the AI to do..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* GitHub Repository Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Target Repository</Label>
                    {githubConnected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadGitHubRepositories}
                        disabled={isLoadingRepos}
                      >
                        {isLoadingRepos ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Refresh
                      </Button>
                    )}
                  </div>

                  {!githubConnected ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Github className="h-4 w-4" />
                        <span className="text-sm font-medium">GitHub Required</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Connect GitHub to select repositories for AI tasks
                      </p>
                      <Button
                        onClick={connectToGitHub}
                        size="sm"
                        className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                      >
                        Connect GitHub
                      </Button>
                    </div>
                  ) : availableRepos.length === 0 && !isLoadingRepos ? (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">No repositories found.</p>
                      <Button
                        onClick={loadGitHubRepositories}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Load Repositories
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={newTask.repository_id}
                      onValueChange={(value) => {
                        const selectedRepo = availableRepos.find(repo => repo.id.toString() === value)
                        setNewTask({
                          ...newTask,
                          repository_id: value,
                          repository_url: selectedRepo?.url || '',
                          repository_name: selectedRepo?.fullName || ''
                        })
                      }}
                      disabled={isLoadingRepos}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingRepos ? "Loading repositories..." : "Select a repository"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRepos.map((repo) => (
                          <SelectItem key={repo.id} value={repo.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{repo.fullName}</div>
                                {repo.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {repo.description}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                  {repo.language && <span>{repo.language}</span>}
                                  {repo.private && <span>🔒 Private</span>}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Workflow Explanation */}
                {newTask.repository_id && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Claude AI Workflow</h4>
                        <div className="text-xs text-blue-800 mt-1 space-y-0.5">
                          <div>🌿 Create branch → 🔍 Analyze → 💻 Code → 📝 Commit → 🔄 PR</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GitHub Issue URL (Optional) */}
                <div>
                  <Label>GitHub Issue URL (Optional)</Label>
                  <Input
                    placeholder="https://github.com/username/repo/issues/123"
                    value={newTask.github_issue_url}
                    onChange={(e) => setNewTask({...newTask, github_issue_url: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to existing GitHub issue (Claude will reference this for context)
                  </p>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-lg">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Handle create task logic here
                      console.log('Creating task:', newTask)
                      setShowCreateTask(false)
                    }}
                    disabled={!newTask.description.trim()}
                    className="flex-1"
                  >
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Claude Configuration Dialog */}
        {showClaudeConfigDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Configure Claude AI</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowClaudeConfigDialog(false)}
                  disabled={isSavingConfig}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Claude API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-ant-api03-..."
                    value={claudeConfigForm.apiKey}
                    onChange={(e) => setClaudeConfigForm({...claudeConfigForm, apiKey: e.target.value})}
                    disabled={isSavingConfig}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from{' '}
                    <a 
                      href="https://console.anthropic.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Anthropic Console
                    </a>
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Claude Model</Label>
                  <Select 
                    value={claudeConfigForm.selectedModel} 
                    onValueChange={(value) => setClaudeConfigForm({...claudeConfigForm, selectedModel: value})}
                    disabled={isSavingConfig}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</SelectItem>
                      <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast & Cost-effective)</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Most Capable)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Sonnet offers the best balance of speed and capability for coding tasks
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="github-integration"
                    checked={claudeConfigForm.enableGitHubIntegration}
                    onChange={(e) => setClaudeConfigForm({...claudeConfigForm, enableGitHubIntegration: e.target.checked})}
                    disabled={isSavingConfig}
                    className="mt-0.5"
                  />
                  <div>
                    <label htmlFor="github-integration" className="text-sm font-medium text-blue-900 cursor-pointer">
                      Enable GitHub Integration
                    </label>
                    <p className="text-xs text-blue-800 mt-1">
                      Allow Claude to create pull requests and interact with your repositories
                    </p>
                  </div>
                </div>

                {configError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{configError}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={saveClaudeConfig}
                    disabled={isSavingConfig || !claudeConfigForm.apiKey.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isSavingConfig ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing & Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowClaudeConfigDialog(false)}
                    disabled={isSavingConfig}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 