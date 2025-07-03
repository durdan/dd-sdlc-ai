'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  GitBranch, 
  TrendingUp, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Target,
  Calendar,
  Zap
} from 'lucide-react'

interface DependencyRelation {
  fromId: string
  toId: string
  type: 'blocks' | 'depends_on' | 'related_to' | 'enables'
  strength: 'strong' | 'medium' | 'weak'
  description: string
}

interface BusinessValueScore {
  score: number
  factors: {
    userImpact: number
    businessCriticality: number
    technicalComplexity: number
    riskLevel: number
  }
  reasoning: string
}

interface TaskBreakdown {
  originalTask: any
  subtasks: Array<{
    id: string
    title: string
    description: string
    estimatedHours: number
    skillsRequired: string[]
    dependencies: string[]
  }>
  totalEstimatedHours: number
}

interface ContentIntelligenceData {
  parsedContent: {
    epic: any
    userStories: any[]
    developmentTasks: any[]
    designTasks: any[]
  }
  intelligence: {
    dependencies: DependencyRelation[]
    businessValues: Record<string, BusinessValueScore>
    taskBreakdowns: TaskBreakdown[]
    priorityRecommendations: Array<{
      itemId: string
      recommendedPriority: 'High' | 'Medium' | 'Low'
      reasoning: string
    }>
    sprintRecommendations: Array<{
      sprintNumber: number
      items: string[]
      totalStoryPoints: number
      reasoning: string
    }>
  }
  summary: {
    totalItems: number
    dependenciesIdentified: number
    complexTasksAnalyzed: number
    priorityRecommendations: number
    sprintsRecommended: number
    averageBusinessValue: number
  }
}

interface ContentIntelligenceViewerProps {
  data: ContentIntelligenceData
  onClose?: () => void
}

export function ContentIntelligenceViewer({ data, onClose }: ContentIntelligenceViewerProps) {
  const [selectedDependency, setSelectedDependency] = useState<DependencyRelation | null>(null)
  const [selectedBreakdown, setSelectedBreakdown] = useState<TaskBreakdown | null>(null)

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'blocks': return 'bg-red-100 text-red-800'
      case 'depends_on': return 'bg-orange-100 text-orange-800'
      case 'related_to': return 'bg-blue-100 text-blue-800'
      case 'enables': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'weak': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getItemTitle = (itemId: string) => {
    const allItems = [
      ...data.parsedContent.userStories,
      ...data.parsedContent.developmentTasks,
      ...data.parsedContent.designTasks
    ]
    const item = allItems.find(i => i.id === itemId)
    return item?.title || itemId
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Content Intelligence Analysis</h1>
            <p className="text-gray-600">AI-powered insights for {data.parsedContent.epic.title}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close Analysis
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalItems}</div>
            <p className="text-xs text-gray-600">Stories, Tasks & Design</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.dependenciesIdentified}</div>
            <p className="text-xs text-gray-600">Relationships Found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Business Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.averageBusinessValue.toFixed(1)}/10</div>
            <Progress value={data.summary.averageBusinessValue * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sprint Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.sprintsRecommended}</div>
            <p className="text-xs text-gray-600">Sprints Recommended</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dependencies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="business-value">Business Value</TabsTrigger>
          <TabsTrigger value="task-breakdown">Task Breakdown</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="sprints">Sprint Plan</TabsTrigger>
        </TabsList>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Dependency Analysis
              </CardTitle>
              <CardDescription>
                Identified relationships between user stories, development tasks, and design tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.intelligence.dependencies.map((dep, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                       onClick={() => setSelectedDependency(dep)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getDependencyTypeColor(dep.type)}>
                          {dep.type.replace('_', ' ')}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full ${getStrengthColor(dep.strength)}`} 
                             title={`${dep.strength} dependency`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{getItemTitle(dep.fromId)}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{getItemTitle(dep.toId)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{dep.description}</p>
                  </div>
                ))}
                {data.intelligence.dependencies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No dependencies identified between items</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Value Tab */}
        <TabsContent value="business-value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Business Value Analysis
              </CardTitle>
              <CardDescription>
                AI-powered business value scoring for prioritization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.intelligence.businessValues).map(([itemId, value]) => (
                  <div key={itemId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{getItemTitle(itemId)}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{value.score}/10</span>
                        <Progress value={value.score * 10} className="w-20" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">User Impact</div>
                        <div className="text-lg">{value.factors.userImpact}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Business Critical</div>
                        <div className="text-lg">{value.factors.businessCriticality}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Complexity</div>
                        <div className="text-lg">{value.factors.technicalComplexity}/10</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Risk Level</div>
                        <div className="text-lg">{value.factors.riskLevel}/10</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{value.reasoning}</p>
                  </div>
                ))}
                {Object.keys(data.intelligence.businessValues).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No business value analysis available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Breakdown Tab */}
        <TabsContent value="task-breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Complex Task Breakdown
              </CardTitle>
              <CardDescription>
                AI-generated subtasks for complex development and design tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.intelligence.taskBreakdowns.map((breakdown, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{breakdown.originalTask.title}</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{breakdown.totalEstimatedHours}h total</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {breakdown.subtasks.map((subtask, subIndex) => (
                        <div key={subIndex} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-sm">{subtask.title}</h5>
                            <span className="text-xs text-gray-600">{subtask.estimatedHours}h</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{subtask.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {subtask.skillsRequired.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {data.intelligence.taskBreakdowns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No complex tasks requiring breakdown identified</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Priorities Tab */}
        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Recommendations
              </CardTitle>
              <CardDescription>
                AI-recommended priorities based on business value and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.intelligence.priorityRecommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{getItemTitle(rec.itemId)}</h4>
                      <Badge className={getPriorityColor(rec.recommendedPriority)}>
                        {rec.recommendedPriority} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rec.reasoning}</p>
                  </div>
                ))}
                {data.intelligence.priorityRecommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No priority recommendations available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sprint Plan Tab */}
        <TabsContent value="sprints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sprint Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated sprint organization based on dependencies and capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.intelligence.sprintRecommendations.map((sprint, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Sprint {sprint.sprintNumber}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sprint.totalStoryPoints} story points</span>
                        <Progress value={(sprint.totalStoryPoints / 20) * 100} className="w-20" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{sprint.reasoning}</p>
                    
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Items in this sprint:</h5>
                      {sprint.items.map((itemId, itemIndex) => (
                        <div key={itemIndex} className="text-sm text-gray-700 pl-4">
                          • {getItemTitle(itemId)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {data.intelligence.sprintRecommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sprint recommendations available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
