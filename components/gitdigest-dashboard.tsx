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
  ChevronRight
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

  useEffect(() => {
    loadUserDigests()
    loadConnectedRepositories()
    checkGithubConnection()
  }, [])

  // Load daily reports when daily reports tab is accessed and currentDigest is available
  useEffect(() => {
    if (activeTab === 'reports' && currentDigest) {
      loadDailyReports(currentDigest.id)
    }
  }, [activeTab, currentDigest])

  const checkGithubConnection = async () => {
    try {
      const response = await fetch('/api/auth/github/status')
      if (response.ok) {
        const data = await response.json()
        setGithubConnected(data.connected)
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
    }
  }

  const loadConnectedRepositories = async () => {
    setIsLoadingRepos(true)
    try {
      const response = await fetch('/api/auth/github/repos?per_page=50&sort=updated')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.repositories) {
          setConnectedRepos(data.repositories)
        }
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
      const response = await fetch('/api/gitdigest/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ digest_id: digestId, format })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully exported to ${format}! URL: ${data.url}`)
      }
    } catch (error) {
      console.error('Error exporting digest:', error)
      alert(`Failed to export to ${format}`)
    }
  }

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
                  <div>
                    <p className="font-medium text-yellow-800">GitHub Not Connected</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Connect your GitHub account to see your repositories and get better analysis results.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                      onClick={() => window.open('/api/auth/github/config', '_blank')}
                    >
                      Connect GitHub
                    </Button>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            My Digests
          </CardTitle>
          <CardDescription>
            All your analyzed repositories and their SDLC scores
          </CardDescription>
        </CardHeader>
      </Card>

      {userDigests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No digests yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Analyze your first repository to get started
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setActiveTab('analyze')}
            >
              Analyze Repository
            </Button>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Zap className="w-4 h-4 mr-2" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="digest" className="flex items-center gap-2">
            <FileText className="w-4 h-4 mr-2" />
            Digest
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Clock className="w-4 h-4 mr-2" />
            Daily Reports
          </TabsTrigger>
          <TabsTrigger value="my-digests" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 mr-2" />
            My Digests
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  )
} 