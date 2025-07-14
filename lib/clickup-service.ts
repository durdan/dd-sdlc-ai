// ClickUp Service - Comprehensive API Integration
// Handles authentication, team management, task operations, and project management

interface ClickUpUser {
  id: string;
  username: string;
  email: string;
  color: string;
  profilePicture: string;
}

interface ClickUpTeam {
  id: string;
  name: string;
  color: string;
  avatar: string;
  members: ClickUpUser[];
}

interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: ClickUpStatus[];
  multiple_assignees: boolean;
  features: {
    due_dates: {
      enabled: boolean;
      start_date: boolean;
      remap_due_dates: boolean;
      remap_closed_due_date: boolean;
    };
    time_tracking: {
      enabled: boolean;
    };
    tags: {
      enabled: boolean;
    };
    time_estimates: {
      enabled: boolean;
    };
    checklists: {
      enabled: boolean;
    };
    custom_fields: {
      enabled: boolean;
    };
    remap_dependencies: {
      enabled: boolean;
    };
    dependency_warning: {
      enabled: boolean;
    };
    portfolios: {
      enabled: boolean;
    };
  };
}

interface ClickUpFolder {
  id: string;
  name: string;
  orderindex: number;
  override_statuses: boolean;
  hidden: boolean;
  space: {
    id: string;
    name: string;
    access: boolean;
  };
  task_count: string;
  archived: boolean;
  statuses: ClickUpStatus[];
  lists: ClickUpList[];
}

interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status: string;
  priority: string;
  assignee: ClickUpUser;
  task_count: number;
  due_date: string;
  start_date: string;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
    name: string;
    access: boolean;
  };
  archived: boolean;
  override_statuses: boolean;
  statuses: ClickUpStatus[];
  permission_level: string;
}

interface ClickUpStatus {
  id: string;
  status: string;
  orderindex: number;
  color: string;
  type: string;
}

interface ClickUpTask {
  id: string;
  custom_id: string;
  name: string;
  text_content: string;
  description: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed: string;
  date_done: string;
  archived: boolean;
  creator: ClickUpUser;
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  checklists: ClickUpChecklist[];
  tags: ClickUpTag[];
  parent: string;
  priority: ClickUpPriority;
  due_date: string;
  start_date: string;
  points: number;
  time_estimate: number;
  custom_fields: ClickUpCustomField[];
  dependencies: ClickUpDependency[];
  linked_tasks: ClickUpTask[];
  team_id: string;
  url: string;
  permission_level: string;
  list: {
    id: string;
    name: string;
    access: boolean;
  };
  project: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
  };
}

interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator: number;
}

interface ClickUpChecklist {
  id: string;
  task_id: string;
  name: string;
  date_created: string;
  orderindex: number;
  creator: ClickUpUser;
  resolved: number;
  unresolved: number;
  items: ClickUpChecklistItem[];
}

interface ClickUpChecklistItem {
  id: string;
  name: string;
  orderindex: number;
  assignee: ClickUpUser;
  resolved: boolean;
  date_created: string;
  children: ClickUpChecklistItem[];
}

interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: any;
  date_created: string;
  hide_from_guests: boolean;
  value: any;
  required: boolean;
}

interface ClickUpDependency {
  task_id: string;
  depends_on: string;
  type: number;
  date_created: string;
  userid: string;
}

interface CreateTaskRequest {
  name: string;
  description?: string;
  assignees?: string[];
  tags?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  start_date?: number;
  time_estimate?: number;
  custom_fields?: Array<{
    id: string;
    value: any;
  }>;
  notify_all?: boolean;
  parent?: string;
  links_to?: string;
  check_required_custom_fields?: boolean;
}

interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: string;
  priority?: number;
  due_date?: number;
  start_date?: number;
  time_estimate?: number;
  archived?: boolean;
  add_assignees?: string[];
  remove_assignees?: string[];
  add_tags?: string[];
  remove_tags?: string[];
  custom_fields?: Array<{
    id: string;
    value: any;
  }>;
}

