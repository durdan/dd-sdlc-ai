'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Users, 
  Code, 
  Palette, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  GitBranch,
  Flag
} from 'lucide-react'
import { BacklogStructure, EnhancedEpic, EnhancedUserStory, EnhancedDevelopmentTask, EnhancedDesignTask, SprintPlan, SubTask } from '@/lib/backlog-structure'

interface BacklogStructureViewerProps {
  data: BacklogStructure
  onClose: () => void
}

export const BacklogStructureViewer: React.FC<BacklogStructureViewerProps> = ({ data, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Complex': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Simple': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderEpicOverview = (epic: EnhancedEpic) => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Epic: {epic.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {epic.totalStoryPoints} Story Points
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {epic.estimatedSprints} Sprints
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{epic.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Business Objectives</h4>
            <ul className="space-y-1">
              {epic.businessObjectives.map((objective, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Success Metrics</h4>
            <ul className="space-y-1">
              {epic.successMetrics.map((metric, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {epic.risks.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Risk Assessment</h4>
            <div className="space-y-2">
              {epic.risks.map((risk, index) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-orange-900">{risk.description}</p>
                    <div className="flex gap-1">
                      <Badge className={getRiskColor(risk.impact)} variant="outline">
                        Impact: {risk.impact}
                      </Badge>
                      <Badge className={getRiskColor(risk.probability)} variant="outline">
                        Probability: {risk.probability}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-orange-700">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {epic.milestones.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-900 mb-2">Key Milestones</h4>
            <div className="space-y-2">
              {epic.milestones.map((milestone, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-900">{milestone.name}</h5>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Sprint {milestone.targetSprint}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">{milestone.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {milestone.deliverables.map((deliverable, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderSubTasks = (subTasks: SubTask[]) => {
    if (subTasks.length === 0) return null

    return (
      <div className="mt-3 pl-4 border-l-2 border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Sub-tasks</h5>
        <div className="space-y-2">
          {subTasks.map((subTask) => (
            <div key={subTask.id} className="p-2 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{subTask.title}</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={getPriorityColor(subTask.priority)}>
                    {subTask.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {subTask.estimatedHours}h
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">{subTask.description}</p>
              {subTask.acceptanceCriteria.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">AC:</span>
                  <ul className="list-disc list-inside ml-2 text-gray-600">
                    {subTask.acceptanceCriteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderUserStories = (stories: EnhancedUserStory[]) => (
    <div className="space-y-4">
      {stories.map((story) => (
        <Card key={story.id} className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                {story.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(story.priority || 'Medium')}>
                  {story.priority || 'Medium'}
                </Badge>
                <Badge className={getRiskColor(story.riskLevel)}>
                  Risk: {story.riskLevel}
                </Badge>
                <Badge className={getComplexityColor(story.complexity)}>
                  {story.complexity}
                </Badge>
                <Badge variant="outline">{story.storyPoints} SP</Badge>
                {story.sprintAssignment && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Sprint {story.sprintAssignment}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">{story.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-1">Acceptance Criteria</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {story.acceptanceCriteria?.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
              
              {story.dependencies.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Dependencies</h5>
                  <div className="flex flex-wrap gap-1">
                    {story.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Business Value: {story.businessValue}/10
              </span>
            </div>

            {renderSubTasks(story.subTasks)}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderDevelopmentTasks = (tasks: EnhancedDevelopmentTask[]) => (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-600" />
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(task.priority || 'Medium')}>
                  {task.priority || 'Medium'}
                </Badge>
                <Badge className={getRiskColor(task.technicalRisk)}>
                  Tech Risk: {task.technicalRisk}
                </Badge>
                <Badge className={getComplexityColor(task.complexity)}>
                  {task.complexity}
                </Badge>
                <Badge variant="outline">{task.storyPoints} SP</Badge>
                {task.sprintAssignment && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Sprint {task.sprintAssignment}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">{task.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {task.components && task.components.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Components</h5>
                  <div className="flex flex-wrap gap-1">
                    {task.components.map((component, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {task.dependencies.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Dependencies</h5>
                  <div className="flex flex-wrap gap-1">
                    {task.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-900 mb-1">Acceptance Criteria</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {task.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {renderSubTasks(task.subTasks)}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderDesignTasks = (tasks: EnhancedDesignTask[]) => (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600" />
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(task.priority || 'Medium')}>
                  {task.priority || 'Medium'}
                </Badge>
                <Badge className={getComplexityColor(task.designComplexity)}>
                  {task.designComplexity}
                </Badge>
                {task.userResearchRequired && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    Research Required
                  </Badge>
                )}
                <Badge variant="outline">{task.storyPoints} SP</Badge>
                {task.sprintAssignment && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Sprint {task.sprintAssignment}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-3">{task.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {task.deliverables && task.deliverables.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Deliverables</h5>
                  <div className="flex flex-wrap gap-1">
                    {task.deliverables.map((deliverable, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {task.dependencies.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">Dependencies</h5>
                  <div className="flex flex-wrap gap-1">
                    {task.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderSubTasks(task.subTasks)}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderSprintPlans = (sprints: SprintPlan[]) => (
    <div className="space-y-6">
      {sprints.map((sprint) => (
        <Card key={sprint.sprintNumber} className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                {sprint.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  {sprint.totalStoryPoints}/{sprint.capacity} SP
                </Badge>
                <Progress 
                  value={(sprint.totalStoryPoints / sprint.capacity) * 100} 
                  className="w-20"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              <strong>Goal:</strong> {sprint.goal}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <h5 className="font-semibold text-sm text-gray-900 mb-2">Sprint Items</h5>
                <div className="space-y-2">
                  {sprint.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {item.type === 'story' && <Users className="h-4 w-4 text-green-600" />}
                        {item.type === 'task' && <Code className="h-4 w-4 text-blue-600" />}
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={getPriorityColor(item.priority)} variant="outline">
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.storyPoints} SP</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {sprint.risks.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-sm text-gray-900 mb-2">Sprint Risks</h5>
                    <div className="space-y-1">
                      {sprint.risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-orange-800">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sprint.dependencies.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-sm text-gray-900 mb-2">Dependencies</h5>
                    <div className="space-y-1">
                      {sprint.dependencies.map((dep, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <GitBranch className="h-3 w-3" />
                          {dep}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderBacklogSummary = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-green-600" />
          Backlog Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.backlogSummary.totalItems}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.backlogSummary.totalStoryPoints}</div>
            <div className="text-sm text-gray-600">Story Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.backlogSummary.estimatedDuration}</div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{data.backlogSummary.readinessScore}%</div>
            <div className="text-sm text-gray-600">Readiness</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge className={getRiskColor(data.backlogSummary.riskAssessment)} variant="outline">
            Overall Risk: {data.backlogSummary.riskAssessment}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {renderBacklogSummary()}
      {renderEpicOverview(data.epic)}
      
      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Stories ({data.userStories.length})
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Dev Tasks ({data.developmentTasks.length})
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design Tasks ({data.designTasks.length})
          </TabsTrigger>
          <TabsTrigger value="sprints" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sprint Plans ({data.sprintPlans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-6">
          {renderUserStories(data.userStories)}
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          {renderDevelopmentTasks(data.developmentTasks)}
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          {renderDesignTasks(data.designTasks)}
        </TabsContent>

        <TabsContent value="sprints" className="mt-6">
          {renderSprintPlans(data.sprintPlans)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
