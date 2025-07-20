"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Github,
  Trello,
  FileText,
  Calendar,
  Database,
  Globe,
  Slack,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink,
  Plus,
  Zap,
  Users,
  Cloud,
  Clock,
  Sparkles,
} from "lucide-react"
import SlackOAuthButton from "./slack-oauth-button"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "development" | "communication" | "documentation" | "project-management"
  status: "connected" | "disconnected" | "error" | "coming-soon"
  features: string[]
  setupRequired: boolean
  vercelIntegration?: boolean
}

interface IntegrationConfig {
  [key: string]: {
    enabled: boolean
    settings: Record<string, any>
  }
}

export function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  // Integration configurations
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig>({
    github: {
      enabled: false,
      settings: {
        connected: false,
        username: "",
        defaultOwner: "",
        selectedRepo: null,
        repositories: [],
        autoCreateRepo: true,
        generateReadme: true,
        defaultBranch: "main",
        visibility: "private",
        includeTemplates: true,
        createProjectBoard: false,
        enableCodeGeneration: true,
        enableIssueSync: true,
      },
    },
    "github-projects": {
      enabled: false,
      settings: {
        connected: false,
        ownerId: "",
        projectTitle: "",
        repositoryOwner: "",
        repositoryName: "",
        includeIssues: true,
        includeCustomFields: true,
        autoCreateMilestones: true,
        defaultPriority: "medium",
        enableLabels: true,
      },
    },
    claude: {
      enabled: false,
      status: "disconnected",
      settings: {
        connected: false,
        apiKey: "",
        model: "claude-3-5-sonnet-20241022",
        enableCodeAnalysis: true,
        enableAgenticCode: true,
        enableGitHubIntegration: true,
        autoCreatePRs: false,
        maxTokens: 200000,
        temperature: 0.1,
      },
    },
    slack: {
      enabled: false,
      settings: {
        connected: false,
        workspaceId: "",
        workspaceName: "",
        defaultChannel: "#general",
        clientId: "",
        setupCompleted: false,
      },
    },
    notion: {
      enabled: false,
      settings: {
        workspace: "",
        database: "",
        autoSync: true,
        templateFormat: "blocks",
      },
    },
    linear: {
      enabled: false,
      settings: {
        team: "",
        project: "",
        autoCreateIssues: true,
        priority: "medium",
      },
    },
    jira: {
      enabled: false,
      status: "disconnected",
      settings: {
        connected: false,
        url: "",
        projectKey: "",
        email: "",
        apiToken: "",
        autoCreate: true,
        issueTypes: [],
        defaultIssueType: "Task",
        createEpics: true,
        linkIssues: true,
      },
    },
    confluence: {
      enabled: false,
      status: "disconnected",
      settings: {
        connected: false,
        url: "",
        spaceKey: "",
        email: "",
        apiToken: "",
        parentPageId: "",
        createPageHierarchy: true,
        includeMetadata: true,
      },
    },
    clickup: {
      enabled: false,
      status: "disconnected",
      settings: {
        connected: false,
        apiToken: "",
        teamId: "",
        spaceId: "",
        folderId: "",
        listId: "",
        autoCreateTasks: true,
        taskPriority: "normal",
        assignees: [],
        createSubtasks: true,
        syncStatus: true,
        enableTimeTracking: false,
        customFields: [],
      },
    },
    trello: {
      enabled: false,
      status: "disconnected",
      settings: {
        connected: false,
        apiKey: "",
        token: "",
        boardId: "",
        lists: [],
        autoCreateCards: true,
        cardLabels: [],
        defaultList: "",
        assignMembers: true,
        dueDateSync: true,
        enableChecklists: true,
        memberMapping: {},
      },
    },
  })

  useEffect(() => {
    setIsMounted(true)
    
    // SECURITY FIX: Clear any existing localStorage configurations to prevent cross-user sharing
    if (typeof window !== 'undefined') {
      localStorage.removeItem('integrationConfigs')
    }
    
    // SECURITY FIX: Clear any existing global GitHub cookies to ensure user isolation
    const clearGlobalGitHubCookies = async () => {
      try {
        await fetch('/api/auth/github/clear-cookies', {
          method: 'POST',
          credentials: 'include'
        })
        console.log('🧹 Cleared any existing global GitHub cookies for user isolation')
      } catch (error) {
        console.warn('Could not clear GitHub cookies:', error)
      }
    }
    
    clearGlobalGitHubCookies()
    
    // Load all configurations from secure database APIs
    loadGitHubConfigFromDatabase()
    loadClaudeConfigFromDatabase()
    loadSlackConfigFromDatabase()
  }, [])

  // Load GitHub configuration from database
  const loadGitHubConfigFromDatabase = async () => {
    try {
      const response = await fetch('/api/auth/github/config', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const config = await response.json()
        
        // Update GitHub integration state with database config
        setIntegrationConfigs((prev) => ({
          ...prev,
          github: {
            enabled: config.connected,
            settings: {
              connected: config.connected,
              username: config.username,
              defaultOwner: config.username,
              repositories: config.repositories || [],
              ...config.settings,
            },
          },
        }))
        
        // IMMEDIATELY auto-populate GitHub Projects if connected and username is available
        if (config.connected && config.username) {
          setIntegrationConfigs((prev) => ({
            ...prev,
            'github-projects': {
              ...prev['github-projects'],
              settings: {
                ...prev['github-projects']?.settings,
                ownerId: config.username,
                repositoryOwner: config.username,
                connected: true,
              },
            },
          }))
        }
        
        console.log('✅ GitHub config loaded from database:', config.connected ? 'Connected' : 'Disconnected')
      }
    } catch (error) {
      console.error('Error loading GitHub config from database:', error)
      // Fall back to checking token status
      checkGitHubConnection()
    }
  }

  // Load Claude configuration from database (secure, user-specific)
  const loadClaudeConfigFromDatabase = async () => {
    try {
      const response = await fetch('/api/claude-config', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update Claude integration state with database config
        setIntegrationConfigs((prev) => ({
          ...prev,
          claude: {
            enabled: data.connected,
            status: data.connected ? "connected" : "disconnected",
            settings: {
              connected: data.connected,
              apiKey: data.connected ? '***hidden***' : '', // Never expose actual key
              model: data.usageLimits?.model || 'claude-3-5-sonnet-20241022',
              enableCodeAnalysis: true,
              enableAgenticCode: true,
              enableGitHubIntegration: true,
              autoCreatePRs: false,
              maxTokens: 200000,
              temperature: 0.1,
            },
          },
        }))
        
        console.log('✅ Claude config loaded from database:', data.connected ? 'Connected' : 'Disconnected')
      }
    } catch (error) {
      console.error('Error loading Claude config from database:', error)
      // Set as disconnected if can't load
      setIntegrationConfigs((prev) => ({
        ...prev,
        claude: {
          ...prev.claude,
          enabled: false,
          status: "disconnected",
          settings: {
            ...prev.claude?.settings,
            connected: false,
          },
        },
      }))
    }
  }

  // Load Slack configuration from database (secure, user-specific)
  const loadSlackConfigFromDatabase = async () => {
    try {
      const response = await fetch('/api/user-integrations/slack', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const config = await response.json()
        
        // Update Slack integration state with database config
        setIntegrationConfigs((prev) => ({
          ...prev,
          slack: {
            enabled: config.isConnected,
            settings: {
              connected: config.isConnected,
              workspaceId: config.workspace?.id || '',
              workspaceName: config.workspace?.name || '',
              defaultChannel: config.workspace?.defaultChannel || '#general',
              setupCompleted: config.isConnected,
            },
          },
        }))
        
        console.log('✅ Slack config loaded from database:', config.isConnected ? 'Connected' : 'Disconnected')
      }
    } catch (error) {
      console.error('Error loading Slack config from database:', error)
      // Set as disconnected if can't load
      setIntegrationConfigs((prev) => ({
        ...prev,
        slack: {
          ...prev.slack,
          enabled: false,
          settings: {
            ...prev.slack?.settings,
            connected: false,
          },
        },
      }))
    }
  }

  // Save GitHub configuration to database
  const saveGitHubConfigToDatabase = async (username: string, repositories: any[], permissions: any) => {
    try {
      const response = await fetch('/api/auth/github/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          repositories,
          permissions,
          settings: integrationConfigs.github?.settings || {},
        }),
      })
      
      if (response.ok) {
        console.log('✅ GitHub config saved to database')
      } else {
        console.error('Failed to save GitHub config to database')
      }
    } catch (error) {
      console.error('Error saving GitHub config to database:', error)
    }
  }

  // Handle refresh parameter from OAuth redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refresh = urlParams.get('refresh')
      
      if (refresh === 'github') {
        console.log('🔄 GitHub OAuth redirect detected, refreshing connection status...')
        
        // Clear the refresh parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Force re-check GitHub connection with delay to ensure backend is ready
        setTimeout(() => {
          console.log('🔍 Checking GitHub connection after OAuth...')
          checkGitHubConnection()
        }, 1500) // Increased delay to ensure APIs are ready
      }
    }
  }, [isMounted])

  // Add effect to monitor GitHub config changes and auto-populate GitHub Projects
  useEffect(() => {
    console.log('🔄 GitHub integration config updated:', {
      enabled: integrationConfigs.github?.enabled,
      connected: integrationConfigs.github?.settings?.connected,
      username: integrationConfigs.github?.settings?.username
    })
    
    // Auto-populate GitHub Projects when GitHub gets connected
    if (integrationConfigs.github?.settings?.connected && integrationConfigs.github?.settings?.username) {
      if (!integrationConfigs['github-projects']?.settings?.ownerId) {
        updateIntegrationSetting('github-projects', 'ownerId', integrationConfigs.github.settings.username)
        updateIntegrationSetting('github-projects', 'repositoryOwner', integrationConfigs.github.settings.username)
        updateIntegrationSetting('github-projects', 'connected', true)
        console.log('✅ Auto-populated GitHub Projects with username:', integrationConfigs.github.settings.username)
      }
    }
  }, [integrationConfigs.github])
  
  // Function to check if GitHub token exists and update connection status
  const checkGitHubConnection = async () => {
    try {
      // Use our backend API to check GitHub connection status
      const response = await fetch('/api/auth/github/status', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.connected && data.user) {
          // Update integration state to reflect successful connection
          updateIntegrationSetting('github', 'connected', true)
          updateIntegrationSetting('github', 'username', data.user.login)
          updateIntegrationSetting('github', 'defaultOwner', data.user.login)
          updateIntegrationSetting('github', 'repositories', data.repositories || [])
          
          // AUTO-POPULATE GitHub Projects with the same username
          updateIntegrationSetting('github-projects', 'ownerId', data.user.login)
          updateIntegrationSetting('github-projects', 'connected', true)
          
          // Enable the integration
          setIntegrationConfigs((prev) => ({
            ...prev,
            github: {
              ...prev.github,
              enabled: true,
            },
          }))
          
          // Save configuration to database
          await fetch('/api/auth/github/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              username: data.user.login,
              repositories: data.repositories || [],
              permissions: {
                "issues": "write",
                "pull_requests": "write",
                "contents": "write"
              },
              settings: integrationConfigs.github?.settings || {},
            }),
          })
          
          console.log(`✅ GitHub already connected as ${data.user.login}`)
        } else {
          console.log('GitHub not connected:', data.message)
        }
      }
    } catch (error) {
      // Token doesn't exist or is invalid - keep as disconnected
      console.log('No existing GitHub connection found:', error)
    }
  }
  
  // SECURITY FIX: No longer saving configurations to localStorage - all configs are now database-backed

  // Available integrations
  const integrations: Integration[] = [
    {
      id: "github",
      name: "GitHub",
      description: "Auto-create repositories, README files, and project structure",
      icon: <Github className="h-6 w-6" />,
      category: "development",
      status: integrationConfigs.github?.settings?.connected ? "connected" : "disconnected",
      features: ["Repository Creation", "README Generation", "Issue Templates", "Project Boards"],
      setupRequired: true,
      vercelIntegration: true,
    },
    {
      id: "github-projects",
      name: "GitHub Projects",
      description: "Create comprehensive project boards from SDLC documentation",
      icon: <Github className="h-6 w-6" />,
      category: "development",
      status: integrationConfigs.github?.settings?.connected ? "connected" : "disconnected",
      features: ["Project Creation", "Issue Generation", "Milestone Management", "Custom Fields", "SDLC Integration"],
      setupRequired: true,
      vercelIntegration: false,
    },
    {
      id: "claude",
      name: "Claude AI",
      description: "Advanced AI coding assistance with agentic workflows",
      icon: <Sparkles className="h-6 w-6" />,
      category: "development",
      status: integrationConfigs.claude?.settings?.connected ? "connected" : "disconnected",
      features: ["Code Analysis", "Bug Detection", "Feature Implementation", "Test Generation", "Agentic Workflows"],
      setupRequired: true,
      vercelIntegration: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "AI assistant bot with slash commands and notifications",
      icon: <Slack className="h-6 w-6" />,
      category: "communication",
      status: integrationConfigs.slack?.settings?.connected ? "connected" : "disconnected",
      features: ["Slash Commands", "Task Creation", "Status Updates", "Interactive Messages", "Parallel Processing"],
      setupRequired: true,
      vercelIntegration: false,
    },
    {
      id: "clickup",
      name: "ClickUp",
      description: "Comprehensive project management and team collaboration",
      icon: <Calendar className="h-6 w-6" />,
      category: "project-management",
      status: integrationConfigs.clickup?.status || "disconnected",
      features: ["Task Management", "Time Tracking", "Custom Fields", "Subtasks", "Team Collaboration"],
      setupRequired: true,
      vercelIntegration: false,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Visual project management with boards and cards",
      icon: <Trello className="h-6 w-6" />,
      category: "project-management", 
      status: integrationConfigs.trello?.status || "disconnected",
      features: ["Board Management", "Card Creation", "Lists", "Labels", "Member Assignment"],
      setupRequired: true,
      vercelIntegration: false,
    },
    {
      id: "asana",
      name: "Asana",
      description: "Team project and task management platform",
      icon: <Calendar className="h-6 w-6" />,
      category: "project-management",
      status: "coming-soon",
      features: ["Task Creation", "Project Templates", "Timeline View", "Team Collaboration"],
      setupRequired: true,
    },
    {
      id: "azure-devops",
      name: "Azure DevOps",
      description: "Microsoft's complete DevOps solution",
      icon: <Cloud className="h-6 w-6" />,
      category: "development",
      status: "coming-soon",
      features: ["Work Items", "Repository Integration", "Pipeline Triggers", "Board Sync"],
      setupRequired: true,
    },
    {
      id: "google-workspace",
      name: "Google Workspace",
      description: "Google Docs, Sheets, and Drive integration",
      icon: <Globe className="h-6 w-6" />,
      category: "documentation",
      status: "coming-soon",
      features: ["Document Creation", "Sheet Export", "Drive Storage", "Real-time Editing"],
      setupRequired: true,
    },
  ]

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === "all" || integration.category === activeTab
    return matchesSearch && matchesCategory
  })

  // Toggle integration
  const toggleIntegration = (integrationId: string) => {
    setIntegrationConfigs((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        enabled: !prev[integrationId]?.enabled,
      },
    }))
  }

  // Update integration setting
  const updateIntegrationSetting = (integrationId: string, setting: string, value: any) => {
    setIntegrationConfigs((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        settings: {
          ...prev[integrationId]?.settings,
          [setting]: value,
        },
      },
    }))
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "coming-soon":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  // Claude configuration handlers (now using secure database storage)
  const handleClaudeConnect = async () => {
    const apiKey = prompt('Enter your Claude API key:')
    if (!apiKey || !apiKey.trim()) return
    
    try {
      // Save to database with test connection
      const response = await fetch('/api/claude-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          selectedModel: 'claude-3-5-sonnet-20241022',
          enableGitHubIntegration: true,
          testConnection: true
        })
      })
      
      const result = await response.json()
        
      if (result.success) {
        // Update integration state
        setIntegrationConfigs((prev) => ({
          ...prev,
          claude: {
            ...prev.claude,
            enabled: true,
            status: "connected",
            settings: {
              ...prev.claude?.settings,
              connected: true,
              apiKey: '***hidden***', // Don't store actual key in UI state
            }
          },
        }))
        
        alert('✅ Successfully connected to Claude AI!')
      } else {
        throw new Error(result.error || 'Invalid API key')
      }
    } catch (error) {
      console.error('Claude connection error:', error)
      alert('❌ Failed to connect to Claude. Please check your API key.')
    }
  }
  
  const handleClaudeDisconnect = async () => {
    try {
      // Remove from database
      const response = await fetch('/api/claude-config', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const result = await response.json()
      
      if (result.success) {
    setIntegrationConfigs((prev) => ({
      ...prev,
      claude: {
        ...prev.claude,
        enabled: false,
        status: "disconnected",
            settings: {
              ...prev.claude?.settings,
              connected: false,
              apiKey: '',
            }
      },
    }))
    
        alert('✅ Claude AI has been disconnected.')
      } else {
        throw new Error(result.error || 'Failed to disconnect')
      }
    } catch (error) {
      console.error('Claude disconnect error:', error)
      alert('❌ Failed to disconnect Claude AI.')
    }
  }

  // GitHub connection handlers
  const handleGitHubConnect = () => {
    // Check if GitHub client ID is configured
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    
    if (!clientId) {
      alert('⚠️ GitHub OAuth not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID environment variable.')
      return
    }
    
    // Real GitHub OAuth flow - Enhanced scope for Cline-inspired autonomous coding + GitHub Projects v2
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/github/callback')
    const scope = encodeURIComponent('repo user:email read:user write:repo_hook admin:repo_hook workflow actions:write contents:write pull_requests:write issues:write project read:project')
    const state = encodeURIComponent(Math.random().toString(36).substring(7)) // CSRF protection
    
    // Store state in sessionStorage for verification
    sessionStorage.setItem('github_oauth_state', state)
    
    // Redirect to GitHub OAuth
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`
    
    window.location.href = githubOAuthUrl
  }
  
  // Check for OAuth callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const storedState = sessionStorage.getItem('github_oauth_state')
    
    if (code && state && state === storedState) {
      // Exchange code for access token
      handleGitHubOAuthCallback(code)
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      sessionStorage.removeItem('github_oauth_state')
    }
  }, [isMounted])
  
  const handleGitHubOAuthCallback = async (code: string) => {
    try {
      // Exchange authorization code for access token
      const response = await fetch('/api/auth/github/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }
      
      const data = await response.json()
      
      if (data.access_token) {
        // Get user info from GitHub API
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          
          // Fetch user repositories
          const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          })
          
          let repositories = []
          if (reposResponse.ok) {
            const reposData = await reposResponse.json()
            repositories = reposData
              .filter((repo: any) => !repo.fork)
              .map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                private: repo.private,
                description: repo.description,
                language: repo.language,
                updated_at: repo.updated_at,
                permissions: repo.permissions,
              }))
          }
          
          // Store connection details (but not the token in localStorage for security)
          updateIntegrationSetting('github', 'connected', true)
          updateIntegrationSetting('github', 'username', userData.login)
          updateIntegrationSetting('github', 'defaultOwner', userData.login)
          updateIntegrationSetting('github', 'repositories', repositories)
          
          // AUTO-POPULATE GitHub Projects with the same username  
          updateIntegrationSetting('github-projects', 'ownerId', userData.login)
          updateIntegrationSetting('github-projects', 'connected', true)
          
          // Clear any existing global GitHub cookies to ensure user isolation
          if (typeof window !== 'undefined') {
            document.cookie = 'github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            console.log('🧹 Cleared any existing global GitHub cookies for user isolation')
          }
          
          // Store token securely in database (user-specific)
          const storeResponse = await fetch('/api/auth/github/store-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: data.access_token }),
          })
          
          if (!storeResponse.ok) {
            throw new Error('Failed to store GitHub token')
          }

          // Save configuration to database
          await fetch('/api/auth/github/config', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              username: userData.login,
              repositories: repositories,
              permissions: {
                "issues": "write",
                "pull_requests": "write",
                "contents": "write"
              },
              settings: integrationConfigs.github?.settings || {},
            }),
          })
          
          // Enable the integration
          toggleIntegration('github')
          
          alert(`✅ Successfully connected to GitHub as ${userData.login}! Found ${repositories.length} repositories.`)
        } else {
          throw new Error('Failed to get user info from GitHub')
        }
      } else {
        throw new Error('No access token received')
      }
    } catch (error) {
      console.error('GitHub OAuth error:', error)
      alert('❌ Failed to connect to GitHub. Please try again.')
    }
  }
  
  const handleGitHubDisconnect = async () => {
    updateIntegrationSetting('github', 'connected', false)
    updateIntegrationSetting('github', 'username', '')
    updateIntegrationSetting('github', 'defaultOwner', '')
    
    // Also disable the integration
    if (integrationConfigs.github?.enabled) {
      toggleIntegration('github')
    }

    // Remove configuration from database
    try {
      await fetch('/api/auth/github/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: '',
          repositories: [],
          permissions: {},
          settings: {},
        }),
      })
    } catch (error) {
      console.error('Error removing GitHub config from database:', error)
    }
    
    alert('GitHub disconnected successfully')
  }

  // ClickUp configuration handlers
  const handleClickUpConnect = async () => {
    const apiToken = prompt('Enter your ClickUp API token:')
    if (!apiToken || !apiToken.trim()) return
    
    try {
      // Test the API token by getting user info
      const response = await fetch('/api/integrations/clickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          apiToken: apiToken.trim(),
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update integration state
        updateIntegrationSetting('clickup', 'connected', true)
        updateIntegrationSetting('clickup', 'apiToken', apiToken.trim())
        updateIntegrationSetting('clickup', 'teamId', data.teams?.[0]?.id || '')
        
        // Enable the integration
        setIntegrationConfigs((prev) => ({
          ...prev,
          clickup: {
            ...prev.clickup,
            enabled: true,
            status: "connected",
          },
        }))
        
        alert(`✅ Successfully connected to ClickUp! Found ${data.teams?.length || 0} teams.`)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Invalid API token')
      }
    } catch (error) {
      console.error('ClickUp connection error:', error)
      alert('❌ Failed to connect to ClickUp. Please check your API token.')
    }
  }
  
  const handleClickUpDisconnect = () => {
    updateIntegrationSetting('clickup', 'connected', false)
    updateIntegrationSetting('clickup', 'apiToken', '')
    updateIntegrationSetting('clickup', 'teamId', '')
    
    setIntegrationConfigs((prev) => ({
      ...prev,
      clickup: {
        ...prev.clickup,
        enabled: false,
        status: "disconnected",
      },
    }))
    
    alert('ClickUp has been disconnected.')
  }

  const handleClickUpCreateSDLCProject = async () => {
    if (!integrationConfigs.clickup?.settings?.connected) {
      alert('⚠️ Please connect ClickUp first.')
      return
    }

    const settings = integrationConfigs.clickup?.settings

    if (!settings?.selectedTeamId || !settings?.projectTitle) {
      alert('⚠️ Please select a team and enter a project title.')
      return
    }

    try {
      const response = await fetch('/api/integrations/clickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-sdlc-project',
          apiToken: settings.apiToken,
          teamId: settings.selectedTeamId,
          projectTitle: settings.projectTitle,
          sdlcDocument: {
            // Mock SDLC document structure - in real app this would come from selected document
            businessAnalysis: {
              executiveSummary: 'Executive summary content...',
              stakeholderAnalysis: 'Stakeholder analysis content...',
              requirementsAnalysis: 'Requirements analysis content...'
            },
            functionalSpec: {
              systemOverview: 'System overview content...',
              functionalRequirements: 'Functional requirements content...'
            },
            technicalSpec: {
              systemArchitecture: 'System architecture content...',
              technologyStack: 'Technology stack content...'
            }
          },
          options: {
            createSpaces: settings.createSpaces ?? true,
            createFolders: settings.createFolders ?? true,
            createLists: settings.createLists ?? true,
            includeCustomFields: settings.includeCustomFields ?? true,
            assignToUsers: settings.assignToUsers || [],
            addTags: settings.addTags || ['sdlc-generated'],
            estimateTimeEnabled: settings.estimateTimeEnabled ?? true
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ SDLC project created successfully!\n\n` +
              `Spaces: ${data.project.statistics.totalSpaces}\n` +
              `Folders: ${data.project.statistics.totalFolders}\n` +
              `Lists: ${data.project.statistics.totalLists}\n` +
              `Tasks: ${data.project.statistics.totalTasks}\n` +
              `Sections: ${data.project.statistics.sectionsProcessed}`)
      } else {
        throw new Error(data.error || 'Project creation failed')
      }
    } catch (error) {
      console.error('ClickUp project creation error:', error)
      alert('❌ Failed to create SDLC project. Please try again.')
    }
  }

  // Trello configuration handlers
  const handleTrelloConnect = async () => {
    const apiKey = prompt('Enter your Trello API Key:')
    if (!apiKey || !apiKey.trim()) return
    
    const token = prompt('Enter your Trello Token:')
    if (!token || !token.trim()) return
    
    try {
      // Test the API credentials by getting user info
      const response = await fetch('/api/integrations/trello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect',
          apiKey: apiKey.trim(),
          token: token.trim(),
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update integration state
        updateIntegrationSetting('trello', 'connected', true)
        updateIntegrationSetting('trello', 'apiKey', apiKey.trim())
        updateIntegrationSetting('trello', 'token', token.trim())
        
        // Enable the integration
        setIntegrationConfigs((prev) => ({
          ...prev,
          trello: {
            ...prev.trello,
            enabled: true,
            status: "connected",
          },
        }))
        
        alert(`✅ Successfully connected to Trello! Found ${data.boards?.length || 0} boards.`)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Invalid API credentials')
      }
    } catch (error) {
      console.error('Trello connection error:', error)
      alert('❌ Failed to connect to Trello. Please check your API credentials.')
    }
  }
  
  const handleTrelloDisconnect = () => {
    updateIntegrationSetting('trello', 'connected', false)
    updateIntegrationSetting('trello', 'apiKey', '')
    updateIntegrationSetting('trello', 'token', '')
    
    setIntegrationConfigs((prev) => ({
      ...prev,
      trello: {
        ...prev.trello,
        enabled: false,
        status: "disconnected",
      },
    }))
    
    alert('Trello has been disconnected.')
  }

  const handleTrelloCreateSDLCProject = async () => {
    if (!lastGeneratedSDLC) {
      alert('Please generate an SDLC document first before creating a Trello project.')
      return
    }

    const projectName = prompt('Enter a name for your Trello project:')
    if (!projectName || !projectName.trim()) return

    const organizationId = prompt('Enter your Trello Organization ID (optional - leave blank for personal board):') || undefined
    const teamMembersInput = prompt('Enter team member IDs separated by commas (optional):') || ''
    const teamMembers = teamMembersInput.split(',').map(id => id.trim()).filter(id => id)
    
    setIsCreatingProject(true)
    try {
      const response = await fetch('/api/integrations/trello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-sdlc-project',
          apiKey: integrationConfigs.trello?.settings?.apiKey,
          token: integrationConfigs.trello?.settings?.token,
          sdlcDocument: lastGeneratedSDLC,
          projectName: projectName.trim(),
          organizationId,
          teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
          autoAssignment: integrationConfigs.trello?.settings?.assignMembers || false,
          dueDate: integrationConfigs.trello?.settings?.dueDateSync ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days from now
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`✅ Successfully created Trello project: ${projectName}!\n\n` +
              `📋 Board: ${data.project.board.name}\n` +
              `📊 Lists: ${data.project.summary.totalLists}\n` +
              `🎯 Cards: ${data.project.summary.totalCards}\n` +
              `🏷️ Labels: ${data.project.summary.totalLabels}\n` +
              `⏱️ Estimated Timeline: ${data.project.summary.projectTimeline}\n\n` +
              `🔗 View your board: ${data.boardUrl}`)
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Trello project creation error:', error)
      alert(`❌ Failed to create Trello project: ${error.message}`)
    } finally {
      setIsCreatingProject(false)
    }
  }

  // Connect to Vercel integration
  const connectVercelIntegration = (integrationId: string) => {
    // In a real app, this would redirect to Vercel's OAuth flow
    console.log(`Connecting to ${integrationId} via Vercel...`)
    // Simulate connection
    setTimeout(() => {
      toggleIntegration(integrationId)
    }, 1000)
  }

  // Slack configuration handlers
  const handleSlackDisconnect = async () => {
    try {
      const response = await fetch('/api/user-integrations/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'disconnect' }),
      })
      
      if (response.ok) {
        setIntegrationConfigs((prev) => ({
          ...prev,
          slack: {
            ...prev.slack,
            enabled: false,
            settings: {
              ...prev.slack?.settings,
              connected: false,
            },
          },
        }))
        
        console.log('✅ Slack integration disconnected')
      }
    } catch (error) {
      console.error('Error disconnecting Slack:', error)
    }
  }

  // GitHub Projects connection handlers
  const handleGitHubProjectsConnect = async () => {
    if (!integrationConfigs.github?.settings?.connected) {
      alert('⚠️ GitHub Projects requires a connected GitHub account. Please connect GitHub first.')
      return
    }

    try {
      const response = await fetch('/api/integrations/github-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'connect'
        }),
      })

      const data = await response.json()

      if (data.success) {
        updateIntegrationSetting('github-projects', 'connected', true)
        updateIntegrationSetting('github-projects', 'user', data.user)
        updateIntegrationSetting('github-projects', 'capabilities', data.capabilities)
        
        alert('✅ GitHub Projects connected successfully!')
      } else {
        throw new Error(data.error || 'Connection failed')
      }
    } catch (error) {
      console.error('GitHub Projects connection error:', error)
      alert('❌ Failed to connect to GitHub Projects. Please try again.')
    }
  }

  const handleGitHubProjectsDisconnect = async () => {
    updateIntegrationSetting('github-projects', 'connected', false)
    updateIntegrationSetting('github-projects', 'user', null)
    updateIntegrationSetting('github-projects', 'capabilities', [])
    
    alert('✅ GitHub Projects disconnected successfully')
  }

  const handleCreateSDLCProject = async () => {
    if (!integrationConfigs['github-projects']?.settings?.connected) {
      alert('⚠️ Please connect GitHub Projects first.')
      return
    }

    if (!integrationConfigs['github-projects']?.settings?.selectedDocument) {
      alert('⚠️ Please select an SDLC document first.')
      return
    }

    const settings = integrationConfigs['github-projects']?.settings

    try {
      const response = await fetch('/api/integrations/github-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-sdlc-project',
          ownerId: settings.ownerId,
          projectTitle: settings.projectTitle,
          sdlcDocument: settings.selectedDocument,
          repositoryOwner: settings.repositoryOwner,
          repositoryName: settings.repositoryName,
          options: {
            includeDetailedIssues: settings.includeDetailedIssues,
            createPhaseBasedMilestones: settings.createPhaseBasedMilestones,
            generateLabels: settings.generateLabels,
            estimateStoryPoints: settings.estimateStoryPoints
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ SDLC project created successfully!\n\n` +
              `Project: ${data.project.title}\n` +
              `Issues: ${data.statistics.totalIssues}\n` +
              `Milestones: ${data.statistics.totalMilestones}\n` +
              `Epics: ${data.statistics.totalEpics}\n\n` +
              `View at: ${data.project.url}`)
      } else {
        throw new Error(data.error || 'Project creation failed')
      }
    } catch (error) {
      console.error('GitHub Projects creation error:', error)
      alert('❌ Failed to create SDLC project. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold truncate">Integration Hub</h2>
          <p className="text-sm sm:text-base text-gray-600">Connect your favorite tools and automate your workflow</p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Request Integration</span>
            <span className="sm:hidden">Request</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Manage All</span>
            <span className="sm:hidden">Manage</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="tabs-mobile-container tabs-scroll-container">
            <TabsList className="tabs-mobile-list">
              <TabsTrigger value="all" className="tab-trigger-mobile">All</TabsTrigger>
              <TabsTrigger value="development" className="tab-trigger-mobile">
                <span className="hidden sm:inline">Development</span>
                <span className="sm:hidden">Dev</span>
              </TabsTrigger>
              <TabsTrigger value="communication" className="tab-trigger-mobile">
                <span className="hidden sm:inline">Communication</span>
                <span className="sm:hidden">Comm</span>
              </TabsTrigger>
              <TabsTrigger value="documentation" className="tab-trigger-mobile">
                <span className="hidden sm:inline">Documentation</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="project-management" className="tab-trigger-mobile">
                <span className="hidden sm:inline">Project Management</span>
                <span className="sm:hidden">PM</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm text-gray-500 capitalize">
                        {integration.status === "coming-soon" ? "Coming Soon" : integration.status}
                      </span>
                      {isMounted && integration.status === "coming-soon" && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                          Coming Soon
                        </Badge>
                      )}
                      {isMounted && integration.vercelIntegration && integration.status !== "coming-soon" && (
                        <Badge variant="outline" className="text-xs">
                          Vercel
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={integrationConfigs[integration.id]?.enabled || false}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                  disabled={integration.status === "coming-soon"}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{integration.description}</p>

              {/* Features */}
              <div>
                <Label className="text-xs font-medium text-gray-500">FEATURES</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {integration.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configuration */}
              {integrationConfigs[integration.id]?.enabled && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-500">CONFIGURATION</Label>

                  {/* Slack Settings */}
                  {integration.id === "slack" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Slack Connection</Label>
                          {integrationConfigs.slack.settings.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {!integrationConfigs.slack.settings.connected ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Set up your Slack workspace to enable AI assistant bot with slash commands.
                            </p>
                            <SlackOAuthButton 
                              className="w-full"
                              onSuccess={() => {
                                console.log('✅ Slack OAuth successful - refreshing configuration...')
                                // Force reload the Slack configuration
                                setTimeout(() => {
                                  loadSlackConfigFromDatabase()
                                }, 2000) // Give time for database to be updated
                              }}
                              onError={(error) => {
                                console.error('❌ Slack OAuth error:', error)
                              }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connected to: <span className="font-medium">{integrationConfigs.slack.settings.workspaceName}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              Default channel: <span className="font-medium">{integrationConfigs.slack.settings.defaultChannel}</span>
                            </p>
                            <div className="flex space-x-2">
                              <SlackOAuthButton 
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onSuccess={() => {
                                  console.log('✅ Slack OAuth reconfigured - refreshing configuration...')
                                  // Force reload the Slack configuration
                                  setTimeout(() => {
                                    loadSlackConfigFromDatabase()
                                  }, 2000) // Give time for database to be updated
                                }}
                                onError={(error) => {
                                  console.error('❌ Slack OAuth error:', error)
                                }}
                              />
                              <Button
                                onClick={handleSlackDisconnect}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Slack Features */}
                      {integrationConfigs.slack.settings.connected && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium">Available Commands</Label>
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-gray-600">
                              <code className="bg-white px-1 rounded">/sdlc create [task]</code> - Create new task
                            </div>
                            <div className="text-xs text-gray-600">
                              <code className="bg-white px-1 rounded">/sdlc status [id]</code> - Check task status
                            </div>
                            <div className="text-xs text-gray-600">
                              <code className="bg-white px-1 rounded">/sdlc list</code> - List your tasks
                            </div>
                            <div className="text-xs text-gray-600">
                              <code className="bg-white px-1 rounded">/sdlc help</code> - Show help
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GitHub Settings */}
                  {integration.id === "github" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">GitHub Connection</Label>
                          {integrationConfigs.github.settings.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {!integrationConfigs.github.settings.connected ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connect your GitHub account to enable repository creation and management.
                            </p>
                            <Button
                              onClick={() => handleGitHubConnect()}
                              size="sm"
                              className="w-full"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Connect GitHub Account
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connected as: <span className="font-medium">{integrationConfigs.github.settings.username || 'GitHub User'}</span>
                            </p>
                            <Button
                              onClick={() => handleGitHubDisconnect()}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Disconnect GitHub
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Repository Selection */}
                      {integrationConfigs.github.settings.connected && integrationConfigs.github.settings.repositories?.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium">Select Target Repository</Label>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose the repository where SDLC documentation and generated code will be integrated.
                          </p>
                          
                          <select
                            value={integrationConfigs.github.settings.selectedRepo?.full_name || ''}
                            onChange={(e) => {
                              const selectedRepo = integrationConfigs.github.settings.repositories.find(
                                (repo: any) => repo.full_name === e.target.value
                              )
                              updateIntegrationSetting("github", "selectedRepo", selectedRepo || null)
                            }}
                            className="w-full border rounded px-3 py-2 text-sm"
                          >
                            <option value="">Select a repository...</option>
                            {integrationConfigs.github.settings.repositories.map((repo: any) => (
                              <option key={repo.id} value={repo.full_name}>
                                {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                                {repo.language ? ` - ${repo.language}` : ''}
                              </option>
                            ))}
                          </select>
                          
                          {integrationConfigs.github.settings.selectedRepo && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{integrationConfigs.github.settings.selectedRepo.name}</p>
                                  <p className="text-xs text-gray-500">{integrationConfigs.github.settings.selectedRepo.description || 'No description'}</p>
                                </div>
                                <div className="text-right">
                                  {integrationConfigs.github.settings.selectedRepo.language && (
                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                                      {integrationConfigs.github.settings.selectedRepo.language}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Repository Settings */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Repository Settings</Label>
                        
                        <div>
                          <Label className="text-sm">Default organization/owner</Label>
                          <Input
                            value={integrationConfigs.github.settings.defaultOwner || ''}
                            onChange={(e) => updateIntegrationSetting("github", "defaultOwner", e.target.value)}
                            placeholder="your-username or org-name"
                            className="mt-1"
                            size="sm"
                            disabled={!integrationConfigs.github.settings.connected}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Default branch</Label>
                          <Input
                            value={integrationConfigs.github.settings.defaultBranch}
                            onChange={(e) => updateIntegrationSetting("github", "defaultBranch", e.target.value)}
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Repository visibility</Label>
                            <p className="text-xs text-gray-500">Choose default visibility for new repositories</p>
                          </div>
                          <select
                            value={integrationConfigs.github.settings.visibility}
                            onChange={(e) => updateIntegrationSetting("github", "visibility", e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                          </select>
                        </div>
                      </div>

                      {/* Feature Settings */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Features</Label>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Auto-create repositories</Label>
                            <p className="text-xs text-gray-500">Automatically create GitHub repo for each project</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.github.settings.autoCreateRepo}
                            onCheckedChange={(checked) => updateIntegrationSetting("github", "autoCreateRepo", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Generate README files</Label>
                            <p className="text-xs text-gray-500">Create comprehensive README from project docs</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.github.settings.generateReadme}
                            onCheckedChange={(checked) => updateIntegrationSetting("github", "generateReadme", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Include issue templates</Label>
                            <p className="text-xs text-gray-500">Add GitHub issue templates based on project type</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.github.settings.includeTemplates}
                            onCheckedChange={(checked) => updateIntegrationSetting("github", "includeTemplates", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Create project board</Label>
                            <p className="text-xs text-gray-500">Set up GitHub Projects board with workflow</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.github.settings.createProjectBoard || false}
                            onCheckedChange={(checked) => updateIntegrationSetting("github", "createProjectBoard", checked)}
                          />
                        </div>
                      </div>

                      {/* SDLC Workflow Integration */}
                      {integrationConfigs.github.settings.selectedRepo && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">SDLC Workflow Integration</Label>
                          <p className="text-xs text-gray-600">Configure how the SDLC process integrates with your selected repository.</p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Enable code generation</Label>
                              <p className="text-xs text-gray-500">Generate and push code directly to repository after documentation</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.github.settings.enableCodeGeneration}
                              onCheckedChange={(checked) => updateIntegrationSetting("github", "enableCodeGeneration", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Sync existing issues</Label>
                              <p className="text-xs text-gray-500">Import existing issues and feature requests into SDLC process</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.github.settings.enableIssueSync}
                              onCheckedChange={(checked) => updateIntegrationSetting("github", "enableIssueSync", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Auto-create branches</Label>
                              <p className="text-xs text-gray-500">Create feature branches for each generated component</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.github.settings.autoCreateBranches || false}
                              onCheckedChange={(checked) => updateIntegrationSetting("github", "autoCreateBranches", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Auto-create pull requests</Label>
                              <p className="text-xs text-gray-500">Create PRs for generated code requiring review</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.github.settings.autoCreatePRs || false}
                              onCheckedChange={(checked) => updateIntegrationSetting("github", "autoCreatePRs", checked)}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm">Development branch pattern</Label>
                            <Input
                              value={integrationConfigs.github.settings.branchPattern || 'feature/sdlc-{feature-name}'}
                              onChange={(e) => updateIntegrationSetting("github", "branchPattern", e.target.value)}
                              placeholder="feature/sdlc-{feature-name}"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Use {feature-name} placeholder for dynamic branch naming</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claude AI Settings */}
                  {integration.id === "claude" && (
                    <div className="space-y-4">
                      {/* Claude Connection */}
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Claude AI Connection</Label>
                          {integrationConfigs.claude?.settings?.connected ? (
                            <Badge variant="default" className="text-xs bg-purple-100 text-purple-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {!integrationConfigs.claude?.settings?.connected ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Enter your Claude API key to enable advanced AI coding assistance.
                            </p>
                            <div className="space-y-2">
                              <Label className="text-sm">Claude API Key</Label>
                              <Input
                                type="password"
                                value={integrationConfigs.claude?.settings?.apiKey || ''}
                                onChange={(e) => updateIntegrationSetting("claude", "apiKey", e.target.value)}
                                placeholder="sk-ant-api03-..."
                                className="font-mono text-xs"
                              />
                              <p className="text-xs text-gray-500">
                                Get your API key from{' '}
                                <a 
                                  href="https://console.anthropic.com/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline"
                                >
                                  Anthropic Console
                                </a>
                              </p>
                            </div>
                            <Button
                              onClick={handleClaudeConnect}
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              disabled={!integrationConfigs.claude?.settings?.apiKey?.trim()}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Connect Claude AI
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connected to Claude AI with API key: <span className="font-mono">***...{integrationConfigs.claude?.settings?.apiKey?.slice(-4)}</span>
                            </p>
                            <Button
                              onClick={handleClaudeDisconnect}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Disconnect Claude AI
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Model Selection */}
                      {integrationConfigs.claude?.settings?.connected && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Model Configuration</Label>
                          
                          <div>
                            <Label className="text-sm">Claude Model</Label>
                            <select
                              value={integrationConfigs.claude?.settings?.model || 'claude-3-5-sonnet-20241022'}
                              onChange={(e) => updateIntegrationSetting("claude", "model", e.target.value)}
                              className="w-full border rounded px-3 py-2 text-sm mt-1"
                            >
                              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast)</option>
                              <option value="claude-3-opus-20240229">Claude 3 Opus (Most Capable)</option>
                              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Claude 3.5 Sonnet offers the best balance of capability and speed for coding tasks.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Max Tokens</Label>
                              <Input
                                type="number"
                                value={integrationConfigs.claude?.settings?.maxTokens || 200000}
                                onChange={(e) => updateIntegrationSetting("claude", "maxTokens", parseInt(e.target.value))}
                                min="1000"
                                max="200000"
                                className="mt-1"
                                size="sm"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Temperature</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={integrationConfigs.claude?.settings?.temperature || 0.1}
                                onChange={(e) => updateIntegrationSetting("claude", "temperature", parseFloat(e.target.value))}
                                min="0"
                                max="1"
                                className="mt-1"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Feature Settings */}
                      {integrationConfigs.claude?.settings?.connected && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Features</Label>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Code Analysis</Label>
                              <p className="text-xs text-gray-500">Enable deep code analysis and bug detection</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.claude?.settings?.enableCodeAnalysis ?? true}
                              onCheckedChange={(checked) => updateIntegrationSetting("claude", "enableCodeAnalysis", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Agentic Code Generation</Label>
                              <p className="text-xs text-gray-500">Enable automated code implementation</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.claude?.settings?.enableAgenticCode ?? true}
                              onCheckedChange={(checked) => updateIntegrationSetting("claude", "enableAgenticCode", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">GitHub Integration</Label>
                              <p className="text-xs text-gray-500">Enable GitHub repository integration</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.claude?.settings?.enableGitHubIntegration ?? true}
                              onCheckedChange={(checked) => updateIntegrationSetting("claude", "enableGitHubIntegration", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Auto-create Pull Requests</Label>
                              <p className="text-xs text-gray-500">Automatically create PRs for generated code</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.claude?.settings?.autoCreatePRs ?? false}
                              onCheckedChange={(checked) => updateIntegrationSetting("claude", "autoCreatePRs", checked)}
                            />
                          </div>
                        </div>
                      )}

                      {/* GitHub Connection Requirement */}
                      {integrationConfigs.claude?.settings?.connected && integrationConfigs.claude?.settings?.enableGitHubIntegration && !integrationConfigs.github?.settings?.connected && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">GitHub Integration Required</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Connect your GitHub account to enable Claude's repository integration features.
                              </p>
                              <Button
                                onClick={() => setActiveTab("development")}
                                size="sm"
                                variant="outline"
                                className="mt-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                              >
                                <Github className="h-3 w-3 mr-1" />
                                Connect GitHub
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* End Claude AI Settings */}

                  {/* Jira Settings */}
                  {integration.id === "jira" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Jira Connection</Label>
                          {integrationConfigs.jira.settings.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            Configure Jira to automatically create issues and epics from SDLC documentation.
                          </p>
                        </div>
                      </div>

                      {/* Jira Configuration */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Jira Configuration</Label>
                        
                        <div>
                          <Label className="text-sm">Jira URL</Label>
                          <Input
                            value={integrationConfigs.jira.settings.url || ''}
                            onChange={(e) => updateIntegrationSetting("jira", "url", e.target.value)}
                            placeholder="https://your-domain.atlassian.net"
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Project Key</Label>
                          <Input
                            value={integrationConfigs.jira.settings.projectKey || ''}
                            onChange={(e) => updateIntegrationSetting("jira", "projectKey", e.target.value)}
                            placeholder="PROJ"
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Email</Label>
                          <Input
                            value={integrationConfigs.jira.settings.email || ''}
                            onChange={(e) => updateIntegrationSetting("jira", "email", e.target.value)}
                            placeholder="your-email@company.com"
                            className="mt-1"
                            size="sm"
                            type="email"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">API Token</Label>
                          <Input
                            value={integrationConfigs.jira.settings.apiToken || ''}
                            onChange={(e) => updateIntegrationSetting("jira", "apiToken", e.target.value)}
                            placeholder="Your Jira API token"
                            className="mt-1"
                            size="sm"
                            type="password"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Generate API token from Jira → Profile → Security → API tokens
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Default Issue Type</Label>
                          <select
                            value={integrationConfigs.jira.settings.defaultIssueType || 'Task'}
                            onChange={(e) => updateIntegrationSetting("jira", "defaultIssueType", e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm mt-1"
                          >
                            <option value="Task">Task</option>
                            <option value="Story">Story</option>
                            <option value="Bug">Bug</option>
                            <option value="Epic">Epic</option>
                            <option value="Sub-task">Sub-task</option>
                          </select>
                        </div>
                      </div>

                      {/* Jira Integration Options */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Integration Options</Label>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Auto-create issues</Label>
                            <p className="text-xs text-gray-500">Automatically create Jira issues from SDLC tasks</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.jira.settings.autoCreate}
                            onCheckedChange={(checked) => updateIntegrationSetting("jira", "autoCreate", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Create epics</Label>
                            <p className="text-xs text-gray-500">Create epics for major features and components</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.jira.settings.createEpics}
                            onCheckedChange={(checked) => updateIntegrationSetting("jira", "createEpics", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Link related issues</Label>
                            <p className="text-xs text-gray-500">Create links between related tasks and epics</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.jira.settings.linkIssues}
                            onCheckedChange={(checked) => updateIntegrationSetting("jira", "linkIssues", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confluence Settings */}
                  {integration.id === "confluence" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Confluence Connection</Label>
                          {integrationConfigs.confluence.settings.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            Configure Confluence to automatically create documentation pages from SDLC output.
                          </p>
                        </div>
                      </div>

                      {/* Confluence Configuration */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Confluence Configuration</Label>
                        
                        <div>
                          <Label className="text-sm">Confluence URL</Label>
                          <Input
                            value={integrationConfigs.confluence.settings.url || ''}
                            onChange={(e) => updateIntegrationSetting("confluence", "url", e.target.value)}
                            placeholder="https://your-domain.atlassian.net/wiki"
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Space Key</Label>
                          <Input
                            value={integrationConfigs.confluence.settings.spaceKey || ''}
                            onChange={(e) => updateIntegrationSetting("confluence", "spaceKey", e.target.value)}
                            placeholder="DEV"
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">Email</Label>
                          <Input
                            value={integrationConfigs.confluence.settings.email || ''}
                            onChange={(e) => updateIntegrationSetting("confluence", "email", e.target.value)}
                            placeholder="your-email@company.com"
                            className="mt-1"
                            size="sm"
                            type="email"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">API Token</Label>
                          <Input
                            value={integrationConfigs.confluence.settings.apiToken || ''}
                            onChange={(e) => updateIntegrationSetting("confluence", "apiToken", e.target.value)}
                            placeholder="Your Confluence API token"
                            className="mt-1"
                            size="sm"
                            type="password"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use the same API token from Jira (Atlassian Account)
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Parent Page ID (Optional)</Label>
                          <Input
                            value={integrationConfigs.confluence.settings.parentPageId || ''}
                            onChange={(e) => updateIntegrationSetting("confluence", "parentPageId", e.target.value)}
                            placeholder="123456789"
                            className="mt-1"
                            size="sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to create pages at space root level
                          </p>
                        </div>
                      </div>

                      {/* Confluence Integration Options */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Integration Options</Label>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Create page hierarchy</Label>
                            <p className="text-xs text-gray-500">Organize SDLC docs in structured page hierarchy</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.confluence.settings.createPageHierarchy}
                            onCheckedChange={(checked) => updateIntegrationSetting("confluence", "createPageHierarchy", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Include metadata</Label>
                            <p className="text-xs text-gray-500">Add project metadata and labels to pages</p>
                          </div>
                          <Switch
                            checked={integrationConfigs.confluence.settings.includeMetadata}
                            onCheckedChange={(checked) => updateIntegrationSetting("confluence", "includeMetadata", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notion Settings */}
                  {integration.id === "notion" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Workspace</Label>
                        <Input
                          value={integrationConfigs.notion.settings.workspace}
                          onChange={(e) => updateIntegrationSetting("notion", "workspace", e.target.value)}
                          placeholder="Your workspace name"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-sync changes</Label>
                        <Switch
                          checked={integrationConfigs.notion.settings.autoSync}
                          onCheckedChange={(checked) => updateIntegrationSetting("notion", "autoSync", checked)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Linear Settings */}
                  {integration.id === "linear" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Team</Label>
                        <Input
                          value={integrationConfigs.linear.settings.team}
                          onChange={(e) => updateIntegrationSetting("linear", "team", e.target.value)}
                          placeholder="Team name"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-create issues</Label>
                        <Switch
                          checked={integrationConfigs.linear.settings.autoCreateIssues}
                          onCheckedChange={(checked) => updateIntegrationSetting("linear", "autoCreateIssues", checked)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ClickUp Settings */}
                  {integration.id === "clickup" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">ClickUp Connection</Label>
                          {integrationConfigs.clickup?.settings?.connected ? (
                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {!integrationConfigs.clickup?.settings?.connected ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Enter your ClickUp API token to enable task and project management.
                            </p>
                            <div className="space-y-2">
                              <Label className="text-sm">ClickUp API Token</Label>
                              <Input
                                type="password"
                                value={integrationConfigs.clickup?.settings?.apiToken || ''}
                                onChange={(e) => updateIntegrationSetting("clickup", "apiToken", e.target.value)}
                                placeholder="your-api-token"
                                className="font-mono text-xs"
                              />
                              <p className="text-xs text-gray-500">
                                Get your API token from{' '}
                                <a 
                                  href="https://app.clickup.com/api/v2" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  ClickUp API
                                </a>
                              </p>
                            </div>
                            <Button
                              onClick={handleClickUpConnect}
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={!integrationConfigs.clickup?.settings?.apiToken?.trim()}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connect ClickUp
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connected to ClickUp with API token: <span className="font-mono">***...{integrationConfigs.clickup?.settings?.apiToken?.slice(-4)}</span>
                            </p>
                            <Button
                              onClick={handleClickUpDisconnect}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Disconnect ClickUp
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* ClickUp Configuration */}
                      {integrationConfigs.clickup?.settings?.connected && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">ClickUp Configuration</Label>
                          
                          <div>
                            <Label className="text-sm">Team ID</Label>
                            <Input
                              value={integrationConfigs.clickup?.settings?.teamId || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "teamId", e.target.value)}
                              placeholder="Your ClickUp Team ID"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Find your Team ID in ClickUp → Settings → API
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm">Space ID (Optional)</Label>
                            <Input
                              value={integrationConfigs.clickup?.settings?.spaceId || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "spaceId", e.target.value)}
                              placeholder="Your ClickUp Space ID"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty to use the default space
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm">Folder ID (Optional)</Label>
                            <Input
                              value={integrationConfigs.clickup?.settings?.folderId || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "folderId", e.target.value)}
                              placeholder="Your ClickUp Folder ID"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty to create tasks directly in the space
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm">List ID (Optional)</Label>
                            <Input
                              value={integrationConfigs.clickup?.settings?.listId || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "listId", e.target.value)}
                              placeholder="Your ClickUp List ID"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty to create tasks directly in the list
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Auto-create tasks</Label>
                              <p className="text-xs text-gray-500">Automatically create ClickUp tasks from SDLC tasks</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.clickup?.settings?.autoCreateTasks}
                              onCheckedChange={(checked) => updateIntegrationSetting("clickup", "autoCreateTasks", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Task Priority</Label>
                              <p className="text-xs text-gray-500">Set default priority for new tasks</p>
                            </div>
                            <select
                              value={integrationConfigs.clickup?.settings?.taskPriority || 'normal'}
                              onChange={(e) => updateIntegrationSetting("clickup", "taskPriority", e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* SDLC Project Creation */}
                      {integrationConfigs.clickup?.settings?.connected && (
                        <div className="space-y-4 border-t pt-4">
                          <Label className="text-sm font-medium">SDLC Project Creation</Label>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">Project Title</Label>
                              <Input
                                value={integrationConfigs.clickup?.settings?.projectTitle || ''}
                                onChange={(e) => updateIntegrationSetting("clickup", "projectTitle", e.target.value)}
                                placeholder="Enter project title"
                                className="mt-1"
                                size="sm"
                              />
                            </div>

                            <div>
                              <Label className="text-sm">Team ID</Label>
                              <Input
                                value={integrationConfigs.clickup?.settings?.selectedTeamId || ''}
                                onChange={(e) => updateIntegrationSetting("clickup", "selectedTeamId", e.target.value)}
                                placeholder="Select team for project creation"
                                className="mt-1"
                                size="sm"
                              />
                            </div>

                            <div>
                              <Label className="text-sm">SDLC Document</Label>
                              <Select
                                value={integrationConfigs.clickup?.settings?.selectedDocumentId || ''}
                                onValueChange={(value) => updateIntegrationSetting('clickup', 'selectedDocumentId', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select SDLC document..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="recent">Most Recent Document</SelectItem>
                                  <SelectItem value="comprehensive">Comprehensive SDLC</SelectItem>
                                  <SelectItem value="detailed">Detailed SDLC</SelectItem>
                                  <SelectItem value="enhanced">Enhanced SDLC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-sm">Project Options</Label>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm">Create Spaces</Label>
                                  <p className="text-xs text-gray-500">Create main project spaces</p>
                                </div>
                                <Switch
                                  checked={integrationConfigs.clickup?.settings?.createSpaces ?? true}
                                  onCheckedChange={(checked) => updateIntegrationSetting('clickup', 'createSpaces', checked)}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm">Create Folders</Label>
                                  <p className="text-xs text-gray-500">Create folders for each SDLC section</p>
                                </div>
                                <Switch
                                  checked={integrationConfigs.clickup?.settings?.createFolders ?? true}
                                  onCheckedChange={(checked) => updateIntegrationSetting('clickup', 'createFolders', checked)}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm">Create Lists</Label>
                                  <p className="text-xs text-gray-500">Create lists for different project phases</p>
                                </div>
                                <Switch
                                  checked={integrationConfigs.clickup?.settings?.createLists ?? true}
                                  onCheckedChange={(checked) => updateIntegrationSetting('clickup', 'createLists', checked)}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm">Include Custom Fields</Label>
                                  <p className="text-xs text-gray-500">Add custom fields for tracking</p>
                                </div>
                                <Switch
                                  checked={integrationConfigs.clickup?.settings?.includeCustomFields ?? true}
                                  onCheckedChange={(checked) => updateIntegrationSetting('clickup', 'includeCustomFields', checked)}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm">Enable Time Tracking</Label>
                                  <p className="text-xs text-gray-500">Enable time tracking for tasks</p>
                                </div>
                                <Switch
                                  checked={integrationConfigs.clickup?.settings?.estimateTimeEnabled ?? true}
                                  onCheckedChange={(checked) => updateIntegrationSetting('clickup', 'estimateTimeEnabled', checked)}
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleClickUpCreateSDLCProject}
                              size="sm"
                              className="w-full"
                              disabled={!integrationConfigs.clickup?.settings?.selectedTeamId || 
                                       !integrationConfigs.clickup?.settings?.projectTitle}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create SDLC Project
                            </Button>

                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-800">
                                <strong>💡 Tips:</strong> 
                                <br />• Projects will be organized by SDLC phases (Business, Technical, Implementation)
                                <br />• Each phase gets its own folder with Planning, In Progress, Review, and Completed lists
                                <br />• Tasks are automatically created from SDLC document sections
                                <br />• Custom fields include Epic, Story Points, Complexity, and Business Value
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trello Settings */}
                  {integration.id === "trello" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Trello Connection</Label>
                          {integrationConfigs.trello?.settings?.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Assignees (Optional)</Label>
                              <p className="text-xs text-gray-500">Comma-separated list of ClickUp user IDs to assign tasks</p>
                            </div>
                            <Input
                              value={integrationConfigs.clickup?.settings?.assignees?.join(', ') || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "assignees", e.target.value.split(',').map(s => s.trim()))}
                              placeholder="user1, user2"
                              className="mt-1"
                              size="sm"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Create sub-tasks</Label>
                              <p className="text-xs text-gray-500">Automatically create sub-tasks for each task</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.clickup?.settings?.createSubtasks}
                              onCheckedChange={(checked) => updateIntegrationSetting("clickup", "createSubtasks", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Sync status updates</Label>
                              <p className="text-xs text-gray-500">Automatically update ClickUp task status based on SDLC status</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.clickup?.settings?.syncStatus}
                              onCheckedChange={(checked) => updateIntegrationSetting("clickup", "syncStatus", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Enable time tracking</Label>
                              <p className="text-xs text-gray-500">Track time spent on ClickUp tasks</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.clickup?.settings?.enableTimeTracking}
                              onCheckedChange={(checked) => updateIntegrationSetting("clickup", "enableTimeTracking", checked)}
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Label className="text-sm">Custom Fields (Optional)</Label>
                            <Input
                              value={integrationConfigs.clickup?.settings?.customFields?.join(', ') || ''}
                              onChange={(e) => updateIntegrationSetting("clickup", "customFields", e.target.value.split(',').map(s => s.trim()))}
                              placeholder="field1:value1,field2:value2"
                              className="flex-1"
                            />
                            <p className="text-xs text-gray-500">Format: field_name:value</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trello Settings */}
                  {integration.id === "trello" && (
                    <div className="space-y-4">
                      {/* Connection Status */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Trello Connection</Label>
                          {integrationConfigs.trello?.settings?.connected ? (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {!integrationConfigs.trello?.settings?.connected ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Enter your Trello API credentials to enable board and card management.
                            </p>
                            <div className="space-y-2">
                              <Label className="text-sm">Trello API Key</Label>
                              <Input
                                type="password"
                                value={integrationConfigs.trello?.settings?.apiKey || ''}
                                onChange={(e) => updateIntegrationSetting("trello", "apiKey", e.target.value)}
                                placeholder="your-api-key"
                                className="font-mono text-xs"
                              />
                              <Label className="text-sm">Trello Token</Label>
                              <Input
                                type="password"
                                value={integrationConfigs.trello?.settings?.token || ''}
                                onChange={(e) => updateIntegrationSetting("trello", "token", e.target.value)}
                                placeholder="your-token"
                                className="font-mono text-xs"
                              />
                              <p className="text-xs text-gray-500">
                                Get your API key and token from{' '}
                                <a 
                                  href="https://trello.com/app-key" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Trello API
                                </a>
                              </p>
                            </div>
                            <Button
                              onClick={handleTrelloConnect}
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={!integrationConfigs.trello?.settings?.apiKey?.trim() || !integrationConfigs.trello?.settings?.token?.trim()}
                            >
                              <Trello className="h-4 w-4 mr-2" />
                              Connect Trello
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600">
                              Connected to Trello with API key: <span className="font-mono">***...{integrationConfigs.trello?.settings?.apiKey?.slice(-4)}</span>
                            </p>
                            <Button
                              onClick={handleTrelloDisconnect}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Disconnect Trello
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Trello Configuration */}
                      {integrationConfigs.trello?.settings?.connected && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Trello Configuration</Label>
                          
                          <div>
                            <Label className="text-sm">Board ID</Label>
                            <Input
                              value={integrationConfigs.trello?.settings?.boardId || ''}
                              onChange={(e) => updateIntegrationSetting("trello", "boardId", e.target.value)}
                              placeholder="Your Trello Board ID"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Find your Board ID in Trello → Settings → Board Settings
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm">Default List (Optional)</Label>
                            <Input
                              value={integrationConfigs.trello?.settings?.defaultList || ''}
                              onChange={(e) => updateIntegrationSetting("trello", "defaultList", e.target.value)}
                              placeholder="Your Trello List Name"
                              className="mt-1"
                              size="sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Leave empty to create cards in the default list
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Assign members</Label>
                              <p className="text-xs text-gray-500">Automatically assign members to new cards</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.trello?.settings?.assignMembers}
                              onCheckedChange={(checked) => updateIntegrationSetting("trello", "assignMembers", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Sync due dates</Label>
                              <p className="text-xs text-gray-500">Automatically sync due dates from SDLC tasks</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.trello?.settings?.dueDateSync}
                              onCheckedChange={(checked) => updateIntegrationSetting("trello", "dueDateSync", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">Enable checklists</Label>
                              <p className="text-xs text-gray-500">Automatically create checklists for new cards</p>
                            </div>
                            <Switch
                              checked={integrationConfigs.trello?.settings?.enableChecklists}
                              onCheckedChange={(checked) => updateIntegrationSetting("trello", "enableChecklists", checked)}
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Label className="text-sm">Member Mapping (Optional)</Label>
                            <Input
                              value={Object.entries(integrationConfigs.trello?.settings?.memberMapping || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                              onChange={(e) => {
                                const mapping: Record<string, string> = {};
                                e.target.value.split(',').forEach(item => {
                                  const [key, value] = item.trim().split(':');
                                  if (key && value) {
                                    mapping[key] = value;
                                  }
                                });
                                updateIntegrationSetting("trello", "memberMapping", mapping);
                              }}
                              placeholder="github:user1,jira:user2"
                              className="flex-1"
                            />
                            <p className="text-xs text-gray-500">Format: source_service:target_id</p>
                          </div>

                          {/* Trello SDLC Project Creation */}
                          <div className="border-t pt-4 mt-4">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">SDLC Project Creation</Label>
                                <p className="text-xs text-gray-500">Create complete Trello boards from SDLC documents</p>
                              </div>
                              
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">🎯 Project Structure</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• <strong>Boards</strong> → Project workspaces</li>
                                  <li>• <strong>Lists</strong> → SDLC phases (Planning, Development, Testing, etc.)</li>
                                  <li>• <strong>Cards</strong> → Features, epics, and tasks</li>
                                  <li>• <strong>Labels</strong> → Priority, type, and status categorization</li>
                                  <li>• <strong>Checklists</strong> → Acceptance criteria and task breakdowns</li>
                                </ul>
                              </div>

                              {lastGeneratedSDLC ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs font-medium">SDLC Document Ready</span>
                                  </div>
                                  <Button
                                    onClick={handleTrelloCreateSDLCProject}
                                    disabled={isCreatingProject || !integrationConfigs.trello?.settings?.connected}
                                    className="w-full"
                                    size="sm"
                                  >
                                    {isCreatingProject ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Trello Project...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Trello Project
                                      </>
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-3">
                                  <div className="text-gray-400 mb-2">
                                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-sm text-gray-500">Generate an SDLC document first</p>
                                  <p className="text-xs text-gray-400">Visit the main dashboard to create a comprehensive SDLC</p>
                                </div>
                              )}

                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">✨ Features</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Intelligent epic and feature mapping</li>
                                  <li>• Automated task breakdown with checklists</li>
                                  <li>• Smart label categorization and priorities</li>
                                  <li>• Team member assignment (if configured)</li>
                                  <li>• Due date synchronization</li>
                                  <li>• Progress tracking across SDLC phases</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GitHub Projects Configuration */}
                  {integration.id === "github-projects" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Connection Status</Label>
                          <p className="text-xs text-gray-500">
                            {integrationConfigs.github?.settings?.connected 
                              ? 'GitHub account connected' 
                              : 'Requires GitHub connection'}
                          </p>
                        </div>
                        <Badge variant={integrationConfigs.github?.settings?.connected ? "default" : "secondary"}>
                          {integrationConfigs.github?.settings?.connected ? "Ready" : "Pending"}
                        </Badge>
                      </div>

                      {integrationConfigs.github?.settings?.connected ? (
                        <div className="space-y-4">
                          {/* Project Settings */}
                          <div className="space-y-2">
                            <Label className="text-sm">Project Settings</Label>
                            
                            <div className="space-y-2">
                              <Input
                                placeholder="Project Title"
                                value={integrationConfigs['github-projects']?.settings?.projectTitle || ''}
                                onChange={(e) => updateIntegrationSetting('github-projects', 'projectTitle', e.target.value)}
                              />
                              
                              <Input
                                placeholder={integrationConfigs.github?.settings?.connected 
                                  ? `Auto-filled: ${integrationConfigs.github?.settings?.username || 'GitHub username'}` 
                                  : "GitHub Username or Organization (e.g., durdan, microsoft)"}
                                value={integrationConfigs['github-projects']?.settings?.ownerId || integrationConfigs.github?.settings?.username || ''}
                                onChange={(e) => updateIntegrationSetting('github-projects', 'ownerId', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Repository Settings */}
                          <div className="space-y-2">
                            <Label className="text-sm">Repository (Optional)</Label>
                            <p className="text-xs text-gray-500">
                              Link to a repository to create issues and milestones
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder={integrationConfigs.github?.settings?.connected 
                                  ? `Auto-filled: ${integrationConfigs.github?.settings?.username || 'GitHub username'}` 
                                  : "Repository Owner"}
                                value={integrationConfigs['github-projects']?.settings?.repositoryOwner || integrationConfigs.github?.settings?.username || ''}
                                onChange={(e) => updateIntegrationSetting('github-projects', 'repositoryOwner', e.target.value)}
                              />
                              <Input
                                placeholder="Repository Name"
                                value={integrationConfigs['github-projects']?.settings?.repositoryName || ''}
                                onChange={(e) => updateIntegrationSetting('github-projects', 'repositoryName', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* SDLC Document Selection */}
                          <div className="space-y-2">
                            <Label className="text-sm">SDLC Document</Label>
                            <p className="text-xs text-gray-500">
                              Select a generated SDLC document to create the project from
                            </p>
                            
                            <Select
                              value={integrationConfigs['github-projects']?.settings?.selectedDocumentId || ''}
                              onValueChange={(value) => updateIntegrationSetting('github-projects', 'selectedDocumentId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select SDLC document..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="recent">Most Recent Document</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive SDLC</SelectItem>
                                <SelectItem value="detailed">Detailed SDLC</SelectItem>
                                <SelectItem value="enhanced">Enhanced SDLC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Project Options */}
                          <div className="space-y-3">
                            <Label className="text-sm">Project Options</Label>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm">Include Detailed Issues</Label>
                                <p className="text-xs text-gray-500">Create issues for each SDLC section</p>
                              </div>
                              <Switch
                                checked={integrationConfigs['github-projects']?.settings?.includeDetailedIssues ?? true}
                                onCheckedChange={(checked) => updateIntegrationSetting('github-projects', 'includeDetailedIssues', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm">Create Phase-Based Milestones</Label>
                                <p className="text-xs text-gray-500">Generate milestones for SDLC phases</p>
                              </div>
                              <Switch
                                checked={integrationConfigs['github-projects']?.settings?.createPhaseBasedMilestones ?? true}
                                onCheckedChange={(checked) => updateIntegrationSetting('github-projects', 'createPhaseBasedMilestones', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm">Generate Labels</Label>
                                <p className="text-xs text-gray-500">Create labels for categorization</p>
                              </div>
                              <Switch
                                checked={integrationConfigs['github-projects']?.settings?.generateLabels ?? true}
                                onCheckedChange={(checked) => updateIntegrationSetting('github-projects', 'generateLabels', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm">Estimate Story Points</Label>
                                <p className="text-xs text-gray-500">Auto-estimate story points for issues</p>
                              </div>
                              <Switch
                                checked={integrationConfigs['github-projects']?.settings?.estimateStoryPoints ?? true}
                                onCheckedChange={(checked) => updateIntegrationSetting('github-projects', 'estimateStoryPoints', checked)}
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            {!integrationConfigs['github-projects']?.settings?.connected ? (
                              <Button
                                onClick={handleGitHubProjectsConnect}
                                size="sm"
                                className="w-full"
                              >
                                <Github className="h-4 w-4 mr-2" />
                                Connect GitHub Projects
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                <Button
                                  onClick={handleCreateSDLCProject}
                                  size="sm"
                                  className="w-full"
                                  disabled={!integrationConfigs['github-projects']?.settings?.projectTitle || 
                                           !integrationConfigs['github-projects']?.settings?.ownerId}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create SDLC Project
                                </Button>
                                
                                <Button
                                  onClick={handleGitHubProjectsDisconnect}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  Disconnect GitHub Projects
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Help Text */}
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-800">
                              <strong>💡 Tips:</strong> 
                              <br />• Username auto-filled from your connected GitHub account
                              <br />• Repository is optional but enables milestone and issue creation
                              <br />• Projects will include custom fields for Status, Priority, Epic, and Story Points
                              <br />• Generated issues will have proper acceptance criteria and descriptions
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            GitHub Projects requires a connected GitHub account. Please connect GitHub first.
                          </p>
                          <Button
                            onClick={() => handleGitHubConnect()}
                            size="sm"
                            className="w-full"
                          >
                            <Github className="h-4 w-4 mr-2" />
                            Connect GitHub Account
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isMounted && integration.status === "coming-soon" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    disabled={true}
                  >
                    Coming Soon
                  </Button>
                ) : isMounted && integration.vercelIntegration ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => connectVercelIntegration(integration.id)}
                    disabled={integrationConfigs[integration.id]?.enabled}
                  >
                    {integrationConfigs[integration.id]?.enabled ? "Connected" : "Connect via Vercel"}
                  </Button>
                ) : isMounted ? (
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Configure
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                    Loading...
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={!isMounted || integration.status === "coming-soon"}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integration Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(integrationConfigs).filter((config) => config.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter((i) => i.vercelIntegration).length}
              </div>
              <div className="text-sm text-gray-600">Vercel Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{integrations.length}</div>
              <div className="text-sm text-gray-600">Available Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Sync Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Auto-create GitHub repository</div>
                <div className="text-sm text-gray-600">When a new project is generated</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Send Slack notification</div>
                <div className="text-sm text-gray-600">When documentation is ready</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Sync to Notion database</div>
                <div className="text-sm text-gray-600">When project status changes</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Create Linear issues</div>
                <div className="text-sm text-gray-600">From functional requirements</div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
