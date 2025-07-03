/**
 * Backlog Structure Service
 * Creates realistic Epic structures, proper story hierarchies, and sprint-ready backlog organization
 */

import { UserStory, DevelopmentTask, DesignTask, Epic } from './content-parser'
import { ContentIntelligence } from './content-intelligence'

export interface SubTask {
  id: string
  title: string
  description: string
  type: 'development' | 'design' | 'testing' | 'documentation'
  estimatedHours: number
  assignee?: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'To Do' | 'In Progress' | 'Done'
  dependencies: string[]
  acceptanceCriteria: string[]
  skillsRequired: string[]
}

export interface EnhancedUserStory extends UserStory {
  parentEpicId: string
  childTasks: string[]
  subTasks: SubTask[]
  dependencies: string[]
  businessValue: number
  riskLevel: 'Low' | 'Medium' | 'High'
  complexity: 'Simple' | 'Medium' | 'Complex'
  sprintAssignment?: number
}

export interface EnhancedDevelopmentTask extends DevelopmentTask {
  parentStoryId?: string
  parentEpicId: string
  subTasks: SubTask[]
  dependencies: string[]
  technicalRisk: 'Low' | 'Medium' | 'High'
  complexity: 'Simple' | 'Medium' | 'Complex'
  sprintAssignment?: number
}

export interface EnhancedDesignTask extends DesignTask {
  parentStoryId?: string
  parentEpicId: string
  subTasks: SubTask[]
  dependencies: string[]
  designComplexity: 'Simple' | 'Medium' | 'Complex'
  userResearchRequired: boolean
  sprintAssignment?: number
}

export interface EnhancedEpic extends Epic {
  childStories: string[]
  childTasks: string[]
  totalStoryPoints: number
  estimatedSprints: number
  businessObjectives: string[]
  successMetrics: string[]
  risks: Array<{
    description: string
    impact: 'Low' | 'Medium' | 'High'
    probability: 'Low' | 'Medium' | 'High'
    mitigation: string
  }>
  milestones: Array<{
    name: string
    description: string
    targetSprint: number
    deliverables: string[]
  }>
}

export interface SprintPlan {
  sprintNumber: number
  name: string
  goal: string
  capacity: number
  items: Array<{
    id: string
    type: 'story' | 'task' | 'subtask'
    title: string
    storyPoints: number
    priority: 'High' | 'Medium' | 'Low'
  }>
  totalStoryPoints: number
  risks: string[]
  dependencies: string[]
}

export interface BacklogStructure {
  epic: EnhancedEpic
  userStories: EnhancedUserStory[]
  developmentTasks: EnhancedDevelopmentTask[]
  designTasks: EnhancedDesignTask[]
  sprintPlans: SprintPlan[]
  backlogSummary: {
    totalItems: number
    totalStoryPoints: number
    estimatedDuration: string
    riskAssessment: 'Low' | 'Medium' | 'High'
    readinessScore: number
  }
}

export class BacklogStructureService {
  private openaiKey: string

  constructor(openaiKey: string) {
    this.openaiKey = openaiKey
  }

  /**
   * Create comprehensive backlog structure from SDLC content and intelligence
   */
  async createBacklogStructure(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    intelligence: ContentIntelligence,
    businessAnalysis: string,
    technicalSpec: string,
    uxSpec: string
  ): Promise<BacklogStructure> {
    console.log('🎯 Creating comprehensive backlog structure...')

    const [
      enhancedEpic,
      enhancedStories,
      enhancedDevTasks,
      enhancedDesignTasks,
      sprintPlans
    ] = await Promise.all([
      this.enhanceEpic(epic, userStories, developmentTasks, designTasks, businessAnalysis),
      this.enhanceUserStories(userStories, epic, intelligence, businessAnalysis),
      this.enhanceDevelopmentTasks(developmentTasks, epic, intelligence, technicalSpec),
      this.enhanceDesignTasks(designTasks, epic, intelligence, uxSpec),
      this.createSprintPlans(userStories, developmentTasks, designTasks, intelligence)
    ])

    const backlogSummary = this.calculateBacklogSummary(
      enhancedEpic,
      enhancedStories,
      enhancedDevTasks,
      enhancedDesignTasks,
      sprintPlans
    )

    return {
      epic: enhancedEpic,
      userStories: enhancedStories,
      developmentTasks: enhancedDevTasks,
      designTasks: enhancedDesignTasks,
      sprintPlans,
      backlogSummary
    }
  }

