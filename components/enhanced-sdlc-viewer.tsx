'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Settings, 
  Code, 
  CheckCircle, 
  Download,
  Clock,
  BarChart3,
  Layers,
  Target
} from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'

interface EnhancedSDLCData {
  businessAnalysis: string
  functionalSpec: string
  technicalSpec: string
  implementationPlan: string
  metadata: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
    tokenEstimate: number
  }
}

interface EnhancedSDLCViewerProps {
  data: EnhancedSDLCData
  isLoading?: boolean
}

export function EnhancedSDLCViewer({ data, isLoading = false }: EnhancedSDLCViewerProps) {
  const [activeTab, setActiveTab] = useState('business')

  const exportToMarkdown = () => {
    const sections = [
      '# Enhanced SDLC Documentation\n\n',
      `Generated on: ${new Date().toISOString()}\n`,
      `Detail Level: ${data.metadata.detailLevel}\n`,
      `Generation Time: ${data.metadata.generationTime}ms\n`,
      `Estimated Tokens: ${data.metadata.tokenEstimate}\n\n`,
      
      '## Business Analysis\n\n',
      data.businessAnalysis, '\n\n',
      
      '## Functional Specification\n\n',
      data.functionalSpec, '\n\n',
      
      '## Technical Specification\n\n',
      data.technicalSpec, '\n\n',
      
      '## Implementation Plan\n\n',
      data.implementationPlan, '\n\n'
    ].join('')

    const blob = new Blob([sections], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enhanced-sdlc-${new Date().toISOString().split('T')[0]}.md`
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
          <h1 className="text-3xl font-bold text-gray-900">Enhanced SDLC Documentation</h1>
          <p className="text-gray-600 mt-2">
            Enterprise-grade documentation with detailed analysis, specifications, and implementation plans
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
          <Badge variant="outline">
            ~{Math.round(data.metadata.tokenEstimate / 1000)}k tokens
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
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Business Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.businessAnalysis.length / 1000)}k</div>
            <p className="text-xs text-gray-600">Characters</p>
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
            <div className="text-2xl font-bold">{Math.round(data.functionalSpec.length / 1000)}k</div>
            <p className="text-xs text-gray-600">Characters</p>
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
            <div className="text-2xl font-bold">{Math.round(data.technicalSpec.length / 1000)}k</div>
            <p className="text-xs text-gray-600">Characters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(data.implementationPlan.length / 1000)}k</div>
            <p className="text-xs text-gray-600">Characters</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Documentation Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
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
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Implementation
              </TabsTrigger>
            </TabsList>

            {/* Business Analysis Tab */}
            <TabsContent value="business" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Business Analysis Overview</h3>
                <p className="text-sm text-blue-800">
                  Comprehensive business analysis including executive summary, stakeholder analysis, 
                  detailed requirements, risk assessment, and success metrics.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Business Analysis Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <MarkdownRenderer content={data.businessAnalysis} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Functional Specification Tab */}
            <TabsContent value="functional" className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Functional Specification Overview</h3>
                <p className="text-sm text-green-800">
                  Detailed functional requirements, system overview, data requirements, 
                  UI specifications, and integration requirements.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Functional Specification Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <MarkdownRenderer content={data.functionalSpec} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Specification Tab */}
            <TabsContent value="technical" className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Technical Specification Overview</h3>
                <p className="text-sm text-purple-800">
                  System architecture, technology stack, database design, API specifications, 
                  security implementation, and deployment strategy.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Technical Specification Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <MarkdownRenderer content={data.technicalSpec} />
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Implementation Plan Tab */}
            <TabsContent value="implementation" className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Implementation Plan Overview</h3>
                <p className="text-sm text-orange-800">
                  Detailed project planning, sprint breakdown, user stories, acceptance criteria, 
                  risk management, and operational runbook.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Implementation Plan Document
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <MarkdownRenderer content={data.implementationPlan} />
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