/**
 * Content Intelligence Service
 * Advanced AI-powered analysis of SDLC content for dependency detection,
 * priority assignment, and intelligent task breakdown
 */

import { UserStory, DevelopmentTask, DesignTask, Epic } from './content-parser'

export interface DependencyRelation {
  fromId: string
  toId: string
  type: 'blocks' | 'depends_on' | 'related_to' | 'enables'
  strength: 'strong' | 'medium' | 'weak'
  description: string
}

export interface BusinessValueScore {
  score: number // 1-10
  factors: {
    userImpact: number
    businessCriticality: number
    technicalComplexity: number
    riskLevel: number
  }
  reasoning: string
}

export interface TaskBreakdown {
  originalTask: DevelopmentTask | DesignTask
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

export interface ContentIntelligence {
  dependencies: DependencyRelation[]
  businessValues: Map<string, BusinessValueScore>
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

export class ContentIntelligenceService {
  private openaiKey: string

  constructor(openaiKey: string) {
    this.openaiKey = openaiKey
  }

  /**
   * Analyze all SDLC content and generate intelligence insights
   */
  async analyzeContent(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    businessAnalysis: string,
    technicalSpec: string,
    uxSpec: string
  ): Promise<ContentIntelligence> {
    console.log('🧠 Starting content intelligence analysis...')

    const [
      dependencies,
      businessValues,
      taskBreakdowns,
      priorityRecommendations,
      sprintRecommendations
    ] = await Promise.all([
      this.detectDependencies(userStories, developmentTasks, designTasks, businessAnalysis, technicalSpec, uxSpec),
      this.analyzeBusinessValue(epic, userStories, developmentTasks, designTasks, businessAnalysis),
      this.generateTaskBreakdowns(developmentTasks, designTasks, technicalSpec, uxSpec),
      this.generatePriorityRecommendations(userStories, developmentTasks, designTasks, businessAnalysis),
      this.generateSprintRecommendations(userStories, developmentTasks, designTasks)
    ])

    return {
      dependencies,
      businessValues,
      taskBreakdowns,
      priorityRecommendations,
      sprintRecommendations
    }
  }