export class ClickUpService {
  private readonly baseUrl = 'https://api.clickup.com/api/v2';
  private readonly apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.apiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ClickUp API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // User Management
  async getCurrentUser(): Promise<ClickUpUser> {
    const response = await this.makeRequest<{ user: ClickUpUser }>('/user');
    return response.user;
  }

  // Team Management
  async getTeams(): Promise<ClickUpTeam[]> {
    const response = await this.makeRequest<{ teams: ClickUpTeam[] }>('/team');
    return response.teams;
  }

  async getTeam(teamId: string): Promise<ClickUpTeam> {
    const response = await this.makeRequest<{ team: ClickUpTeam }>(`/team/${teamId}`);
    return response.team;
  }

  // Space Management
  async getSpaces(teamId: string): Promise<ClickUpSpace[]> {
    const response = await this.makeRequest<{ spaces: ClickUpSpace[] }>(`/team/${teamId}/space`);
    return response.spaces;
  }

  async getSpace(spaceId: string): Promise<ClickUpSpace> {
    const response = await this.makeRequest<ClickUpSpace>(`/space/${spaceId}`);
    return response;
  }

  // Folder Management
  async getFolders(spaceId: string): Promise<ClickUpFolder[]> {
    const response = await this.makeRequest<{ folders: ClickUpFolder[] }>(`/space/${spaceId}/folder`);
    return response.folders;
  }

  async getFolder(folderId: string): Promise<ClickUpFolder> {
    const response = await this.makeRequest<ClickUpFolder>(`/folder/${folderId}`);
    return response;
  }

  // List Management
  async getLists(spaceId: string): Promise<ClickUpList[]> {
    const response = await this.makeRequest<{ lists: ClickUpList[] }>(`/space/${spaceId}/list`);
    return response.lists;
  }

  async getList(listId: string): Promise<ClickUpList> {
    const response = await this.makeRequest<ClickUpList>(`/list/${listId}`);
    return response;
  }

