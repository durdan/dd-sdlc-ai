"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, Play, Download, Upload, Sparkles, Settings, Eye, Code, FileText, Zap } from "lucide-react"

interface PromptTemplate {
  id: string
  name: string
  content: string
  variables: Record<string, any>
}

interface AISettings {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export function PromptEngineering() {
  const [activeTab, setActiveTab] = useState("business")
  const [showPreview, setShowPreview] = useState(false)

  // Default prompt templates
  const [promptTemplates, setPromptTemplates] = useState<Record<string, PromptTemplate>>({
    business: {
      id: "business",
      name: "Business Analysis",
      content: `As a {{role}} with {{experience}} years of experience, analyze the following business case and provide a comprehensive business analysis:

Business Case: {{input}}

Please provide:
1. Executive Summary
2. Business Objectives
3. Stakeholder Analysis
4. Success Criteria
5. Risk Assessment
6. Timeline Estimates
7. Resource Requirements

{{#include_compliance}}
8. Compliance and Regulatory Considerations
{{/include_compliance}}

Writing Style: {{writing_style}}
Industry Focus: {{industry}}
Methodology: {{methodology}}

Format the response in a {{format}} manner with clear headings and bullet points.`,
      variables: {
        role: "Senior Business Analyst",
        experience: "10",
        writing_style: "Professional",
        industry: "Technology",
        methodology: "Agile",
        format: "structured",
        include_compliance: true,
      },
    },
    functional: {
      id: "functional",
      name: "Functional Specification",
      content: `As a {{role}} with expertise in {{methodology}} development, create a detailed functional specification based on the following business analysis:

Business Analysis: {{business_analysis}}

Please provide:
1. Functional Requirements (numbered list)
2. User Stories with acceptance criteria
3. Use Cases with detailed scenarios
4. Data Requirements
5. Integration Requirements
6. Performance Requirements
7. Security Requirements

{{#include_api_specs}}
8. API Specifications and Endpoints
{{/include_api_specs}}

Target Audience: {{audience}}
Complexity Level: {{complexity}}
Documentation Style: {{doc_style}}

Ensure all requirements are {{requirement_style}} and include priority levels (High/Medium/Low).`,
      variables: {
        role: "Senior Product Manager",
        methodology: "Agile",
        audience: "Development Team",
        complexity: "Medium",
        doc_style: "Technical",
        requirement_style: "testable and measurable",
        include_api_specs: true,
      },
    },
    technical: {
      id: "technical",
      name: "Technical Specification",
      content: `As a {{role}} with {{experience}} years of experience in {{tech_stack}}, create a comprehensive technical specification:

Functional Requirements: {{functional_spec}}

Please provide:
1. System Architecture Overview
2. Technology Stack Recommendations
3. Database Design and Schema
4. API Specifications and Endpoints
5. Security Implementation Details
6. Deployment Strategy
7. Testing Strategy
8. Monitoring and Logging

{{#include_scalability}}
9. Scalability and Performance Considerations
{{/include_scalability}}

{{#include_devops}}
10. DevOps and CI/CD Pipeline
{{/include_devops}}

Architecture Pattern: {{architecture_pattern}}
Cloud Platform: {{cloud_platform}}
Database Type: {{database_type}}
Security Level: {{security_level}}

Include specific technical details, code examples where appropriate, and implementation approaches.`,
      variables: {
        role: "Senior Software Architect",
        experience: "12",
        tech_stack: "Node.js, React, PostgreSQL",
        architecture_pattern: "Microservices",
        cloud_platform: "AWS",
        database_type: "Relational",
        security_level: "Enterprise",
        include_scalability: true,
        include_devops: true,
      },
    },
    ux: {
      id: "ux",
      name: "UX Specification",
      content: `As a {{role}} specializing in {{design_approach}} design, create a comprehensive UX specification:

Business Requirements: {{business_analysis}}
Functional Requirements: {{functional_spec}}

Please provide:
1. User Personas and Demographics
2. User Journey Maps
3. Information Architecture
4. Wireframe Descriptions
5. UI Component Specifications
6. Accessibility Requirements ({{accessibility_level}})
7. Mobile Responsiveness Guidelines
8. Usability Testing Plan

{{#include_branding}}
9. Brand Guidelines and Visual Identity
{{/include_branding}}

{{#include_prototyping}}
10. Interactive Prototype Specifications
{{/include_prototyping}}

Target Devices: {{target_devices}}
Design System: {{design_system}}
User Experience Level: {{ux_complexity}}
Accessibility Standard: {{accessibility_standard}}

Focus on {{design_priority}} and ensure the design supports {{user_goals}}.`,
      variables: {
        role: "Senior UX Designer",
        design_approach: "Human-Centered",
        accessibility_level: "WCAG 2.1 AA",
        target_devices: "Desktop, Mobile, Tablet",
        design_system: "Material Design",
        ux_complexity: "Intermediate",
        accessibility_standard: "WCAG 2.1 AA",
        design_priority: "usability and accessibility",
        user_goals: "efficient task completion",
        include_branding: true,
        include_prototyping: true,
      },
    },
  })

  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  })

  // Get current template
  const currentTemplate = promptTemplates[activeTab]

  // Variable options
  const variableOptions = {
    role: [
      "Senior Business Analyst",
      "Product Manager",
      "Technical Lead",
      "Solution Architect",
      "UX Designer",
      "Project Manager",
    ],
    writing_style: ["Professional", "Casual", "Technical", "Executive", "Detailed", "Concise"],
    industry: ["Technology", "Healthcare", "Finance", "E-commerce", "Manufacturing", "Education"],
    methodology: ["Agile", "Waterfall", "DevOps", "Lean", "Scrum", "Kanban"],
    format: ["structured", "narrative", "bullet-points", "table-format"],
    audience: ["Development Team", "Executives", "Stakeholders", "End Users", "Technical Team"],
    complexity: ["Simple", "Medium", "Complex", "Enterprise"],
    doc_style: ["Technical", "Business", "User-Friendly", "Comprehensive"],
    architecture_pattern: ["Monolithic", "Microservices", "Serverless", "Event-Driven", "Layered"],
    cloud_platform: ["AWS", "Azure", "Google Cloud", "On-Premise", "Hybrid"],
    database_type: ["Relational", "NoSQL", "Graph", "Time-Series", "In-Memory"],
    security_level: ["Basic", "Standard", "Enterprise", "Government"],
    design_approach: ["Human-Centered", "Design Thinking", "Lean UX", "Atomic Design"],
    target_devices: ["Desktop Only", "Mobile First", "Desktop, Mobile, Tablet", "Cross-Platform"],
    design_system: ["Material Design", "Bootstrap", "Custom", "Ant Design", "Chakra UI"],
  }

  // Update template content
  const updateTemplateContent = (content: string) => {
    setPromptTemplates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        content,
      },
    }))
  }

  // Update variable value
  const updateVariable = (key: string, value: any) => {
    setPromptTemplates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        variables: {
          ...prev[activeTab].variables,
          [key]: value,
        },
      },
    }))
  }

  // Generate preview of prompt with variables replaced
  const generatePreview = () => {
    let preview = currentTemplate.content
    Object.entries(currentTemplate.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      preview = preview.replace(regex, String(value))
    })

    // Handle conditional blocks
    preview = preview.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, condition, content) => {
      return currentTemplate.variables[condition] ? content : ""
    })

    return preview
  }

  // Reset to defaults
  const resetToDefaults = () => {
    // Reset logic would restore original templates
    console.log("Reset to defaults")
  }

  // Test generation
  const testGeneration = () => {
    console.log("Testing generation with current prompt...")
    console.log("Prompt:", generatePreview())
    console.log("AI Settings:", aiSettings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Engineering Interface</h2>
          <p className="text-gray-600">
            Customize AI prompts for each document type to get exactly the output you need
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={testGeneration}>
            <Play className="h-4 w-4 mr-2" />
            Test Generation
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="business">Business Analysis</TabsTrigger>
              <TabsTrigger value="functional">Functional Spec</TabsTrigger>
              <TabsTrigger value="technical">Technical Spec</TabsTrigger>
              <TabsTrigger value="ux">UX Specification</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Template Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Prompt Template Editor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-content">Template Content</Label>
                      <Textarea
                        id="template-content"
                        value={currentTemplate.content}
                        onChange={(e) => updateTemplateContent(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                        placeholder="Enter your prompt template here..."
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Template Syntax:</p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          <code className="bg-gray-100 px-1 rounded">{"{{variable_name}}"}</code> - Insert variable
                          value
                        </li>
                        <li>
                          <code className="bg-gray-100 px-1 rounded">{"{{#condition}}...{{/condition}}"}</code> -
                          Conditional block
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variables Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Template Variables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentTemplate.variables).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                        {typeof value === "boolean" ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={key}
                              checked={value}
                              onChange={(e) => updateVariable(key, e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">Include this section</span>
                          </div>
                        ) : variableOptions[key as keyof typeof variableOptions] ? (
                          <Select value={String(value)} onValueChange={(newValue) => updateVariable(key, newValue)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {variableOptions[key as keyof typeof variableOptions].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={key}
                            value={String(value)}
                            onChange={(e) => updateVariable(key, e.target.value)}
                            placeholder={`Enter ${key.replace(/_/g, " ")}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) =>
                    setAiSettings((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))
                  }
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  value={aiSettings.maxTokens}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, maxTokens: Number.parseInt(e.target.value) }))}
                  min="100"
                  max="4000"
                />
              </div>

              <div>
                <Label htmlFor="top-p">Top P: {aiSettings.topP}</Label>
                <input
                  type="range"
                  id="top-p"
                  min="0"
                  max="1"
                  step="0.1"
                  value={aiSettings.topP}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, topP: Number.parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="frequency-penalty">Frequency Penalty: {aiSettings.frequencyPenalty}</Label>
                <input
                  type="range"
                  id="frequency-penalty"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiSettings.frequencyPenalty}
                  onChange={(e) =>
                    setAiSettings((prev) => ({ ...prev, frequencyPenalty: Number.parseFloat(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Template Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Templates
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Import Templates
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <Zap className="h-4 w-4 mr-2" />
                AI Optimize
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Template Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Variables:</span>
                  <Badge variant="outline">{Object.keys(currentTemplate.variables).length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <Badge variant="outline">{currentTemplate.content.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Est. Tokens:</span>
                  <Badge variant="outline">{Math.ceil(currentTemplate.content.length / 4)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prompt Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatePreview()}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
