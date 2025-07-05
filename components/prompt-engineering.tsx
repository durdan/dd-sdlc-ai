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

interface PromptEngineeringProps {
  onPromptUpdate?: (type: string, content: string) => void
}

export function PromptEngineering({ onPromptUpdate }: PromptEngineeringProps = {}) {
  const [activeTab, setActiveTab] = useState("business")
  const [showPreview, setShowPreview] = useState(false)

  // Default prompt templates
  const [promptTemplates, setPromptTemplates] = useState<Record<string, PromptTemplate>>({
    business: {
      id: "business",
      name: "Business Analysis → User Stories",
      content: `As a Senior Product Owner with 8+ years of Agile experience, analyze the following business case and extract actionable user stories:

Business Case: {{input}}

Generate the following structured output:

## Epic Overview
- **Epic Title**: [Clear, business-focused title]
- **Epic Description**: [2-3 sentences describing the overall business goal]
- **Business Value**: [Quantifiable value/impact]
- **Priority**: [High/Medium/Low with justification]

## User Stories (Format: As a [user type], I want [functionality], so that [benefit])
For each user story, provide:
1. **Story Title**: Clear, action-oriented title
2. **Story Description**: Full user story format
3. **Acceptance Criteria**: 3-5 specific, testable criteria
4. **Story Points**: Estimate (1, 2, 3, 5, 8, 13)
5. **Priority**: High/Medium/Low
6. **Dependencies**: Any blocking or related stories
7. **Definition of Done**: Clear completion criteria

## Personas & User Types
- **Primary Users**: [List main user types]
- **Secondary Users**: [Supporting user types]
- **Admin Users**: [Administrative roles]

## Success Metrics
- **User Adoption**: [Specific metrics]
- **Business Impact**: [ROI/KPI targets]
- **Technical Performance**: [Performance benchmarks]

Focus on creating 5-8 user stories that are:
- Independent and deliverable
- Testable with clear acceptance criteria
- Properly sized for sprint planning
- Aligned with business objectives

Writing Style: {{writing_style}}
Industry Focus: {{industry}}
Methodology: {{methodology}}`,
      variables: {
        role: "Senior Product Owner",
        experience: "8",
        writing_style: "Agile-focused",
        industry: "Technology",
        methodology: "Scrum",
        format: "user-story-driven",
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
      name: "Technical Specification → Development Tasks",
      content: `As a Senior Software Architect with 10+ years of full-stack development experience, break down the following functional requirements into specific development tasks:

Functional Requirements: {{functional_spec}}
Business Analysis: {{business_analysis}}

Generate the following structured output:

## Technical Epic
- **Epic Title**: [Technical implementation focus]
- **Technical Approach**: [Architecture pattern/approach]
- **Technology Stack**: [Specific technologies]

## Development Tasks
For each task, provide:
1. **Task Title**: Clear, action-oriented (e.g., "Implement user authentication API")
2. **Task Description**: Technical implementation details
3. **Acceptance Criteria**: Technical completion criteria
4. **Story Points**: Effort estimate (1, 2, 3, 5, 8)
5. **Components**: Frontend/Backend/Database/DevOps
6. **Dependencies**: Technical prerequisites
7. **Definition of Done**: Code quality, testing, documentation requirements

## Task Categories:
### Backend Development
- API endpoint implementation
- Database schema design
- Business logic implementation
- Authentication/authorization
- Data validation and processing

### Frontend Development
- UI component development
- State management
- API integration
- Form handling and validation
- Responsive design implementation

### Infrastructure & DevOps
- Database setup and configuration
- CI/CD pipeline setup
- Environment configuration
- Monitoring and logging
- Security implementation

### Testing & Quality Assurance
- Unit test implementation
- Integration test setup
- End-to-end test scenarios
- Performance testing
- Security testing

## Technical Debt & Improvements
- Code refactoring opportunities
- Performance optimizations
- Security enhancements
- Documentation updates

Create 8-12 specific, actionable development tasks that are:
- Technically detailed and implementable
- Properly estimated for sprint planning
- Categorized by development area
- Include clear technical acceptance criteria

Architecture Pattern: {{architecture_pattern}}
Cloud Platform: {{cloud_platform}}
Database Type: {{database_type}}
Security Level: {{security_level}}`,
      variables: {
        role: "Senior Software Architect",
        experience: "10",
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
      name: "UX/UI Specification → Design Tasks",
      content: `As a Senior UX Designer with expertise in user-centered design, create specific design tasks based on the following requirements:

User Stories: {{user_stories}}
Business Analysis: {{business_analysis}}

Generate the following structured output:

## UX Epic
- **Epic Title**: [User experience focus]
- **Design Approach**: [Design methodology]
- **Success Metrics**: [User experience KPIs]

## Design Tasks
For each task, provide:
1. **Task Title**: Clear design deliverable (e.g., "Create user onboarding wireframes")
2. **Task Description**: Design scope and requirements
3. **Deliverables**: Specific design artifacts
4. **Story Points**: Design effort estimate (1, 2, 3, 5, 8)
5. **User Impact**: How this improves user experience
6. **Dependencies**: Design prerequisites
7. **Definition of Done**: Design completion criteria

## Design Task Categories:
### Research & Discovery
- User research and interviews
- Competitive analysis
- User journey mapping
- Persona development
- Usability testing

### Information Architecture
- Site map creation
- User flow diagrams
- Content strategy
- Navigation design
- Information hierarchy

### Visual Design
- Wireframe creation
- Mockup development
- Visual style guide
- Component library
- Icon and illustration design

### Prototyping & Testing
- Interactive prototype development
- Usability testing sessions
- A/B test setup
- Accessibility review
- Design system documentation

Create 6-10 specific design tasks that are:
- User-focused and experience-driven
- Deliverable-based with clear outcomes
- Properly scoped for design sprints
- Include user validation methods

Target Devices: {{target_devices}}
Design System: {{design_system}}
User Experience Level: {{ux_complexity}}
Accessibility Standard: {{accessibility_standard}}

Focus on {{design_priority}} and ensure the design supports {{user_goals}}.`,
      variables: {
        role: "Senior UX Designer",
        design_approach: "User-Centered",
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
    mermaid: {
      id: "mermaid",
      name: "Mermaid Diagrams → System Visualization",
      content: `As a Senior System Architect with expertise in technical documentation, create comprehensive Mermaid diagrams based on the following specifications:

Technical Specification: {{technical_spec}}
Functional Specification: {{functional_spec}}
Business Analysis: {{business_analysis}}

Generate the following structured Mermaid diagrams:

## System Architecture Diagram
\`\`\`mermaid
graph TD
    %% Create a high-level system architecture diagram
    %% Include: Frontend, Backend, Database, External Services
    %% Show data flow and component relationships
\`\`\`

## Database Schema Diagram
\`\`\`mermaid
erDiagram
    %% Create entity relationship diagram
    %% Include: Tables, relationships, key fields
    %% Show primary keys, foreign keys, and constraints
\`\`\`

## User Flow Diagram
\`\`\`mermaid
flowchart TD
    %% Create user journey flowchart
    %% Include: User actions, decision points, system responses
    %% Show happy path and error handling
\`\`\`

## API Flow Diagram
\`\`\`mermaid
sequenceDiagram
    %% Create API interaction sequence
    %% Include: Client, Server, Database interactions
    %% Show request/response flow and error handling
\`\`\`

Ensure diagrams are:
- Technically accurate and detailed
- Easy to understand and well-labeled
- Include proper Mermaid syntax
- Show realistic system interactions
- Include error handling and edge cases

Diagram Style: {{diagram_style}}
Complexity Level: {{complexity_level}}
Focus Area: {{focus_area}}`,
      variables: {
        diagram_style: "Professional",
        complexity_level: "Detailed",
        focus_area: "System Architecture",
        include_database: true,
        include_api_flow: true,
        include_user_flow: true,
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

  // Handle save template
  const handleSaveTemplate = () => {
    // Save logic would go here
    console.log("Saving template:", promptTemplates[activeTab])
    
    // Notify parent component about the updated prompt
    if (onPromptUpdate) {
      onPromptUpdate(activeTab, promptTemplates[activeTab].content)
    }
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
            <div className="tabs-mobile-container tabs-scroll-container mb-4">
              <TabsList className="tabs-mobile-list">
                <TabsTrigger value="business" className="tab-trigger-mobile">
                  <span className="hidden sm:inline">Business Analysis</span>
                  <span className="sm:hidden">Business</span>
                </TabsTrigger>
                <TabsTrigger value="functional" className="tab-trigger-mobile">
                  <span className="hidden sm:inline">Functional Spec</span>
                  <span className="sm:hidden">Functional</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="tab-trigger-mobile">
                  <span className="hidden sm:inline">Technical Spec</span>
                  <span className="sm:hidden">Technical</span>
                </TabsTrigger>
                <TabsTrigger value="ux" className="tab-trigger-mobile">
                  <span className="hidden sm:inline">UX Specification</span>
                  <span className="sm:hidden">UX</span>
                </TabsTrigger>
                <TabsTrigger value="mermaid" className="tab-trigger-mobile">
                  <span className="hidden sm:inline">Mermaid Diagrams</span>
                  <span className="sm:hidden">Mermaid</span>
                </TabsTrigger>
              </TabsList>
            </div>

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
              <Button variant="outline" className="w-full bg-transparent" onClick={handleSaveTemplate}>
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
