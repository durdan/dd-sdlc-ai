"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Users, 
  Database, 
  Shield, 
  Zap, 
  BarChart3, 
  Settings, 
  Eye,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  GitBranch,
  Plus,
  Link,
  Loader2,
  Github,
  ExternalLink,
  BookOpen,
  Archive
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { GitHubProjectsCreator } from './github-projects-creator'

interface ComprehensiveSDLCData {
  businessAnalysis?: {
    executiveSummary: string
    stakeholderAnalysis: string
    requirementsAnalysis: string
    riskAssessment: string
    successMetrics: string
    userStories: string
    personas: string
    competitiveAnalysis: string
    businessModel: string
    financialProjections: string
  }
  functionalSpec?: {
    systemOverview: string
    functionalRequirements: string
    dataRequirements: string
    integrationRequirements: string
    performanceRequirements: string
    securityRequirements: string
    userInterfaceRequirements: string
    workflowDefinitions: string
    businessRules: string
    acceptanceCriteria: string
  }
  technicalSpec?: {
    systemArchitecture: string
    technologyStack: string
    dataModels: string
    apiSpecifications: string
    securityImplementation: string
    deploymentStrategy: string
    monitoringStrategy: string
    testingStrategy: string
    performanceOptimization: string
    scalabilityPlan: string
  }
  uxSpec?: {
    userPersonas: string
    userJourneys: string
    wireframes: string
    designSystem: string
    accessibilityRequirements: string
    usabilityTesting: string
    interactionDesign: string
    informationArchitecture: string
    visualDesign: string
    prototypingPlan: string
  }
  dataSpec?: {
    dataModels: string
    databaseDesign: string
    dataFlow: string
    dataGovernance: string
    dataQuality: string
    dataPrivacy: string
    dataRetention: string
    dataIntegration: string
    dataAnalytics: string
    dataBackup: string
  }
  serviceSpec?: {
    microservicesArchitecture: string
    serviceDefinitions: string
    apiDesign: string
    serviceInteractions: string
    serviceDeployment: string
    serviceMonitoring: string
    serviceScaling: string
    serviceSecurity: string
    serviceVersioning: string
    serviceDocumentation: string
  }
  deploymentSpec?: {
    deploymentStrategy: string
    infrastructureRequirements: string
    environmentSetup: string
    cicdPipeline: string
    releaseManagement: string
    rollbackStrategy: string
    configurationManagement: string
    secretsManagement: string
    networkConfiguration: string
    loadBalancing: string
  }
  observabilitySpec?: {
    monitoringStrategy: string
    loggingStrategy: string
    alertingStrategy: string
    metricsDefinition: string
    dashboardDesign: string
    healthChecks: string
    performanceMonitoring: string
    errorTracking: string
    auditLogging: string
    reportingStrategy: string
  }
  implementationGuide?: {
    projectPlan: string
    sprintBreakdown: string
    resourcePlan: string
    riskMitigation: string
    qualityAssurance: string
    changeManagement: string
    trainingPlan: string
    maintenancePlan: string
    operationalRunbook: string
    postLaunchSupport: string
  }
  metadata?: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
    tokenEstimate: number
    contextContinuity: boolean
  }
}

interface ComprehensiveSDLCViewerProps {
  data: ComprehensiveSDLCData
  onExport?: () => void
  onShare?: () => void
  documentId?: string
  onDocumentSave?: (document: SavedDocument) => void
}

interface SavedDocument {
  id: string
  title: string
  data: ComprehensiveSDLCData
  createdAt: string
  updatedAt: string
  linkedProjects?: Array<{
    platform: 'github' | 'clickup' | 'trello'
    projectId: string
    projectName: string
    projectUrl: string
  }>
}

interface GitHubRepository {
  id: number
  name: string
  fullName: string
  private: boolean
  url: string
}

