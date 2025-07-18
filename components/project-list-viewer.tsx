"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { 
  GitBranch, 
  ExternalLink, 
  Loader2, 
  Github, 
  FileText,
  ChevronDown,
  ChevronRight,
  Bot,
  Code,
  Eye
} from 'lucide-react'

interface ProjectResult {
  id: string
  title: string
  status: string
  createdAt: string
  jiraEpic?: string
  confluencePage?: string
  githubProject?: {
    id: string
    url: string
    number: number
    issueCount?: number
    repositoryName?: string
  }
  documents: {
    businessAnalysis: string
    functionalSpec: string
    technicalSpec: string
    uxSpec: string
    architecture: string
    comprehensive?: string
    mermaidDiagrams?: string
  }
  hasComprehensiveContent: boolean
  totalDocuments: number
  projectType?: 'sdlc' | 'claude_code_assistant'
}

interface ProjectListViewerProps {
  projects: ProjectResult[]
  onJiraExport?: (project: ProjectResult) => void
  onConfluenceExport?: (project: ProjectResult) => void
  onGitHubProjectCreate?: (project: ProjectResult) => void
  isExportingToJira?: boolean
  isExportingToConfluence?: boolean
  isCreatingGitHubProject?: boolean
  selectedProjectForGitHub?: ProjectResult | null
  config?: any
}

