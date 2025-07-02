"use client"

import type React from "react"
import { 
  FileText, 
  Users, 
  Settings, 
  Palette, 
  GitBranch, 
  ExternalLink, 
  ArrowRight,
  CheckCircle,
  Clock,
  Circle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "in_progress" | "completed" | "error"
  progress: number
}

interface SimpleWorkflowDiagramProps {
  processingSteps?: ProcessingStep[]
}

export function SimpleWorkflowDiagram({ processingSteps = [] }: SimpleWorkflowDiagramProps) {
  const workflowSteps = [
    {
      id: "input",
      title: "Requirements Input",
      description: "Enter your project requirements and business needs",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      id: "analysis",
      title: "Business Analysis",
      description: "Generate comprehensive business analysis and objectives",
      icon: <Users className="h-6 w-6" />,
      color: "bg-green-100 text-green-700 border-green-200"
    },
    {
      id: "functional",
      title: "Functional Specification",
      description: "Create detailed functional requirements and user stories",
      icon: <Settings className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
      id: "technical",
      title: "Technical Specification",
      description: "Generate system architecture and technical details",
      icon: <GitBranch className="h-6 w-6" />,
      color: "bg-orange-100 text-orange-700 border-orange-200"
    },
    {
      id: "ux",
      title: "UX Specification",
      description: "Design user experience and interface guidelines",
      icon: <Palette className="h-6 w-6" />,
      color: "bg-pink-100 text-pink-700 border-pink-200"
    },
    {
      id: "mermaid",
      title: "Visual Diagrams",
      description: "Create architecture, database, and flow diagrams",
      icon: <GitBranch className="h-6 w-6" />,
      color: "bg-cyan-100 text-cyan-700 border-cyan-200"
    }
  ]

  const integrationSteps = [
    {
      id: "jira",
      title: "JIRA Epic Creation",
      description: "Auto-create JIRA epics and stories (Optional)",
      icon: <ExternalLink className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-700 border-amber-200"
    },
    {
      id: "confluence",
      title: "Confluence Docs",
      description: "Publish documentation to Confluence (Optional)",
      icon: <ExternalLink className="h-5 w-5" />,
      color: "bg-indigo-100 text-indigo-700 border-indigo-200"
    }
  ]

  const getStepStatus = (stepId: string) => {
    const step = processingSteps.find(s => s.id === stepId)
    return step?.status || "pending"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <Circle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">SDLC Documentation Workflow</h2>
        <p className="text-gray-600">
          Our streamlined process transforms your requirements into complete SDLC documentation
        </p>
      </div>

      {/* Main Workflow Steps */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          Core Documentation Generation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card className={`p-4 border-2 ${step.color} transition-all duration-200 hover:shadow-md`}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-white/50">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{step.title}</h4>
                        {getStatusIcon(getStepStatus(step.id))}
                      </div>
                      <p className="text-xs opacity-80 leading-tight">{step.description}</p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Step {index + 1}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow connector */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Steps */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          Optional Integrations
          <Badge variant="outline" className="text-xs">Coming Soon</Badge>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrationSteps.map((step) => (
            <Card key={step.id} className={`p-4 border-2 ${step.color} opacity-75`}>
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/50">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-xs opacity-80 leading-tight">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Flow Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Process Summary</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Input Requirements</span>
          <ArrowRight className="h-3 w-3" />
          <span>AI Analysis</span>
          <ArrowRight className="h-3 w-3" />
          <span>Document Generation</span>
          <ArrowRight className="h-3 w-3" />
          <span>Visual Diagrams</span>
          <ArrowRight className="h-3 w-3" />
          <span className="text-amber-600">Platform Integration</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Complete SDLC documentation generated in minutes, not hours
        </p>
      </div>
    </div>
  )
}
