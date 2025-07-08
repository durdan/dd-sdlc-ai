'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Users, 
  Settings, 
  Code, 
  Palette, 
  CheckCircle, 
  Download,
  Clock,
  BarChart3,
  Shield,
  Database,
  Zap,
  Globe,
  TestTube
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'

interface DetailedSDLCData {
  businessAnalysis: {
    executiveSummary: string
    stakeholderAnalysis: string
    requirementsAnalysis: string
    riskAssessment: string
    successMetrics: string
    userStories: string
    personas: string
  }
  functionalSpec: {
    systemOverview: string
    functionalRequirements: string
    dataRequirements: string
    integrationRequirements: string
    performanceRequirements: string
    securityRequirements: string
    userInterfaceRequirements: string
  }
  technicalSpec: {
    systemArchitecture: string
    technologyStack: string
    dataModels: string
    apiSpecifications: string
    securityImplementation: string
    deploymentStrategy: string
    monitoringStrategy: string
    testingStrategy: string
  }
  uxSpec: {
    userPersonas: string
    userJourneys: string
    wireframes: string
    designSystem: string
    accessibilityRequirements: string
    usabilityTesting: string
    interactionDesign: string
  }
  implementationGuide: {
    projectPlan: string
    sprintBreakdown: string
    userStories: string
    acceptanceCriteria: string
    testCases: string
    deploymentPlan: string
    operationalRunbook: string
  }
  metadata: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
  }
}

interface DetailedSDLCViewerProps {
  data: DetailedSDLCData
  isLoading?: boolean
}