export function ComprehensiveSDLCViewer({ data, onExport, onShare, documentId, onDocumentSave }: ComprehensiveSDLCViewerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview'])
  
  // Project creation states
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  
  // Document management states
  const [savedDocument, setSavedDocument] = useState<SavedDocument | null>(null)
  const [isSavingDocument, setIsSavingDocument] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('')
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)

  // Load saved document on component mount
  useEffect(() => {
    if (documentId) {
      loadSavedDocument(documentId)
    }
  }, [documentId])

  const loadSavedDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/sdlc-documents/${docId}`)
      if (response.ok) {
        const document = await response.json()
        setSavedDocument(document)
        setDocumentTitle(document.title)
      }
    } catch (error) {
      console.error('Failed to load saved document:', error)
    }
  }

  const handleSaveDocument = async () => {
    if (!documentTitle.trim()) {
      alert('Please enter a document title')
      return
    }

    setIsSavingDocument(true)
    try {
      // Convert SDLC data to markdown content for storage
      const content = generateMarkdownContent(data)
      
      const payload = {
        title: documentTitle.trim(),
        content,
        description: `Comprehensive SDLC document with ${data.metadata?.sectionsGenerated || 0} sections`
      }

      const url = documentId ? `/api/sdlc-documents/${documentId}` : '/api/sdlc-documents'
      const method = documentId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const savedDoc = result.document
        // Transform to match the expected SavedDocument format
        const transformedDoc: SavedDocument = {
          id: savedDoc.id,
          title: savedDoc.title,
          data,
          createdAt: savedDoc.created_at,
          updatedAt: savedDoc.updated_at,
          linkedProjects: transformLinkedProjectsToOldFormat(savedDoc.linked_projects || {})
        }
        
        setSavedDocument(transformedDoc)
        setIsDocumentDialogOpen(false)
        onDocumentSave?.(transformedDoc)
        alert(`✅ Document ${documentId ? 'updated' : 'saved'} successfully!`)
      } else {
        throw new Error(result.error || 'Failed to save document')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      alert('❌ Failed to save document')
    } finally {
      setIsSavingDocument(false)
    }
  }

  // Convert SDLC data to markdown content
  const generateMarkdownContent = (data: ComprehensiveSDLCData): string => {
    let markdown = `# ${documentTitle}\n\n`
    
    if (data.businessAnalysis) {
      markdown += '## Business Analysis\n\n'
      Object.entries(data.businessAnalysis).forEach(([key, value]) => {
        if (value) {
          markdown += `### ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}\n\n`
        }
      })
    }

    if (data.functionalSpec) {
      markdown += '## Functional Specification\n\n'
      Object.entries(data.functionalSpec).forEach(([key, value]) => {
        if (value) {
          markdown += `### ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}\n\n`
        }
      })
    }

    if (data.technicalSpec) {
      markdown += '## Technical Specification\n\n'
      Object.entries(data.technicalSpec).forEach(([key, value]) => {
        if (value) {
          markdown += `### ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}\n\n`
        }
      })
    }

    if (data.uxSpec) {
      markdown += '## UX Specification\n\n'
      Object.entries(data.uxSpec).forEach(([key, value]) => {
        if (value) {
          markdown += `### ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}\n\n${value}\n\n`
        }
      })
    }

    // Add other sections as needed...
    return markdown
  }

  // Transform linked projects from new format to old format
  const transformLinkedProjectsToOldFormat = (linkedProjects: any) => {
    const result: Array<{
      platform: 'github' | 'clickup' | 'trello'
      projectId: string
      projectName: string
      projectUrl: string
    }> = []

    if (linkedProjects.github) {
      linkedProjects.github.forEach((project: any) => {
        result.push({
          platform: 'github',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    if (linkedProjects.clickup) {
      linkedProjects.clickup.forEach((project: any) => {
        result.push({
          platform: 'clickup',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    if (linkedProjects.trello) {
      linkedProjects.trello.forEach((project: any) => {
        result.push({
          platform: 'trello',
          projectId: project.url || project.name,
          projectName: project.name,
          projectUrl: project.url
        })
      })
    }

    return result
  }

  // GitHub project creation is now handled by GitHubProjectsCreator component

  const generateDocumentId = () => {
    return `sdlc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const getSectionIcon = (section: string) => {
    const icons: { [key: string]: any } = {
      business: Users,
      functional: FileText,
      technical: Settings,
      ux: Eye,
      data: Database,
      service: Zap,
      deployment: Shield,
      observability: BarChart3,
      implementation: CheckCircle
    }
    return icons[section] || FileText
  }

  const getSectionColor = (section: string) => {
    const colors: { [key: string]: string } = {
      business: 'bg-blue-50 border-blue-200',
      functional: 'bg-green-50 border-green-200',
      technical: 'bg-purple-50 border-purple-200',
      ux: 'bg-pink-50 border-pink-200',
      data: 'bg-orange-50 border-orange-200',
      service: 'bg-yellow-50 border-yellow-200',
      deployment: 'bg-red-50 border-red-200',
      observability: 'bg-teal-50 border-teal-200',
      implementation: 'bg-indigo-50 border-indigo-200'
    }
    return colors[section] || 'bg-gray-50 border-gray-200'
  }

  const renderSection = (title: string, content: { [key: string]: string }, sectionKey: string) => {
    const Icon = getSectionIcon(sectionKey)
    const colorClass = getSectionColor(sectionKey)
    
    return (
      <Card key={sectionKey} className={`mb-6 ${colorClass}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
              <Badge variant="secondary" className="ml-2">
                {Object.keys(content).length} sections
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(sectionKey)}
            >
              {expandedSections.includes(sectionKey) ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </CardHeader>
        
        {expandedSections.includes(sectionKey) && (
          <CardContent>
            <Tabs defaultValue={Object.keys(content)[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                {Object.keys(content).slice(0, 5).map((key) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.keys(content).slice(0, 5).map((key) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <MarkdownRenderer content={content[key]} />
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
            
            {Object.keys(content).length > 5 && (
              <div className="mt-4">
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(content).slice(5).map((key) => (
                    <Card key={key} className="p-4">
                      <h4 className="font-medium mb-2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <ScrollArea className="h-32">
                        <MarkdownRenderer content={content[key]} />
                      </ScrollArea>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Project Creation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {savedDocument ? savedDocument.title : 'Comprehensive SDLC Documentation'}
                {savedDocument && (
                  <Badge variant="secondary" className="ml-2">
                    <Archive className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Enterprise-level project documentation with {data.metadata?.sectionsGenerated} sections
              </CardDescription>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Project Creation Actions */}
              <div className="flex gap-2">
                <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Github className="h-4 w-4 mr-2" />
                      Create GitHub Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Create GitHub Project
                      </DialogTitle>
                      <DialogDescription>
                        Transform this SDLC document into a GitHub Projects board with issues, milestones, and custom fields.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <GitHubProjectsCreator
                      documents={data}
                      projectTitle={projectName}
                      onSuccess={async (result) => {
                        // Update saved document with linked project
                        if (savedDocument && documentId) {
                          // Create the new linked project in the database format
                          const newLinkedProject = {
                            github: [
                              {
                                name: result.project?.title || projectName,
                                url: result.project?.url || '',
                                created_at: new Date().toISOString()
                              }
                            ]
                          }
                          
                          // Update the document with the new linked project
                          const updatedDocument = {
                            ...savedDocument,
                            linkedProjects: newLinkedProject
                          }
                          
                          // Save to database
                          try {
                            const response = await fetch(`/api/sdlc-documents/${documentId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(updatedDocument)
                            })
                            
                            if (response.ok) {
                              setSavedDocument(updatedDocument)
                              if (onDocumentSave) {
                                onDocumentSave(updatedDocument)
                              }
                            }
                          } catch (error) {
                            console.error('Failed to update document with linked project:', error)
                          }
                        }
                        
                        setIsProjectDialogOpen(false)
                      }}
                      onError={(error) => {
                        console.error('GitHub project creation error:', error)
                      }}
                    />
                  </DialogContent>
                </Dialog>

                {/* Document Management */}
                <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {savedDocument ? 'Update Document' : 'Save Document'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {savedDocument ? 'Update Document' : 'Save Document'}
                      </DialogTitle>
                      <DialogDescription>
                        Save this SDLC document for future reference and project creation.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="docTitle">Document Title</Label>
                        <Input
                          id="docTitle"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          placeholder="Enter document title..."
                          className="mt-1"
                        />
                      </div>
                      
                      {savedDocument?.linkedProjects && savedDocument.linkedProjects.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Linked Projects</Label>
                          <div className="mt-2 space-y-2">
                            {savedDocument.linkedProjects.map((project, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <Github className="h-4 w-4" />
                                  <span className="text-sm">{project.projectName}</span>
                                  <Badge variant="outline" className="text-xs">{project.platform}</Badge>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDocumentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveDocument} 
                        disabled={isSavingDocument || !documentTitle.trim()}
                      >
                        {isSavingDocument ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            {savedDocument ? 'Update' : 'Save'}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Standard Actions */}
              <div className="flex gap-2">
                <Button onClick={onExport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={onShare} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced metadata with linked projects */}
          {data.metadata && (
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Generated in {(data.metadata.generationTime / 1000).toFixed(1)}s
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {data.metadata.detailLevel} level
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                ~{data.metadata.tokenEstimate.toLocaleString()} tokens
              </Badge>
              {data.metadata.contextContinuity && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Context Continuity
                </Badge>
              )}
              {savedDocument?.linkedProjects && savedDocument.linkedProjects.length > 0 && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  {savedDocument.linkedProjects.length} Linked Project{savedDocument.linkedProjects.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main content */}
      <div className="space-y-6">
        {data.businessAnalysis && renderSection('Business Analysis', data.businessAnalysis, 'business')}
        {data.functionalSpec && renderSection('Functional Specification', data.functionalSpec, 'functional')}
        {data.technicalSpec && renderSection('Technical Specification', data.technicalSpec, 'technical')}
        {data.uxSpec && renderSection('UX Specification', data.uxSpec, 'ux')}
        {data.dataSpec && renderSection('Data Specification', data.dataSpec, 'data')}
        {data.serviceSpec && renderSection('Service Specification', data.serviceSpec, 'service')}
        {data.deploymentSpec && renderSection('Deployment Specification', data.deploymentSpec, 'deployment')}
        {data.observabilitySpec && renderSection('Observability Specification', data.observabilitySpec, 'observability')}
        {data.implementationGuide && renderSection('Implementation Guide', data.implementationGuide, 'implementation')}
      </div>

      {/* Enhanced summary footer */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              This comprehensive documentation contains detailed specifications across{' '}
              <strong>{data.metadata?.sectionsGenerated}</strong> sections, generated with{' '}
              <strong>{data.metadata?.detailLevel}</strong> detail level.
            </p>
            <p className="text-xs text-gray-500">
              Ready for enterprise implementation with full technical, business, and operational guidance.
            </p>
            {savedDocument?.linkedProjects && savedDocument.linkedProjects.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-blue-600 font-medium">
                  🔗 Linked to {savedDocument.linkedProjects.length} active project{savedDocument.linkedProjects.length > 1 ? 's' : ''} for seamless development workflow
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 