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
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  GitBranch,
  GitPullRequest,
  ExternalLink,
  FileText,
  Code,
  Bug,
  Zap,
  Copy,
  Search,
  BarChart3,
  GitMerge,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  XCircle,
  Github,
  Eye,
  RotateCcw,
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'
import { StreamingResponseWindow } from './streaming-response-window'

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

interface ClaudeCodeDashboardProps {
  projectId?: string | null
}

export default function ClaudeCodeDashboard({ projectId }: ClaudeCodeDashboardProps) {
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
  
  // Bug analysis states
  const [bugDescription, setBugDescription] = useState('')
  
  // Real-time polling state
  const [pollingTaskIds, setPollingTaskIds] = useState<Set<string>>(new Set())
  
  // PR creation loading state
  const [creatingPrForTask, setCreatingPrForTask] = useState<string | null>(null)

  // Add state for button loading
  const [cancellingTaskId, setCancellingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  // Add usage hook
  const { usage, loading: usageLoading, refetch: refetchUsage } = useFreemiumUsage()

  // Task creation modal state
  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false)
  const [taskCreationSuccess, setTaskCreationSuccess] = useState<ClaudeTask | null>(null)
  
  // Streaming response state
  const [streamingResponses, setStreamingResponses] = useState<Record<string, string>>({})
  const [streamingTasks, setStreamingTasks] = useState<Set<string>>(new Set())

  // GitHub repository loading states
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false)
  const [repositoryError, setRepositoryError] = useState<string | null>(null)
  const [repositoryRetryCount, setRepositoryRetryCount] = useState(0)
  const [lastRepositoryLoadTime, setLastRepositoryLoadTime] = useState<number | null>(null)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null)

  // Auto-clear success messages after 10 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('')
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [success])

  // Auto-clear error messages after 15 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('')
      }, 15000)
      
      return () => clearTimeout(timer)
    }
  }, [error])

  // Load data on mount
  useEffect(() => {
    loadTasks()
    loadRepositories()
  }, [])

  // Load specific project when projectId is provided
  useEffect(() => {
    if (projectId) {
      loadSpecificProject(projectId)
    }
  }, [projectId])

  // REAL-TIME PROGRESS POLLING
  // Poll for task updates when tasks are running
  useEffect(() => {
    const runningTasks = tasks.filter(task => 
      task.status === 'pending' || 
      task.status === 'analyzing' || 
      task.status === 'planning' || 
      task.status === 'executing' || 
      task.status === 'reviewing'
    )

    // Start polling for running tasks
    runningTasks.forEach(task => {
      if (!pollingTaskIds.has(task.id)) {
        setPollingTaskIds(prev => new Set(prev).add(task.id))
        startTaskPolling(task.id)
        // If no task is selected, open the modal for the first running task
        setSelectedTask(prev => {
          if (!prev) {
            console.log('[DEBUG] setSelectedTask called from polling:', task)
            return task
          }
          return prev
        })
      }
    })

    // Stop polling for completed/failed tasks
    pollingTaskIds.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId)
      if (!task || task.status === 'completed' || task.status === 'failed') {
        setPollingTaskIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
      }
    })
  }, [tasks, pollingTaskIds])

  const startTaskPolling = (taskId: string) => {
    console.log(`🔄 Starting real-time polling for task: ${taskId}`)
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_task',
            taskId: taskId
          })
        })
        if (response.ok) {
          const data = await response.json()
          const updatedTask = data.task
          
          // Update streaming responses based on task status
          if (updatedTask.status === 'analyzing' || updatedTask.status === 'planning' || updatedTask.status === 'executing' || updatedTask.status === 'reviewing') {
            setStreamingResponses(prev => {
              const existingContent = prev[taskId] || ''
              let newContent = existingContent
              
              // Add execution logs if available
              if (updatedTask.execution_logs && Array.isArray(updatedTask.execution_logs)) {
                const logs = updatedTask.execution_logs
                const lastLog = logs[logs.length - 1]
                
                if (lastLog && lastLog.message) {
                  const logMessage = `${lastLog.message}\n`
                  
                  // Add progress updates (prevent duplicate messages)
                  if (!existingContent.includes(logMessage)) {
                    newContent = existingContent + logMessage
                  }
                }
              } else {
                // Fallback to generic progress message
                const progressMessage = `Step ${updatedTask.progress || 0}% complete...\n`
                
                // Add progress updates (prevent duplicate messages)
                if (!existingContent.includes(progressMessage)) {
                  newContent = existingContent + progressMessage
                }
              }
              
              return {
                ...prev,
                [taskId]: newContent
              }
            })
          } else if (updatedTask.status === 'completed') {
            let completionMessage = '\n✅ Task completed successfully!\n'
            
            // Add actual results to streaming response
            if (updatedTask.result) {
              completionMessage += '\n📋 Generated Results:\n'
              
              if (updatedTask.result.reasoning) {
                completionMessage += `\n🧠 Reasoning:\n${updatedTask.result.reasoning}\n`
              }
              
              if (updatedTask.result.implementation?.files_to_create?.length > 0) {
                completionMessage += `\n📄 Files to Create (${updatedTask.result.implementation.files_to_create.length}):\n`
                updatedTask.result.implementation.files_to_create.forEach((file: any, index: number) => {
                  completionMessage += `${index + 1}. ${file.path} - ${file.description}\n`
                })
              }
              
              if (updatedTask.result.implementation?.files_to_modify?.length > 0) {
                completionMessage += `\n✏️ Files to Modify (${updatedTask.result.implementation.files_to_modify.length}):\n`
                updatedTask.result.implementation.files_to_modify.forEach((file: any, index: number) => {
                  completionMessage += `${index + 1}. ${file.path} - ${file.description}\n`
                })
              }
              
              if (updatedTask.result.tests?.unit_tests?.length > 0) {
                completionMessage += `\n🧪 Unit Tests (${updatedTask.result.tests.unit_tests.length}):\n`
                updatedTask.result.tests.unit_tests.forEach((test: any, index: number) => {
                  completionMessage += `${index + 1}. ${test.file_path} - ${test.description}\n`
                })
              }
              
              if (updatedTask.result.validation_steps?.length > 0) {
                completionMessage += `\n✅ Validation Steps:\n`
                updatedTask.result.validation_steps.forEach((step: string, index: number) => {
                  completionMessage += `${index + 1}. ${step}\n`
                })
              }
            }
            
            setStreamingResponses(prev => ({
              ...prev,
              [taskId]: (prev[taskId] || '') + completionMessage
            }))
            setStreamingTasks(prev => {
              const newSet = new Set(prev)
              newSet.delete(taskId)
              return newSet
            })
          } else if (updatedTask.status === 'failed') {
            let errorMessage = '\n❌ Task failed.\n'
            
            // Add detailed error information from execution logs
            if (updatedTask.execution_logs && Array.isArray(updatedTask.execution_logs)) {
              const errorLogs = updatedTask.execution_logs.filter((log: any) => 
                log.message && log.message.includes('❌')
              )
              
              if (errorLogs.length > 0) {
                errorMessage += '\n📋 Error Details:\n'
                errorLogs.forEach((log: any, index: number) => {
                  errorMessage += `${index + 1}. ${log.message}\n`
                })
              }
            }
            
            // Add error from result if available
            if (updatedTask.result?.error_message) {
              errorMessage += `\n🔍 Error: ${updatedTask.result.error_message}\n`
            }
            
            setStreamingResponses(prev => ({
              ...prev,
              [taskId]: (prev[taskId] || '') + errorMessage
            }))
            setStreamingTasks(prev => {
              const newSet = new Set(prev)
              newSet.delete(taskId)
              return newSet
            })
          }
          
          // Update the task in the tasks list
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId ? { 
                ...task, 
                ...updatedTask,
                // Ensure we preserve the original task structure
                status: updatedTask.status,
                progress: updatedTask.progress,
                steps: updatedTask.steps,
                result: updatedTask.result
              } : task
            )
          )
          
          // Update selected task if it's the one being polled
          setSelectedTask(prevSelected => 
            prevSelected?.id === taskId ? { 
              ...prevSelected, 
              ...updatedTask,
              status: updatedTask.status,
              progress: updatedTask.progress,
              steps: updatedTask.steps,
              result: updatedTask.result
            } : prevSelected
          )
          
          // Stop polling if task is completed or failed
          if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
            console.log(`✅ Task ${taskId} completed, stopping polling`)
            clearInterval(pollInterval)
            setPollingTaskIds(prev => {
              const newSet = new Set(prev)
              newSet.delete(taskId)
              return newSet
            })
            // Keep streaming response but stop streaming state
            setStreamingTasks(prev => {
              const newSet = new Set(prev)
              newSet.delete(taskId)
              return newSet
            })
          }
        }
      } catch (error) {
        console.error(`❌ Error polling task ${taskId}:`, error)
      }
    }, 1000) // Poll every 1 second for better real-time updates

    // Cleanup interval after 10 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval)
      setPollingTaskIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }, 600000) // 10 minutes
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_tasks'
        })
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }

  const loadSpecificProject = async (projectId: string) => {
    try {
      console.log('🔍 Loading specific project:', projectId)
      
      // Load the specific project generation from the database
      const response = await fetch(`/api/claude?action=get_project&project_id=${projectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Project data:', data)
        
        if (data.project) {
          const project = data.project
          
          // Check if project has content
          if (project.has_content === false) {
            setError('This project exists but has no stored content. It may be an analytics-only record.')
            return
          }
          
          // Handle different data structures
          let projectTask: ClaudeTask
          
          if (project.project_type) {
            // This is from project_generations (Claude Code Assistant)
            projectTask = {
              id: project.id,
              description: `Claude Code Assistant - ${project.project_type}`,
              type: project.project_type,
              status: project.success ? 'completed' : 'failed',
              priority: 'medium',
              progress: project.success ? 100 : 0,
              result: project.metadata || project,
              created_at: project.created_at,
              completed_at: project.completed_at
            }
          } else {
            // This is from sdlc_ai_task_executions (AI tasks)
            projectTask = {
              id: project.id,
              description: project.description || 'AI Task',
              type: project.task_type || 'unknown',
              status: project.status || 'pending',
              priority: 'medium',
              progress: project.progress || 0,
              result: project.execution_result,
              created_at: project.created_at,
              completed_at: project.completed_at
            }
          }
          
          setSelectedTask(projectTask)
          setActiveTab('overview')
          
          // Show success message
          const projectType = project.project_type || project.task_type || 'Project'
          setSuccess(`✅ Loaded project: ${projectType}`)
        }
      } else {
        console.error('Failed to load specific project:', response.status)
        setError('Failed to load the specific project')
      }
    } catch (error) {
      console.error('Error loading specific project:', error)
      setError('Error loading the specific project')
    }
  }

  const loadRepositories = async (isRetry = false) => {
    console.log('🔵 loadRepositories called', { isRetry, retryCount: repositoryRetryCount })
    
    // Prevent multiple simultaneous loads
    if (isLoadingRepositories && !isRetry) {
      console.log('⚠️ Repository loading already in progress, skipping')
      return
    }
    
    setIsLoadingRepositories(true)
    setRepositoryError(null)
    setShowTimeoutWarning(false)
    setLoadStartTime(Date.now())
    
    // Set timeout warning for mobile users
    const timeoutWarning = setTimeout(() => {
      if (isLoadingRepositories) {
        setShowTimeoutWarning(true)
      }
    }, 10000) // Show warning after 10 seconds
    
    try {
      console.log('📡 Fetching GitHub repositories...')
      const response = await fetch('/api/auth/github/repos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout for mobile devices
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      clearTimeout(timeoutWarning)
      console.log('📥 GitHub repos response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 GitHub repos data:', data)
        console.log('📥 Repositories count:', data.repositories?.length || 0)
        
        setRepositories(data.repositories || [])
        setRepositoryRetryCount(0)
        setLastRepositoryLoadTime(Date.now())
        
        // Show success message for mobile users
        if (data.repositories?.length > 0) {
          setSuccess(`✅ Loaded ${data.repositories.length} repositories successfully`)
        } else {
          setRepositoryError('No repositories found. Please check your GitHub connection.')
        }
        
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ Failed to load repositories:', response.status, errorData)
        
        let errorMessage = 'Failed to load repositories'
        
        if (response.status === 401) {
          errorMessage = 'GitHub authentication required. Please reconnect your GitHub account.'
        } else if (response.status === 403) {
          errorMessage = 'GitHub access denied. Please check your repository permissions.'
        } else if (response.status === 429) {
          errorMessage = 'GitHub rate limit exceeded. Please try again in a few minutes.'
        } else if (response.status >= 500) {
          errorMessage = 'GitHub service temporarily unavailable. Please try again later.'
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
        
        setRepositoryError(errorMessage)
        
        // Auto-retry for network errors on mobile
        if (response.status >= 500 && repositoryRetryCount < 2) {
          console.log(`🔄 Auto-retrying repository load (attempt ${repositoryRetryCount + 1}/3)`)
          setTimeout(() => {
            setRepositoryRetryCount(prev => prev + 1)
            loadRepositories(true)
          }, 2000)
        }
      }
    } catch (error) {
      clearTimeout(timeoutWarning)
      const loadTime = Date.now() - (loadStartTime || Date.now())
      console.log('❌ Error loading repositories:', error, `(took ${loadTime}ms)`)
      
      let errorMessage = 'Failed to load repositories'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Repository loading timed out. Please check your internet connection and try again.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else {
          errorMessage = error.message
        }
      }
      
      setRepositoryError(errorMessage)
      
      // Auto-retry for network errors
      if (repositoryRetryCount < 2 && (error instanceof Error && error.name !== 'AbortError')) {
        console.log(`🔄 Auto-retrying repository load due to network error (attempt ${repositoryRetryCount + 1}/3)`)
        setTimeout(() => {
          setRepositoryRetryCount(prev => prev + 1)
          loadRepositories(true)
        }, 3000)
      }
    } finally {
      setIsLoadingRepositories(false)
      setShowTimeoutWarning(false)
      setLoadStartTime(null)
    }
  }

  const handleCreateTask = async () => {
    console.log('🔵 handleCreateTask called')
    console.log('🔵 taskDescription:', taskDescription)
    console.log('🔵 selectedRepo:', selectedRepo)
    
    if (!taskDescription.trim()) {
      console.log('❌ Task description validation failed')
      setError('Task description is required')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('📤 Sending create_task request...')
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          description: taskDescription,
          type: 'feature', // default
          priority: 'medium', // default
          repository: selectedRepo,
          context: `Task created from Claude Code Dashboard`
        })
      })

      console.log('📥 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (response.ok) {
        console.log('✅ Task creation successful')
        setTaskCreationSuccess(data.task)
        setShowTaskCreationModal(true)
        setTaskDescription('')
        
        // Set up streaming for the new task
        if (data.task?.id) {
          setStreamingTasks(prev => new Set(prev).add(data.task.id))
          setStreamingResponses(prev => ({
            ...prev,
            [data.task.id]: '🚀 Task created successfully! Starting AI processing...\n📋 Initializing task execution...\n'
          }))
          // Immediately open the task details modal for real-time progress
          setSelectedTask((task) => {
            console.log('[DEBUG] setSelectedTask called after create:', data.task)
            return data.task
          })
        }
        
        loadTasks()
        refetchUsage() // Refresh usage after task creation
      } else {
        console.log('❌ Task creation failed:', data.error)
        setError(data.error || 'Failed to create task')
      }
    } catch (error) {
      console.log('❌ Task creation error:', error)
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

    // Check if PR already exists
    if (hasPullRequest(task)) {
      setError('Pull request already exists for this task')
      return
    }

    setCreatingPrForTask(task.id)
    setError('')
    setSuccess('')

    try {
      const repositoryUrl = `https://github.com/${task.repository.owner}/${task.repository.name}`
      
      console.log(`🔄 Creating PR for task ${task.id} in repository ${repositoryUrl}`)
      
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_implementation_pr',
          taskId: task.id,
          repositoryUrl,
          generatedCode: task.result,
          prTitle: `✨ ${task.description}`,
          prDescription: `Auto-generated by Claude AI\n\n**Task**: ${task.description}\n**Type**: ${task.type}\n**Priority**: ${task.priority}\n\n## Generated Changes\n\n${task.result.implementation?.files_to_create?.length || 0} files to create\n${task.result.implementation?.files_to_modify?.length || 0} files to modify\n\n## Validation Steps\n\n${task.result.validation_steps ? task.result.validation_steps.join('\n') : 'No validation steps provided'}\n\n---\n*Generated by Claude Code Assistant*`,
          branchName: `claude/${task.type}/${task.id.slice(-8)}`
        })
      })

      const data = await response.json()
      console.log(`📥 PR creation response:`, data)
      
      if (response.ok && data.success) {
        const prInfo = data.pull_request
        const successMessage = `🎉 Pull request created successfully!\n\n📝 PR #${prInfo.number}: ${prInfo.title}\n🔗 ${prInfo.url}`
        
        setSuccess(successMessage)
        
        // Update prStatuses state immediately
        setPrStatuses(prev => ({
          ...prev,
          [task.id]: {
            ...prInfo,
            created_at: new Date().toISOString()
          }
        }))
        
        // Also update the task in the tasks state to show PR info immediately
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? { 
                  ...t, 
                  result: {
                    ...t.result,
                    pull_request: prInfo
                  }
                }
              : t
          )
        )
        
        // Update selected task if it's the current one
        if (selectedTask?.id === task.id) {
          setSelectedTask(prevTask => ({
            ...prevTask!,
            result: {
              ...prevTask!.result,
              pull_request: prInfo
            }
          }))
        }
        
        // Refresh tasks from API to get updated PR info
        setTimeout(() => {
          loadTasks()
        }, 2000)
        
        console.log(`✅ PR created successfully: ${prInfo.url}`)
      } else {
        const errorMessage = data.error || 'Failed to create pull request'
        console.error(`❌ PR creation failed:`, errorMessage)
        setError(`❌ Failed to create PR: ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ PR creation error:', error)
      setError(`❌ Network error creating PR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCreatingPrForTask(null)
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

    if (!selectedRepo) {
      setError('Repository selection is required')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Use the Claude API for unified workflow
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          description: bugDescription,
          type: 'bug_fix',
          priority: 'high',
          repository: selectedRepo,
          context: 'Bug analysis and fix from Claude Code Dashboard'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Bug analysis and fix completed! Check the Tasks tab for results.')
        
        // Clear form
        setBugDescription('')
        
        // Refresh tasks to show the new comprehensive development task
        loadTasks()
        
        // Switch to tasks tab to show progress
        setActiveTab('tasks')
        
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
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retry_task',
          taskId: taskId
        })
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

  // Cancel task function
  const handleCancelTask = async (taskId: string) => {
    setCancellingTaskId(taskId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_task',
          taskId: taskId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Task cancelled successfully!')
        loadTasks() // Refresh task list
        
        // Clear streaming responses for cancelled task
        setStreamingTasks(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        setStreamingResponses(prev => {
          const newResponses = { ...prev }
          delete newResponses[taskId]
          return newResponses
        })
        
        // Close dialog if the cancelled task is currently selected
        if (selectedTask?.id === taskId) {
          setSelectedTask(null)
        }
      } else {
        setError(data.error || 'Failed to cancel task')
      }
    } catch (error) {
      setError('Failed to cancel task')
    } finally {
      setCancellingTaskId(null)
    }
  }

  // Delete task function
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    setDeletingTaskId(taskId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_task',
          taskId: taskId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Task deleted successfully!')
        // Remove the task from local state immediately
        setTasks(prev => prev.filter(t => t.id !== taskId))
        setPollingTaskIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        // Clear streaming responses for deleted task
        setStreamingTasks(prev => {
          const newSet = new Set(prev)
          newSet.delete(taskId)
          return newSet
        })
        setStreamingResponses(prev => {
          const newResponses = { ...prev }
          delete newResponses[taskId]
          return newResponses
        })
        // Close dialog if the deleted task is currently selected
        if (selectedTask?.id === taskId) {
          setSelectedTask(null)
        }
        return
      } else {
        setError(data.error || 'Failed to delete task')
      }
    } catch (error) {
      setError('Failed to delete task')
    } finally {
      setDeletingTaskId(null)
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

  // Add helper function to detect stuck tasks
  const isTaskStuck = (task: ClaudeTask): boolean => {
    if (task.status !== 'pending') return false
    
    const createdAt = new Date(task.created_at)
    const now = new Date()
    const timeDiff = now.getTime() - createdAt.getTime()
    const minutesElapsed = timeDiff / (1000 * 60)
    
    // Consider a task stuck if it's been pending for more than 5 minutes
    return minutesElapsed > 5
  }

  // Add helper function to get time elapsed since creation
  const getTimeElapsed = (task: ClaudeTask): string => {
    const createdAt = new Date(task.created_at)
    const now = new Date()
    const timeDiff = now.getTime() - createdAt.getTime()
    const minutesElapsed = Math.floor(timeDiff / (1000 * 60))
    
    if (minutesElapsed < 1) return 'Just now'
    if (minutesElapsed < 60) return `${minutesElapsed}m ago`
    
    const hoursElapsed = Math.floor(minutesElapsed / 60)
    if (hoursElapsed < 24) return `${hoursElapsed}h ago`
    
    const daysElapsed = Math.floor(hoursElapsed / 24)
    return `${daysElapsed}d ago`
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

  // Enhanced workflow status to handle stuck tasks
  const getWorkflowStatus = (task: ClaudeTask) => {
    const prStatus = prStatuses[task.id]
    const isStuck = isTaskStuck(task)
    
    if (task.status === 'failed') return { step: 'failed', label: 'Task Failed', color: 'text-red-600' }
    if (task.status === 'pending' && isStuck) return { step: 'stuck', label: 'Stuck - Needs Retry', color: 'text-amber-600' }
    if (task.status === 'pending') return { step: 'pending', label: 'Queued', color: 'text-yellow-600' }
    if (task.status === 'in_progress') return { step: 'processing', label: 'Processing...', color: 'text-blue-600' }
    if (task.status === 'completed' && !prStatus) return { step: 'ready_for_pr', label: 'Ready for PR', color: 'text-orange-600' }
    if (prStatus && !prStatus.merged) return { step: 'pr_created', label: 'PR Created', color: 'text-purple-600' }
    if (prStatus && prStatus.merged) return { step: 'merged', label: 'Merged', color: 'text-green-600' }
    return { step: 'unknown', label: 'Unknown', color: 'text-gray-600' }
  }

  // Enhanced status icon to show stuck tasks
  const getEnhancedStatusIcon = (task: ClaudeTask) => {
    const isStuck = isTaskStuck(task)
    
    if (task.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (task.status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    } else if (task.status === 'pending' && isStuck) {
      return <AlertCircle className="h-4 w-4 text-amber-500" />
    } else if (task.status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" />
    } else if (task.status === 'in_progress') {
      return <Clock className="h-4 w-4 text-blue-500" />
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const clearBugAnalysisForm = () => {
    setBugDescription('')
    setSelectedRepo('')
  }

  // DYNAMIC WORKFLOW STEPS HELPER
  const renderDynamicWorkflowSteps = (task: ClaudeTask) => {
    // Always prefer backend steps if available and not empty
    if (task.steps && task.steps.length > 0) {
      return (
        <div className="space-y-2">
          {task.steps.map((step, index) => (
            <div 
              key={step.id ? `${step.id}-${index}` : `step-${index}`}
              className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                step.status === 'completed' ? 'bg-green-100' : 
                step.status === 'running' || step.status === 'in_progress' ? 'bg-blue-100' : 
                step.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step.status === 'running' || step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                step.status === 'completed' ? 'bg-green-500 text-white' :
                step.status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-300'
              }`}>
                {(step.status === 'running' || step.status === 'in_progress') ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : step.status === 'completed' ? (
                  <CheckCircle className="h-3 w-3" />
                ) : step.status === 'failed' ? (
                  <AlertCircle className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-sm flex-1">{step.title || step.name}</span>
              {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              {(step.status === 'running' || step.status === 'in_progress') && (
                <div className="flex items-center gap-1 ml-auto">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <span className="text-xs text-blue-600">Processing...</span>
                </div>
              )}
              {step.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500 ml-auto" />}
            </div>
          ))}
        </div>
      )
    }

    // Enhanced fallback workflow with consistent styling to match backend steps
    const defaultSteps = [
      { id: 'analyze', name: '📊 Analyze repository structure and patterns', threshold: 0 },
      { id: 'identify', name: '🔍 Identify implementation requirements', threshold: 20 },
      { id: 'branch', name: '🌿 Create a feature branch', threshold: 40 },
      { id: 'generate', name: `⚡ Generate context-aware ${task.type === 'bug_fix' ? 'bug fix' : 'feature'} code`, threshold: 60 },
      { id: 'test', name: `🧪 Generate tests to validate the ${task.type === 'bug_fix' ? 'fix' : 'implementation'}`, threshold: 80 },
      { id: 'pr', name: '📋 Create pull request for review', threshold: 100 },
      { id: 'merge', name: '✅ Review and merge when ready', threshold: 101 }
    ]

    return (
      <div className="space-y-2">
        {defaultSteps.map((step, index) => {
          const isActive = task.progress >= step.threshold
          const isProcessing = task.status !== 'completed' && task.status !== 'failed' && 
                              task.progress >= step.threshold && task.progress < (defaultSteps[index + 1]?.threshold || 101)
          const isCompleted = step.id === 'pr' ? (task.status === 'completed' && task.result?.pull_request) :
                             step.id === 'merge' ? prStatuses[task.id]?.merged :
                             task.progress > step.threshold

          return (
            <div 
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                isCompleted ? 'bg-green-100' : 
                isProcessing ? 'bg-blue-100' : 
                isActive ? 'bg-yellow-100' : 'bg-gray-100'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isCompleted ? 'bg-green-500 text-white' :
                isProcessing ? 'bg-blue-500 text-white' :
                isActive ? 'bg-yellow-500 text-white' : 'bg-gray-300'
              }`}>
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-sm flex-1">{step.name}</span>
              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              {isProcessing && (
                <div className="flex items-center gap-1 ml-auto">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <span className="text-xs text-blue-600">Processing...</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Helper function to check if PR exists for a task
  const hasPullRequest = (task: ClaudeTask): boolean => {
    // Check task result (from backend update)
    if (task.result?.pull_request) {
      return true
    }
    
    // Check prStatuses state (from button click)
    if (prStatuses[task.id]?.url) {
      return true
    }
    
    return false
  }

  // Get PR info from either source
  const getPullRequestInfo = (task: ClaudeTask) => {
    return task.result?.pull_request || prStatuses[task.id] || null
  }

  // Debug: log when selectedTask changes (for modal open)
  useEffect(() => {
    if (selectedTask) {
      console.log('[DEBUG] Modal rendered for selectedTask:', selectedTask)
    }
  }, [selectedTask])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Usage Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-500" />
              Claude Code Assistant
            </h1>
            <p className="text-gray-600 mt-1">AI-powered code generation and analysis</p>
          </div>
          
          {/* Usage Indicator */}
          <div className="flex items-center gap-4">
            {usage && (
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Daily Usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {usage.projectsToday}/{usage.dailyLimit}
                    </span>
                    <Badge variant={usage.remainingProjects > 0 ? 'default' : 'destructive'}>
                      {usage.remainingProjects} left
                    </Badge>
                  </div>
                  <div className="w-16">
                    <Progress value={usage.percentageUsed} className="h-2" />
                  </div>
                </div>
              </Card>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/usage-dashboard'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Usage
            </Button>
          </div>
        </div>

        {/* Task Creation Modal */}
        <Dialog open={showTaskCreationModal} onOpenChange={setShowTaskCreationModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Task Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Your Claude task has been created and queued for processing.
              </DialogDescription>
            </DialogHeader>
            
            {taskCreationSuccess && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{taskCreationSuccess.type}</Badge>
                    <Badge variant="secondary">{taskCreationSuccess.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{taskCreationSuccess.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Created: {new Date(taskCreationSuccess.created_at).toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Task queued for processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">Analysis will begin shortly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-500">You'll be notified when complete</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTaskCreationModal(false)}
              >
                Close
              </Button>
              <Button onClick={() => {
                setShowTaskCreationModal(false)
                // Switch to Tasks tab
                const el = document.querySelector('[data-value="tasks"]')
                if (el instanceof HTMLElement && typeof el.click === 'function') {
                  el.click()
                }
              }}>
                View Tasks
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 whitespace-pre-wrap">
              {error}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="ml-auto h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 whitespace-pre-wrap">
              {success}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess('')}
              className="ml-auto h-6 w-6 p-0 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Mobile-Friendly Notifications */}
        {(isLoadingRepositories || repositoryError || showTimeoutWarning) && (
          <div className="mb-4">
            {isLoadingRepositories && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <span className="font-medium">Loading GitHub repositories...</span>
                  {repositoryRetryCount > 0 && (
                    <span className="block text-sm mt-1">Retry attempt {repositoryRetryCount}/3</span>
                  )}
                  {showTimeoutWarning && (
                    <span className="block text-sm mt-1 text-amber-700">
                      ⚠️ Taking longer than usual. This is normal on slower connections.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {showTimeoutWarning && !isLoadingRepositories && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <span className="font-medium">Repository loading is taking longer than expected</span>
                  <span className="block text-sm mt-1">
                    This might be due to a slow internet connection or GitHub API delays. 
                    The request will continue for up to 30 seconds.
                  </span>
                </AlertDescription>
              </Alert>
            )}
            
            {repositoryError && !isLoadingRepositories && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <span className="font-medium">Repository loading failed:</span>
                  <span className="block text-sm mt-1">{repositoryError}</span>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRepositoryRetryCount(0)
                        loadRepositories()
                      }}
                      disabled={isLoadingRepositories}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = '/admin/integrations'}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Check Connection
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="tabs-mobile-container tabs-scroll-container mb-4">
            <TabsList className="tabs-mobile-list">
              <TabsTrigger value="overview" className="tab-trigger-mobile">
                <Search className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="tab-trigger-mobile">
                <Code className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Tasks</span>
                <span className="sm:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="analyze" className="tab-trigger-mobile">
                <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Code Analysis</span>
                <span className="sm:hidden">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="bugs" className="tab-trigger-mobile">
                <Bug className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Bug Detection</span>
                <span className="sm:hidden">Bugs</span>
              </TabsTrigger>
              <TabsTrigger value="repositories" className="tab-trigger-mobile">
                <Github className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Repositories</span>
                <span className="sm:hidden">Repos</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
                  const isStuck = isTaskStuck(task)
                  const timeElapsed = getTimeElapsed(task)
                  return (
                    <div key={task.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        {getEnhancedStatusIcon(task)}
                        <div>
                          <p className="font-medium">{task.description}</p>
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
                            <span className="text-xs text-gray-500">{getTimeElapsed(task)}</span>
                            {isStuck && (
                              <span className="text-xs text-amber-600 font-medium">STUCK!</span>
                            )}
                          </div>
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
                        {isStuck && (
                          <Button size="sm" variant="outline" onClick={() => handleRetryTask(task.id)}>
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Retry
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
                    <Label htmlFor="description">What do you want Claude to implement or fix?</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your feature, bug, or request..."
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreateTask} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Task...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Create Task
                      </>
                    )}
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
                                {getEnhancedStatusIcon(task)}
                              </div>
                            </div>
                            
                            {/* Always show progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{task.progress || 0}%</span>
                              </div>
                              <Progress value={task.progress || 0} className="h-2" />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Created: {task.created_at ? new Date(task.created_at).toLocaleString() : 'Unknown'}
                              </span>
                              {/* Task Action Buttons */}
                              <div className="flex gap-2">
                                {/* Create PR Button */}
                                {task.status === 'completed' && !hasPullRequest(task) && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleCreatePR(task)} 
                                    disabled={isLoading || creatingPrForTask === task.id}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {creatingPrForTask === task.id ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Creating PR...
                                      </>
                                    ) : (
                                      <>
                                        <GitPullRequest className="h-3 w-3 mr-1" />
                                        Create PR
                                      </>
                                    )}
                                  </Button>
                                )}

                                {/* PR Status Display */}
                                {hasPullRequest(task) && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <GitPullRequest className="h-3 w-3 mr-1" />
                                      PR Created
                                    </Badge>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => {
                                        const prInfo = getPullRequestInfo(task)
                                        if (prInfo?.url) {
                                          window.open(prInfo.url, '_blank')
                                        }
                                      }}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View PR
                                    </Button>
                                  </div>
                                )}

                                {/* Cancel Button - for running tasks */}
                                {(task.status === 'pending' || task.status === 'analyzing' || task.status === 'planning' || task.status === 'executing' || task.status === 'reviewing') && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleCancelTask(task.id)}
                                    disabled={cancellingTaskId === task.id}
                                  >
                                    {cancellingTaskId === task.id ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Cancel
                                      </>
                                    )}
                                  </Button>
                                )}

                                {/* Retry Button - for stuck pending tasks */}
                                {task.status === 'pending' && isTaskStuck(task) && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleRetryTask(task.id)}
                                    className="text-amber-600 border-amber-600 hover:bg-amber-50"
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Retry Stuck Task
                                  </Button>
                                )}

                                {/* Retry Button - for failed tasks */}
                                {task.status === 'failed' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleRetryTask(task.id)}
                                  >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Retry
                                  </Button>
                                )}

                                {/* Delete Button - for completed/failed/cancelled tasks */}
                                {(task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={deletingTaskId === task.id}
                                  >
                                    {deletingTaskId === task.id ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                )}

                                {/* View Details Button */}
                                <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
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
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Bug Analysis & Fix
                </CardTitle>
                <CardDescription>
                  Select a repository and describe the bug or paste a stack trace. The AI will analyze the issue, create a fix, and prepare a pull request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bugRepository">Repository *</Label>
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
                  <Label htmlFor="bugDescription">Bug Description or Stack Trace *</Label>
                  <Textarea
                    id="bugDescription"
                    placeholder="Describe the bug in natural language or paste the stack trace/error message here..."
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 You can paste error messages, stack traces, or describe the bug in plain English
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAnalyzeBug} disabled={isLoading} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? 'Analyzing & Fixing Bug...' : 'Analyze & Fix Bug'}
                  </Button>
                  <Button onClick={clearBugAnalysisForm} variant="outline" disabled={isLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4" />
                    Unified Workflow
                  </h3>
                  <p className="text-sm text-gray-700">
                    This follows the same workflow as feature requests:
                  </p>
                  <ol className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>1. 📊 Analyze repository structure and patterns</li>
                    <li>2. 🔍 Identify root cause and affected files</li>
                    <li>3. 🌿 Create a feature branch for the fix</li>
                    <li>4. ⚡ Generate context-aware bug fix code</li>
                    <li>5. 🧪 Generate tests to validate the fix</li>
                    <li>6. 📋 Create pull request for review</li>
                    <li>7. ✅ Review and merge when ready</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repositories" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>Repositories available for Claude AI operations</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {lastRepositoryLoadTime && (
                      <span className="text-xs text-gray-500">
                        Last updated: {new Date(lastRepositoryLoadTime).toLocaleTimeString()}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadRepositories()}
                      disabled={isLoadingRepositories}
                      className="flex items-center space-x-1"
                    >
                      {isLoadingRepositories ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          <span>Refresh</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Loading State */}
                {isLoadingRepositories && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Loading repositories...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {repositoryRetryCount > 0 ? `Retry attempt ${repositoryRetryCount}/3` : 'Connecting to GitHub'}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {repositoryError && !isLoadingRepositories && (
                  <div className="text-center py-6">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 font-medium mb-2">Failed to load repositories</p>
                    <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">{repositoryError}</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          setRepositoryRetryCount(0)
                          loadRepositories()
                        }}
                        disabled={isLoadingRepositories}
                        className="flex items-center space-x-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Try Again</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/admin/integrations'}
                        className="flex items-center space-x-1"
                      >
                        <Settings className="h-3 w-3" />
                        <span>Check GitHub Connection</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingRepositories && !repositoryError && repositories.length === 0 && (
                  <div className="text-center py-6">
                    <Github className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No repositories connected</p>
                    <p className="text-sm text-gray-400 mb-4">Connect your GitHub account to get started</p>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = '/admin/integrations'}
                      className="flex items-center space-x-1"
                    >
                      <Github className="h-3 w-3" />
                      <span>Connect GitHub</span>
                    </Button>
                  </div>
                )}

                {/* Success State - Repositories List */}
                {!isLoadingRepositories && !repositoryError && repositories.length > 0 && (
                  <div className="space-y-4">
                    {/* Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">
                          {repositories.length} repository{repositories.length !== 1 ? 'ies' : 'y'} loaded successfully
                        </span>
                      </div>
                    </div>

                    {/* Repositories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repositories.map((repo) => (
                        <div key={repo.fullName} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{repo.name}</h4>
                              <p className="text-sm text-gray-500 truncate">{repo.fullName}</p>
                              {repo.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{repo.description}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                {repo.language && (
                                  <Badge variant="outline" className="text-xs">
                                    {repo.language}
                                  </Badge>
                                )}
                                <Badge variant={repo.private ? 'secondary' : 'outline'} className="text-xs">
                                  {repo.private ? 'Private' : 'Public'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between">
                            <Button size="sm" variant="outline" asChild>
                              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                                <Github className="h-3 w-3" />
                                <span>View on GitHub</span>
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRepo(repo.fullName)}
                              className="flex items-center space-x-1"
                            >
                              <Code className="h-3 w-3" />
                              <span>Use for AI</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Task Details Dialog */}
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Task Details: {selectedTask.description}
                </DialogTitle>
                <DialogDescription>
                  Complete workflow status and generated code review
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[75vh]">
                <div className="space-y-6">
                  {/* Workflow Progress Steps */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Unified Workflow Progress
                    </h3>
                    {renderDynamicWorkflowSteps(selectedTask)}
                  </div>

                  {/* Streaming Response Window */}
                  {(streamingTasks.has(selectedTask.id) || streamingResponses[selectedTask.id] || (pollingTaskIds.has(selectedTask.id))) && (
                    <StreamingResponseWindow
                      isStreaming={streamingTasks.has(selectedTask.id) || pollingTaskIds.has(selectedTask.id)}
                      content={streamingResponses[selectedTask.id] || ''}
                      title={`${selectedTask.type === 'bug_fix' ? 'Bug Fix' : 'Code Generation'} Progress`}
                      className="mx-0"
                    />
                  )}

                  {/* Current Status */}
                  {selectedTask.status === 'pending' && (
                    <div className={`mt-3 p-3 rounded-lg ${isTaskStuck(selectedTask) ? 'bg-amber-100' : 'bg-yellow-100'}`}>
                      <p className={`text-sm ${isTaskStuck(selectedTask) ? 'text-amber-800' : 'text-yellow-800'}`}>
                        {isTaskStuck(selectedTask) ? (
                          <>
                            ⚠️ Task appears stuck (pending for {getTimeElapsed(selectedTask)}). 
                            <br />
                            Click "Retry Stuck Task" to restart processing.
                          </>
                        ) : (
                          <>
                            ⏳ Task is queued and waiting to start processing...
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedTask.status === 'in_progress' && (
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800">
                        🔄 Task is currently being processed by the AI...
                      </p>
                    </div>
                  )}
                  {selectedTask.status === 'failed' && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <p className="text-sm text-red-800">
                        ❌ Task failed. Check logs or retry the task.
                      </p>
                    </div>
                  )}

                  {/* Branch and Repository Status */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Branch & Repository Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Repository:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedTask.repository ? (
                            <>
                              <Badge variant="outline">
                                <Github className="h-3 w-3 mr-1" />
                                {selectedTask.repository.owner}/{selectedTask.repository.name}
                              </Badge>
                              <Button size="sm" variant="outline" asChild>
                                <a 
                                  href={`https://github.com/${selectedTask.repository.owner}/${selectedTask.repository.name}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Repo
                                </a>
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Repository information not available</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Feature Branch:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedTask.result?.branch_name ? (
                            <>
                              <Badge variant="outline" className="bg-green-50">
                                <GitBranch className="h-3 w-3 mr-1" />
                                {selectedTask.result.branch_name}
                              </Badge>
                              {selectedTask.repository && (
                                <Button size="sm" variant="outline" asChild>
                                  <a 
                                    href={`https://github.com/${selectedTask.repository.owner}/${selectedTask.repository.name}/tree/${selectedTask.result.branch_name}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View Branch
                                  </a>
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              {selectedTask.status === 'pending' ? 'Branch will be created during processing' : 
                               selectedTask.status === 'in_progress' ? 'Branch being created...' : 
                               'No branch created yet'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Pull Request Status */}
                    {hasPullRequest(selectedTask) && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <span className="text-sm font-medium text-gray-600">Pull Request:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-purple-50">
                            <GitPullRequest className="h-3 w-3 mr-1" />
                            PR #{getPullRequestInfo(selectedTask)?.number}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <a href={getPullRequestInfo(selectedTask)?.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View PR
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generated Code Results */}
                  {selectedTask.result && (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Generated Code
                      </h3>
                      
                      {/* Files to Create */}
                      {selectedTask.result.implementation?.files_to_create?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Files to Create:</h4>
                          {selectedTask.result.implementation.files_to_create.map((file: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm text-blue-600">{file.path}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleFileExpansion(`create-${file.path}`)}
                                  className="h-6 px-2"
                                >
                                  {expandedFiles.has(`create-${file.path}`) ? 'Hide' : 'Show'} Code
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                              {expandedFiles.has(`create-${file.path}`) && (
                                <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                  <pre>{file.content}</pre>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(file.content)}
                                    className="mt-2 h-6 px-2 text-xs"
                                  >
                                    Copy Code
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Files to Modify */}
                      {selectedTask.result.implementation?.files_to_modify?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Files to Modify:</h4>
                          {selectedTask.result.implementation.files_to_modify.map((file: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm text-orange-600">{file.path}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleFileExpansion(`modify-${file.path}`)}
                                  className="h-6 px-2"
                                >
                                  {expandedFiles.has(`modify-${file.path}`) ? 'Hide' : 'Show'} Changes
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{file.description}</p>
                              {expandedFiles.has(`modify-${file.path}`) && (
                                <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                  <pre>{file.changes}</pre>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(file.changes)}
                                    className="mt-2 h-6 px-2 text-xs"
                                  >
                                    Copy Changes
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tests */}
                      {selectedTask.result.tests?.unit_tests?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Unit Tests:</h4>
                          {selectedTask.result.tests.unit_tests.map((test: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-sm text-green-600">{test.file_path}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleFileExpansion(`test-${test.file_path}`)}
                                  className="h-6 px-2"
                                >
                                  {expandedFiles.has(`test-${test.file_path}`) ? 'Hide' : 'Show'} Tests
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                              {expandedFiles.has(`test-${test.file_path}`) && (
                                <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                  <pre>{test.content}</pre>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(test.content)}
                                    className="mt-2 h-6 px-2 text-xs"
                                  >
                                    Copy Tests
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Validation Steps */}
                      {selectedTask.result.validation_steps?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700">Validation Steps:</h4>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {selectedTask.result.validation_steps.map((step: string, index: number) => (
                                <li key={index} className="text-gray-700">{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedTask.status === 'completed' && selectedTask.result && !hasPullRequest(selectedTask) && (
                      <Button
                        onClick={() => handleCreatePR(selectedTask)}
                        disabled={creatingPrForTask === selectedTask.id}
                        className="flex items-center gap-2"
                      >
                        {creatingPrForTask === selectedTask.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating PR...
                          </>
                        ) : (
                          <>
                            <GitPullRequest className="h-4 w-4" />
                            Create Pull Request
                          </>
                        )}
                      </Button>
                    )}
                    
                    {isTaskStuck(selectedTask) && (
                      <Button
                        variant="outline"
                        onClick={() => handleRetryTask(selectedTask.id)}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Retry Stuck Task
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => handleCancelTask(selectedTask.id)}
                      disabled={cancellingTaskId === selectedTask.id}
                      className="flex items-center gap-2"
                    >
                      {cancellingTaskId === selectedTask.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Cancel Task
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteTask(selectedTask.id)}
                      disabled={deletingTaskId === selectedTask.id}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      {deletingTaskId === selectedTask.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Task
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}