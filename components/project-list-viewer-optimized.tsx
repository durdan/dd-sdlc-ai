"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LazyProjectCard } from '@/components/lazy-project-card'
import { 
  GitBranch, 
  ChevronDown,
  Bot,
  Code,
  Eye
} from 'lucide-react'

interface ProjectSummary {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  updated_at: string | null
  jira_project: string | null
  confluence_space: string | null
  projectType?: 'sdlc' | 'claude_code_assistant'
}

interface ProjectListViewerOptimizedProps {
  projects: ProjectSummary[]
  userId: string
  totalProjectCount?: number
  onJiraExport?: (project: any) => void
  onConfluenceExport?: (project: any) => void
  onGitHubProjectCreate?: (project: any) => void
  isExportingToJira?: boolean
  isExportingToConfluence?: boolean
  isCreatingGitHubProject?: boolean
  selectedProjectForGitHub?: any
  config?: any
}

export function ProjectListViewerOptimized({
  projects,
  userId,
  totalProjectCount = 0,
  onJiraExport,
  onConfluenceExport,
  onGitHubProjectCreate,
  isExportingToJira = false,
  isExportingToConfluence = false,
  isCreatingGitHubProject = false,
  selectedProjectForGitHub,
  config
}: ProjectListViewerOptimizedProps) {
  const [expanded, setExpanded] = useState(false)
  const [projectFilter, setProjectFilter] = useState<'all' | 'sdlc' | 'claude_code_assistant'>('all')

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(project => {
    if (projectFilter === 'all') return true
    return project.projectType === projectFilter
  })

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
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
              {totalProjectCount > 50 ? `50+` : projects.length}
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
              // Handle Claude Code Assistant projects
              if (project.projectType === 'claude_code_assistant') {
                return (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <Badge variant="outline" className="text-blue-700 border-blue-200 text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            Claude Code
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Created on {new Date(project.created_at).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Handle Claude Code project click
                            console.log('View Claude Code project:', project)
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">View in Claude Code</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              }

              // Handle SDLC projects with lazy loading
              return (
                <LazyProjectCard
                  key={project.id}
                  project={project}
                  userId={userId}
                  onJiraExport={onJiraExport}
                  onConfluenceExport={onConfluenceExport}
                  onGitHubProjectCreate={onGitHubProjectCreate}
                  isExportingToJira={isExportingToJira}
                  isExportingToConfluence={isExportingToConfluence}
                  isCreatingGitHubProject={isCreatingGitHubProject}
                  selectedProjectForGitHub={selectedProjectForGitHub}
                  config={config}
                />
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}