  /**
   * Task 4.1: Create realistic Epic structure
   */
  private async enhanceEpic(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    businessAnalysis: string
  ): Promise<EnhancedEpic> {
    const totalStoryPoints = [
      ...userStories,
      ...developmentTasks,
      ...designTasks
    ].reduce((sum, item) => sum + (item.storyPoints || 0), 0)

    const prompt = `
Enhance this Epic with realistic structure, business objectives, success metrics, and risk assessment.

Epic Details:
Title: ${epic.title}
Description: ${epic.description}
Business Value: ${epic.businessValue}

Context:
${businessAnalysis.slice(0, 1000)}...

User Stories: ${userStories.length}
Development Tasks: ${developmentTasks.length}
Design Tasks: ${designTasks.length}
Total Story Points: ${totalStoryPoints}

Create a comprehensive Epic structure with:
1. Clear business objectives (3-5 specific goals)
2. Measurable success metrics
3. Risk assessment with mitigation strategies
4. Key milestones with target sprints
5. Estimated sprint duration

Return JSON format:
{
  "businessObjectives": [
    "Specific business goal 1",
    "Specific business goal 2"
  ],
  "successMetrics": [
    "Measurable metric 1",
    "Measurable metric 2"
  ],
  "risks": [
    {
      "description": "Risk description",
      "impact": "High|Medium|Low",
      "probability": "High|Medium|Low",
      "mitigation": "Mitigation strategy"
    }
  ],
  "milestones": [
    {
      "name": "Milestone name",
      "description": "Milestone description",
      "targetSprint": 2,
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ],
  "estimatedSprints": 4
}
`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert product manager who creates comprehensive Epic structures for agile development.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn('No JSON found in Epic enhancement response')
        return this.createDefaultEnhancedEpic(epic, userStories, developmentTasks, designTasks, totalStoryPoints)
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        ...epic,
        childStories: userStories.map(s => s.id),
        childTasks: [...developmentTasks.map(t => t.id), ...designTasks.map(t => t.id)],
        totalStoryPoints,
        estimatedSprints: parsed.estimatedSprints || Math.ceil(totalStoryPoints / 20),
        businessObjectives: parsed.businessObjectives || [],
        successMetrics: parsed.successMetrics || [],
        risks: parsed.risks || [],
        milestones: parsed.milestones || []
      }

    } catch (error) {
      console.error('Error enhancing Epic:', error)
      return this.createDefaultEnhancedEpic(epic, userStories, developmentTasks, designTasks, totalStoryPoints)
    }
  }

  private createDefaultEnhancedEpic(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    totalStoryPoints: number
  ): EnhancedEpic {
    return {
      ...epic,
      childStories: userStories.map(s => s.id),
      childTasks: [...developmentTasks.map(t => t.id), ...designTasks.map(t => t.id)],
      totalStoryPoints,
      estimatedSprints: Math.ceil(totalStoryPoints / 20),
      businessObjectives: ['Deliver core functionality', 'Improve user experience'],
      successMetrics: ['User adoption rate', 'Performance metrics'],
      risks: [{
        description: 'Technical complexity',
        impact: 'Medium' as const,
        probability: 'Medium' as const,
        mitigation: 'Regular technical reviews'
      }],
      milestones: [{
        name: 'MVP Release',
        description: 'Minimum viable product',
        targetSprint: Math.ceil(totalStoryPoints / 40),
        deliverables: ['Core features', 'Basic UI']
      }]
    }
  }

  /**
   * Task 4.2: Generate proper Story hierarchy
   */
  private async enhanceUserStories(
    userStories: UserStory[],
    epic: Epic,
    intelligence: ContentIntelligence,
    businessAnalysis: string
  ): Promise<EnhancedUserStory[]> {
    const enhancedStories: EnhancedUserStory[] = []

    for (const story of userStories) {
      const businessValue = intelligence.businessValues.get(story.id)
      const dependencies = intelligence.dependencies
        .filter(dep => dep.fromId === story.id || dep.toId === story.id)
        .map(dep => dep.fromId === story.id ? dep.toId : dep.fromId)

      const subTasks = await this.generateSubTasks(story, 'story', businessAnalysis)

      const enhancedStory: EnhancedUserStory = {
        ...story,
        parentEpicId: epic.id,
        childTasks: [], // Will be populated if tasks are linked to stories
        subTasks,
        dependencies,
        businessValue: businessValue?.score || 5,
        riskLevel: this.calculateRiskLevel(story.storyPoints || 0),
        complexity: this.calculateComplexity(story.storyPoints || 0),
        sprintAssignment: intelligence.sprintRecommendations
          .find(sprint => sprint.items.includes(story.id))?.sprintNumber
      }

      enhancedStories.push(enhancedStory)
    }

    return enhancedStories
  }

  /**
   * Task 4.3: Create granular Task breakdown
   */
  private async enhanceDevelopmentTasks(
    developmentTasks: DevelopmentTask[],
    epic: Epic,
    intelligence: ContentIntelligence,
    technicalSpec: string
  ): Promise<EnhancedDevelopmentTask[]> {
    const enhancedTasks: EnhancedDevelopmentTask[] = []

    for (const task of developmentTasks) {
      const dependencies = intelligence.dependencies
        .filter(dep => dep.fromId === task.id || dep.toId === task.id)
        .map(dep => dep.fromId === task.id ? dep.toId : dep.fromId)

      const subTasks = await this.generateSubTasks(task, 'development', technicalSpec)

      const enhancedTask: EnhancedDevelopmentTask = {
        ...task,
        parentEpicId: epic.id,
        subTasks,
        dependencies,
        technicalRisk: this.calculateTechnicalRisk(task.storyPoints || 0, task.components?.length || 0),
        complexity: this.calculateComplexity(task.storyPoints || 0),
        sprintAssignment: intelligence.sprintRecommendations
          .find(sprint => sprint.items.includes(task.id))?.sprintNumber
      }

      enhancedTasks.push(enhancedTask)
    }

    return enhancedTasks
  }

  private async enhanceDesignTasks(
    designTasks: DesignTask[],
    epic: Epic,
    intelligence: ContentIntelligence,
    uxSpec: string
  ): Promise<EnhancedDesignTask[]> {
    const enhancedTasks: EnhancedDesignTask[] = []

    for (const task of designTasks) {
      const dependencies = intelligence.dependencies
        .filter(dep => dep.fromId === task.id || dep.toId === task.id)
        .map(dep => dep.fromId === task.id ? dep.toId : dep.fromId)

      const subTasks = await this.generateSubTasks(task, 'design', uxSpec)

      const enhancedTask: EnhancedDesignTask = {
        ...task,
        parentEpicId: epic.id,
        subTasks,
        dependencies,
        designComplexity: this.calculateComplexity(task.storyPoints || 0),
        userResearchRequired: task.deliverables?.some(d => 
          d.toLowerCase().includes('research') || 
          d.toLowerCase().includes('user') ||
          d.toLowerCase().includes('persona')
        ) || false,
        sprintAssignment: intelligence.sprintRecommendations
          .find(sprint => sprint.items.includes(task.id))?.sprintNumber
      }

      enhancedTasks.push(enhancedTask)
    }

    return enhancedTasks
  }

  /**
   * Task 4.4: Add Sub-task creation for complex items
   */
  private async generateSubTasks(
    item: UserStory | DevelopmentTask | DesignTask,
    type: 'story' | 'development' | 'design',
    context: string
  ): Promise<SubTask[]> {
    // Only generate subtasks for complex items (5+ story points)
    if ((item.storyPoints || 0) < 5) {
      return []
    }

    const prompt = `
Break down this ${type} item into 3-6 specific subtasks.

Item Details:
Title: ${item.title}
Description: ${item.description}
Story Points: ${item.storyPoints}

Context: ${context.slice(0, 500)}...

Create actionable subtasks that:
1. Are specific and measurable
2. Can be completed in 1-8 hours each
3. Have clear acceptance criteria
4. Include required skills

Return JSON array:
[
  {
    "title": "Specific subtask title",
    "description": "Detailed description",
    "type": "development|design|testing|documentation",
    "estimatedHours": 4,
    "priority": "High|Medium|Low",
    "acceptanceCriteria": ["Criteria 1", "Criteria 2"],
    "skillsRequired": ["Skill 1", "Skill 2"]
  }
]
`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert ${type === 'development' ? 'software architect' : type === 'design' ? 'UX designer' : 'product manager'} who breaks down work into actionable subtasks.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
      })

      if (!response.ok) {
        return []
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      if (!content) {
        return []
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return []
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      return parsed.map((subtask: any, index: number) => ({
        id: `${item.id}-subtask-${index + 1}`,
        title: subtask.title || `Subtask ${index + 1}`,
        description: subtask.description || '',
        type: subtask.type || type,
        estimatedHours: subtask.estimatedHours || 4,
        priority: subtask.priority || 'Medium',
        status: 'To Do' as const,
        dependencies: [],
        acceptanceCriteria: subtask.acceptanceCriteria || [],
        skillsRequired: subtask.skillsRequired || []
      }))

    } catch (error) {
      console.error(`Error generating subtasks for ${item.id}:`, error)
      return []
    }
  }

  /**
   * Task 4.5: Implement sprint-ready backlog organization
   */
  private async createSprintPlans(
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    intelligence: ContentIntelligence
  ): Promise<SprintPlan[]> {
    const sprintPlans: SprintPlan[] = []
    const sprintCapacity = 20 // Standard sprint capacity

    for (const sprintRec of intelligence.sprintRecommendations) {
      const sprintItems = sprintRec.items.map(itemId => {
        const allItems = [...userStories, ...developmentTasks, ...designTasks]
        const item = allItems.find(i => i.id === itemId)
        if (!item) return null

        return {
          id: item.id,
          type: userStories.includes(item as UserStory) ? 'story' as const :
                developmentTasks.includes(item as DevelopmentTask) ? 'task' as const : 'task' as const,
          title: item.title,
          storyPoints: item.storyPoints || 0,
          priority: item.priority || 'Medium' as const
        }
      }).filter(Boolean) as Array<{
        id: string
        type: 'story' | 'task' | 'subtask'
        title: string
        storyPoints: number
        priority: 'High' | 'Medium' | 'Low'
      }>

      const sprintPlan: SprintPlan = {
        sprintNumber: sprintRec.sprintNumber,
        name: `Sprint ${sprintRec.sprintNumber}`,
        goal: sprintRec.reasoning.split('.')[0] || `Complete sprint ${sprintRec.sprintNumber} objectives`,
        capacity: sprintCapacity,
        items: sprintItems,
        totalStoryPoints: sprintRec.totalStoryPoints,
        risks: this.identifySprintRisks(sprintItems, intelligence),
        dependencies: this.identifySprintDependencies(sprintItems, intelligence)
      }

      sprintPlans.push(sprintPlan)
    }

    return sprintPlans
  }

  private identifySprintRisks(
    sprintItems: Array<{ id: string; type: string; title: string; storyPoints: number; priority: string }>,
    intelligence: ContentIntelligence
  ): string[] {
    const risks: string[] = []

    // Check for high story point items
    const highComplexityItems = sprintItems.filter(item => item.storyPoints >= 8)
    if (highComplexityItems.length > 0) {
      risks.push(`High complexity items: ${highComplexityItems.map(i => i.title).join(', ')}`)
    }

    // Check for dependency risks
    const itemIds = sprintItems.map(item => item.id)
    const externalDependencies = intelligence.dependencies.filter(dep => 
      itemIds.includes(dep.fromId) && !itemIds.includes(dep.toId)
    )
    if (externalDependencies.length > 0) {
      risks.push(`External dependencies on items outside this sprint`)
    }

    return risks
  }

  private identifySprintDependencies(
    sprintItems: Array<{ id: string; type: string; title: string; storyPoints: number; priority: string }>,
    intelligence: ContentIntelligence
  ): string[] {
    const itemIds = sprintItems.map(item => item.id)
    return intelligence.dependencies
      .filter(dep => itemIds.includes(dep.fromId) || itemIds.includes(dep.toId))
      .map(dep => `${dep.fromId} ${dep.type} ${dep.toId}`)
  }

  private calculateBacklogSummary(
    epic: EnhancedEpic,
    stories: EnhancedUserStory[],
    devTasks: EnhancedDevelopmentTask[],
    designTasks: EnhancedDesignTask[],
    sprints: SprintPlan[]
  ) {
    const totalItems = stories.length + devTasks.length + designTasks.length
    const totalStoryPoints = epic.totalStoryPoints
    const estimatedWeeks = sprints.length * 2 // 2 weeks per sprint
    
    // Calculate risk assessment
    const highRiskItems = [
      ...stories.filter(s => s.riskLevel === 'High'),
      ...devTasks.filter(t => t.technicalRisk === 'High'),
      ...designTasks.filter(t => t.designComplexity === 'Complex')
    ].length

    const riskAssessment = highRiskItems > totalItems * 0.3 ? 'High' :
                          highRiskItems > totalItems * 0.1 ? 'Medium' : 'Low'

    // Calculate readiness score (0-100)
    let readinessScore = 100
    readinessScore -= (epic.risks.filter(r => r.impact === 'High').length * 10)
    readinessScore -= (highRiskItems * 5)
    readinessScore = Math.max(0, Math.min(100, readinessScore))

    return {
      totalItems,
      totalStoryPoints,
      estimatedDuration: `${estimatedWeeks} weeks (${sprints.length} sprints)`,
      riskAssessment: riskAssessment as 'Low' | 'Medium' | 'High',
      readinessScore
    }
  }

  private calculateRiskLevel(storyPoints: number): 'Low' | 'Medium' | 'High' {
    if (storyPoints >= 8) return 'High'
    if (storyPoints >= 5) return 'Medium'
    return 'Low'
  }

  private calculateTechnicalRisk(storyPoints: number, componentCount: number): 'Low' | 'Medium' | 'High' {
    const riskScore = storyPoints + (componentCount * 2)
    if (riskScore >= 12) return 'High'
    if (riskScore >= 8) return 'Medium'
    return 'Low'
  }

  private calculateComplexity(storyPoints: number): 'Simple' | 'Medium' | 'Complex' {
    if (storyPoints >= 8) return 'Complex'
    if (storyPoints >= 5) return 'Medium'
    return 'Simple'
  }
}
