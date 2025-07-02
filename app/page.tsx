"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  FileText,
  GitBranch,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Workflow,
  Info,
  Plug,
  Presentation,
} from "lucide-react"
import { HowItWorksVisualization } from "@/components/how-it-works-visualization"
import { PromptEngineering } from "@/components/prompt-engineering"
import { IntegrationHub } from "@/components/integration-hub"
import { VisualizationHub } from "@/components/visualization-hub"

interface ProcessingStep {
  id: string
  name: string
  status: "pending" | "in_progress" | "completed" | "error"
  progress: number
  estimatedTime?: string
}

interface ProjectResult {
  id: string
  title: string
  status: string
  createdAt: string
  jiraEpic?: string
  confluencePage?: string
  documents: {
    businessAnalysis: string
    functionalSpec: string
    technicalSpec: string
    uxSpec: string
    architecture: string
  }
}

interface WorkflowVisualizationProps {
  currentStep: number
  processingSteps: ProcessingStep[]
}

const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ currentStep, processingSteps }) => {
  return (
    <div>
      {/* Placeholder for Workflow Visualization - Replace with actual implementation */}
      <p>Current Step: {currentStep}</p>
      <ul>
        {processingSteps.map((step) => (
          <li key={step.id}>
            {step.name} - Status: {step.status} - Progress: {step.progress}%
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SDLCAutomationPlatform() {
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    openaiKey: "",
    jiraProject: "",
    confluenceSpace: "",
    template: "default",
  })

  const [showWorkflow, setShowWorkflow] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPromptEngineering, setShowPromptEngineering] = useState(false)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showVisualization, setShowVisualization] = useState(false)

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { id: "analysis", name: "Business Analysis", status: "pending", progress: 0 },
    { id: "functional", name: "Functional Specification", status: "pending", progress: 0 },
    { id: "technical", name: "Technical Specification", status: "pending", progress: 0 },
    { id: "ux", name: "UX Specification", status: "pending", progress: 0 },
    { id: "jira", name: "JIRA Epic Creation", status: "pending", progress: 0 },
    { id: "confluence", name: "Confluence Documentation", status: "pending", progress: 0 },
    { id: "linking", name: "Cross-platform Linking", status: "pending", progress: 0 },
  ])

  const [recentProjects] = useState<ProjectResult[]>([
    {
      id: "1",
      title: "User Authentication System",
      status: "completed",
      createdAt: "2024-01-15",
      jiraEpic: "AUTH-123",
      confluencePage: "https://company.atlassian.net/wiki/spaces/DEV/pages/123456",
      documents: {
        businessAnalysis: "Complete business analysis for user authentication...",
        functionalSpec: "Functional requirements and user stories...",
        technicalSpec: "Technical architecture and implementation details...",
        uxSpec: "User experience design and wireframes...",
        architecture: "System architecture diagrams and data flow...",
      },
    },
    {
      id: "2",
      title: "Payment Gateway Integration",
      status: "completed",
      createdAt: "2024-01-14",
      jiraEpic: "PAY-456",
      confluencePage: "https://company.atlassian.net/wiki/spaces/DEV/pages/789012",
      documents: {
        businessAnalysis: "Payment system business requirements...",
        functionalSpec: "Payment flow specifications...",
        technicalSpec: "Integration technical details...",
        uxSpec: "Payment UX design patterns...",
        architecture: "Payment system architecture...",
      },
    },
  ])

  const handleGenerate = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setCurrentStep(0)

    // Simulate the SDLC process
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i)

      // Update current step to in_progress
      setProcessingSteps((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "in_progress", progress: 0 } : step)),
      )

      // Simulate progress for current step
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProcessingSteps((prev) => prev.map((step, index) => (index === i ? { ...step, progress } : step)))
      }

      // Mark current step as completed
      setProcessingSteps((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "completed", progress: 100 } : step)),
      )
    }

    setIsProcessing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SDLC Automation Platform</h1>
            <p className="text-gray-600">Transform ideas into complete project documentation with AI</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Platform Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={config.openaiKey}
                      onChange={(e) => setConfig((prev) => ({ ...prev, openaiKey: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-project">JIRA Project Key</Label>
                    <Input
                      id="jira-project"
                      placeholder="PROJ"
                      value={config.jiraProject}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraProject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-space">Confluence Space</Label>
                    <Input
                      id="confluence-space"
                      placeholder="DEV"
                      value={config.confluenceSpace}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceSpace: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={config.template}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, template: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default SDLC</SelectItem>
                        <SelectItem value="agile">Agile Development</SelectItem>
                        <SelectItem value="bug-fix">Bug Fix Template</SelectItem>
                        <SelectItem value="feature">Feature Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setShowConfig(false)} className="w-full">
                    Save Configuration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => setShowIntegrations(true)}>
              <Plug className="h-4 w-4 mr-2" />
              Integrations
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowVisualization(true)}>
              <Presentation className="h-4 w-4 mr-2" />
              Visualize
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowWorkflow(true)}>
              <Workflow className="h-4 w-4 mr-2" />
              View Workflow
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowHowItWorks(true)}>
              <Info className="h-4 w-4 mr-2" />
              How It Works
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowPromptEngineering(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Prompt Engineering
            </Button>
          </div>
        </div>

        {/* Main Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Business Case
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-input">Describe your bug, feature, or business case:</Label>
              <Textarea
                id="business-input"
                placeholder="Example: We need to implement a user authentication system that supports email/password login, social media login (Google, Facebook), password reset functionality, and role-based access control. The system should be secure, scalable, and integrate with our existing user database..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px] mt-2"
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>JIRA Project:</span>
                <Badge variant="outline">{config.jiraProject || "Not configured"}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Confluence Space:</span>
                <Badge variant="outline">{config.confluenceSpace || "Not configured"}</Badge>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={!input.trim() || isProcessing} className="w-full" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? "Generating SDLC Documentation..." : "Generate SDLC Documentation"}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                Processing Your Request...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${step.status === "completed" ? "text-green-700" : step.status === "in_progress" ? "text-blue-700" : "text-gray-500"}`}
                        >
                          {step.name}
                        </span>
                        {step.status === "in_progress" && (
                          <span className="text-sm text-gray-500">{step.progress}%</span>
                        )}
                      </div>
                      {step.status === "in_progress" && <Progress value={step.progress} className="mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-500">Created on {project.createdAt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          {project.status}
                        </Badge>
                        {project.jiraEpic && <Badge variant="outline">JIRA: {project.jiraEpic}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {project.jiraEpic && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          JIRA Epic
                        </Button>
                      )}
                      {project.confluencePage && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Confluence
                        </Button>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="business" className="mt-4">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="business">Business</TabsTrigger>
                      <TabsTrigger value="functional">Functional</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="ux">UX</TabsTrigger>
                      <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="business" className="mt-2">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {project.documents.businessAnalysis}
                      </div>
                    </TabsContent>
                    <TabsContent value="functional" className="mt-2">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {project.documents.functionalSpec}
                      </div>
                    </TabsContent>
                    <TabsContent value="technical" className="mt-2">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {project.documents.technicalSpec}
                      </div>
                    </TabsContent>
                    <TabsContent value="ux" className="mt-2">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{project.documents.uxSpec}</div>
                    </TabsContent>
                    <TabsContent value="architecture" className="mt-2">
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {project.documents.architecture}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={showWorkflow} onOpenChange={setShowWorkflow}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>SDLC Automation Workflow</DialogTitle>
            </DialogHeader>
            <WorkflowVisualization currentStep={currentStep} processingSteps={processingSteps} />
          </DialogContent>
        </Dialog>

        <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>How SDLC Automation Works</DialogTitle>
            </DialogHeader>
            <HowItWorksVisualization />
          </DialogContent>
        </Dialog>

        <Dialog open={showPromptEngineering} onOpenChange={setShowPromptEngineering}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Prompt Engineering Interface</DialogTitle>
            </DialogHeader>
            <PromptEngineering />
          </DialogContent>
        </Dialog>

        <Dialog open={showIntegrations} onOpenChange={setShowIntegrations}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Integration Hub</DialogTitle>
            </DialogHeader>
            <IntegrationHub />
          </DialogContent>
        </Dialog>

        <Dialog open={showVisualization} onOpenChange={setShowVisualization}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Visualization & Presentation Hub</DialogTitle>
            </DialogHeader>
            <VisualizationHub />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
