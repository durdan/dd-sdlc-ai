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
}