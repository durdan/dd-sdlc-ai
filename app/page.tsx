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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
import { MermaidViewer } from "@/components/mermaid-viewer"

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
    aiModel: "gpt-4",
    jiraUrl: "",
    jiraProject: "",
    jiraEmail: "",
    jiraToken: "",
    jiraAutoCreate: true,
    confluenceUrl: "",
    confluenceSpace: "",
    confluenceEmail: "",
    confluenceToken: "",
    confluenceAutoCreate: true,
    template: "default",
    outputFormat: "markdown",
    emailNotifications: true,
    slackNotifications: false,
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

  const [generatedDocuments, setGeneratedDocuments] = useState<any>(null)

  const handleGenerate = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setCurrentStep(0)

    try {
      // Call the API to generate SDLC documentation
      const response = await fetch("/api/generate-sdlc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          template: config.template,
          jiraProject: config.jiraProject,
          confluenceSpace: config.confluenceSpace,
          jiraEnabled: config.jiraAutoCreate && config.jiraUrl && config.jiraToken,
          confluenceEnabled: config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate documentation")
      }

      const result = await response.json()

      // Update processing steps based on what was actually generated
      const steps = [
        { id: "analysis", name: "Business Analysis", status: "completed", progress: 100 },
        { id: "functional", name: "Functional Specification", status: "completed", progress: 100 },
        { id: "technical", name: "Technical Specification", status: "completed", progress: 100 },
        { id: "ux", name: "UX Specification", status: "completed", progress: 100 },
      ]

      // Add optional steps if integrations are enabled
      if (config.jiraAutoCreate && config.jiraUrl && config.jiraToken) {
        steps.push({ id: "jira", name: "JIRA Epic Creation", status: "completed", progress: 100 })
      }

      if (config.confluenceAutoCreate && config.confluenceUrl && config.confluenceToken) {
        steps.push({ id: "confluence", name: "Confluence Documentation", status: "completed", progress: 100 })
      }

      if (steps.length > 4) {
        steps.push({ id: "linking", name: "Cross-platform Linking", status: "completed", progress: 100 })
      }

      setProcessingSteps(steps)

      // Show the generated documents in the interface
      setGeneratedDocuments(result)
    } catch (error) {
      console.error("Error generating documentation:", error)
      // Handle error state
    } finally {
      setIsProcessing(false)
    }
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

  const handleSaveConfig = () => {
    console.log("Saving configuration:", config)
    // Here you would save to localStorage or send to API
    localStorage.setItem("sdlc-config", JSON.stringify(config))
    setShowConfig(false)
  }

  const handleTestConnections = () => {
    console.log("Testing connections...")
    // Here you would test JIRA and Confluence connections
    alert("Testing connections... (This would test your API credentials)")
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
            <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>

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

        {/* Generated Documents Display */}
        {generatedDocuments && (
          <div className="space-y-6">
            {/* Document Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="business" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="business">Business Analysis</TabsTrigger>
                    <TabsTrigger value="functional">Functional Spec</TabsTrigger>
                    <TabsTrigger value="technical">Technical Spec</TabsTrigger>
                    <TabsTrigger value="ux">UX Specification</TabsTrigger>
                    <TabsTrigger value="diagrams">Architecture</TabsTrigger>
                  </TabsList>

                  <TabsContent value="business">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {generatedDocuments.businessAnalysis}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="functional">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {generatedDocuments.functionalSpec}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {generatedDocuments.technicalSpec}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="ux">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{generatedDocuments.uxSpec}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="diagrams">
                    <MermaidViewer
                      diagrams={{
                        architecture: generatedDocuments.mermaidDiagrams || "",
                        database: "",
                        userFlow: "",
                        apiFlow: "",
                      }}
                    />
                  </TabsContent>
                </Tabs>

                {/* Integration Links */}
                {(generatedDocuments.jiraEpic || generatedDocuments.confluencePage) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Integration Links</h4>
                    <div className="flex gap-4">
                      {generatedDocuments.jiraEpic && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          JIRA Epic: {generatedDocuments.jiraEpic.key}
                        </Button>
                      )}
                      {generatedDocuments.confluencePage && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Confluence Page
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

        {/* Configuration Dialog */}
        <Dialog open={showConfig} onOpenChange={setShowConfig}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Platform Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* AI Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <h3 className="font-semibold">AI Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={config.openaiKey}
                      onChange={(e) => setConfig((prev) => ({ ...prev, openaiKey: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Required for AI-powered document generation</p>
                  </div>
                  <div>
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select
                      value={config.aiModel}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, aiModel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* JIRA Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <h3 className="font-semibold">JIRA Integration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jira-url">JIRA URL</Label>
                    <Input
                      id="jira-url"
                      placeholder="https://company.atlassian.net"
                      value={config.jiraUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-project">Project Key</Label>
                    <Input
                      id="jira-project"
                      placeholder="PROJ"
                      value={config.jiraProject}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraProject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-email">Email</Label>
                    <Input
                      id="jira-email"
                      type="email"
                      placeholder="user@company.com"
                      value={config.jiraEmail}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jira-token">API Token</Label>
                    <Input
                      id="jira-token"
                      type="password"
                      placeholder="Your JIRA API token"
                      value={config.jiraToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, jiraToken: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jira-auto-create"
                    checked={config.jiraAutoCreate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, jiraAutoCreate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="jira-auto-create" className="text-sm">
                    Automatically create JIRA epics for new projects
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Confluence Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-semibold">Confluence Integration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confluence-url">Confluence URL</Label>
                    <Input
                      id="confluence-url"
                      placeholder="https://company.atlassian.net/wiki"
                      value={config.confluenceUrl}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-space">Space Key</Label>
                    <Input
                      id="confluence-space"
                      placeholder="DEV"
                      value={config.confluenceSpace}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceSpace: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-email">Email</Label>
                    <Input
                      id="confluence-email"
                      type="email"
                      placeholder="user@company.com"
                      value={config.confluenceEmail}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confluence-token">API Token</Label>
                    <Input
                      id="confluence-token"
                      type="password"
                      placeholder="Your Confluence API token"
                      value={config.confluenceToken}
                      onChange={(e) => setConfig((prev) => ({ ...prev, confluenceToken: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confluence-auto-create"
                    checked={config.confluenceAutoCreate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, confluenceAutoCreate: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="confluence-auto-create" className="text-sm">
                    Automatically create Confluence pages for documentation
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Template Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <h3 className="font-semibold">Template Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template">Default Template</Label>
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
                        <SelectItem value="enterprise">Enterprise Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="output-format">Output Format</Label>
                    <Select
                      value={config.outputFormat}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, outputFormat: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markdown">Markdown</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="confluence">Confluence Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <h3 className="font-semibold">Notification Settings</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="email-notifications"
                      checked={config.emailNotifications}
                      onChange={(e) => setConfig((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="email-notifications" className="text-sm">
                      Send email notifications when documents are ready
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="slack-notifications"
                      checked={config.slackNotifications}
                      onChange={(e) => setConfig((prev) => ({ ...prev, slackNotifications: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="slack-notifications" className="text-sm">
                      Send Slack notifications (requires Slack integration)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveConfig} className="flex-1">
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={handleTestConnections}>
                  Test Connections
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Other Dialogs */}
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