  /**
   * Task 3.4: Dependency detection between stories/tasks
   */
  private async detectDependencies(
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    businessAnalysis: string,
    technicalSpec: string,
    uxSpec: string
  ): Promise<DependencyRelation[]> {
    const allItems = [
      ...userStories.map(s => ({ ...s, type: 'story' })),
      ...developmentTasks.map(t => ({ ...t, type: 'dev' })),
      ...designTasks.map(t => ({ ...t, type: 'design' }))
    ]

    const prompt = `
Analyze the following SDLC items and identify dependencies between them. Look for:
1. Technical dependencies (one task must complete before another can start)
2. Business logic dependencies (user stories that build upon each other)
3. Design dependencies (UI/UX tasks that depend on research or wireframes)
4. Data dependencies (tasks that require shared data structures or APIs)

Items to analyze:
${allItems.map(item => `
ID: ${item.id}
Type: ${item.type}
Title: ${item.title}
Description: ${item.description}
${item.type === 'story' ? `Acceptance Criteria: ${(item as any).acceptanceCriteria?.join(', ') || 'None'}` : ''}
${item.type !== 'story' ? `Components: ${(item as any).components?.join(', ') || 'None'}` : ''}
`).join('\n---\n')}

Context from specifications:
Business Analysis: ${businessAnalysis.slice(0, 1000)}...
Technical Spec: ${technicalSpec.slice(0, 1000)}...
UX Spec: ${uxSpec.slice(0, 1000)}...

Return a JSON array of dependencies in this format:
[
  {
    "fromId": "source_item_id",
    "toId": "dependent_item_id", 
    "type": "blocks|depends_on|related_to|enables",
    "strength": "strong|medium|weak",
    "description": "Clear explanation of why this dependency exists"
  }
]

Focus on realistic, actionable dependencies that would impact sprint planning.
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
              content: 'You are an expert software project manager and technical architect. Analyze SDLC items to identify realistic dependencies for sprint planning.'
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

      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON array found in dependency analysis response')
        return []
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error detecting dependencies:', error)
      return []
    }
  }

  /**
   * Task 3.5: Priority assignment based on business value
   */
  private async analyzeBusinessValue(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    businessAnalysis: string
  ): Promise<Map<string, BusinessValueScore>> {
    const allItems = [
      ...userStories.map(s => ({ ...s, type: 'story' })),
      ...developmentTasks.map(t => ({ ...t, type: 'dev' })),
      ...designTasks.map(t => ({ ...t, type: 'design' }))
    ]

    const businessValues = new Map<string, BusinessValueScore>()

    const prompt = `
Analyze the business value of each SDLC item based on the epic context and business analysis.

Epic Context:
Title: ${epic.title}
Description: ${epic.description}
Business Value: ${epic.businessValue}

Business Analysis Context:
${businessAnalysis.slice(0, 1500)}

Rate each item on a scale of 1-10 for business value, considering:
1. User Impact (how much it affects end users)
2. Business Criticality (how important for business goals)
3. Technical Complexity (implementation difficulty - lower complexity = higher value)
4. Risk Level (potential risks - lower risk = higher value)

Items to analyze:
${allItems.map(item => `
ID: ${item.id}
Type: ${item.type}
Title: ${item.title}
Description: ${item.description}
`).join('\n---\n')}

Return a JSON object with business value scores:
{
  "item_id": {
    "score": 8,
    "factors": {
      "userImpact": 9,
      "businessCriticality": 8,
      "technicalComplexity": 6,
      "riskLevel": 7
    },
    "reasoning": "High user impact and business criticality, moderate complexity"
  }
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
              content: 'You are an expert product manager. Analyze SDLC items for business value to guide prioritization decisions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
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

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn('No JSON object found in business value analysis response')
        return businessValues
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      for (const [itemId, value] of Object.entries(parsed)) {
        businessValues.set(itemId, value as BusinessValueScore)
      }

      return businessValues
    } catch (error) {
      console.error('Error analyzing business value:', error)
      return businessValues
    }
  }

  /**
   * Task 3.2 & 3.3: Technical task breakdown and design task identification
   */
  private async generateTaskBreakdowns(
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    technicalSpec: string,
    uxSpec: string
  ): Promise<TaskBreakdown[]> {
    const breakdowns: TaskBreakdown[] = []

    // Analyze complex tasks that need breakdown
    const complexTasks = [
      ...developmentTasks.filter(t => t.storyPoints >= 5),
      ...designTasks.filter(t => t.storyPoints >= 5)
    ]

    for (const task of complexTasks) {
      const isDevTask = 'components' in task
      const spec = isDevTask ? technicalSpec : uxSpec
      
      const prompt = `
Break down this complex ${isDevTask ? 'development' : 'design'} task into smaller, actionable subtasks.

Task to break down:
Title: ${task.title}
Description: ${task.description}
Story Points: ${task.storyPoints}
${isDevTask ? `Components: ${(task as DevelopmentTask).components.join(', ')}` : `Deliverables: ${(task as DesignTask).deliverables.join(', ')}`}

Context from specification:
${spec.slice(0, 1000)}...

Create 3-6 subtasks that:
1. Are specific and actionable
2. Can be completed by one person
3. Have clear acceptance criteria
4. Include estimated hours (1-16 hours each)
5. Identify required skills/expertise

Return JSON format:
{
  "subtasks": [
    {
      "id": "subtask_id",
      "title": "Specific subtask title",
      "description": "Detailed description with acceptance criteria",
      "estimatedHours": 8,
      "skillsRequired": ["React", "TypeScript"],
      "dependencies": ["other_subtask_id"]
    }
  ],
  "totalEstimatedHours": 32
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
                content: `You are an expert ${isDevTask ? 'software architect' : 'UX designer'} who breaks down complex tasks into manageable subtasks.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1500
          }),
        })

        if (!response.ok) {
          console.error(`OpenAI API error for task ${task.id}: ${response.status}`)
          continue
        }

