"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Github,
  Trello,
  FileText,
  Calendar,
  Database,
  Globe,
  Slack,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink,
  Plus,
  Zap,
  Users,
  Cloud,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: "development" | "communication" | "documentation" | "project-management"
  status: "connected" | "disconnected" | "error"
  features: string[]
  setupRequired: boolean
  vercelIntegration?: boolean
}

interface IntegrationConfig {
  [key: string]: {
    enabled: boolean
    settings: Record<string, any>
  }
}

export function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Integration configurations
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig>({
    github: {
      enabled: false,
      settings: {
        autoCreateRepo: true,
        generateReadme: true,
        defaultBranch: "main",
        visibility: "private",
        includeTemplates: true,
      },
    },
    slack: {
      enabled: false,
      settings: {
        channel: "#development",
        notifications: ["project-created", "documentation-ready"],
        mentionTeam: true,
        includeLinks: true,
      },
    },
    notion: {
      enabled: false,
      settings: {
        workspace: "",
        database: "",
        autoSync: true,
        templateFormat: "blocks",
      },
    },
    linear: {
      enabled: false,
      settings: {
        team: "",
        project: "",
        autoCreateIssues: true,
        priority: "medium",
      },
    },
  })

  // Available integrations
  const integrations: Integration[] = [
    {
      id: "github",
      name: "GitHub",
      description: "Auto-create repositories, README files, and project structure",
      icon: <Github className="h-6 w-6" />,
      category: "development",
      status: integrationConfigs.github.enabled ? "connected" : "disconnected",
      features: ["Repository Creation", "README Generation", "Issue Templates", "Project Boards"],
      setupRequired: true,
      vercelIntegration: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Real-time notifications and team collaboration",
      icon: <Slack className="h-6 w-6" />,
      category: "communication",
      status: integrationConfigs.slack.enabled ? "connected" : "disconnected",
      features: ["Project Notifications", "Team Mentions", "Document Sharing", "Status Updates"],
      setupRequired: true,
      vercelIntegration: true,
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Enterprise communication and collaboration",
      icon: <Users className="h-6 w-6" />,
      category: "communication",
      status: "disconnected",
      features: ["Channel Notifications", "File Sharing", "Meeting Integration", "Bot Commands"],
      setupRequired: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Comprehensive documentation and knowledge management",
      icon: <FileText className="h-6 w-6" />,
      category: "documentation",
      status: integrationConfigs.notion.enabled ? "connected" : "disconnected",
      features: ["Page Creation", "Database Sync", "Template Import", "Real-time Collaboration"],
      setupRequired: true,
    },
    {
      id: "linear",
      name: "Linear",
      description: "Modern issue tracking and project management",
      icon: <Zap className="h-6 w-6" />,
      category: "project-management",
      status: integrationConfigs.linear.enabled ? "connected" : "disconnected",
      features: ["Issue Creation", "Project Sync", "Milestone Tracking", "Team Assignment"],
      setupRequired: true,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Visual project management with boards and cards",
      icon: <Trello className="h-6 w-6" />,
      category: "project-management",
      status: "disconnected",
      features: ["Board Creation", "Card Management", "Checklist Sync", "Due Date Tracking"],
      setupRequired: true,
    },
    {
      id: "asana",
      name: "Asana",
      description: "Team project and task management platform",
      icon: <Calendar className="h-6 w-6" />,
      category: "project-management",
      status: "disconnected",
      features: ["Task Creation", "Project Templates", "Timeline View", "Team Collaboration"],
      setupRequired: true,
    },
    {
      id: "azure-devops",
      name: "Azure DevOps",
      description: "Microsoft's complete DevOps solution",
      icon: <Cloud className="h-6 w-6" />,
      category: "development",
      status: "disconnected",
      features: ["Work Items", "Repository Integration", "Pipeline Triggers", "Board Sync"],
      setupRequired: true,
    },
    {
      id: "google-workspace",
      name: "Google Workspace",
      description: "Google Docs, Sheets, and Drive integration",
      icon: <Globe className="h-6 w-6" />,
      category: "documentation",
      status: "disconnected",
      features: ["Document Creation", "Sheet Export", "Drive Storage", "Real-time Editing"],
      setupRequired: true,
    },
  ]

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === "all" || integration.category === activeTab
    return matchesSearch && matchesCategory
  })

  // Toggle integration
  const toggleIntegration = (integrationId: string) => {
    setIntegrationConfigs((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        enabled: !prev[integrationId]?.enabled,
      },
    }))
  }

  // Update integration setting
  const updateIntegrationSetting = (integrationId: string, setting: string, value: any) => {
    setIntegrationConfigs((prev) => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        settings: {
          ...prev[integrationId]?.settings,
          [setting]: value,
        },
      },
    }))
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  // Connect to Vercel integration
  const connectVercelIntegration = (integrationId: string) => {
    // In a real app, this would redirect to Vercel's OAuth flow
    console.log(`Connecting to ${integrationId} via Vercel...`)
    // Simulate connection
    setTimeout(() => {
      toggleIntegration(integrationId)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub</h2>
          <p className="text-gray-600">Connect your favorite tools and automate your workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Manage All
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="project-management">Project Management</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(integration.status)}
                      <span className="text-sm text-gray-500 capitalize">{integration.status}</span>
                      {integration.vercelIntegration && (
                        <Badge variant="outline" className="text-xs">
                          Vercel
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={integrationConfigs[integration.id]?.enabled || false}
                  onCheckedChange={() => toggleIntegration(integration.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{integration.description}</p>

              {/* Features */}
              <div>
                <Label className="text-xs font-medium text-gray-500">FEATURES</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {integration.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configuration */}
              {integrationConfigs[integration.id]?.enabled && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-500">CONFIGURATION</Label>

                  {/* GitHub Settings */}
                  {integration.id === "github" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-create repositories</Label>
                        <Switch
                          checked={integrationConfigs.github.settings.autoCreateRepo}
                          onCheckedChange={(checked) => updateIntegrationSetting("github", "autoCreateRepo", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Generate README files</Label>
                        <Switch
                          checked={integrationConfigs.github.settings.generateReadme}
                          onCheckedChange={(checked) => updateIntegrationSetting("github", "generateReadme", checked)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Default branch</Label>
                        <Input
                          value={integrationConfigs.github.settings.defaultBranch}
                          onChange={(e) => updateIntegrationSetting("github", "defaultBranch", e.target.value)}
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Slack Settings */}
                  {integration.id === "slack" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Default channel</Label>
                        <Input
                          value={integrationConfigs.slack.settings.channel}
                          onChange={(e) => updateIntegrationSetting("slack", "channel", e.target.value)}
                          placeholder="#development"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Mention team</Label>
                        <Switch
                          checked={integrationConfigs.slack.settings.mentionTeam}
                          onCheckedChange={(checked) => updateIntegrationSetting("slack", "mentionTeam", checked)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notion Settings */}
                  {integration.id === "notion" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Workspace</Label>
                        <Input
                          value={integrationConfigs.notion.settings.workspace}
                          onChange={(e) => updateIntegrationSetting("notion", "workspace", e.target.value)}
                          placeholder="Your workspace name"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-sync changes</Label>
                        <Switch
                          checked={integrationConfigs.notion.settings.autoSync}
                          onCheckedChange={(checked) => updateIntegrationSetting("notion", "autoSync", checked)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Linear Settings */}
                  {integration.id === "linear" && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Team</Label>
                        <Input
                          value={integrationConfigs.linear.settings.team}
                          onChange={(e) => updateIntegrationSetting("linear", "team", e.target.value)}
                          placeholder="Team name"
                          className="mt-1"
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Auto-create issues</Label>
                        <Switch
                          checked={integrationConfigs.linear.settings.autoCreateIssues}
                          onCheckedChange={(checked) => updateIntegrationSetting("linear", "autoCreateIssues", checked)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {integration.vercelIntegration ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => connectVercelIntegration(integration.id)}
                    disabled={integrationConfigs[integration.id]?.enabled}
                  >
                    {integrationConfigs[integration.id]?.enabled ? "Connected" : "Connect via Vercel"}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Configure
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integration Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(integrationConfigs).filter((config) => config.enabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter((i) => i.vercelIntegration).length}
              </div>
              <div className="text-sm text-gray-600">Vercel Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{integrations.length}</div>
              <div className="text-sm text-gray-600">Available Integrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-sm text-gray-600">Sync Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Auto-create GitHub repository</div>
                <div className="text-sm text-gray-600">When a new project is generated</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Send Slack notification</div>
                <div className="text-sm text-gray-600">When documentation is ready</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Sync to Notion database</div>
                <div className="text-sm text-gray-600">When project status changes</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Create Linear issues</div>
                <div className="text-sm text-gray-600">From functional requirements</div>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