export function ProjectListViewer({
  projects,
  onJiraExport,
  onConfluenceExport,
  onGitHubProjectCreate,
  isExportingToJira = false,
  isExportingToConfluence = false,
  isCreatingGitHubProject = false,
  selectedProjectForGitHub,
  config
}: ProjectListViewerProps) {
  const [expanded, setExpanded] = useState(false)
  const [projectFilter, setProjectFilter] = useState<'all' | 'sdlc' | 'claude_code_assistant'>('all')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (projectFilter === 'all') return true
    return project.projectType === projectFilter
  })

  // Get available tabs for a project based on its content
  const getAvailableTabs = (project: ProjectResult) => {
    const tabs = []
    
    if (project.projectType === 'claude_code_assistant') {
      // Claude Code Assistant projects have different structure
      return ['overview']
    }
    
    // SDLC projects - check what documents are available
    if (project.documents.businessAnalysis && project.documents.businessAnalysis.length > 100) {
      tabs.push('business')
    }
    if (project.documents.functionalSpec && project.documents.functionalSpec.length > 100) {
      tabs.push('functional')
    }
    if (project.documents.technicalSpec && project.documents.technicalSpec.length > 100) {
      tabs.push('technical')
    }
    if (project.documents.uxSpec && project.documents.uxSpec.length > 100) {
      tabs.push('ux')
    }
    if (project.documents.architecture && project.documents.architecture.length > 100) {
      tabs.push('architecture')
    }
    if (project.documents.comprehensive && project.documents.comprehensive.length > 100) {
      tabs.push('comprehensive')
    }
    
    return tabs
  }

  // Handle project click - open appropriate viewer
  const handleProjectClick = (project: ProjectResult) => {
    if (project.projectType === 'claude_code_assistant') {
      // Navigate to Claude Code Assistant viewer with project ID
      window.location.href = `/claude-code?project=${project.id}`
    } else {
      // Toggle project expansion for SDLC projects
      const newExpanded = new Set(expandedProjects)
      if (newExpanded.has(project.id)) {
        newExpanded.delete(project.id)
      } else {
        newExpanded.add(project.id)
      }
      setExpandedProjects(newExpanded)
    }
  }

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  if (projects.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors" 
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Recent Projects
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {projects.length}
            </Badge>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`} />
        </CardTitle>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          {/* Project Type Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
              <div className="flex gap-1">
                <Button
                  variant={projectFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProjectFilter('all')}
                  className="text-xs"
                >
                  All ({projects.length})
                </Button>
                <Button
                  variant={projectFilter === 'sdlc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProjectFilter('sdlc')}
                  className="text-xs"
                >
                  SDLC ({projects.filter(p => p.projectType === 'sdlc').length})
                </Button>
                <Button
                  variant={projectFilter === 'claude_code_assistant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProjectFilter('claude_code_assistant')}
                  className="text-xs"
                >
                  Claude Code ({projects.filter(p => p.projectType === 'claude_code_assistant').length})
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredProjects.map((project) => {
              const isExpanded = expandedProjects.has(project.id)
              const availableTabs = getAvailableTabs(project)
              const hasContent = availableTabs.length > 0
              
              return (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        {project.projectType === 'claude_code_assistant' && (
                          <Badge variant="outline" className="text-blue-700 border-blue-200 text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            Claude Code
                          </Badge>
                        )}
                        {project.projectType === 'sdlc' && (
                          <Badge variant="outline" className="text-green-700 border-green-200 text-xs">
                            <Code className="h-3 w-3 mr-1" />
                            SDLC
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Created on {project.createdAt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          {project.status}
                        </Badge>
                        {project.jiraEpic && (
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            JIRA: {project.jiraEpic}
                          </Badge>
                        )}
                        {project.confluencePage && (
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Confluence
                          </Badge>
                        )}
                        {project.githubProject && (
                          <Badge variant="outline" className="text-gray-700 border-gray-200">
                            <Github className="h-3 w-3 mr-1" />
                            GitHub: #{project.githubProject.number}
                          </Badge>
                        )}
                        {hasContent && (
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            <FileText className="h-3 w-3 mr-1" />
                            {availableTabs.length} docs
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      {/* View/Expand Button */}
                      {project.projectType === 'claude_code_assistant' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleProjectClick(project)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">View in Claude Code</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      ) : hasContent ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleProjectExpansion(project.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Collapse</span>
                              <span className="sm:hidden">Collapse</span>
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Expand</span>
                              <span className="sm:hidden">Expand</span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled
                          className="text-gray-400 border-gray-200"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">No Content</span>
                          <span className="sm:hidden">Empty</span>
                        </Button>
                      )}
                      
                      {/* Integration Buttons - Only for SDLC projects */}
                      {project.projectType === 'sdlc' && (
                        <>
                          {/* JIRA Integration Buttons */}
                          {project.jiraEpic ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-700 border-blue-200 hover:bg-blue-50"
                              onClick={() => {
                                const url = project.jiraEpicUrl || `${config?.jiraUrl}/browse/${project.jiraEpic}`
                                window.open(url, '_blank')
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">View JIRA</span>
                              <span className="sm:hidden">JIRA</span>
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onJiraExport?.(project)}
                              disabled={isExportingToJira}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              {isExportingToJira ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <ExternalLink className="h-4 w-4 mr-1" />
                              )}
                              <span className="hidden sm:inline">Export Jira</span>
                              <span className="sm:hidden">Jira</span>
                            </Button>
                          )}
                          
                          {/* GitHub Projects Integration Button */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onGitHubProjectCreate?.(project)}
                            disabled={isCreatingGitHubProject}
                            className="text-gray-800 border-gray-300 hover:bg-gray-50"
                          >
                            {isCreatingGitHubProject && selectedProjectForGitHub?.id === project.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Github className="h-4 w-4 mr-1" />
                            )}
                            <span className="hidden sm:inline">GitHub</span>
                            <span className="sm:hidden">GitHub</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content - Only for SDLC projects with content */}
                  {isExpanded && project.projectType === 'sdlc' && hasContent && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Tabs defaultValue={availableTabs[0]} className="w-full">
                        <div className="w-full overflow-x-auto whitespace-nowrap -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <TabsList className="inline-flex w-max">
                            {availableTabs.includes('business') && (
                              <TabsTrigger value="business" className="text-xs sm:text-sm min-w-[120px]">
                                <span className="hidden sm:inline">Business</span>
                                <span className="sm:hidden">Biz</span>
                              </TabsTrigger>
                            )}
                            {availableTabs.includes('functional') && (
                              <TabsTrigger value="functional" className="text-xs sm:text-sm min-w-[120px]">
                                <span className="hidden sm:inline">Functional</span>
                                <span className="sm:hidden">Func</span>
                              </TabsTrigger>
                            )}
                            {availableTabs.includes('technical') && (
                              <TabsTrigger value="technical" className="text-xs sm:text-sm min-w-[120px]">
                                <span className="hidden sm:inline">Technical</span>
                                <span className="sm:hidden">Tech</span>
                              </TabsTrigger>
                            )}
                            {availableTabs.includes('ux') && (
                              <TabsTrigger value="ux" className="text-xs sm:text-sm min-w-[120px]">UX</TabsTrigger>
                            )}
                            {availableTabs.includes('architecture') && (
                              <TabsTrigger value="architecture" className="text-xs sm:text-sm min-w-[120px]">
                                <span className="hidden sm:inline">Architecture</span>
                                <span className="sm:hidden">Arch</span>
                              </TabsTrigger>
                            )}
                            {availableTabs.includes('comprehensive') && (
                              <TabsTrigger value="comprehensive" className="text-xs sm:text-sm min-w-[120px]">
                                <span className="hidden sm:inline">Comprehensive</span>
                                <span className="sm:hidden">Comp</span>
                              </TabsTrigger>
                            )}
                          </TabsList>
                        </div>
                        
                        {availableTabs.includes('business') && (
                          <TabsContent value="business" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.businessAnalysis}
                              title="Business Analysis"
                              type="business"
                            />
                          </TabsContent>
                        )}
                        {availableTabs.includes('functional') && (
                          <TabsContent value="functional" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.functionalSpec}
                              title="Functional Specification"
                              type="functional"
                            />
                          </TabsContent>
                        )}
                        {availableTabs.includes('technical') && (
                          <TabsContent value="technical" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.technicalSpec}
                              title="Technical Specification"
                              type="technical"
                            />
                          </TabsContent>
                        )}
                        {availableTabs.includes('ux') && (
                          <TabsContent value="ux" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.uxSpec}
                              title="UX Specification"
                              type="ux"
                            />
                          </TabsContent>
                        )}
                        {availableTabs.includes('architecture') && (
                          <TabsContent value="architecture" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.architecture}
                              title="Architecture"
                              type="architecture"
                            />
                          </TabsContent>
                        )}
                        {availableTabs.includes('comprehensive') && (
                          <TabsContent value="comprehensive" className="mt-2">
                            <MarkdownRenderer 
                              content={project.documents.comprehensive}
                              title="Comprehensive SDLC"
                              type="comprehensive"
                            />
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 