        const result = await response.json()
        const content = result.choices[0]?.message?.content

        if (!content) {
          console.error(`No content received for task ${task.id}`)
          continue
        }

        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.warn(`No JSON found in breakdown for task ${task.id}`)
          continue
        }

        const parsed = JSON.parse(jsonMatch[0])
        
        breakdowns.push({
          originalTask: task,
          subtasks: parsed.subtasks || [],
          totalEstimatedHours: parsed.totalEstimatedHours || 0
        })

      } catch (error) {
        console.error(`Error breaking down task ${task.id}:`, error)
      }
    }

    return breakdowns
  }

  /**
   * Generate priority recommendations based on business value and dependencies
   */
  private async generatePriorityRecommendations(
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    businessAnalysis: string
  ): Promise<Array<{ itemId: string; recommendedPriority: 'High' | 'Medium' | 'Low'; reasoning: string }>> {
    const allItems = [
      ...userStories,
      ...developmentTasks,
      ...designTasks
    ]

    const recommendations: Array<{ itemId: string; recommendedPriority: 'High' | 'Medium' | 'Low'; reasoning: string }> = []

    const prompt = `
Based on the business analysis and SDLC items, recommend priority levels (High/Medium/Low) for each item.

Business Analysis Context:
${businessAnalysis.slice(0, 1000)}...

Consider these factors for prioritization:
1. Business value and user impact
2. Technical dependencies and blockers
3. Risk mitigation
4. MVP requirements
5. Resource availability

Items to prioritize:
${allItems.map(item => `
ID: ${item.id}
Title: ${item.title}
Description: ${item.description}
Current Priority: ${item.priority || 'Not set'}
Story Points: ${item.storyPoints}
`).join('\n---\n')}

Return JSON array:
[
  {
    "itemId": "item_id",
    "recommendedPriority": "High|Medium|Low",
    "reasoning": "Clear explanation for this priority recommendation"
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
              content: 'You are an expert product manager who prioritizes features based on business value, technical constraints, and strategic goals.'
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

      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON array found in priority recommendations response')
        return recommendations
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error generating priority recommendations:', error)
      return recommendations
    }
  }

  /**
   * Generate sprint recommendations based on story points, dependencies, and priorities
   */
  private async generateSprintRecommendations(
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[]
  ): Promise<Array<{ sprintNumber: number; items: string[]; totalStoryPoints: number; reasoning: string }>> {
    const allItems = [
      ...userStories,
      ...developmentTasks,
      ...designTasks
    ]

    const totalStoryPoints = allItems.reduce((sum, item) => sum + (item.storyPoints || 0), 0)
    const sprintCapacity = 20 // Typical sprint capacity in story points

    const prompt = `
Organize these SDLC items into sprint recommendations. Assume a team capacity of ${sprintCapacity} story points per sprint.

Items to organize:
${allItems.map(item => `
ID: ${item.id}
Title: ${item.title}
Priority: ${item.priority}
Story Points: ${item.storyPoints}
Type: ${userStories.includes(item as UserStory) ? 'User Story' : developmentTasks.includes(item as DevelopmentTask) ? 'Development Task' : 'Design Task'}
`).join('\n---\n')}

Total Story Points: ${totalStoryPoints}
Sprint Capacity: ${sprintCapacity} points

Consider:
1. High priority items first
2. Dependencies between items
3. Balanced sprint composition (mix of stories, dev tasks, design tasks)
4. Logical grouping of related work
5. Risk distribution across sprints

Return JSON array of sprint recommendations:
[
  {
    "sprintNumber": 1,
    "items": ["item_id_1", "item_id_2"],
    "totalStoryPoints": 18,
    "reasoning": "Sprint 1 focuses on foundational user stories and core infrastructure"
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
              content: 'You are an expert Scrum Master who organizes backlog items into well-balanced, logical sprints.'
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

      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.warn('No JSON array found in sprint recommendations response')
        return []
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Error generating sprint recommendations:', error)
      return []
    }
  }
}
