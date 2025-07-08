"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  Clock
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'

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
}

export function ComprehensiveSDLCViewer({ data, onExport, onShare }: ComprehensiveSDLCViewerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview'])

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
      {/* Header with metadata */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Comprehensive SDLC Documentation</CardTitle>
              <CardDescription className="text-lg mt-2">
                Enterprise-level project documentation with {data.metadata?.sectionsGenerated} sections
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
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

      {/* Summary footer */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              This comprehensive documentation contains detailed specifications across{' '}
              <strong>{data.metadata?.sectionsGenerated}</strong> sections, generated with{' '}
              <strong>{data.metadata?.detailLevel}</strong> detail level.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Ready for enterprise implementation with full technical, business, and operational guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 