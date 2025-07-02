"use client"

import type React from "react"

import {
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Bot,
  Settings,
  FileText,
  GitBranch,
  Merge,
  Globe,
  ExternalLink,
  Edit,
} from "lucide-react"

interface WorkflowVisualizationProps {
  currentStep: number
  processingSteps: Array<{
    id: string
    name: string
    status: "pending" | "in_progress" | "completed" | "error"
    progress: number
  }>
}

interface WorkflowNode {
  id: string
  label: string
  icon: React.ReactNode
  x: number
  y: number
  status: "pending" | "in_progress" | "completed" | "error"
  description: string
}

interface WorkflowConnection {
  from: string
  to: string
  type: "solid" | "dashed"
}

export function WorkflowVisualization({ currentStep, processingSteps }: WorkflowVisualizationProps) {
  const getNodeStatus = (nodeId: string): "pending" | "in_progress" | "completed" | "error" => {
    const stepMap: { [key: string]: string } = {
      "chat-input": "analysis",
      "ai-agent": "analysis",
      "format-input": "analysis",
      "set-params": "analysis",
      "business-research": "analysis",
      "functional-spec": "functional",
      "technical-spec": "technical",
      "ux-spec": "ux",
      "jira-epic": "jira",
      "merge-specs": "confluence",
      "confluence-prep": "confluence",
      "confluence-create": "confluence",
      "jira-update": "linking",
      "final-output": "linking",
    }

    const mappedStep = stepMap[nodeId]
    const step = processingSteps.find((s) => s.id === mappedStep)
    return step?.status || "pending"
  }

  const nodes: WorkflowNode[] = [
    {
      id: "chat-input",
      label: "When chat message received",
      icon: <MessageSquare className="h-4 w-4" />,
      x: 50,
      y: 200,
      status: getNodeStatus("chat-input"),
      description: "User provides business case input",
    },
    {
      id: "ai-agent",
      label: "AI Agent",
      icon: <Bot className="h-4 w-4" />,
      x: 200,
      y: 200,
      status: getNodeStatus("ai-agent"),
      description: "OpenAI processes the input",
    },
    {
      id: "format-input",
      label: "Format Chat Input",
      icon: <FileText className="h-4 w-4" />,
      x: 350,
      y: 200,
      status: getNodeStatus("format-input"),
      description: "Structure input for processing",
    },
    {
      id: "set-params",
      label: "Set Parameters",
      icon: <Settings className="h-4 w-4" />,
      x: 500,
      y: 200,
      status: getNodeStatus("set-params"),
      description: "Configure generation parameters",
    },
    {
      id: "business-research",
      label: "1. Business Analyst Research",
      icon: <FileText className="h-4 w-4" />,
      x: 650,
      y: 200,
      status: getNodeStatus("business-research"),
      description: "Generate business analysis",
    },
    {
      id: "functional-spec",
      label: "2. Generate Functional Specification",
      icon: <FileText className="h-4 w-4" />,
      x: 500,
      y: 100,
      status: getNodeStatus("functional-spec"),
      description: "Create functional requirements",
    },
    {
      id: "technical-spec",
      label: "3. Generate Technical Specification",
      icon: <FileText className="h-4 w-4" />,
      x: 800,
      y: 100,
      status: getNodeStatus("technical-spec"),
      description: "Design technical architecture",
    },
    {
      id: "ux-spec",
      label: "4. Generate UX Specification",
      icon: <FileText className="h-4 w-4" />,
      x: 500,
      y: 300,
      status: getNodeStatus("ux-spec"),
      description: "Define user experience requirements",
    },
    {
      id: "jira-epic",
      label: "5. Create JIRA Epic",
      icon: <GitBranch className="h-4 w-4" />,
      x: 650,
      y: 350,
      status: getNodeStatus("jira-epic"),
      description: "Generate JIRA epic and tasks",
    },
    {
      id: "merge-specs",
      label: "6. Merge All Specifications",
      icon: <Merge className="h-4 w-4" />,
      x: 950,
      y: 200,
      status: getNodeStatus("merge-specs"),
      description: "Combine all generated documents",
    },
    {
      id: "confluence-prep",
      label: "7. Prepare Confluence Content",
      icon: <FileText className="h-4 w-4" />,
      x: 1100,
      y: 150,
      status: getNodeStatus("confluence-prep"),
      description: "Format content for Confluence",
    },
    {
      id: "confluence-create",
      label: "8. Create Confluence Documentation",
      icon: <Globe className="h-4 w-4" />,
      x: 1250,
      y: 200,
      status: getNodeStatus("confluence-create"),
      description: "Publish to Confluence",
    },
    {
      id: "jira-update",
      label: "9. Update JIRA with Confluence Link",
      icon: <ExternalLink className="h-4 w-4" />,
      x: 1250,
      y: 300,
      status: getNodeStatus("jira-update"),
      description: "Link JIRA epic to Confluence page",
    },
    {
      id: "final-output",
      label: "10. Final Output Summary",
      icon: <Edit className="h-4 w-4" />,
      x: 1400,
      y: 250,
      status: getNodeStatus("final-output"),
      description: "Generate final project summary",
    },
  ]

  const connections: WorkflowConnection[] = [
    { from: "chat-input", to: "ai-agent", type: "solid" },
    { from: "ai-agent", to: "format-input", type: "solid" },
    { from: "format-input", to: "set-params", type: "solid" },
    { from: "set-params", to: "business-research", type: "solid" },
    { from: "business-research", to: "functional-spec", type: "solid" },
    { from: "business-research", to: "technical-spec", type: "solid" },
    { from: "business-research", to: "ux-spec", type: "solid" },
    { from: "business-research", to: "jira-epic", type: "solid" },
    { from: "functional-spec", to: "merge-specs", type: "solid" },
    { from: "technical-spec", to: "merge-specs", type: "solid" },
    { from: "ux-spec", to: "merge-specs", type: "solid" },
    { from: "jira-epic", to: "merge-specs", type: "solid" },
    { from: "merge-specs", to: "confluence-prep", type: "solid" },
    { from: "confluence-prep", to: "confluence-create", type: "solid" },
    { from: "confluence-create", to: "jira-update", type: "solid" },
    { from: "jira-update", to: "final-output", type: "solid" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 border-green-300"
      case "in_progress":
        return "text-blue-600 bg-blue-100 border-blue-300"
      case "error":
        return "text-red-600 bg-red-100 border-red-300"
      default:
        return "text-gray-600 bg-gray-100 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "in_progress":
        return <Clock className="h-3 w-3 text-blue-600 animate-spin" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return <div className="h-3 w-3 rounded-full border border-gray-400" />
    }
  }

  const getConnectionPath = (from: WorkflowNode, to: WorkflowNode) => {
    const startX = from.x + 75 // Assuming node width of 150px
    const startY = from.y + 25 // Assuming node height of 50px
    const endX = to.x
    const endY = to.y + 25

    // Create a curved path
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
  }

  return (
    <div className="relative w-full h-[600px] overflow-auto bg-gray-50 rounded-lg border">
      <svg className="absolute inset-0 w-full h-full" style={{ minWidth: "1500px", minHeight: "500px" }}>
        {/* Render connections */}
        {connections.map((conn, index) => {
          const fromNode = nodes.find((n) => n.id === conn.from)
          const toNode = nodes.find((n) => n.to === conn.to)

          if (!fromNode || !toNode) return null

          return (
            <path
              key={index}
              d={getConnectionPath(fromNode, toNode)}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              strokeDasharray={conn.type === "dashed" ? "5,5" : "none"}
              markerEnd="url(#arrowhead)"
            />
          )
        })}

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>

      {/* Render nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute w-36 p-2 rounded-lg border-2 shadow-sm transition-all duration-200 ${getStatusColor(node.status)}`}
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(node.status)}
            {node.icon}
          </div>
          <div className="text-xs font-medium leading-tight">{node.label}</div>
          <div className="text-xs text-gray-600 mt-1 leading-tight">{node.description}</div>
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg border shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Status Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-gray-400"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-red-600" />
            <span>Error</span>
          </div>
        </div>
      </div>

      {/* Process Info */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg border shadow-sm max-w-xs">
        <h4 className="text-sm font-semibold mb-2">Workflow Overview</h4>
        <p className="text-xs text-gray-600">
          This diagram shows the complete SDLC automation process from initial input to final documentation delivery.
          Each node represents a specific step in the workflow, with parallel processing for efficiency.
        </p>
      </div>
    </div>
  )
}
