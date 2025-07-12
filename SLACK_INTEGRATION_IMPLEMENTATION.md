# 🚀 Slack Integration Implementation Guide
## Phase 2 Development Plan

> **Goal**: Implement Slack-integrated, cloud-based AI coding assistant with parallel processing

---

## 🎯 **IMPLEMENTATION TIMELINE**

### **Week 1: Slack Bot & Worker Architecture**
- **Days 1-3**: Slack Bot Foundation
- **Days 4-7**: Cloud Worker Architecture

### **Week 2: GitHub Integration & Notifications**
- **Days 1-4**: GitHub API Integration
- **Days 5-7**: Notification System

### **Week 3: Enhancement & Deployment**
- **Days 1-5**: Hybrid Interface Enhancement
- **Days 6-7**: Testing & Deployment

---

## 🤖 **SLACK BOT IMPLEMENTATION**

### **1. Slack App Setup**

#### **Create Slack App Configuration**
```bash
# Create new Slack app at https://api.slack.com/apps
# Configure OAuth & Permissions with these scopes:

Bot Token Scopes:
- chat:write
- chat:write.public
- commands
- channels:read
- groups:read
- im:read
- mpim:read
- users:read
- files:write

User Token Scopes:
- chat:write
- channels:read
- groups:read
```

#### **Environment Variables**
```bash
# .env additions
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
```

### **2. Slack Bot Service Implementation**