  // Task Management
  async getTasks(listId: string, options: {
    archived?: boolean;
    include_closed?: boolean;
    order_by?: string;
    reverse?: boolean;
    subtasks?: boolean;
    statuses?: string[];
    include_markdown_description?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ClickUpTask[]> {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await this.makeRequest<{ tasks: ClickUpTask[] }>(
      `/list/${listId}/task?${queryParams.toString()}`
    );
    return response.tasks;
  }

  async getTask(taskId: string): Promise<ClickUpTask> {
    const response = await this.makeRequest<ClickUpTask>(`/task/${taskId}`);
    return response;
  }

  async createTask(listId: string, taskData: CreateTaskRequest): Promise<ClickUpTask> {
    const response = await this.makeRequest<ClickUpTask>(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response;
  }

  async updateTask(taskId: string, updateData: UpdateTaskRequest): Promise<ClickUpTask> {
    const response = await this.makeRequest<ClickUpTask>(`/task/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.makeRequest(`/task/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Subtask Management
  async createSubtask(parentTaskId: string, subtaskData: CreateTaskRequest): Promise<ClickUpTask> {
    const response = await this.makeRequest<ClickUpTask>(`/task/${parentTaskId}/subtask`, {
      method: 'POST',
      body: JSON.stringify(subtaskData),
    });
    return response;
  }

  // Comment Management
  async getTaskComments(taskId: string): Promise<any[]> {
    const response = await this.makeRequest<{ comments: any[] }>(`/task/${taskId}/comment`);
    return response.comments;
  }

  async createTaskComment(taskId: string, comment: {
    comment_text: string;
    assignee?: string;
    notify_all?: boolean;
  }): Promise<any> {
    const response = await this.makeRequest<any>(`/task/${taskId}/comment`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
    return response;
  }

  // Checklist Management
  async createChecklist(taskId: string, checklistData: {
    name: string;
  }): Promise<ClickUpChecklist> {
    const response = await this.makeRequest<ClickUpChecklist>(`/task/${taskId}/checklist`, {
      method: 'POST',
      body: JSON.stringify(checklistData),
    });
    return response;
  }

  async addChecklistItem(checklistId: string, itemData: {
    name: string;
    assignee?: string;
  }): Promise<ClickUpChecklistItem> {
    const response = await this.makeRequest<ClickUpChecklistItem>(`/checklist/${checklistId}/checklist_item`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return response;
  }

  // Time Tracking
  async getTimeEntries(taskId: string): Promise<any[]> {
    const response = await this.makeRequest<{ data: any[] }>(`/task/${taskId}/time`);
    return response.data;
  }

  async createTimeEntry(taskId: string, timeData: {
    description: string;
    time: number;
    start: number;
    billable?: boolean;
  }): Promise<any> {
    const response = await this.makeRequest<any>(`/task/${taskId}/time`, {
      method: 'POST',
      body: JSON.stringify(timeData),
    });
    return response;
  }

  // Custom Fields
  async getCustomFields(listId: string): Promise<ClickUpCustomField[]> {
    const response = await this.makeRequest<{ fields: ClickUpCustomField[] }>(`/list/${listId}/field`);
    return response.fields;
  }

  async setCustomFieldValue(taskId: string, fieldId: string, value: any): Promise<void> {
    await this.makeRequest(`/task/${taskId}/field/${fieldId}`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  // Webhooks
  async getWebhooks(teamId: string): Promise<any[]> {
    const response = await this.makeRequest<{ webhooks: any[] }>(`/team/${teamId}/webhook`);
    return response.webhooks;
  }

  async createWebhook(teamId: string, webhookData: {
    endpoint: string;
    events: string[];
    task_id?: string;
    list_id?: string;
    folder_id?: string;
    space_id?: string;
  }): Promise<any> {
    const response = await this.makeRequest<any>(`/team/${teamId}/webhook`, {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
    return response;
  }

  // Utility methods for SDLC integration
  async createSDLCTask(listId: string, sdlcData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignees?: string[];
    tags?: string[];
    dueDate?: Date;
    customFields?: { [key: string]: any };
    subtasks?: Array<{
      name: string;
      description?: string;
      assignees?: string[];
    }>;
  }): Promise<{
    task: ClickUpTask;
    subtasks: ClickUpTask[];
  }> {
    const priorityMap = {
      low: 4,
      medium: 3,
      high: 2,
      urgent: 1,
    };

    const taskData: CreateTaskRequest = {
      name: sdlcData.title,
      description: sdlcData.description,
      priority: priorityMap[sdlcData.priority],
      assignees: sdlcData.assignees,
      tags: sdlcData.tags,
      due_date: sdlcData.dueDate?.getTime(),
      notify_all: true,
    };

    const mainTask = await this.createTask(listId, taskData);
    const subtasks: ClickUpTask[] = [];

    if (sdlcData.subtasks) {
      for (const subtaskData of sdlcData.subtasks) {
        const subtask = await this.createSubtask(mainTask.id, {
          name: subtaskData.name,
          description: subtaskData.description,
          assignees: subtaskData.assignees,
        });
        subtasks.push(subtask);
      }
    }

    return { task: mainTask, subtasks };
  }

  async updateTaskStatus(taskId: string, status: string): Promise<ClickUpTask> {
    return this.updateTask(taskId, { status });
  }

  async assignTaskToUser(taskId: string, userId: string): Promise<ClickUpTask> {
    return this.updateTask(taskId, { add_assignees: [userId] });
  }

  async addTagsToTask(taskId: string, tags: string[]): Promise<ClickUpTask> {
    return this.updateTask(taskId, { add_tags: tags });
  }

  async setTaskDueDate(taskId: string, dueDate: Date): Promise<ClickUpTask> {
    return this.updateTask(taskId, { due_date: dueDate.getTime() });
  }

  async setTaskPriority(taskId: string, priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<ClickUpTask> {
    const priorityMap = {
      low: 4,
      medium: 3,
      high: 2,
      urgent: 1,
    };

    return this.updateTask(taskId, { priority: priorityMap[priority] });
  }

  // Helper method to validate API token
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // SDLC-Specific Project Creation Methods
  // ============================================================================

  async createSDLCProject(
    teamId: string,
    projectTitle: string,
    sdlcDocument: any,
    options: {
      createSpaces?: boolean
      createFolders?: boolean
      createLists?: boolean
      includeCustomFields?: boolean
      assignToUsers?: string[]
      addTags?: string[]
      estimateTimeEnabled?: boolean
    } = {}
  ): Promise<{
    spaces: ClickUpSpace[]
    folders: ClickUpFolder[]
    lists: ClickUpList[]
    tasks: ClickUpTask[]
    statistics: {
      totalSpaces: number
      totalFolders: number
      totalLists: number
      totalTasks: number
      sectionsProcessed: number
    }
  }> {
    const {
      createSpaces = true,
      createFolders = true,
      createLists = true,
      includeCustomFields = true,
      assignToUsers = [],
      addTags = ['sdlc-generated'],
      estimateTimeEnabled = true
    } = options

    const result = {
      spaces: [] as ClickUpSpace[],
      folders: [] as ClickUpFolder[],
      lists: [] as ClickUpList[],
      tasks: [] as ClickUpTask[],
      statistics: {
        totalSpaces: 0,
        totalFolders: 0,
        totalLists: 0,
        totalTasks: 0,
        sectionsProcessed: 0
      }
    }

    try {
      // Create main project space
      if (createSpaces) {
        const mainSpace = await this.createSpace(teamId, {
          name: projectTitle,
          multiple_assignees: true,
          features: {
            due_dates: { enabled: true, start_date: true, remap_due_dates: true, remap_closed_due_date: true },
            time_tracking: { enabled: estimateTimeEnabled },
            tags: { enabled: true },
            time_estimates: { enabled: estimateTimeEnabled },
            checklists: { enabled: true },
            custom_fields: { enabled: includeCustomFields },
            remap_dependencies: { enabled: true },
            dependency_warning: { enabled: true },
            portfolios: { enabled: false }
          }
        })
        result.spaces.push(mainSpace)
        result.statistics.totalSpaces++

        // Create folders for each major SDLC section
        if (createFolders) {
          const folderPromises = []

          // Business Analysis Folder
          if (sdlcDocument.businessAnalysis) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '📊 Business Analysis',
                color: '#3B82F6'
              })
            )
          }

          // Functional Specification Folder
          if (sdlcDocument.functionalSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '⚙️ Functional Specification',
                color: '#10B981'
              })
            )
          }

          // Technical Architecture Folder
          if (sdlcDocument.technicalSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '🏗️ Technical Architecture',
                color: '#8B5CF6'
              })
            )
          }

          // UX Design Folder
          if (sdlcDocument.uxSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '🎨 UX Design',
                color: '#EC4899'
              })
            )
          }

          // Data Architecture Folder
          if (sdlcDocument.dataSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '🗄️ Data Architecture',
                color: '#F59E0B'
              })
            )
          }

          // Service Design Folder
          if (sdlcDocument.serviceSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '🔧 Service Design',
                color: '#EF4444'
              })
            )
          }

          // Deployment Folder
          if (sdlcDocument.deploymentSpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '🚀 Deployment',
                color: '#6B7280'
              })
            )
          }

          // Observability Folder
          if (sdlcDocument.observabilitySpec) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '📈 Observability',
                color: '#FBBF24'
              })
            )
          }

          // Implementation Folder
          if (sdlcDocument.implementationGuide) {
            folderPromises.push(
              this.createFolder(mainSpace.id, {
                name: '⚡ Implementation',
                color: '#06B6D4'
              })
            )
          }

          const folders = await Promise.all(folderPromises)
          result.folders.push(...folders)
          result.statistics.totalFolders = folders.length

          // Create lists and tasks for each folder
          if (createLists) {
            for (const folder of folders) {
              const sectionName = folder.name.replace(/^[^\s]*\s/, '') // Remove emoji
              const sectionData = this.getSectionData(sdlcDocument, sectionName)

              if (sectionData) {
                // Create lists for different phases within each section
                const phasePromises = []

                phasePromises.push(
                  this.createList(folder.id, {
                    name: `📋 ${sectionName} - Planning`,
                    content: `Planning phase for ${sectionName}`,
                    due_date: this.getPhaseDate(1),
                    priority: 2,
                    assignee: assignToUsers[0] || undefined,
                    status: 'active'
                  })
                )

                phasePromises.push(
                  this.createList(folder.id, {
                    name: `🔄 ${sectionName} - In Progress`,
                    content: `Active work for ${sectionName}`,
                    due_date: this.getPhaseDate(2),
                    priority: 1,
                    assignee: assignToUsers[0] || undefined,
                    status: 'active'
                  })
                )

                phasePromises.push(
                  this.createList(folder.id, {
                    name: `✅ ${sectionName} - Review`,
                    content: `Review and validation for ${sectionName}`,
                    due_date: this.getPhaseDate(3),
                    priority: 3,
                    assignee: assignToUsers[0] || undefined,
                    status: 'active'
                  })
                )

                phasePromises.push(
                  this.createList(folder.id, {
                    name: `🎯 ${sectionName} - Completed`,
                    content: `Completed items for ${sectionName}`,
                    assignee: assignToUsers[0] || undefined,
                    status: 'active'
                  })
                )

                const lists = await Promise.all(phasePromises)
                result.lists.push(...lists)
                result.statistics.totalLists += lists.length

                // Create tasks for each subsection
                const taskPromises = []

                for (const [key, content] of Object.entries(sectionData)) {
                  if (typeof content === 'string' && content.trim().length > 0) {
                    const taskTitle = `${sectionName}: ${this.formatSubsectionTitle(key)}`
                    const planningList = lists.find(l => l.name.includes('Planning'))

                    if (planningList) {
                      taskPromises.push(
                        this.createSDLCTask(planningList.id, {
                          title: taskTitle,
                          description: this.generateTaskDescription(key, content, sectionName),
                          priority: this.calculateTaskPriority(key, sectionName),
                          assignees: assignToUsers,
                          tags: [...addTags, sectionName.toLowerCase().replace(/\s+/g, '-'), key.toLowerCase()],
                          dueDate: this.calculateTaskDueDate(key, sectionName),
                          customFields: includeCustomFields ? this.generateCustomFields(key, sectionName) : undefined,
                          subtasks: this.generateSubtasks(key, content, sectionName)
                        })
                      )
                    }
                  }
                }

                const taskResults = await Promise.all(taskPromises)
                const tasks = taskResults.flatMap(r => [r.task, ...r.subtasks])
                result.tasks.push(...tasks)
                result.statistics.totalTasks += tasks.length
                result.statistics.sectionsProcessed++
              }
            }
          }
        }
      }

      return result
    } catch (error) {
      console.error('Error creating SDLC project:', error)
      throw error
    }
  }

  // Helper method to get section data from SDLC document
  private getSectionData(sdlcDocument: any, sectionName: string): any {
    switch (sectionName) {
      case 'Business Analysis':
        return sdlcDocument.businessAnalysis
      case 'Functional Specification':
        return sdlcDocument.functionalSpec
      case 'Technical Architecture':
        return sdlcDocument.technicalSpec
      case 'UX Design':
        return sdlcDocument.uxSpec
      case 'Data Architecture':
        return sdlcDocument.dataSpec
      case 'Service Design':
        return sdlcDocument.serviceSpec
      case 'Deployment':
        return sdlcDocument.deploymentSpec
      case 'Observability':
        return sdlcDocument.observabilitySpec
      case 'Implementation':
        return sdlcDocument.implementationGuide
      default:
        return null
    }
  }

  // Helper method to format subsection titles
  private formatSubsectionTitle(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  // Helper method to generate task description
  private generateTaskDescription(key: string, content: string, sectionName: string): string {
    return `## ${this.formatSubsectionTitle(key)}

${content}

---

### Context
- **Section**: ${sectionName}
- **Generated**: ${new Date().toISOString()}
- **Source**: SDLC Documentation Generator

### Acceptance Criteria
- [ ] Review and validate the ${this.formatSubsectionTitle(key).toLowerCase()}
- [ ] Ensure all requirements are captured
- [ ] Verify alignment with overall project goals
- [ ] Update documentation as needed
- [ ] Obtain stakeholder approval

### Definition of Done
- [ ] Content reviewed and approved
- [ ] Documentation updated
- [ ] Stakeholder sign-off received
- [ ] Task moved to completed status

### Resources
- [ ] Technical documentation review
- [ ] Stakeholder consultation
- [ ] Requirements validation
- [ ] Implementation planning`
  }

  // Helper method to calculate task priority
  private calculateTaskPriority(key: string, sectionName: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (key.includes('executive') || key.includes('Executive') || 
        key.includes('architecture') || key.includes('Architecture') ||
        key.includes('security') || key.includes('Security')) {
      return 'urgent'
    }

    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('system') || key.includes('System') ||
        sectionName.includes('Business') && key.includes('analysis')) {
      return 'high'
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('documentation') || key.includes('Documentation') ||
        key.includes('monitoring') || key.includes('Monitoring')) {
      return 'medium'
    }

    return 'low'
  }

  // Helper method to calculate task due date
  private calculateTaskDueDate(key: string, sectionName: string): Date {
    const baseDate = new Date()
    
    if (sectionName.includes('Business')) {
      baseDate.setDate(baseDate.getDate() + 14) // 2 weeks
    } else if (sectionName.includes('Functional') || sectionName.includes('Technical')) {
      baseDate.setDate(baseDate.getDate() + 28) // 4 weeks
    } else if (sectionName.includes('Implementation')) {
      baseDate.setDate(baseDate.getDate() + 84) // 12 weeks
    } else {
      baseDate.setDate(baseDate.getDate() + 42) // 6 weeks
    }

    return baseDate
  }

  // Helper method to generate custom fields
  private generateCustomFields(key: string, sectionName: string): { [key: string]: any } {
    return {
      'Epic': sectionName,
      'Story Points': this.estimateStoryPoints(key, sectionName),
      'Complexity': this.calculateComplexity(key, sectionName),
      'Business Value': this.calculateBusinessValue(key, sectionName),
      'Technical Risk': this.calculateTechnicalRisk(key, sectionName)
    }
  }

  // Helper method to estimate story points
  private estimateStoryPoints(key: string, sectionName: string): number {
    if (key.includes('executive') || key.includes('Executive') || 
        key.includes('architecture') || key.includes('Architecture')) {
      return 8
    }

    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('system') || key.includes('System')) {
      return 5
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('documentation') || key.includes('Documentation')) {
      return 3
    }

    return 2
  }

  // Helper method to calculate complexity
  private calculateComplexity(key: string, sectionName: string): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (key.includes('architecture') || key.includes('Architecture') ||
        key.includes('security') || key.includes('Security')) {
      return 'Very High'
    }

    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('system') || key.includes('System')) {
      return 'High'
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('documentation') || key.includes('Documentation')) {
      return 'Medium'
    }

    return 'Low'
  }

  // Helper method to calculate business value
  private calculateBusinessValue(key: string, sectionName: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (key.includes('executive') || key.includes('Executive') ||
        key.includes('business') || key.includes('Business')) {
      return 'Critical'
    }

    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('user') || key.includes('User')) {
      return 'High'
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('security') || key.includes('Security')) {
      return 'Medium'
    }

    return 'Low'
  }

  // Helper method to calculate technical risk
  private calculateTechnicalRisk(key: string, sectionName: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (key.includes('architecture') || key.includes('Architecture') ||
        key.includes('security') || key.includes('Security')) {
      return 'Critical'
    }

    if (key.includes('integration') || key.includes('Integration') ||
        key.includes('deployment') || key.includes('Deployment')) {
      return 'High'
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('monitoring') || key.includes('Monitoring')) {
      return 'Medium'
    }

    return 'Low'
  }

  // Helper method to generate subtasks
  private generateSubtasks(key: string, content: string, sectionName: string): Array<{
    name: string
    description?: string
    assignees?: string[]
  }> {
    const subtasks = []

    // Common subtasks for all sections
    subtasks.push({
      name: `Research and Analysis - ${this.formatSubsectionTitle(key)}`,
      description: `Conduct thorough research and analysis for ${this.formatSubsectionTitle(key)}`
    })

    subtasks.push({
      name: `Documentation - ${this.formatSubsectionTitle(key)}`,
      description: `Create comprehensive documentation for ${this.formatSubsectionTitle(key)}`
    })

    subtasks.push({
      name: `Review and Validation - ${this.formatSubsectionTitle(key)}`,
      description: `Review and validate the ${this.formatSubsectionTitle(key)} with stakeholders`
    })

    // Section-specific subtasks
    if (sectionName.includes('Business')) {
      subtasks.push({
        name: `Stakeholder Consultation - ${this.formatSubsectionTitle(key)}`,
        description: `Consult with stakeholders on ${this.formatSubsectionTitle(key)}`
      })
    }

    if (sectionName.includes('Technical')) {
      subtasks.push({
        name: `Technical Design - ${this.formatSubsectionTitle(key)}`,
        description: `Create technical design for ${this.formatSubsectionTitle(key)}`
      })
    }

    if (sectionName.includes('Implementation')) {
      subtasks.push({
        name: `Implementation Plan - ${this.formatSubsectionTitle(key)}`,
        description: `Create implementation plan for ${this.formatSubsectionTitle(key)}`
      })
    }

    return subtasks
  }

  // Helper method to get phase date
  private getPhaseDate(phase: number): number {
    const date = new Date()
    date.setDate(date.getDate() + (phase * 14)) // 2 weeks per phase
    return date.getTime()
  }

  // ============================================================================
  // Space, Folder, and List Creation Methods
  // ============================================================================

  async createSpace(teamId: string, spaceData: {
    name: string
    multiple_assignees?: boolean
    features?: any
    color?: string
  }): Promise<ClickUpSpace> {
    const endpoint = `/team/${teamId}/space`
    return this.makeRequest<ClickUpSpace>(endpoint, {
      method: 'POST',
      body: JSON.stringify(spaceData)
    })
  }

  async createFolder(spaceId: string, folderData: {
    name: string
    color?: string
    hidden?: boolean
  }): Promise<ClickUpFolder> {
    const endpoint = `/space/${spaceId}/folder`
    return this.makeRequest<ClickUpFolder>(endpoint, {
      method: 'POST',
      body: JSON.stringify(folderData)
    })
  }

  async createList(folderId: string, listData: {
    name: string
    content?: string
    due_date?: number
    priority?: number
    assignee?: string
    status?: string
  }): Promise<ClickUpList> {
    const endpoint = `/folder/${folderId}/list`
    return this.makeRequest<ClickUpList>(endpoint, {
      method: 'POST',
      body: JSON.stringify(listData)
    })
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkCreateTasks(
    listId: string,
    tasks: CreateTaskRequest[]
  ): Promise<ClickUpTask[]> {
    const taskPromises = tasks.map(task => this.createTask(listId, task))
    return Promise.all(taskPromises)
  }

  async bulkUpdateTasks(
    updates: Array<{ taskId: string; updateData: UpdateTaskRequest }>
  ): Promise<ClickUpTask[]> {
    const updatePromises = updates.map(({ taskId, updateData }) => 
      this.updateTask(taskId, updateData)
    )
    return Promise.all(updatePromises)
  }

  // ============================================================================
  // Template and Export Methods
  // ============================================================================

  async createProjectTemplate(
    teamId: string,
    templateName: string,
    templateData: {
      spaces: any[]
      folders: any[]
      lists: any[]
      tasks: any[]
    }
  ): Promise<any> {
    // This would create a reusable template
    // For now, return the template data
    return {
      name: templateName,
      teamId,
      ...templateData,
      createdAt: new Date().toISOString()
    }
  }

  async exportProjectStructure(spaceId: string): Promise<any> {
    const space = await this.getSpace(spaceId)
    const folders = await this.getFolders(spaceId)
    const lists = await this.getLists(spaceId)
    
    const allTasks = []
    for (const list of lists) {
      const tasks = await this.getTasks(list.id)
      allTasks.push(...tasks)
    }

    return {
      space,
      folders,
      lists,
      tasks: allTasks,
      exportedAt: new Date().toISOString()
    }
  }
}