export function DetailedSDLCViewer({ data, isLoading = false }: DetailedSDLCViewerProps) {
  const [activeTab, setActiveTab] = useState('business')

  const exportToMarkdown = () => {
    const sections = [
      '# Comprehensive SDLC Documentation\n\n',
      `Generated on: ${new Date().toISOString()}\n`,
      `Detail Level: ${data.metadata.detailLevel}\n`,
      `Generation Time: ${data.metadata.generationTime}ms\n`,
      `Sections Generated: ${data.metadata.sectionsGenerated}\n\n`,
      
      '## Business Analysis\n\n',
      '### Executive Summary\n', data.businessAnalysis.executiveSummary, '\n\n',
      '### Stakeholder Analysis\n', data.businessAnalysis.stakeholderAnalysis, '\n\n',
      '### Requirements Analysis\n', data.businessAnalysis.requirementsAnalysis, '\n\n',
      '### Risk Assessment\n', data.businessAnalysis.riskAssessment, '\n\n',
      '### Success Metrics\n', data.businessAnalysis.successMetrics, '\n\n',
      '### User Stories\n', data.businessAnalysis.userStories, '\n\n',
      '### User Personas\n', data.businessAnalysis.personas, '\n\n',
      
      '## Functional Specification\n\n',
      '### System Overview\n', data.functionalSpec.systemOverview, '\n\n',
      '### Functional Requirements\n', data.functionalSpec.functionalRequirements, '\n\n',
      '### Data Requirements\n', data.functionalSpec.dataRequirements, '\n\n',
      '### Integration Requirements\n', data.functionalSpec.integrationRequirements, '\n\n',
      '### Performance Requirements\n', data.functionalSpec.performanceRequirements, '\n\n',
      '### Security Requirements\n', data.functionalSpec.securityRequirements, '\n\n',
      '### User Interface Requirements\n', data.functionalSpec.userInterfaceRequirements, '\n\n',
      
      '## Technical Specification\n\n',
      '### System Architecture\n', data.technicalSpec.systemArchitecture, '\n\n',
      '### Technology Stack\n', data.technicalSpec.technologyStack, '\n\n',
      '### Data Models\n', data.technicalSpec.dataModels, '\n\n',
      '### API Specifications\n', data.technicalSpec.apiSpecifications, '\n\n',
      '### Security Implementation\n', data.technicalSpec.securityImplementation, '\n\n',
      '### Deployment Strategy\n', data.technicalSpec.deploymentStrategy, '\n\n',
      '### Monitoring Strategy\n', data.technicalSpec.monitoringStrategy, '\n\n',
      '### Testing Strategy\n', data.technicalSpec.testingStrategy, '\n\n',
      
      '## UX Specification\n\n',
      '### User Personas\n', data.uxSpec.userPersonas, '\n\n',
      '### User Journeys\n', data.uxSpec.userJourneys, '\n\n',
      '### Wireframes\n', data.uxSpec.wireframes, '\n\n',
      '### Design System\n', data.uxSpec.designSystem, '\n\n',
      '### Accessibility Requirements\n', data.uxSpec.accessibilityRequirements, '\n\n',
      '### Usability Testing\n', data.uxSpec.usabilityTesting, '\n\n',
      '### Interaction Design\n', data.uxSpec.interactionDesign, '\n\n',
      
      '## Implementation Guide\n\n',
      '### Project Plan\n', data.implementationGuide.projectPlan, '\n\n',
      '### Sprint Breakdown\n', data.implementationGuide.sprintBreakdown, '\n\n',
      '### User Stories\n', data.implementationGuide.userStories, '\n\n',
      '### Acceptance Criteria\n', data.implementationGuide.acceptanceCriteria, '\n\n',
      '### Test Cases\n', data.implementationGuide.testCases, '\n\n',
      '### Deployment Plan\n', data.implementationGuide.deploymentPlan, '\n\n',
      '### Operational Runbook\n', data.implementationGuide.operationalRunbook, '\n\n'
    ].join('')

    const blob = new Blob([sections], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `detailed-sdlc-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detailed SDLC Documentation</h1>
          <p className="text-gray-600 mt-2">
            Enterprise-grade documentation with {data.metadata.sectionsGenerated} sections
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {Math.round(data.metadata.generationTime / 1000)}s
          </Badge>
          <Badge variant="secondary">
            {data.metadata.detailLevel}
          </Badge>
          <Button onClick={exportToMarkdown} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Business Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-600">Detailed sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4 text-green-600" />
              Functional Spec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-600">Requirement areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4 text-purple-600" />
              Technical Spec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-600">Technical areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-600" />
              Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-600">Implementation guides</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="functional" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Functional
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="ux" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                UX
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Implementation
              </TabsTrigger>
            </TabsList>

            {/* Business Analysis Tab */}
            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.executiveSummary} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Stakeholder Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.stakeholderAnalysis} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Requirements Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.requirementsAnalysis} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.riskAssessment} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Success Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.successMetrics} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Personas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.businessAnalysis.personas} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    User Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <MarkdownRenderer content={data.businessAnalysis.userStories} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Functional Specification Tab */}
            <TabsContent value="functional" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.systemOverview} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Functional Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.functionalRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.dataRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Integration Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.integrationRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Performance Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.performanceRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.functionalSpec.securityRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    User Interface Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <MarkdownRenderer content={data.functionalSpec.userInterfaceRequirements} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Specification Tab */}
            <TabsContent value="technical" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      System Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.systemArchitecture} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.technologyStack} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Models
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.dataModels} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      API Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.apiSpecifications} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.securityImplementation} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Deployment Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.deploymentStrategy} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Monitoring Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.monitoringStrategy} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Testing Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.technicalSpec.testingStrategy} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UX Specification Tab */}
            <TabsContent value="ux" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Personas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.userPersonas} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      User Journeys
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.userJourneys} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Wireframes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.wireframes} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Design System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.designSystem} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Accessibility Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.accessibilityRequirements} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Usability Testing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.uxSpec.usabilityTesting} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Interaction Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <MarkdownRenderer content={data.uxSpec.interactionDesign} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Implementation Guide Tab */}
            <TabsContent value="implementation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.projectPlan} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Sprint Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.sprintBreakdown} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Acceptance Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.acceptanceCriteria} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.testCases} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Deployment Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.deploymentPlan} />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Operational Runbook
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <MarkdownRenderer content={data.implementationGuide.operationalRunbook} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    User Stories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <MarkdownRenderer content={data.implementationGuide.userStories} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 