#### **Create `lib/slack-service.ts`**
```typescript
import { App, ExpressReceiver } from '@slack/bolt';
import { WebClient } from '@slack/web-api';

export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  appToken: string;
  socketMode: boolean;
}

export class SlackService {
  private app: App;
  private client: WebClient;

  constructor(config: SlackConfig) {
    this.app = new App({
      token: config.botToken,
      signingSecret: config.signingSecret,
      socketMode: config.socketMode,
      appToken: config.appToken,
    });

    this.client = new WebClient(config.botToken);
    this.setupCommands();
    this.setupInteractions();
  }

  private setupCommands() {
    // /sdlc create [task]
    this.app.command('/sdlc', async ({ command, ack, respond, client }) => {
      await ack();
      
      const [action, ...args] = command.text.split(' ');
      
      switch (action) {
        case 'create':
          await this.handleCreateTask(args.join(' '), command.user_id, respond);
          break;
        case 'status':
          await this.handleTaskStatus(args[0], command.user_id, respond);
          break;
        case 'list':
          await this.handleListTasks(command.user_id, respond);
          break;
        case 'connect':
          await this.handleConnectRepo(args[0], command.user_id, respond);
          break;
        case 'config':
          await this.handleConfig(command.user_id, client, command.trigger_id);
          break;
        default:
          await this.handleHelp(respond);
      }
    });
  }

  private async handleCreateTask(
    taskDescription: string,
    userId: string,
    respond: any
  ) {
    if (!taskDescription.trim()) {
      await respond({
        text: '❌ Please provide a task description. Example: `/sdlc create Fix login button bug`',
        response_type: 'ephemeral'
      });
      return;
    }

    try {
      // Create task through our existing API
      const task = await this.createTaskViaAPI(taskDescription, userId);
      
      await respond({
        text: `✅ Task created successfully!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Task Created*\n*ID:* ${task.id}\n*Description:* ${taskDescription}\n*Status:* ${task.status}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Progress'
                },
                action_id: 'view_task_progress',
                value: task.id
              }
            ]
          }
        ]
      });
    } catch (error) {
      await respond({
        text: `❌ Error creating task: ${error.message}`,
        response_type: 'ephemeral'
      });
    }
  }

  private async handleTaskStatus(
    taskId: string,
    userId: string,
    respond: any
  ) {
    if (!taskId) {
      await respond({
        text: '❌ Please provide a task ID. Example: `/sdlc status task-123`',
        response_type: 'ephemeral'
      });
      return;
    }

    try {
      const task = await this.getTaskStatusViaAPI(taskId, userId);
      
      const progressBar = this.createProgressBar(task.progress || 0);
      
      await respond({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Task Status*\n*ID:* ${task.id}\n*Status:* ${task.status}\n*Progress:* ${progressBar}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Created: ${new Date(task.createdAt).toLocaleString()}`
              }
            ]
          }
        ]
      });
    } catch (error) {
      await respond({
        text: `❌ Error getting task status: ${error.message}`,
        response_type: 'ephemeral'
      });
    }
  }

  private async handleListTasks(userId: string, respond: any) {
    try {
      const tasks = await this.getUserTasksViaAPI(userId);
      
      if (tasks.length === 0) {
        await respond({
          text: '📋 No active tasks found. Use `/sdlc create [description]` to create a new task.',
          response_type: 'ephemeral'
        });
        return;
      }

      const taskBlocks = tasks.map(task => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${task.id}*\n${task.description}\n*Status:* ${task.status}`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View'
          },
          action_id: 'view_task_details',
          value: task.id
        }
      }));

      await respond({
        text: `📋 Your Active Tasks (${tasks.length})`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Your Active Tasks* (${tasks.length})`
            }
          },
          ...taskBlocks
        ]
      });
    } catch (error) {
      await respond({
        text: `❌ Error listing tasks: ${error.message}`,
        response_type: 'ephemeral'
      });
    }
  }

  private createProgressBar(progress: number): string {
    const total = 10;
    const filled = Math.round((progress / 100) * total);
    const empty = total - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
  }

  // API Integration methods
  private async createTaskViaAPI(description: string, userId: string) {
    const response = await fetch('/api/claude-agentic-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_task',
        taskData: {
          description,
          userId,
          source: 'slack'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    
    return response.json();
  }

  private async getTaskStatusViaAPI(taskId: string, userId: string) {
    const response = await fetch(`/api/claude-agentic-code?action=get_task_status&taskId=${taskId}&userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get task status');
    }
    
    return response.json();
  }

  private async getUserTasksViaAPI(userId: string) {
    const response = await fetch(`/api/claude-agentic-code?action=list_tasks&userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user tasks');
    }
    
    const data = await response.json();
    return data.tasks || [];
  }

  async start() {
    await this.app.start();
    console.log('🤖 Slack bot is running!');
  }
}
```

### **3. Slack API Route**

#### **Create `app/api/slack/events/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SlackService } from '@/lib/slack-service';

const slackService = new SlackService({
  botToken: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  appToken: process.env.SLACK_APP_TOKEN!,
  socketMode: false
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    // Handle Slack events
    const response = await slackService.handleEvent(body, headers);
    
    return new NextResponse(response.body, {
      status: response.statusCode,
      headers: response.headers
    });
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## ⚡ **CLOUD WORKER ARCHITECTURE**

### **1. Task Queue System**

#### **Create `lib/task-queue.ts`**
```typescript
import Redis from 'ioredis';

export interface Task {
  id: string;
  type: TaskType;
  priority: Priority;
  payload: any;
  dependencies: string[];
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

export enum TaskType {
  CODE_ANALYSIS = 'code_analysis',
  IMPLEMENTATION = 'implementation',
  TESTING = 'testing',
  PR_CREATION = 'pr_creation',
  NOTIFICATION = 'notification'
}

export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export class TaskQueue {
  private redis: Redis;
  private queueName: string;
  private statusKey: string;

  constructor(redisUrl: string, queueName = 'sdlc-tasks') {
    this.redis = new Redis(redisUrl);
    this.queueName = queueName;
    this.statusKey = `${queueName}:status`;
  }

  async enqueue(task: Task): Promise<void> {
    const taskData = JSON.stringify(task);
    
    // Add to priority queue
    const priority = this.getPriorityScore(task.priority);
    await this.redis.zadd(this.queueName, priority, taskData);
    
    // Store task status
    await this.redis.hset(this.statusKey, task.id, JSON.stringify({
      status: task.status,
      updatedAt: new Date().toISOString()
    }));
    
    console.log(`📋 Task ${task.id} queued with priority ${task.priority}`);
  }

  async dequeue(taskType?: TaskType): Promise<Task | null> {
    // Get highest priority task
    const results = await this.redis.zrevrange(this.queueName, 0, 0);
    
    if (results.length === 0) {
      return null;
    }
    
    const taskData = results[0];
    const task = JSON.parse(taskData) as Task;
    
    // Filter by task type if specified
    if (taskType && task.type !== taskType) {
      return null;
    }
    
    // Remove from queue
    await this.redis.zrem(this.queueName, taskData);
    
    // Update status
    task.status = TaskStatus.PROCESSING;
    task.startedAt = new Date();
    await this.updateTaskStatus(task.id, task.status);
    
    console.log(`🔄 Task ${task.id} dequeued for processing`);
    return task;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await this.redis.hset(this.statusKey, taskId, JSON.stringify({
      status,
      updatedAt: new Date().toISOString()
    }));
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus | null> {
    const result = await this.redis.hget(this.statusKey, taskId);
    
    if (!result) {
      return null;
    }
    
    const data = JSON.parse(result);
    return data.status;
  }

  private getPriorityScore(priority: Priority): number {
    switch (priority) {
      case Priority.LOW: return 1;
      case Priority.MEDIUM: return 2;
      case Priority.HIGH: return 3;
      case Priority.URGENT: return 4;
      default: return 1;
    }
  }
}
```

### **2. Worker Pool Manager**

#### **Create `lib/worker-pool.ts`**
```typescript
import { TaskQueue, Task, TaskType, TaskStatus } from './task-queue';
import { AgenticExecutionEngine } from './agentic-execution-engine';

export interface WorkerConfig {
  maxWorkers: number;
  minWorkers: number;
  scalingThreshold: number;
  workerTimeout: number;
}

export class WorkerPool {
  private workers: Map<string, Worker> = new Map();
  private taskQueue: TaskQueue;
  private config: WorkerConfig;
  private isRunning = false;

  constructor(taskQueue: TaskQueue, config: WorkerConfig) {
    this.taskQueue = taskQueue;
    this.config = config;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    // Start minimum number of workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      await this.createWorker();
    }
    
    // Start monitoring loop
    this.startMonitoring();
    
    console.log(`🚀 Worker pool started with ${this.config.minWorkers} workers`);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Stop all workers
    for (const [workerId, worker] of this.workers) {
      await worker.stop();
      this.workers.delete(workerId);
    }
    
    console.log('🛑 Worker pool stopped');
  }

  private async createWorker(): Promise<Worker> {
    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const worker = new Worker(workerId, this.taskQueue, this.config.workerTimeout);
    
    this.workers.set(workerId, worker);
    
    // Start worker
    worker.start();
    
    // Handle worker completion
    worker.on('taskCompleted', (task: Task) => {
      this.onTaskCompleted(task);
    });
    
    worker.on('taskFailed', (task: Task, error: Error) => {
      this.onTaskFailed(task, error);
    });
    
    worker.on('workerIdle', () => {
      this.onWorkerIdle(workerId);
    });
    
    console.log(`👷 Worker ${workerId} created`);
    return worker;
  }

  private async startMonitoring(): Promise<void> {
    while (this.isRunning) {
      // Check if we need to scale up or down
      const queueLength = await this.getQueueLength();
      const activeWorkers = this.getActiveWorkerCount();
      
      if (queueLength > this.config.scalingThreshold && activeWorkers < this.config.maxWorkers) {
        await this.scaleUp();
      } else if (queueLength === 0 && activeWorkers > this.config.minWorkers) {
        await this.scaleDown();
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  private async scaleUp(): Promise<void> {
    const currentWorkers = this.workers.size;
    if (currentWorkers < this.config.maxWorkers) {
      await this.createWorker();
      console.log(`📈 Scaled up to ${this.workers.size} workers`);
    }
  }

  private async scaleDown(): Promise<void> {
    const currentWorkers = this.workers.size;
    if (currentWorkers > this.config.minWorkers) {
      // Find and stop an idle worker
      for (const [workerId, worker] of this.workers) {
        if (worker.isIdle()) {
          await worker.stop();
          this.workers.delete(workerId);
          console.log(`📉 Scaled down to ${this.workers.size} workers`);
          break;
        }
      }
    }
  }

  private async getQueueLength(): Promise<number> {
    return await this.taskQueue.getQueueLength();
  }

  private getActiveWorkerCount(): number {
    return Array.from(this.workers.values()).filter(worker => !worker.isIdle()).length;
  }

  private onTaskCompleted(task: Task): void {
    console.log(`✅ Task ${task.id} completed`);
    // Send notification
    this.sendNotification(task, 'completed');
  }

  private onTaskFailed(task: Task, error: Error): void {
    console.log(`❌ Task ${task.id} failed: ${error.message}`);
    // Send notification
    this.sendNotification(task, 'failed');
  }

  private onWorkerIdle(workerId: string): void {
    console.log(`💤 Worker ${workerId} is idle`);
  }

  private async sendNotification(task: Task, status: string): Promise<void> {
    // Send Slack notification
    // Implementation depends on notification system
  }
}

class Worker {
  private id: string;
  private taskQueue: TaskQueue;
  private timeout: number;
  private isRunning = false;
  private currentTask: Task | null = null;
  private executionEngine: AgenticExecutionEngine;

  constructor(id: string, taskQueue: TaskQueue, timeout: number) {
    this.id = id;
    this.taskQueue = taskQueue;
    this.timeout = timeout;
    this.executionEngine = new AgenticExecutionEngine(/* config */);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.processQueue();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  isIdle(): boolean {
    return this.currentTask === null;
  }

  private async processQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        const task = await this.taskQueue.dequeue();
        
        if (task) {
          this.currentTask = task;
          await this.processTask(task);
          this.currentTask = null;
        } else {
          // No tasks available, wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Worker ${this.id} error:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async processTask(task: Task): Promise<void> {
    console.log(`🔄 Worker ${this.id} processing task ${task.id}`);
    
    try {
      // Execute task based on type
      let result;
      
      switch (task.type) {
        case TaskType.CODE_ANALYSIS:
          result = await this.executeCodeAnalysis(task);
          break;
        case TaskType.IMPLEMENTATION:
          result = await this.executeImplementation(task);
          break;
        case TaskType.TESTING:
          result = await this.executeTesting(task);
          break;
        case TaskType.PR_CREATION:
          result = await this.executePRCreation(task);
          break;
        case TaskType.NOTIFICATION:
          result = await this.executeNotification(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      // Mark task as completed
      await this.taskQueue.updateTaskStatus(task.id, TaskStatus.COMPLETED);
      
      console.log(`✅ Worker ${this.id} completed task ${task.id}`);
      
    } catch (error) {
      console.error(`❌ Worker ${this.id} failed task ${task.id}:`, error);
      await this.taskQueue.updateTaskStatus(task.id, TaskStatus.FAILED);
      throw error;
    }
  }

  private async executeCodeAnalysis(task: Task): Promise<any> {
    // Use existing agentic execution engine
    return await this.executionEngine.analyzeRepository(task.payload);
  }

  private async executeImplementation(task: Task): Promise<any> {
    // Use existing agentic execution engine
    return await this.executionEngine.executeTask(task.payload);
  }

  private async executeTesting(task: Task): Promise<any> {
    // Run tests
    return await this.executionEngine.runTests(task.payload);
  }

  private async executePRCreation(task: Task): Promise<any> {
    // Create pull request
    return await this.executionEngine.createPullRequest(task.payload);
  }

  private async executeNotification(task: Task): Promise<any> {
    // Send notification
    return await this.sendNotification(task.payload);
  }

  private async sendNotification(payload: any): Promise<void> {
    // Implementation depends on notification service
  }
}
```

---

## 🔗 **GITHUB INTEGRATION ENHANCEMENT**

### **1. Enhanced GitHub Service**

#### **Update `lib/github-operations-service.ts`**
```typescript
import { Octokit } from '@octokit/rest';

export interface PRCreationRequest {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  draft?: boolean;
  maintainerCanModify?: boolean;
}

export interface PRTemplate {
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  reviewers: string[];
  milestone?: string;
}

export class GitHubOperationsService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async createAutomatedPR(
    task: any,
    changes: any,
    template: PRTemplate
  ): Promise<any> {
    try {
      console.log(`🔀 Creating automated PR for task ${task.id}`);
      
      // Create feature branch
      const branchName = `feature/task-${task.id}-${Date.now()}`;
      await this.createBranch(task.repository.owner, task.repository.name, branchName);
      
      // Apply changes to branch
      await this.applyChangesToBranch(
        task.repository.owner,
        task.repository.name,
        branchName,
        changes
      );
      
      // Create pull request
      const pr = await this.octokit.rest.pulls.create({
        owner: task.repository.owner,
        repo: task.repository.name,
        title: template.title,
        body: template.body,
        head: branchName,
        base: task.repository.branch || 'main',
        draft: false,
        maintainer_can_modify: true
      });
      
      // Add labels
      if (template.labels.length > 0) {
        await this.octokit.rest.issues.addLabels({
          owner: task.repository.owner,
          repo: task.repository.name,
          issue_number: pr.data.number,
          labels: template.labels
        });
      }
      
      // Request reviewers
      if (template.reviewers.length > 0) {
        await this.octokit.rest.pulls.requestReviewers({
          owner: task.repository.owner,
          repo: task.repository.name,
          pull_number: pr.data.number,
          reviewers: template.reviewers
        });
      }
      
      console.log(`✅ PR created successfully: ${pr.data.html_url}`);
      return pr.data;
      
    } catch (error) {
      console.error('❌ Error creating automated PR:', error);
      throw error;
    }
  }

  private async createBranch(owner: string, repo: string, branchName: string): Promise<void> {
    // Get default branch SHA
    const { data: defaultBranch } = await this.octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: 'main'
    });
    
    // Create new branch
    await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: defaultBranch.commit.sha
    });
  }

  private async applyChangesToBranch(
    owner: string,
    repo: string,
    branch: string,
    changes: any
  ): Promise<void> {
    // Apply file changes to the branch
    for (const change of changes.files) {
      await this.updateFileInBranch(owner, repo, branch, change);
    }
  }

  private async updateFileInBranch(
    owner: string,
    repo: string,
    branch: string,
    change: any
  ): Promise<void> {
    try {
      // Get current file (if exists)
      let currentFile;
      try {
        currentFile = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: change.path,
          ref: branch
        });
      } catch (error) {
        // File doesn't exist, will be created
      }
      
      // Update or create file
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: change.path,
        message: `Update ${change.path} (Task: ${change.taskId})`,
        content: Buffer.from(change.content).toString('base64'),
        branch,
        sha: currentFile ? (currentFile.data as any).sha : undefined
      });
      
    } catch (error) {
      console.error(`❌ Error updating file ${change.path}:`, error);
      throw error;
    }
  }

  generatePRTemplate(task: any, changes: any): PRTemplate {
    return {
      title: `${task.type}: ${task.description}`,
      body: `## Task Details
- **Task ID**: ${task.id}
- **Type**: ${task.type}
- **Priority**: ${task.priority}
- **Description**: ${task.description}

## Changes Made
${changes.summary}

## Files Modified
${changes.files.map(f => `- ${f.path}`).join('\n')}

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Tests are included
- [ ] Documentation updated
- [ ] No breaking changes

---
*This PR was automatically generated by SDLC.dev AI Assistant*`,
      labels: ['automated', task.type, task.priority],
      assignees: [task.userId],
      reviewers: []
    };
  }
}
```

---

## 📧 **NOTIFICATION SYSTEM**

### **1. Notification Service**

#### **Create `lib/notification-service.ts`**
```typescript
import { WebClient } from '@slack/web-api';
import nodemailer from 'nodemailer';

export interface NotificationConfig {
  slack: {
    token: string;
    enabled: boolean;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    enabled: boolean;
  };
  webhook: {
    enabled: boolean;
    endpoints: string[];
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  recipient: string;
  title: string;
  message: string;
  data: any;
  channels: NotificationChannel[];
  priority: Priority;
  scheduledAt?: Date;
  sentAt?: Date;
  status: NotificationStatus;
}

export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_STARTED = 'task_started',
  TASK_PROGRESS = 'task_progress',
  TASK_COMPLETED = 'task_completed',
  TASK_FAILED = 'task_failed',
  PR_CREATED = 'pr_created',
  PR_MERGED = 'pr_merged'
}

export enum NotificationChannel {
  SLACK = 'slack',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export class NotificationService {
  private config: NotificationConfig;
  private slackClient: WebClient;
  private emailTransporter: nodemailer.Transporter;

  constructor(config: NotificationConfig) {
    this.config = config;
    
    if (config.slack.enabled) {
      this.slackClient = new WebClient(config.slack.token);
    }
    
    if (config.email.enabled) {
      this.emailTransporter = nodemailer.createTransporter(config.email.smtp);
    }
  }

  async sendNotification(notification: Notification): Promise<void> {
    console.log(`📧 Sending notification ${notification.id} to ${notification.recipient}`);
    
    const results = await Promise.allSettled([
      ...(notification.channels.includes(NotificationChannel.SLACK) ? [this.sendSlackNotification(notification)] : []),
      ...(notification.channels.includes(NotificationChannel.EMAIL) ? [this.sendEmailNotification(notification)] : []),
      ...(notification.channels.includes(NotificationChannel.WEBHOOK) ? [this.sendWebhookNotification(notification)] : [])
    ]);
    
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      console.error(`❌ Failed to send notification ${notification.id}:`, failures);
      throw new Error(`Failed to send to ${failures.length} channels`);
    }
    
    console.log(`✅ Notification ${notification.id} sent successfully`);
  }

  private async sendSlackNotification(notification: Notification): Promise<void> {
    if (!this.config.slack.enabled || !this.slackClient) {
      return;
    }
    
    const blocks = this.buildSlackBlocks(notification);
    
    await this.slackClient.chat.postMessage({
      channel: notification.recipient,
      text: notification.title,
      blocks
    });
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    if (!this.config.email.enabled || !this.emailTransporter) {
      return;
    }
    
    const html = this.buildEmailHTML(notification);
    
    await this.emailTransporter.sendMail({
      from: this.config.email.smtp.auth.user,
      to: notification.recipient,
      subject: notification.title,
      html
    });
  }

  private async sendWebhookNotification(notification: Notification): Promise<void> {
    if (!this.config.webhook.enabled) {
      return;
    }
    
    const payload = {
      id: notification.id,
      type: notification.type,
      recipient: notification.recipient,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date().toISOString()
    };
    
    await Promise.all(
      this.config.webhook.endpoints.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      )
    );
  }

  private buildSlackBlocks(notification: Notification): any[] {
    const baseBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${notification.title}*\n${notification.message}`
        }
      }
    ];
    
    // Add type-specific blocks
    switch (notification.type) {
      case NotificationType.TASK_COMPLETED:
        baseBlocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Task'
              },
              action_id: 'view_task',
              value: notification.data.taskId
            }
          ]
        });
        break;
      
      case NotificationType.PR_CREATED:
        baseBlocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View PR'
              },
              url: notification.data.prUrl
            }
          ]
        });
        break;
    }
    
    return baseBlocks;
  }

  private buildEmailHTML(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
          .content { padding: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; }
          .button { background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SDLC.dev</h1>
          <h2>${notification.title}</h2>
        </div>
        <div class="content">
          <p>${notification.message}</p>
          ${notification.data.actionUrl ? `<a href="${notification.data.actionUrl}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from SDLC.dev</p>
        </div>
      </body>
      </html>
    `;
  }

  // Smart batching for reduced noise
  async batchNotifications(notifications: Notification[]): Promise<void> {
    const batched = this.groupNotificationsByRecipient(notifications);
    
    for (const [recipient, notifs] of batched) {
      if (notifs.length > 1) {
        await this.sendBatchedNotification(recipient, notifs);
      } else {
        await this.sendNotification(notifs[0]);
      }
    }
  }

  private groupNotificationsByRecipient(notifications: Notification[]): Map<string, Notification[]> {
    const grouped = new Map<string, Notification[]>();
    
    for (const notification of notifications) {
      const existing = grouped.get(notification.recipient) || [];
      existing.push(notification);
      grouped.set(notification.recipient, existing);
    }
    
    return grouped;
  }

  private async sendBatchedNotification(recipient: string, notifications: Notification[]): Promise<void> {
    const batchNotification: Notification = {
      id: `batch-${Date.now()}`,
      type: NotificationType.TASK_PROGRESS,
      recipient,
      title: `📋 ${notifications.length} Task Updates`,
      message: notifications.map(n => `• ${n.title}`).join('\n'),
      data: { notifications: notifications.map(n => n.data) },
      channels: notifications[0].channels,
      priority: Math.max(...notifications.map(n => this.getPriorityValue(n.priority))),
      status: NotificationStatus.PENDING
    };
    
    await this.sendNotification(batchNotification);
  }

  private getPriorityValue(priority: Priority): number {
    switch (priority) {
      case Priority.LOW: return 1;
      case Priority.MEDIUM: return 2;
      case Priority.HIGH: return 3;
      case Priority.URGENT: return 4;
      default: return 1;
    }
  }
}
```

---

## 📊 **NEXT STEPS**

### **Week 1 Tasks**
1. **Set up Slack app** and configure OAuth
2. **Implement Slack service** with slash commands
3. **Create task queue system** with Redis
4. **Build worker pool manager** with auto-scaling

### **Week 2 Tasks**
1. **Enhance GitHub integration** with automated PR creation
2. **Implement notification service** with multi-channel support
3. **Add webhook support** for external integrations
4. **Create smart batching** for reduced notification noise

### **Week 3 Tasks**
1. **Build web-Slack synchronization** for hybrid interface
2. **Implement cross-platform state management**
3. **Add monitoring and alerting** for production readiness
4. **Deploy and test** the complete system

This implementation plan provides a solid foundation for transforming your existing AI Code Assistant into a Slack-integrated, cloud-based platform with parallel processing capabilities. 