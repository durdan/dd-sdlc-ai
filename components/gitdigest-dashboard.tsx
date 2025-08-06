'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Calendar, 
  Users, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Share2,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  GitPullRequest,
  Bug,
  Code,
  BookOpen,
  Settings,
  Zap,
  Loader2,
  ChevronRight,
  Webhook,
  Copy,
  Bell,
  Github
} from 'lucide-react'

// ============================================================================
// MERMAID DIAGRAM COMPONENT
// ============================================================================

interface MermaidDiagramProps {
  content: string
  title?: string
  className?: string
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ content, title, className = "" }) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to clean Mermaid content
  const cleanMermaidContent = (rawContent: string): string => {
    if (!rawContent) return ''
    
    let cleaned = rawContent.trim()
    
    // Remove markdown code fences if present
    if (cleaned.startsWith('```mermaid')) {
      cleaned = cleaned.replace(/^```mermaid\s*\n?/, '')
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*\n?/, '')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '')
    }
    
    return cleaned.trim()
  }

  useEffect(() => {
    const renderDiagram = async () => {
      if (!diagramRef.current || !content || content.trim() === '') {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const cleanContent = cleanMermaidContent(content)
        
        if (!cleanContent) {
          setIsLoading(false)
          return
        }

        const mermaid = (await import("mermaid")).default
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: "default", 
          securityLevel: "loose",
          fontFamily: "ui-sans-serif, system-ui, sans-serif"
        })
        
        diagramRef.current.innerHTML = ''
        const { svg } = await mermaid.render(`diagram-${Date.now()}`, cleanContent)
        diagramRef.current.innerHTML = svg
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      } finally {
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [content])

  if (!content || content.trim() === '') {
    return (
      <div className={`bg-muted/20 rounded-lg border-2 border-dashed border-muted p-8 text-center ${className}`}>
        <Code className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-muted-foreground mb-2">{title || "No Diagram Available"}</h3>
        <p className="text-sm text-muted-foreground">This diagram hasn't been generated yet.</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b bg-muted/20">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
      )}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Rendering diagram...
            </div>
          </div>
        )}
        {error && (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
            <p className="text-sm text-destructive">Failed to render diagram: {error}</p>
          </div>
        )}
        <div 
          ref={diagramRef}
          className="p-6 min-h-[300px] overflow-auto"
        />
      </div>
    </div>
  )
}

// ============================================================================
// INTERFACES
// ============================================================================

interface RepoDigest {
  id: string
  repo_url: string
  repo_name: string
  repo_owner: string
  repo_full_name: string
  digest_data: {
    summary: string
    keyChanges: string[]
    sdlcScore: number
    sdlcBreakdown: {
      documentation: number
      testing: number
      security: number
      maintenance: number
      community: number
      activity: number
    }
    recommendations: string[]
    artifacts?: {
      requirementsDoc?: string
      architectureDiagram?: string
      testPlan?: string
      securityAudit?: string
    }
  }
  sdlc_score: number
  last_analyzed: string
  created_at: string
  updated_at: string
}

interface DailyReport {
  id: string
  report_date: string
  changes_summary: {
    summary: string
    keyChanges: string[]
    contributors: string[]
    commitCount: number
    prsMerged: number
    issuesResolved: number
  }
  commit_count: number
  pr_count: number
  issue_count: number
  contributors_count: number
  lines_added: number
  lines_removed: number
  ai_summary: string
  key_changes: string[]
  created_at: string
}

interface GitHubRepository {
  id: number
  name: string
  fullName: string
  private: boolean
  description: string | null
  language: string | null
  url: string // This is the html_url from GitHub API
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

interface GitDigestDashboardProps {
  config: {
    openaiKey: string
    jiraUrl: string
    jiraEmail: string
    jiraToken: string
    confluenceUrl: string
    confluenceEmail: string
    confluenceToken: string
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GitDigestDashboard({ config }: GitDigestDashboardProps) {
  const [repoUrl, setRepoUrl] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentDigest, setCurrentDigest] = useState<any>(null)
  const [userDigests, setUserDigests] = useState<any[]>([])
  const [dailyReports, setDailyReports] = useState<any[]>([])
  const [isLoadingDigests, setIsLoadingDigests] = useState(false)
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [activeTab, setActiveTab] = useState('analyze')
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepository[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Webhook settings state
  const [webhookSettings, setWebhookSettings] = useState({
    enabled: false,
    webhookUrl: '',
    selectedRepos: [] as string[],
    triggers: {
      push: true,
      pullRequest: true,
      issues: false,
      release: false
    },
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '09:00'
    }
  })
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false)
  const [webhookToken, setWebhookToken] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    loadUserDigests()
    checkGithubConnection()
  }, [])

  // Check GitHub connection and load repos when connection status changes
  useEffect(() => {
    if (githubConnected) {
      loadConnectedRepositories()
    }
  }, [githubConnected])

  // Re-check GitHub connection when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      checkGithubConnection()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Also check when the tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkGithubConnection()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Load daily reports when daily reports tab is accessed and currentDigest is available
  useEffect(() => {
    if (activeTab === 'reports' && currentDigest) {
      loadDailyReports(currentDigest.id)
    }
  }, [activeTab, currentDigest])

  const checkGithubConnection = async () => {
    try {
      const response = await fetch('/api/auth/github/status', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('GitHub connection status:', data)
        setGithubConnected(data.connected)
        
        // If connected, also try to load repositories
        if (data.connected && connectedRepos.length === 0) {
          loadConnectedRepositories()
        }
      } else {
        console.error('GitHub status check failed:', response.status)
        setGithubConnected(false)
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
      setGithubConnected(false)
    }
  }

  const loadConnectedRepositories = async () => {
    setIsLoadingRepos(true)
    try {
      const response = await fetch('/api/auth/github/repos?per_page=50&sort=updated', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.repositories) {
          setConnectedRepos(data.repositories)
          console.log(`Loaded ${data.repositories.length} repositories`)
        }
      } else {
        console.error('Failed to load repositories:', response.status)
      }
    } catch (error) {
      console.error('Error loading repositories:', error)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const handleRepoSelect = (repo: GitHubRepository) => {
    setRepoUrl(repo.url || '')
    setError(null) // Clear any existing errors
    // Don't change active tab since we're already on analyze tab
  }

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadUserDigests = async () => {
    try {
      const response = await fetch('/api/gitdigest/digests', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserDigests(data.digests || [])
      }
    } catch (error) {
      console.error('Error loading user digests:', error)
    }
  }

  const handleAnalyze = async () => {
    if (!repoUrl?.trim()) {
      setError('Please enter a repository URL')
      return
    }

    if (!config.openaiKey || config.openaiKey.trim() === '') {
      setError('OpenAI API key is required. Please configure it in the Settings tab.')
      return
    }

    setIsAnalyzing(true)
    setCurrentDigest(null)
    setError(null)

    try {
      const response = await fetch('/api/gitdigest/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          repo_url: repoUrl?.trim(),
          openaiKey: config.openaiKey
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      setCurrentDigest(data.digest)
      setActiveTab('digest')
      
      // Refresh user digests to include the new one
      await loadUserDigests()
    } catch (error) {
      console.error('Error analyzing repository:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze repository')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadDailyReports = async (digestId: string) => {
    try {
      const response = await fetch(`/api/gitdigest/daily-reports?digest_id=${digestId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDailyReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error loading daily reports:', error)
    }
  }

  const shareDigest = async (digestId: string) => {
    try {
      const response = await fetch('/api/gitdigest/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ digest_id: digestId })
      })

      if (response.ok) {
        const data = await response.json()
        const shareUrl = `${window.location.origin}/digest/${data.share_token}`
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing digest:', error)
      alert('Failed to create share link')
    }
  }

  const exportDigest = async (digestId: string, format: 'jira' | 'confluence' | 'github') => {
    try {
      // Implementation for exporting digest
      console.log(`Exporting digest ${digestId} to ${format}`)
    } catch (error) {
      console.error('Error exporting digest:', error)
    }
  }

  // ============================================================================
  // WEBHOOK SETTINGS FUNCTIONS
  // ============================================================================

  const loadWebhookSettings = async () => {
    setIsLoadingWebhooks(true)
    try {
      const response = await fetch('/api/gitdigest/settings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setWebhookSettings(data.settings || webhookSettings)
      }
    } catch (error) {
      console.error('Error loading GitDigest settings:', error)
    } finally {
      setIsLoadingWebhooks(false)
    }
  }

  const saveWebhookSettings = async () => {
    try {
      setSavingSettings(true)
      const response = await fetch('/api/gitdigest/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookSettings),
      })
      
      if (response.ok) {
        console.log('✅ GitDigest settings saved successfully')
        // Show success message
      } else {
        console.error('❌ Failed to save GitDigest settings')
      }
    } catch (error) {
      console.error('Error saving GitDigest settings:', error)
    } finally {
      setSavingSettings(false)
    }
  }

  const generateWebhookToken = async () => {
    // No longer needed - using existing GitHub webhook infrastructure
    console.log('ℹ️ Using existing GitHub webhook infrastructure')
  }

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/github/webhooks`
    navigator.clipboard.writeText(webhookUrl)
    console.log('📋 Copied webhook URL:', webhookUrl)
  }

  const copyWebhookToken = () => {
    // No longer needed - using existing GitHub webhook infrastructure
    console.log('ℹ️ Token not needed with existing GitHub webhook infrastructure')
  }

  // Load webhook settings on component mount
  useEffect(() => {
    loadWebhookSettings()
  }, [])

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderAnalyzeTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Analyze Repository
          </CardTitle>
          <CardDescription>
            Enter a GitHub repository URL to generate a comprehensive SDLC digest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connected Repositories Section */}
          {githubConnected && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Connected Repositories</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadConnectedRepositories}
                  disabled={isLoadingRepos}
                >
                  {isLoadingRepos ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
              
              {isLoadingRepos ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading repositories...
                </div>
              ) : connectedRepos.length > 0 ? (
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {connectedRepos.map((repo) => (
                    <Card 
                      key={repo.id} 
                      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRepoSelect(repo)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium truncate">{repo.fullName}</span>
                            {repo.private && (
                              <Badge variant="secondary" className="text-xs">Private</Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                {repo.language}
                              </span>
                            )}
                            <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No repositories found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure you have repositories in your GitHub account
                  </p>
                </Card>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter URL manually
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Manual URL Input */}
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/owner/repo or owner/repo"
              value={repoUrl || ''}
              onChange={(e) => {
                setRepoUrl(e.target.value)
                if (error) setError(null)
              }}
              className={`font-mono ${repoUrl ? 'border-green-500' : ''}`}
            />
            {repoUrl && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Repository URL set: {repoUrl}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleAnalyze} 
            disabled={!repoUrl?.trim() || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Repository...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze Repository
              </>
            )}
          </Button>

          {!githubConnected && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">GitHub Not Connected</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Connect your GitHub account to see your repositories and get better analysis results.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={() => window.location.href = '/dashboard#integrations'}
                      >
                        Connect GitHub
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        onClick={() => {
                          checkGithubConnection()
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh Status
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Recent Digests */}
      {userDigests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Digests</CardTitle>
            <CardDescription>Your previously analyzed repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userDigests.slice(0, 5).map((digest) => (
                <div key={digest.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{digest.repo_full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {digest.sdlc_score}/100 • {new Date(digest.last_analyzed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentDigest(digest)
                      setActiveTab('digest')
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderDigestTab = () => {
    if (!currentDigest) {
      return (
        <div className="text-center py-8">
          <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No digest selected. Analyze a repository first.</p>
        </div>
      )
    }

    const digest = currentDigest.digest_data

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  {currentDigest.repo_full_name}
                </CardTitle>
                <CardDescription>
                  Last analyzed: {new Date(currentDigest.last_analyzed).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareDigest(currentDigest.id)}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Digest</DialogTitle>
                      <DialogDescription>
                        Choose where to export this digest
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => exportDigest(currentDigest.id, 'jira')}
                      >
                        Export to JIRA Epic
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => exportDigest(currentDigest.id, 'confluence')}
                      >
                        Export to Confluence Page
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => exportDigest(currentDigest.id, 'github')}
                      >
                        Export to GitHub Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* SDLC Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              SDLC Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {digest.sdlcScore}/100
                </div>
                <Progress value={digest.sdlcScore} className="w-full" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(digest.sdlcBreakdown).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-semibold mb-1">{score}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {category}
                    </div>
                    <Progress value={score} className="w-full mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {digest.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Changes */}
        {digest.keyChanges && digest.keyChanges.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                Key Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {digest.keyChanges.map((change, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{change}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {digest.recommendations && digest.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {digest.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Artifacts */}
        {digest.artifacts && Object.keys(digest.artifacts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Generated Artifacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="requirements" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {digest.artifacts.requirementsDoc && (
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  )}
                  {digest.artifacts.architectureDiagram && (
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  )}
                  {digest.artifacts.testPlan && (
                    <TabsTrigger value="testing">Test Plan</TabsTrigger>
                  )}
                  {digest.artifacts.securityAudit && (
                    <TabsTrigger value="security">Security</TabsTrigger>
                  )}
                </TabsList>
                
                {digest.artifacts.requirementsDoc && (
                  <TabsContent value="requirements">
                    <div className="bg-white rounded-lg border shadow-sm">
                      <div className="px-4 py-3 border-b bg-muted/20">
                        <h3 className="font-medium text-sm">Requirements Document</h3>
                      </div>
                      <ScrollArea className="h-[400px] w-full p-4">
                        <div className="prose prose-sm max-w-none">
                          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/20 p-4 rounded-md">
                            {digest.artifacts.requirementsDoc}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                )}
                
                {digest.artifacts.architectureDiagram && (
                  <TabsContent value="architecture">
                    <MermaidDiagram 
                      content={digest.artifacts.architectureDiagram} 
                      title="System Architecture Diagram"
                    />
                  </TabsContent>
                )}
                
                {digest.artifacts.testPlan && (
                  <TabsContent value="testing">
                    <div className="bg-white rounded-lg border shadow-sm">
                      <div className="px-4 py-3 border-b bg-muted/20">
                        <h3 className="font-medium text-sm">Test Plan</h3>
                      </div>
                      <ScrollArea className="h-[400px] w-full p-4">
                        <div className="prose prose-sm max-w-none">
                          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/20 p-4 rounded-md">
                            {digest.artifacts.testPlan}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                )}
                
                {digest.artifacts.securityAudit && (
                  <TabsContent value="security">
                    <div className="bg-white rounded-lg border shadow-sm">
                      <div className="px-4 py-3 border-b bg-muted/20">
                        <h3 className="font-medium text-sm">Security Audit</h3>
                      </div>
                      <ScrollArea className="h-[400px] w-full p-4">
                        <div className="prose prose-sm max-w-none">
                          <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/20 p-4 rounded-md">
                            {digest.artifacts.securityAudit}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderDailyReportsTab = () => {
    if (!currentDigest) {
      return (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a digest to view daily reports</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Reports - {currentDigest.repo_full_name}
            </CardTitle>
            <CardDescription>
              Automated daily standup reports for repository activity
            </CardDescription>
          </CardHeader>
        </Card>

        {dailyReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No daily reports available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Daily reports will be generated automatically based on repository activity
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {dailyReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{new Date(report.report_date).toLocaleDateString()}</span>
                    <Badge variant="outline">
                      {report.commit_count} commits
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-sm leading-relaxed">
                        {report.ai_summary}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-semibold">{report.commit_count}</div>
                        <div className="text-sm text-muted-foreground">Commits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold">{report.pr_count}</div>
                        <div className="text-sm text-muted-foreground">Pull Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold">{report.issue_count}</div>
                        <div className="text-sm text-muted-foreground">Issues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-semibold">{report.contributors_count}</div>
                        <div className="text-sm text-muted-foreground">Contributors</div>
                      </div>
                    </div>
                    
                    {report.key_changes && report.key_changes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Changes</h4>
                        <div className="space-y-1">
                          {report.key_changes.map((change, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMyDigestsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Digests</h2>
        <Button
          variant="outline"
          onClick={loadUserDigests}
          disabled={isLoadingDigests}
        >
          {isLoadingDigests ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {isLoadingDigests ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your digests...</p>
        </div>
      ) : userDigests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No digests found. Analyze a repository to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userDigests.map((digest) => (
            <Card key={digest.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{digest.repo_name}</CardTitle>
                <CardDescription>{digest.repo_owner}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">SDLC Score</span>
                    <Badge variant={digest.sdlc_score >= 80 ? 'default' : digest.sdlc_score >= 60 ? 'secondary' : 'destructive'}>
                      {digest.sdlc_score}/100
                    </Badge>
                  </div>
                  <Progress value={digest.sdlc_score} className="w-full" />
                  <div className="text-sm text-muted-foreground">
                    Last analyzed: {new Date(digest.last_analyzed).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCurrentDigest(digest)
                      setActiveTab('digest')
                    }}
                  >
                    View Digest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  // ============================================================================
  // SETTINGS TAB
  // ============================================================================

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">GitDigest Settings</h2>
      </div>

      <div className="grid gap-6">
        {/* GitHub App Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub App Integration
            </CardTitle>
            <CardDescription>
              Install the GitDigest GitHub App to automatically generate digests when your repositories change.
              This uses your existing GitHub connection for seamless integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GitHub Connection Status */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${githubConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">
                    GitHub {githubConnected ? 'Connected' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {githubConnected 
                      ? 'Using your existing GitHub OAuth connection' 
                      : 'Connect GitHub to enable automatic digests'
                    }
                  </p>
                </div>
              </div>
              {!githubConnected && (
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard#integrations'}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </Button>
              )}
            </div>

            {githubConnected && (
              <>
                <Separator />
                
                {/* Enable GitDigest */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable GitDigest Automation</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically generate digests when your repositories are updated
                    </p>
                  </div>
                  <Switch
                    checked={webhookSettings.enabled}
                    onCheckedChange={(checked) => 
                      setWebhookSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                {webhookSettings.enabled && (
                  <>
                    {/* Repository Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Connected Repositories</Label>
                      <div className="max-h-48 overflow-y-auto border rounded-lg">
                        {isLoadingRepos ? (
                          <div className="p-4 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading repositories...</p>
                          </div>
                        ) : connectedRepos.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">No repositories found</p>
                          </div>
                        ) : (
                          <div className="space-y-2 p-3">
                            {connectedRepos.map((repo) => (
                              <div key={repo.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  <span className="text-sm font-medium">{repo.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {repo.private ? 'Private' : 'Public'}
                                  </Badge>
                                </div>
                                <Switch
                                  checked={webhookSettings.selectedRepos.includes(repo.fullName)}
                                  onCheckedChange={(checked) => {
                                    setWebhookSettings(prev => ({
                                      ...prev,
                                      selectedRepos: checked 
                                        ? [...prev.selectedRepos, repo.fullName]
                                        : prev.selectedRepos.filter(r => r !== repo.fullName)
                                    }))
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadConnectedRepositories}
                        disabled={isLoadingRepos}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Repositories
                      </Button>
                    </div>

                    {/* Trigger Events */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Trigger Events</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Push Events</Label>
                            <p className="text-xs text-muted-foreground">Trigger on code pushes</p>
                          </div>
                          <Switch
                            checked={webhookSettings.triggers.push}
                            onCheckedChange={(checked) => 
                              setWebhookSettings(prev => ({ 
                                ...prev, 
                                triggers: { ...prev.triggers, push: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Pull Requests</Label>
                            <p className="text-xs text-muted-foreground">Trigger on PR events</p>
                          </div>
                          <Switch
                            checked={webhookSettings.triggers.pullRequest}
                            onCheckedChange={(checked) => 
                              setWebhookSettings(prev => ({ 
                                ...prev, 
                                triggers: { ...prev.triggers, pullRequest: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Issues</Label>
                            <p className="text-xs text-muted-foreground">Trigger on issue events</p>
                          </div>
                          <Switch
                            checked={webhookSettings.triggers.issues}
                            onCheckedChange={(checked) => 
                              setWebhookSettings(prev => ({ 
                                ...prev, 
                                triggers: { ...prev.triggers, issues: checked }
                              }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm">Releases</Label>
                            <p className="text-xs text-muted-foreground">Trigger on new releases</p>
                          </div>
                          <Switch
                            checked={webhookSettings.triggers.release}
                            onCheckedChange={(checked) => 
                              setWebhookSettings(prev => ({ 
                                ...prev, 
                                triggers: { ...prev.triggers, release: checked }
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Digests */}
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Scheduled Digests</Label>
                          <p className="text-xs text-muted-foreground">
                            Generate regular digests on a schedule
                          </p>
                        </div>
                        <Switch
                          checked={webhookSettings.schedule.enabled}
                          onCheckedChange={(checked) => 
                            setWebhookSettings(prev => ({ 
                              ...prev, 
                              schedule: { ...prev.schedule, enabled: checked }
                            }))
                          }
                        />
                      </div>

                      {webhookSettings.schedule.enabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Frequency</Label>
                            <Select
                              value={webhookSettings.schedule.frequency}
                              onValueChange={(value) => 
                                setWebhookSettings(prev => ({ 
                                  ...prev, 
                                  schedule: { ...prev.schedule, frequency: value }
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Time</Label>
                            <Input
                              type="time"
                              value={webhookSettings.schedule.time}
                              onChange={(e) => 
                                setWebhookSettings(prev => ({ 
                                  ...prev, 
                                  schedule: { ...prev.schedule, time: e.target.value }
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save Settings */}
                    <div className="flex justify-end">
                      <Button 
                        onClick={saveWebhookSettings}
                        disabled={savingSettings}
                      >
                        {savingSettings ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Bell className="w-4 h-4 mr-2" />
                        )}
                        {savingSettings ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* GitHub App Installation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              How It Works
            </CardTitle>
            <CardDescription>
              GitDigest uses your existing GitHub connection to automatically generate repository insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Connect GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    Uses your existing GitHub OAuth connection for secure access
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Select Repositories</p>
                  <p className="text-sm text-muted-foreground">
                    Choose which repositories should generate automatic digests
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Configure Triggers</p>
                  <p className="text-sm text-muted-foreground">
                    Set which events (pushes, PRs, issues) should trigger digest generation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium">Automatic Generation</p>
                  <p className="text-sm text-muted-foreground">
                    GitDigest monitors your repositories and generates insights automatically
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Secure & Private:</strong> GitDigest uses your existing GitHub permissions 
                and only analyzes metadata - no source code is stored or transmitted to third parties.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Advanced Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Configuration
            </CardTitle>
            <CardDescription>
              Fine-tune your GitDigest automation settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Analysis Depth</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light (Basic metrics)</SelectItem>
                    <SelectItem value="standard">Standard (Recommended)</SelectItem>
                    <SelectItem value="deep">Deep (Comprehensive analysis)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Digest Format</Label>
                <Select defaultValue="markdown">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Include Mermaid Diagrams</Label>
                <p className="text-xs text-muted-foreground">
                  Generate architecture diagrams in digest artifacts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notify on Completion</Label>
                <p className="text-xs text-muted-foreground">
                  Send notifications when digests are generated
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GitDigest</h1>
          <p className="text-muted-foreground">
            AI-powered repository analysis and SDLC insights
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="tabs-mobile-container tabs-scroll-container mb-4">
          <TabsList className="tabs-mobile-list">
            <TabsTrigger value="analyze" className="tab-trigger-mobile">
              <Zap className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analyze</span>
              <span className="sm:hidden">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="digest" className="tab-trigger-mobile">
              <FileText className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Digest</span>
              <span className="sm:hidden">Digest</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="tab-trigger-mobile">
              <Clock className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Daily Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="my-digests" className="tab-trigger-mobile">
              <BookOpen className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My Digests</span>
              <span className="sm:hidden">My Digests</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="tab-trigger-mobile">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analyze" className="space-y-6">
          {renderAnalyzeTab()}
        </TabsContent>

        <TabsContent value="digest" className="space-y-6">
          {renderDigestTab()}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {renderDailyReportsTab()}
        </TabsContent>

        <TabsContent value="my-digests" className="space-y-6">
          {renderMyDigestsTab()}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {renderSettingsTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 