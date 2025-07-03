/**
 * Jira API Service for SDLC Integration
 * Handles creation of Epics, User Stories, and Tasks in Jira
 */

import { UserStory, DevelopmentTask, DesignTask, Epic } from './content-parser'

export interface JiraConfig {
  url: string
  email: string
  apiToken: string
  projectKey: string
  defaultIssueType: string
  autoCreate: boolean
  createEpics: boolean
  linkIssues: boolean
}

export interface JiraIssue {
  id: string
  key: string
  url: string
  issueType: string
  summary: string
  description: string
  status: string
  assignee?: string
  priority: string
  storyPoints?: number
  components: string[]
  labels: string[]
}

export interface JiraEpic extends JiraIssue {
  issueType: 'Epic'
  epicName: string
}

export interface CreateIssueRequest {
  summary: string
  description: string
  issueType: string
  priority: string
  storyPoints?: number
  components?: string[]
  labels?: string[]
  epicLink?: string
  acceptanceCriteria?: string[]
}

export class JiraService {
  private config: JiraConfig
  private baseUrl: string
  private authHeader: string

  constructor(config: JiraConfig) {
    this.config = config
    this.baseUrl = `${config.url}/rest/api/3`
    this.authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/myself`, {
        headers: {
          'Authorization': this.authHeader,
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          message: `Connected successfully as ${user.displayName} (${user.emailAddress})`
        }
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get project information
   */
  async getProject(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/project/${this.config.projectKey}`, {
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get project: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get available issue types for the project
   */
  async getIssueTypes(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/issuetype`, {
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get issue types: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a Jira Epic
   */
  async createEpic(epic: Epic, projectId: string): Promise<JiraEpic> {
    const issueData = {
      fields: {
        project: {
          key: this.config.projectKey
        },
        summary: epic.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: epic.description
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `Business Value: ${epic.businessValue}`,
                  marks: [{ type: 'strong' }]
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Epic'
        },
        priority: {
          name: epic.priority
        },
        labels: ['sdlc-generated', 'epic', projectId],
        customfield_10011: epic.title // Epic Name field (may vary by Jira instance)
      }
    }

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create epic: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    
    return {
      id: result.id,
      key: result.key,
      url: `${this.config.url}/browse/${result.key}`,
      issueType: 'Epic',
      summary: epic.title,
      description: epic.description,
      status: 'To Do',
      priority: epic.priority,
      storyPoints: undefined,
      components: [],
      labels: ['sdlc-generated', 'epic', projectId],
      epicName: epic.title
    }
  }

  /**
   * Create a User Story in Jira
   */
  async createUserStory(story: UserStory, epicKey?: string, projectId?: string): Promise<JiraIssue> {
    const acceptanceCriteriaText = story.acceptanceCriteria.length > 0 
      ? `\n\nAcceptance Criteria:\n${story.acceptanceCriteria.map(ac => `• ${ac}`).join('\n')}`
      : ''

    const definitionOfDoneText = story.definitionOfDone.length > 0
      ? `\n\nDefinition of Done:\n${story.definitionOfDone.map(dod => `• ${dod}`).join('\n')}`
      : ''

    const issueData = {
      fields: {
        project: {
          key: this.config.projectKey
        },
        summary: story.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: story.description + acceptanceCriteriaText + definitionOfDoneText
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Story'
        },
        priority: {
          name: story.priority
        },
        labels: ['sdlc-generated', 'user-story', ...(projectId ? [projectId] : [])],
        ...(story.storyPoints && {
          customfield_10016: story.storyPoints // Story Points field (may vary by Jira instance)
        }),
        ...(epicKey && {
          customfield_10014: epicKey // Epic Link field (may vary by Jira instance)
        })
      }
    }

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create user story: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    
    return {
      id: result.id,
      key: result.key,
      url: `${this.config.url}/browse/${result.key}`,
      issueType: 'Story',
      summary: story.title,
      description: story.description,
      status: 'To Do',
      priority: story.priority,
      storyPoints: story.storyPoints,
      components: [],
      labels: ['sdlc-generated', 'user-story', ...(projectId ? [projectId] : [])]
    }
  }

  /**
   * Create a Development Task in Jira
   */
  async createDevelopmentTask(task: DevelopmentTask, epicKey?: string, projectId?: string): Promise<JiraIssue> {
    const acceptanceCriteriaText = task.acceptanceCriteria.length > 0 
      ? `\n\nAcceptance Criteria:\n${task.acceptanceCriteria.map(ac => `• ${ac}`).join('\n')}`
      : ''

    const definitionOfDoneText = task.definitionOfDone.length > 0
      ? `\n\nDefinition of Done:\n${task.definitionOfDone.map(dod => `• ${dod}`).join('\n')}`
      : ''

    const componentsText = task.components.length > 0
      ? `\n\nComponents: ${task.components.join(', ')}`
      : ''

    const issueData = {
      fields: {
        project: {
          key: this.config.projectKey
        },
        summary: task.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: task.description + componentsText + acceptanceCriteriaText + definitionOfDoneText
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Task'
        },
        priority: {
          name: 'Medium' // Default priority for dev tasks
        },
        labels: ['sdlc-generated', 'dev-task', task.category.toLowerCase(), ...(projectId ? [projectId] : [])],
        ...(task.storyPoints && {
          customfield_10016: task.storyPoints // Story Points field (may vary by Jira instance)
        }),
        ...(epicKey && {
          customfield_10014: epicKey // Epic Link field (may vary by Jira instance)
        })
      }
    }

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create development task: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    
    return {
      id: result.id,
      key: result.key,
      url: `${this.config.url}/browse/${result.key}`,
      issueType: 'Task',
      summary: task.title,
      description: task.description,
      status: 'To Do',
      priority: 'Medium',
      storyPoints: task.storyPoints,
      components: task.components,
      labels: ['sdlc-generated', 'dev-task', task.category.toLowerCase(), ...(projectId ? [projectId] : [])]
    }
  }

  /**
   * Create a Design Task in Jira
   */
  async createDesignTask(task: DesignTask, epicKey?: string, projectId?: string): Promise<JiraIssue> {
    const deliverablesText = task.deliverables.length > 0 
      ? `\n\nDeliverables:\n${task.deliverables.map(d => `• ${d}`).join('\n')}`
      : ''

    const definitionOfDoneText = task.definitionOfDone.length > 0
      ? `\n\nDefinition of Done:\n${task.definitionOfDone.map(dod => `• ${dod}`).join('\n')}`
      : ''

    const userImpactText = task.userImpact
      ? `\n\nUser Impact: ${task.userImpact}`
      : ''

    const issueData = {
      fields: {
        project: {
          key: this.config.projectKey
        },
        summary: task.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: task.description + userImpactText + deliverablesText + definitionOfDoneText
                }
              ]
            }
          ]
        },
        issuetype: {
          name: 'Task'
        },
        priority: {
          name: 'Medium' // Default priority for design tasks
        },
        labels: ['sdlc-generated', 'design-task', task.category.toLowerCase().replace(' ', '-'), ...(projectId ? [projectId] : [])],
        ...(task.storyPoints && {
          customfield_10016: task.storyPoints // Story Points field (may vary by Jira instance)
        }),
        ...(epicKey && {
          customfield_10014: epicKey // Epic Link field (may vary by Jira instance)
        })
      }
    }

    const response = await fetch(`${this.baseUrl}/issue`, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create design task: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    
    return {
      id: result.id,
      key: result.key,
      url: `${this.config.url}/browse/${result.key}`,
      issueType: 'Task',
      summary: task.title,
      description: task.description,
      status: 'To Do',
      priority: 'Medium',
      storyPoints: task.storyPoints,
      components: [],
      labels: ['sdlc-generated', 'design-task', task.category.toLowerCase().replace(' ', '-'), ...(projectId ? [projectId] : [])]
    }
  }

  /**
   * Create all SDLC issues in Jira (Epic + Stories + Tasks)
   */
  async createSDLCIssues(
    epic: Epic,
    userStories: UserStory[],
    developmentTasks: DevelopmentTask[],
    designTasks: DesignTask[],
    projectId: string
  ): Promise<{
    epic: JiraEpic
    userStories: JiraIssue[]
    developmentTasks: JiraIssue[]
    designTasks: JiraIssue[]
    summary: {
      totalIssues: number
      epicKey: string
      userStoriesCount: number
      developmentTasksCount: number
      designTasksCount: number
    }
  }> {
    try {
      // 1. Create Epic
      const createdEpic = await this.createEpic(epic, projectId)
      
      // 2. Create User Stories linked to Epic
      const createdUserStories: JiraIssue[] = []
      for (const story of userStories) {
        const createdStory = await this.createUserStory(story, createdEpic.key, projectId)
        createdUserStories.push(createdStory)
      }
      
      // 3. Create Development Tasks linked to Epic
      const createdDevelopmentTasks: JiraIssue[] = []
      for (const task of developmentTasks) {
        const createdTask = await this.createDevelopmentTask(task, createdEpic.key, projectId)
        createdDevelopmentTasks.push(createdTask)
      }
      
      // 4. Create Design Tasks linked to Epic
      const createdDesignTasks: JiraIssue[] = []
      for (const task of designTasks) {
        const createdTask = await this.createDesignTask(task, createdEpic.key, projectId)
        createdDesignTasks.push(createdTask)
      }

      return {
        epic: createdEpic,
        userStories: createdUserStories,
        developmentTasks: createdDevelopmentTasks,
        designTasks: createdDesignTasks,
        summary: {
          totalIssues: 1 + createdUserStories.length + createdDevelopmentTasks.length + createdDesignTasks.length,
          epicKey: createdEpic.key,
          userStoriesCount: createdUserStories.length,
          developmentTasksCount: createdDevelopmentTasks.length,
          designTasksCount: createdDesignTasks.length
        }
      }
    } catch (error) {
      throw new Error(`Failed to create SDLC issues in Jira: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
