"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { Skeleton } from '@/components/ui/skeleton'
import { dbService } from '@/lib/database-service'
import { 
  ExternalLink, 
  Loader2, 
  Github, 
  FileText,
  ChevronDown,
  ChevronRight,
  Code,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react'

interface ProjectSummary {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  jira_project: string | null
  confluence_space: string | null
}

interface ProjectFullData {
  documents: {
    businessAnalysis?: string
    functionalSpec?: string
    technicalSpec?: string
    uxSpec?: string
    architecture?: string
    comprehensive?: string
  }
  documentAvailability: {
    business: boolean
    functional: boolean
    technical: boolean
    comprehensive: boolean
  }
  availableTabs: string[]
  integrations: any[]
}

interface LazyProjectCardProps {
  project: ProjectSummary
  userId: string
  onJiraExport?: (project: any) => void
  onConfluenceExport?: (project: any) => void
  onGitHubProjectCreate?: (project: any) => void
  isExportingToJira?: boolean
  isExportingToConfluence?: boolean
  isCreatingGitHubProject?: boolean
  selectedProjectForGitHub?: any
  config?: any
}

export function LazyProjectCard({
  project,
  userId,
  onJiraExport,
  onConfluenceExport,
  onGitHubProjectCreate,
  isExportingToJira = false,
  isExportingToConfluence = false,
  isCreatingGitHubProject = false,
  selectedProjectForGitHub,
  config
}: LazyProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fullData, setFullData] = useState<ProjectFullData | null>(null)
  const [activeTab, setActiveTab] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const loadProjectDetails = async () => {
    if (fullData || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const { project: fullProject, documents, integrations } = await dbService.getProjectFullDetails(project.id, userId)
      
      if (!fullProject) {
        setError('Failed to load project details')
        return
      }

      // Process documents to build the structure
      const projectDocuments: ProjectFullData['documents'] = {}
      const documentAvailability: ProjectFullData['documentAvailability'] = {
        business: false,
        functional: false,
        technical: false,
        comprehensive: false
      }
      const availableTabs: string[] = []

      documents.forEach(doc => {
        const content = doc.content || ''
        const hasContent = content.length > 200 && !content.includes('[Placeholder')

        switch (doc.document_type) {
          case 'business_analysis':
            if (hasContent) {
              projectDocuments.businessAnalysis = content
              documentAvailability.business = true
              availableTabs.push('business')
            }
            break
          case 'functional_spec':
            if (hasContent) {
              projectDocuments.functionalSpec = content
              documentAvailability.functional = true
              availableTabs.push('functional')
            }
            break
          case 'technical_spec':
            if (hasContent) {
              projectDocuments.technicalSpec = content
              documentAvailability.technical = true
              availableTabs.push('technical')
            }
            break
          case 'ux_spec':
            if (hasContent) {
              projectDocuments.uxSpec = content
              availableTabs.push('ux')
            }
            break
          case 'architecture':
            if (hasContent) {
              projectDocuments.architecture = content
              availableTabs.push('architecture')
            }
            break
          case 'comprehensive':
            if (hasContent) {
              projectDocuments.comprehensive = content
              documentAvailability.comprehensive = true
              availableTabs.push('comprehensive')
            }
            break
        }
      })

      setFullData({
        documents: projectDocuments,
        documentAvailability,
        availableTabs,
        integrations
      })

      // Set default active tab
      if (availableTabs.length > 0) {
        setActiveTab(availableTabs[0])
      }
    } catch (err) {
      console.error('Error loading project details:', err)
      setError('Error loading project details')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpansion = async () => {
    if (!isExpanded && !fullData) {
      await loadProjectDetails()
    }
    setIsExpanded(!isExpanded)
  }

  const hasContent = fullData ? fullData.availableTabs.length > 0 : true // Assume has content until loaded

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{project.title}</h3>
            <Badge variant="outline" className="text-green-700 border-green-200 text-xs">
              <Code className="h-3 w-3 mr-1" />
              SDLC
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Created on {new Date(project.created_at).toLocaleDateString()}</p>
          
          {/* Document Availability Indicators - Show skeleton while loading */}
          <div className="flex flex-wrap items-center gap-1 mt-2">
            <span className="text-xs text-gray-500 mr-1">Documents:</span>
            {isLoading && !fullData ? (
              <Skeleton className="h-5 w-32" />
            ) : fullData ? (
              Object.entries(fullData.documentAvailability).map(([docType, isAvailable]) => (
                <Badge 
                  key={docType}
                  variant={isAvailable ? "default" : "outline"}
                  className={`text-xs h-5 px-1.5 ${
                    isAvailable 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                >
                  {isAvailable ? (
                    <CheckCircle className="h-3 w-3 mr-0.5" />
                  ) : (
                    <Circle className="h-3 w-3 mr-0.5" />
                  )}
                  {docType === 'business' ? 'Biz' : 
                   docType === 'functional' ? 'Func' : 
                   docType === 'technical' ? 'Tech' : 
                   docType === 'comprehensive' ? 'Comp' : 
                   docType}
                </Badge>
              ))
            ) : null}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-green-700 border-green-200">
              {project.status}
            </Badge>
            {project.jira_project && (
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                <ExternalLink className="h-3 w-3 mr-1" />
                JIRA: {project.jira_project}
              </Badge>
            )}
            {project.confluence_space && (
              <Badge variant="outline" className="text-green-700 border-green-200">
                <ExternalLink className="h-3 w-3 mr-1" />
                Confluence
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* View/Expand Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleExpansion}
            disabled={isLoading}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : isExpanded ? (
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
          
          {/* Integration Buttons */}
          {project.jira_project ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-700 border-blue-200 hover:bg-blue-50"
              onClick={() => {
                const url = `${config?.jiraUrl}/browse/${project.jira_project}`
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
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {error ? (
            <div className="text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : fullData && fullData.availableTabs.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full overflow-x-auto whitespace-nowrap -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <TabsList className="inline-flex w-max">
                  {fullData.availableTabs.includes('business') && (
                    <TabsTrigger value="business" className="text-xs sm:text-sm min-w-[120px]">
                      <span className="hidden sm:inline">Business</span>
                      <span className="sm:hidden">Biz</span>
                    </TabsTrigger>
                  )}
                  {fullData.availableTabs.includes('functional') && (
                    <TabsTrigger value="functional" className="text-xs sm:text-sm min-w-[120px]">
                      <span className="hidden sm:inline">Functional</span>
                      <span className="sm:hidden">Func</span>
                    </TabsTrigger>
                  )}
                  {fullData.availableTabs.includes('technical') && (
                    <TabsTrigger value="technical" className="text-xs sm:text-sm min-w-[120px]">
                      <span className="hidden sm:inline">Technical</span>
                      <span className="sm:hidden">Tech</span>
                    </TabsTrigger>
                  )}
                  {fullData.availableTabs.includes('ux') && (
                    <TabsTrigger value="ux" className="text-xs sm:text-sm min-w-[120px]">UX</TabsTrigger>
                  )}
                  {fullData.availableTabs.includes('architecture') && (
                    <TabsTrigger value="architecture" className="text-xs sm:text-sm min-w-[120px]">
                      <span className="hidden sm:inline">Architecture</span>
                      <span className="sm:hidden">Arch</span>
                    </TabsTrigger>
                  )}
                  {fullData.availableTabs.includes('comprehensive') && (
                    <TabsTrigger value="comprehensive" className="text-xs sm:text-sm min-w-[120px]">
                      <span className="hidden sm:inline">Comprehensive</span>
                      <span className="sm:hidden">Comp</span>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              {fullData.availableTabs.includes('business') && (
                <TabsContent value="business" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.businessAnalysis || ''}
                    title="Business Analysis"
                    type="business"
                  />
                </TabsContent>
              )}
              {fullData.availableTabs.includes('functional') && (
                <TabsContent value="functional" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.functionalSpec || ''}
                    title="Functional Specification"
                    type="functional"
                  />
                </TabsContent>
              )}
              {fullData.availableTabs.includes('technical') && (
                <TabsContent value="technical" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.technicalSpec || ''}
                    title="Technical Specification"
                    type="technical"
                  />
                </TabsContent>
              )}
              {fullData.availableTabs.includes('ux') && (
                <TabsContent value="ux" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.uxSpec || ''}
                    title="UX Specification"
                    type="ux"
                  />
                </TabsContent>
              )}
              {fullData.availableTabs.includes('architecture') && (
                <TabsContent value="architecture" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.architecture || ''}
                    title="Architecture"
                    type="architecture"
                  />
                </TabsContent>
              )}
              {fullData.availableTabs.includes('comprehensive') && (
                <TabsContent value="comprehensive" className="mt-2">
                  <MarkdownRenderer 
                    content={fullData.documents.comprehensive || ''}
                    title="Comprehensive SDLC"
                    type="comprehensive"
                  />
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <div className="text-gray-500 text-sm">No document content available</div>
          )}
        </div>
      )}
    </div>
  )
}