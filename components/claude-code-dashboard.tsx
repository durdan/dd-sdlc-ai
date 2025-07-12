'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckCircle, Clock, AlertCircle, Code, Search, Bug, FileText, Github, Sparkles, Play, RotateCcw, Eye, GitBranch, GitPullRequest, GitMerge, ChevronDown, ChevronRight, Copy, Download, ExternalLink, Trash2 } from 'lucide-react'

interface ClaudeTask {
  id: string
  description: string
  type: string
  status: string
  priority: string
  progress: number
  result?: any
  steps?: any[]
  created_at: string
  completed_at?: string
  repository?: {
    owner: string
    name: string
    branch: string
  }
}

interface Repository {
  id: number
  name: string
  fullName: string
  private: boolean
  url: string
  description?: string
  language?: string
  defaultBranch: string
}

interface PRStatus {
  url?: string
  number?: number
  state?: string
  merged?: boolean
  created_at?: string
}

export default function ClaudeCodeDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [tasks, setTasks] = useState<ClaudeTask[]>([])
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedTask, setSelectedTask] = useState<ClaudeTask | null>(null)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [prStatuses, setPrStatuses] = useState<Record<string, PRStatus>>({})
  
  // Form states
  const [selectedRepo, setSelectedRepo] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskType, setTaskType] = useState('feature')
  const [priority, setPriority] = useState('medium')
  const [codeToAnalyze, setCodeToAnalyze] = useState('')
  const [bugDescription, setBugDescription] = useState('')

  // Load data on mount
  useEffect(() => {
    loadTasks()
    loadRepositories()
  }, [])

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/slack/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }

  const loadRepositories = async () => {
    try {
      const response = await fetch('/api/auth/github/repos')
      if (response.ok) {
        const data = await response.json()
        setRepositories(data.repositories || [])
      }
    } catch (error) {
      console.error('Failed to load repositories:', error)
    }
  }

  const handleCreateTask = async () => {
    if (!taskDescription.trim()) {
      setError('Task description is required')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/slack/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: taskDescription,
          type: taskType,
          priority,
          repository: selectedRepo,
          context: `Task created from Claude Code Dashboard`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Task created successfully!')
        setTaskDescription('')
        loadTasks()
      } else {
        setError(data.error || 'Failed to create task')
      }
    } catch (error) {
      setError('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePR = async (task: ClaudeTask) => {
    if (!task.result || !task.repository) {
      setError('Cannot create PR: No generated code or repository information')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const repositoryUrl = `https://github.com/${task.repository.owner}/${task.repository.name}`
      
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_implementation_pr',
          repositoryUrl,
          generatedCode: task.result,
          prTitle: `✨ ${task.description}`,
          prDescription: `Auto-generated by Claude AI\n\n**Task**: ${task.description}\n**Type**: ${task.type}\n**Priority**: ${task.priority}\n\n## Generated Changes\n\n${task.result.files_to_create?.length || 0} files to create\n${task.result.files_to_modify?.length || 0} files to modify\n\n## Validation Steps\n\n${task.result.validation_steps ? task.result.validation_steps.join('\n') : 'No validation steps provided'}\n\n---\n*Generated by Claude Code Assistant*`,
          branchName: `claude/${task.type}/${task.id.slice(-8)}`
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess(`Pull request created successfully! ${data.pullRequest.url}`)
        setPrStatuses(prev => ({
          ...prev,
          [task.id]: data.pullRequest
        }))
      } else {
        setError(data.error || 'Failed to create pull request')
      }
    } catch (error) {
      setError('Failed to create pull request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeCode = async () => {
    if (!codeToAnalyze.trim()) {
      setError('Code content is required for analysis')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_code',
          codeContent: codeToAnalyze,
          analysisType: 'code_review',
          context: 'Code analysis from Claude Code Dashboard'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Code analysis completed!')
        // You could display the analysis results in a modal or separate section
        console.log('Analysis result:', data.analysis)
      } else {
        setError(data.error || 'Failed to analyze code')
      }
    } catch (error) {
      setError('Failed to analyze code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeBug = async () => {
    if (!bugDescription.trim()) {
      setError('Bug description is required')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_bug',
          repositoryUrl: selectedRepo,
          bugDescription,
          context: 'Bug analysis from Claude Code Dashboard'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Bug analysis completed!')
        console.log('Bug analysis result:', data.analysis)
      } else {
        setError(data.error || 'Failed to analyze bug')
      }
    } catch (error) {
      setError('Failed to analyze bug')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetryTask = async (taskId: string) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/slack/tasks/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Task retry initiated!')
        loadTasks()
      } else {
        setError(data.error || 'Failed to retry task')
      }
    } catch (error) {
      setError('Failed to retry task')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFileExpansion = (fileName: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileName)) {
        newSet.delete(fileName)
      } else {
        newSet.add(fileName)
      }
      return newSet
    })
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    setSuccess('Copied to clipboard!')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getWorkflowStatus = (task: ClaudeTask) => {
    const prStatus = prStatuses[task.id]
    
    if (task.status === 'failed') return { step: 'failed', label: 'Task Failed', color: 'text-red-600' }
    if (task.status === 'in_progress') return { step: 'processing', label: 'Processing...', color: 'text-blue-600' }
    if (task.status === 'completed' && !prStatus) return { step: 'ready_for_pr', label: 'Ready for PR', color: 'text-orange-600' }
    if (prStatus && !prStatus.merged) return { step: 'pr_created', label: 'PR Created', color: 'text-purple-600' }
    if (prStatus && prStatus.merged) return { step: 'merged', label: 'Merged', color: 'text-green-600' }
    return { step: 'unknown', label: 'Unknown', color: 'text-gray-600' }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Claude Code Assistant
        </h1>
        <p className="text-gray-600">
          AI-powered code analysis, generation, and repository management
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Code Analysis
          </TabsTrigger>
          <TabsTrigger value="bugs" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Bug Detection
          </TabsTrigger>
          <TabsTrigger value="repositories" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            Repositories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold">{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Repositories</p>
                    <p className="text-2xl font-bold">{repositories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest Claude AI tasks and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.slice(0, 5).map((task) => {
                const workflow = getWorkflowStatus(task)
                return (
                  <div key={task.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <p className="font-medium">{task.description}</p>
                        <p className="text-sm text-gray-500">
                          {task.type} • {task.priority} priority
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={workflow.color}>
                        {workflow.label}
                      </Badge>
                      {task.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Create AI-powered coding tasks for repositories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="repository">Repository</Label>
                  <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select repository..." />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.fullName} value={repo.fullName}>
                          {repo.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taskType">Task Type</Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature Implementation</SelectItem>
                      <SelectItem value="bug_fix">Bug Fix</SelectItem>
                      <SelectItem value="refactoring">Code Refactoring</SelectItem>
                      <SelectItem value="testing">Test Generation</SelectItem>
                      <SelectItem value="review">Code Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you want Claude to implement or fix..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button onClick={handleCreateTask} disabled={isLoading} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  {isLoading ? 'Creating Task...' : 'Create Task'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
                <CardDescription>Monitor your Claude AI tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No tasks created yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {tasks.map((task) => {
                      const workflow = getWorkflowStatus(task)
                      const prStatus = prStatuses[task.id]
                      
                      return (
                        <div key={task.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.description}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${workflow.color}`}>
                                  {workflow.label}
                                </Badge>
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                          
                          {task.progress !== undefined && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Created: {new Date(task.created_at).toLocaleString()}
                            </span>
                            <div className="flex space-x-2">
                              {task.status === 'completed' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Review
                                  </Button>
                                  {!prStatus && (
                                    <Button size="sm" onClick={() => handleCreatePR(task)} disabled={isLoading}>
                                      <GitPullRequest className="h-3 w-3 mr-1" />
                                      Create PR
                                    </Button>
                                  )}
                                  {prStatus && (
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={prStatus.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View PR
                                      </a>
                                    </Button>
                                  )}
                                </>
                              )}
                              {task.status === 'failed' && (
                                <Button size="sm" variant="outline" onClick={() => handleRetryTask(task.id)}>
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Retry
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Analysis</CardTitle>
              <CardDescription>Get AI-powered insights and suggestions for your code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="codeToAnalyze">Code to Analyze</Label>
                <Textarea
                  id="codeToAnalyze"
                  placeholder="Paste your code here for analysis..."
                  value={codeToAnalyze}
                  onChange={(e) => setCodeToAnalyze(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button onClick={handleAnalyzeCode} disabled={isLoading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Analyzing...' : 'Analyze Code'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bug Detection & Analysis</CardTitle>
              <CardDescription>Describe a bug and get AI-powered analysis and fix suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bugRepository">Repository</Label>
                <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repository..." />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem key={repo.fullName} value={repo.fullName}>
                        {repo.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bugDescription">Bug Description</Label>
                <Textarea
                  id="bugDescription"
                  placeholder="Describe the bug you're experiencing..."
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  rows={6}
                />
              </div>
              
              <Button onClick={handleAnalyzeBug} disabled={isLoading} className="w-full">
                <Bug className="h-4 w-4 mr-2" />
                {isLoading ? 'Analyzing Bug...' : 'Analyze Bug'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repositories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Repositories</CardTitle>
              <CardDescription>Repositories available for Claude AI operations</CardDescription>
            </CardHeader>
            <CardContent>
              {repositories.length === 0 ? (
                <div className="text-center py-6">
                  <Github className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No repositories connected.</p>
                  <p className="text-sm text-gray-400">Connect your GitHub account to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositories.map((repo) => (
                    <div key={repo.fullName} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{repo.name}</h4>
                          <p className="text-sm text-gray-500">{repo.fullName}</p>
                          {repo.description && (
                            <p className="text-xs text-gray-400 mt-1">{repo.description}</p>
                          )}
                          {repo.language && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={repo.private ? 'secondary' : 'outline'}>
                          {repo.private ? 'Private' : 'Public'}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <Button size="sm" variant="outline" asChild>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-3 w-3 mr-1" />
                            View on GitHub
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Task Details: {selectedTask.description}
              </DialogTitle>
              <DialogDescription>
                Review generated code and manage deployment workflow
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Workflow Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTask.status)}
                      <span className="font-medium">Status</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTask.repository && (
                      <Badge variant="outline">
                        <Github className="h-3 w-3 mr-1" />
                        {selectedTask.repository.owner}/{selectedTask.repository.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Generated Files */}
                {selectedTask.result?.files_to_create && selectedTask.result.files_to_create.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Files to Create ({selectedTask.result.files_to_create.length})
                    </h3>
                    {selectedTask.result.files_to_create.map((file: any, index: number) => (
                      <Collapsible key={index}>
                        <CollapsibleTrigger
                          className="flex items-center justify-between w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                          onClick={() => toggleFileExpansion(`create-${index}`)}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedFiles.has(`create-${index}`) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <code className="text-sm font-mono">{file.path}</code>
                            <Badge variant="outline" className="text-xs text-green-700">
                              NEW
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(file.content)
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </span>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">{file.description}</span>
                              <span className="text-xs text-gray-500">
                                {file.content.split('\n').length} lines
                              </span>
                            </div>
                            <pre className="text-sm">
                              <code>{file.content}</code>
                            </pre>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* Files to Modify */}
                {selectedTask.result?.files_to_modify && selectedTask.result.files_to_modify.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Files to Modify ({selectedTask.result.files_to_modify.length})
                    </h3>
                    {selectedTask.result.files_to_modify.map((file: any, index: number) => (
                      <Collapsible key={index}>
                        <CollapsibleTrigger
                          className="flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                          onClick={() => toggleFileExpansion(`modify-${index}`)}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedFiles.has(`modify-${index}`) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                            <code className="text-sm font-mono">{file.path}</code>
                            <Badge variant="outline" className="text-xs text-blue-700">
                              MODIFY
                            </Badge>
                          </div>
                          <span
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(file.changes)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-400">{file.description}</span>
                            </div>
                            <pre className="text-sm">
                              <code>{file.changes}</code>
                            </pre>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}

                {/* Validation Steps */}
                {selectedTask.result?.validation_steps && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Validation Steps</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <ul className="space-y-2 text-sm">
                        {selectedTask.result.validation_steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Created: {new Date(selectedTask.created_at).toLocaleString()}</span>
                {selectedTask.completed_at && (
                  <span>• Completed: {new Date(selectedTask.completed_at).toLocaleString()}</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                {selectedTask.status === 'completed' && !prStatuses[selectedTask.id] && (
                  <Button onClick={() => handleCreatePR(selectedTask)} disabled={isLoading}>
                    <GitPullRequest className="h-4 w-4 mr-2" />
                    Create Pull Request
                  </Button>
                )}
                {prStatuses[selectedTask.id] && (
                  <Button variant="outline" asChild>
                    <a href={prStatuses[selectedTask.id].url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Pull Request
                    </a>
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 