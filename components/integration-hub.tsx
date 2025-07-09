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
        channel: "#development",
        notifications: ["project-created", "documentation-ready"],
        mentionTeam: true,
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
  })

  useEffect(() => {
    setIsMounted(true)
    
    // Load integration configs from localStorage (for non-GitHub integrations)
    if (typeof window !== 'undefined') {
      const savedConfigs = localStorage.getItem('integrationConfigs')
      if (savedConfigs) {
        try {
          const parsedConfigs = JSON.parse(savedConfigs)
          // Only load non-GitHub configs from localStorage
          const { github, ...otherConfigs } = parsedConfigs
          setIntegrationConfigs(prev => ({ ...prev, ...otherConfigs }))
        } catch (error) {
          console.error('Failed to parse saved integration configs:', error)
        }
      }
    }
    
    // Load GitHub configuration from database
    loadGitHubConfigFromDatabase()
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
        
        console.log('✅ GitHub config loaded from database:', config.connected ? 'Connected' : 'Disconnected')
        console.log('🔍 Database config details:', config)
      }
    } catch (error) {
      console.error('Error loading GitHub config from database:', error)
      // Fall back to checking token status
      checkGitHubConnection()
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

  // Add effect to monitor GitHub config changes
  useEffect(() => {
    console.log('🔄 GitHub integration config updated:', {
      enabled: integrationConfigs.github?.enabled,
      connected: integrationConfigs.github?.settings?.connected,
      username: integrationConfigs.github?.settings?.username
    })
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
  
  // Save integration configs to localStorage whenever they change
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('integrationConfigs', JSON.stringify(integrationConfigs))
    }
  }, [integrationConfigs, isMounted])

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
      description: "Real-time notifications and team collaboration",
      icon: <Slack className="h-6 w-6" />,
      category: "communication",
      status: "coming-soon",
      features: ["Project Notifications", "Team Mentions", "Document Sharing", "Status Updates"],
      setupRequired: true,
      vercelIntegration: true,
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Enterprise communication and collaboration",
      icon: <Users className="h-6 w-6" />,
      category: "communication",
      status: "coming-soon",
      features: ["Channel Notifications", "File Sharing", "Meeting Integration", "Bot Commands"],
      setupRequired: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Comprehensive documentation and knowledge management",
      icon: <FileText className="h-6 w-6" />,
      category: "documentation",
      status: "coming-soon",
      features: ["Page Creation", "Database Sync", "Template Import", "Real-time Collaboration"],
      setupRequired: true,
    },
    {
      id: "linear",
      name: "Linear",
      description: "Modern issue tracking and project management",
      icon: <Zap className="h-6 w-6" />,
      category: "project-management",
      status: "coming-soon",
      features: ["Issue Creation", "Project Sync", "Milestone Tracking", "Team Assignment"],
      setupRequired: true,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Visual project management with boards and cards",
      icon: <Trello className="h-6 w-6" />,
      category: "project-management",
      status: "coming-soon",
      features: ["Board Creation", "Card Management", "Checklist Sync", "Due Date Tracking"],
      setupRequired: true,
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

  // Claude configuration handlers
  const handleClaudeConnect = async () => {
    const apiKey = prompt('Enter your Claude API key:')
    if (!apiKey || !apiKey.trim()) return
    
    try {
      // Test the API key
      const response = await fetch('/api/claude-code-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          testConnection: true
        })
      })
      
      if (response.ok) {
        // Update integration state
        updateIntegrationSetting('claude', 'connected', true)
        updateIntegrationSetting('claude', 'apiKey', apiKey.trim())
        
        // Enable the integration
        setIntegrationConfigs((prev) => ({
          ...prev,
          claude: {
            ...prev.claude,
            enabled: true,
            status: "connected",
          },
        }))
        
        alert('✅ Successfully connected to Claude AI!')
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      console.error('Claude connection error:', error)
      alert('❌ Failed to connect to Claude. Please check your API key.')
    }
  }
  
  const handleClaudeDisconnect = () => {
    updateIntegrationSetting('claude', 'connected', false)
    updateIntegrationSetting('claude', 'apiKey', '')
    
    setIntegrationConfigs((prev) => ({
      ...prev,
      claude: {
        ...prev.claude,
        enabled: false,
        status: "disconnected",
      },
    }))
    
    alert('Claude AI has been disconnected.')
  }

  // GitHub connection handlers
  const handleGitHubConnect = () => {
    // Check if GitHub client ID is configured
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    
    if (!clientId) {
      alert('⚠️ GitHub OAuth not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID environment variable.')
      return
    }
    
    // Real GitHub OAuth flow
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/github/callback')
    const scope = encodeURIComponent('repo user:email read:user')
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
          
          // Store token securely (in httpOnly cookie via backend)
          await fetch('/api/auth/github/store-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: data.access_token }),
          })

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

  // Connect to Vercel integration
  const connectVercelIntegration = (integrationId: string) => {
    // In a real app, this would redirect to Vercel's OAuth flow
    console.log(`Connecting to ${integrationId} via Vercel...`)
    // Simulate connection
    setTimeout(() => {
      toggleIntegration(integrationId)
    }, 1000)
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

                  {/* Slack Settings */}
                  {integration.id === "slack" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Default channel</Label>
                        <Input
                          value={integrationConfigs.slack.settings.channel}
                          onChange={(e) => updateIntegrationSetting("slack", "channel", e.target.value)}
                          placeholder="#development"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Mention team</Label>
                        <Switch
                          checked={integrationConfigs.slack.settings.mentionTeam}
                          onCheckedChange={(checked) => updateIntegrationSetting("slack", "mentionTeam", checked)}
                        />
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
