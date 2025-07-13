import { taskQueue, Task, TaskType, TaskStatus, Priority, TaskSource } from './vercel-task-queue';
import { getUserSlackConfig } from '@/app/api/user-integrations/slack/route';
import { createClient } from '@/lib/supabase/server';
import taskStore from './task-store'

// Slack API interfaces
interface SlackCommand {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

interface SlackResponse {
  response_type?: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: any[];
  attachments?: any[];
}

interface SlackInteraction {
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    domain: string;
  };
  actions?: any[];
  trigger_id?: string;
  response_url?: string;
  callback_id?: string;
  value?: string;
}

export class SlackService {
  
  /**
   * Handle Slack slash commands
   */
  static async handleSlashCommand(command: SlackCommand): Promise<SlackResponse> {
    console.log(`🤖 Slack command: ${command.command} ${command.text} from ${command.user_name}`);
    
    try {
      // Verify user has Slack integration
      const userId = await this.getUserIdBySlackUser(command.user_id, command.team_id);
      if (!userId) {
        return {
          response_type: 'ephemeral',
          text: '❌ Your Slack account is not connected to SDLC.dev. Please connect it first in the dashboard.'
        };
      }

      // Parse command and arguments
      const [action, ...args] = command.text.trim().split(' ');
      
      switch (action.toLowerCase()) {
        case 'create':
          return await this.handleCreateTask(args.join(' '), userId, command);
        
        case 'status':
          return await this.handleTaskStatus(args[0], userId, command);
        
        case 'list':
          return await this.handleListTasks(userId, command);
        
        case 'connect':
          return await this.handleConnectRepo(args[0], userId, command);
        
        case 'config':
          return await this.handleConfig(userId, command);
        
        case 'help':
        case '':
          return await this.handleHelp();
        
        default:
          return {
            response_type: 'ephemeral',
            text: `❌ Unknown command: \`${action}\`. Type \`/sdlc help\` for available commands.`
          };
      }
      
    } catch (error) {
      console.error('❌ Error handling Slack command:', error);
      return {
        response_type: 'ephemeral',
        text: '❌ An error occurred while processing your command. Please try again.'
      };
    }
  }

  /**
   * Handle interactive component interactions
   */
  static async handleInteraction(interaction: SlackInteraction): Promise<SlackResponse> {
    console.log(`🔄 Slack interaction: ${interaction.type} from ${interaction.user.username}`);
    
    try {
      // Verify user has Slack integration
      const userId = await this.getUserIdBySlackUser(interaction.user.id, interaction.team.id);
      if (!userId) {
        return {
          response_type: 'ephemeral',
          text: '❌ Your Slack account is not connected to SDLC.dev.'
        };
      }

      if (interaction.type === 'block_actions' && interaction.actions) {
        const action = interaction.actions[0];
        
        switch (action.action_id) {
          case 'view_task_progress':
            return await this.handleViewTaskProgress(action.value, userId);
          
          case 'view_task_details':
            return await this.handleViewTaskDetails(action.value, userId);
          
          case 'cancel_task':
            return await this.handleCancelTask(action.value, userId);
          
          case 'retry_task':
            return await this.handleRetryTask(action.value, userId);
          
          default:
            return {
              response_type: 'ephemeral',
              text: '❌ Unknown interaction action.'
            };
        }
      }
      
      return {
        response_type: 'ephemeral',
        text: '❌ Unsupported interaction type.'
      };
      
    } catch (error) {
      console.error('❌ Error handling Slack interaction:', error);
      return {
        response_type: 'ephemeral',
        text: '❌ An error occurred while processing your interaction.'
      };
    }
  }

  // =====================================================
  // COMMAND HANDLERS
  // =====================================================

  private static async handleCreateTask(
    taskDescription: string,
    userId: string,
    command: SlackCommand
  ): Promise<SlackResponse> {
    if (!taskDescription.trim()) {
      return {
        response_type: 'ephemeral',
        text: '❌ Please provide a task description.\n\nExample: `/sdlc create Fix login button bug`'
      };
    }

    try {
      // Create task
      const taskId = `slack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const task: Task = {
        id: taskId,
        type: this.inferTaskType(taskDescription),
        priority: this.inferPriority(taskDescription),
        payload: {
          description: taskDescription,
          channel: command.channel_id,
          user: command.user_id,
          source: 'slack'
        },
        dependencies: [],
        status: TaskStatus.QUEUED,
        userId,
        source: TaskSource.SLACK,
        createdAt: new Date(),
        retryCount: 0,
        maxRetries: 3
      };

      await taskQueue.enqueue(task);

      return {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Task Created Successfully*\n*ID:* \`${taskId}\`\n*Description:* ${taskDescription}\n*Type:* ${task.type}\n*Priority:* ${Priority[task.priority]}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '👀 View Progress'
                },
                style: 'primary',
                action_id: 'view_task_progress',
                value: taskId
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '📋 List All Tasks'
                },
                action_id: 'list_tasks',
                value: 'all'
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Created by <@${command.user_id}> • ${new Date().toLocaleString()}`
              }
            ]
          }
        ]
      };
      
    } catch (error) {
      console.error('❌ Error creating task:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async handleTaskStatus(
    taskId: string,
    userId: string,
    command: SlackCommand
  ): Promise<SlackResponse> {
    if (!taskId) {
      return {
        response_type: 'ephemeral',
        text: '❌ Please provide a task ID.\n\nExample: `/sdlc status task-123`'
      };
    }

    try {
      // Get task details
      const userTasks = await taskQueue.getUserTasks(userId);
      const task = userTasks.find(t => t.id === taskId);
      
      if (!task) {
        return {
          response_type: 'ephemeral',
          text: `❌ Task \`${taskId}\` not found or you don't have permission to view it.`
        };
      }

      const progressBar = this.createProgressBar(this.getTaskProgress(task));
      const statusEmoji = this.getStatusEmoji(task.status);
      
      return {
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${statusEmoji} *Task Status*\n*ID:* \`${task.id}\`\n*Status:* ${task.status}\n*Progress:* ${progressBar}\n*Description:* ${task.payload.description}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Type:* ${task.type}`
              },
              {
                type: 'mrkdwn',
                text: `*Priority:* ${Priority[task.priority]}`
              },
              {
                type: 'mrkdwn',
                text: `*Created:* ${task.createdAt.toLocaleString()}`
              },
              {
                type: 'mrkdwn',
                text: `*Started:* ${task.startedAt ? task.startedAt.toLocaleString() : 'Not started'}`
              }
            ]
          },
          ...(task.status === TaskStatus.FAILED && task.errorMessage ? [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:* ${task.errorMessage}`
            }
          }] : []),
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🔄 Refresh'
                },
                action_id: 'view_task_progress',
                value: taskId
              },
              ...(task.status === TaskStatus.FAILED ? [{
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🔁 Retry'
                },
                style: 'primary',
                action_id: 'retry_task',
                value: taskId
              }] : []),
              ...(task.status === TaskStatus.PROCESSING ? [{
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🛑 Cancel'
                },
                style: 'danger',
                action_id: 'cancel_task',
                value: taskId
              }] : [])
            ]
          }
        ]
      };
      
    } catch (error) {
      console.error('❌ Error getting task status:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to get task status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async handleListTasks(
    userId: string,
    command: SlackCommand
  ): Promise<SlackResponse> {
    try {
      const tasks = await taskQueue.getUserTasks(userId, 10);
      
      if (tasks.length === 0) {
        return {
          response_type: 'ephemeral',
          text: '📋 No tasks found. Use `/sdlc create [description]` to create your first task!'
        };
      }

      const taskBlocks = tasks.map(task => {
        const statusEmoji = this.getStatusEmoji(task.status);
        const progressBar = this.createProgressBar(this.getTaskProgress(task));
        
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${statusEmoji} *${task.id}*\n${task.payload.description}\n${progressBar} ${task.status}`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '👀 View'
            },
            action_id: 'view_task_details',
            value: task.id
          }
        };
      });

      return {
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📋 *Your Recent Tasks* (${tasks.length})`
            }
          },
          {
            type: 'divider'
          },
          ...taskBlocks,
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Showing ${tasks.length} most recent tasks • Use \`/sdlc status [task-id]\` for details`
              }
            ]
          }
        ]
      };
      
    } catch (error) {
      console.error('❌ Error listing tasks:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to list tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async handleConnectRepo(
    repoArg: string,
    userId: string,
    command: SlackCommand
  ): Promise<SlackResponse> {
    if (!repoArg) {
      return {
        response_type: 'ephemeral',
        text: '❌ Please provide a repository.\n\nExample: `/sdlc connect owner/repo`'
      };
    }

    // For now, just acknowledge the command
    // TODO: Integrate with GitHub repository selection
    return {
      response_type: 'ephemeral',
      text: `🔗 Repository connection for \`${repoArg}\` is not yet implemented. Please use the web dashboard to connect repositories.`
    };
  }

  private static async handleConfig(
    userId: string,
    command: SlackCommand
  ): Promise<SlackResponse> {
    try {
      // Get user's current configuration
      const slackConfig = await getUserSlackConfig(userId);
      
      if (!slackConfig) {
        return {
          response_type: 'ephemeral',
          text: '❌ No Slack configuration found. Please set up Slack integration in the web dashboard first.'
        };
      }

      return {
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `⚙️ *Your SDLC.dev Configuration*\n*Workspace:* ${slackConfig.workspaceName}\n*Default Channel:* ${slackConfig.defaultChannel || 'Not set'}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🌐 Open Dashboard'
                },
                style: 'primary',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=integrations`
              }
            ]
          }
        ]
      };
      
    } catch (error) {
      console.error('❌ Error getting config:', error);
      return {
        response_type: 'ephemeral',
        text: '❌ Failed to get configuration. Please try again.'
      };
    }
  }

  private static async handleHelp(): Promise<SlackResponse> {
    return {
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🤖 *SDLC.dev AI Assistant Commands*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Create Task:*\n`/sdlc create [description]`\nExample: `/sdlc create Fix login bug`'
            },
            {
              type: 'mrkdwn',
              text: '*Check Status:*\n`/sdlc status [task-id]`\nExample: `/sdlc status task-123`'
            },
            {
              type: 'mrkdwn',
              text: '*List Tasks:*\n`/sdlc list`\nShows your recent tasks'
            },
            {
              type: 'mrkdwn',
              text: '*Configuration:*\n`/sdlc config`\nView your settings'
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '💡 *Tips:*\n• Be specific in task descriptions\n• Use keywords like "fix", "add", "update" for better task classification\n• Tasks are processed in priority order'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🌐 Open Dashboard'
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📖 Documentation'
              },
              url: `${process.env.NEXT_PUBLIC_APP_URL}/docs`
            }
          ]
        }
      ]
    };
  }

  // =====================================================
  // INTERACTION HANDLERS
  // =====================================================

  private static async handleViewTaskProgress(taskId: string, userId: string): Promise<SlackResponse> {
    // Same as handleTaskStatus but with different response
    return this.handleTaskStatus(taskId, userId, {} as SlackCommand);
  }

  private static async handleViewTaskDetails(taskId: string, userId: string): Promise<SlackResponse> {
    // Same as handleTaskStatus but with different response
    return this.handleTaskStatus(taskId, userId, {} as SlackCommand);
  }

  private static async handleCancelTask(taskId: string, userId: string): Promise<SlackResponse> {
    try {
      await taskQueue.updateTaskStatus(taskId, TaskStatus.CANCELLED);
      
      return {
        response_type: 'ephemeral',
        text: `🛑 Task \`${taskId}\` has been cancelled.`
      };
      
    } catch (error) {
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to cancel task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async handleRetryTask(taskId: string, userId: string): Promise<SlackResponse> {
    try {
      // Get original task from task store
      const originalTask = taskStore.getTask(taskId);
      
      if (!originalTask) {
        return {
          response_type: 'ephemeral',
          text: `❌ Task \`${taskId}\` not found.`
        };
      }

      // Check if task can be retried
      if (originalTask.status !== 'failed' && originalTask.status !== 'cancelled') {
        return {
          response_type: 'ephemeral',
          text: `❌ Task \`${taskId}\` cannot be retried. Current status: ${originalTask.status}`
        };
      }

      // Reset the existing task for retry instead of creating a new one
      console.log(`🔄 [SLACK] Resetting task ${taskId} for retry...`);
      
      // Find the first failed step to determine restart point
      let firstFailedStepIndex = -1;
      if (originalTask.steps && originalTask.steps.length > 0) {
        firstFailedStepIndex = originalTask.steps.findIndex(step => step.status === 'failed');
      }
      
      // Reset task state for retry
      originalTask.status = 'pending';
      originalTask.startedAt = undefined;
      originalTask.completedAt = undefined;
      originalTask.actualDuration = undefined;
      
      // Reset progress - keep completed steps, reset failed/in-progress steps
      if (originalTask.steps && originalTask.steps.length > 0) {
        originalTask.steps.forEach((step) => {
          if (step.status === 'failed' || step.status === 'in_progress') {
            step.status = 'pending';
            step.startedAt = undefined;
            step.completedAt = undefined;
            step.error = undefined;
            step.result = undefined;
          }
          // Keep completed steps as-is
        });
        
        // Recalculate progress
        const completedSteps = originalTask.steps.filter(s => s.status === 'completed').length;
        originalTask.progress = Math.round((completedSteps / originalTask.steps.length) * 100);
      } else {
        originalTask.progress = 0;
        originalTask.steps = [];
      }

      // Add retry metadata
      const retryCount = ((originalTask as any).retryCount || 0) + 1;
      (originalTask as any).retryCount = retryCount;
      (originalTask as any).lastRetryAt = new Date().toISOString();

      // Update the task in the store
      taskStore.updateTask(originalTask);

      const keptSteps = originalTask.steps?.filter(s => s.status === 'completed').length || 0;
      const retryingSteps = originalTask.steps?.filter(s => s.status === 'pending').length || 0;

      console.log(`✅ [SLACK] Reset task ${taskId} for retry (attempt #${retryCount})`);
      console.log(`📊 [SLACK] Keeping ${keptSteps} completed steps, retrying ${retryingSteps} steps`);
      
      // Use the unified retry API
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/slack/tasks/${taskId}/retry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          return {
            response_type: 'ephemeral',
            text: `🔁 Task \`${taskId}\` has been reset for retry (attempt #${retryCount}).\n` +
                  `📊 Keeping ${keptSteps} completed steps, retrying ${retryingSteps} steps.\n` +
                  `Use \`/sdlc status ${taskId}\` to check progress.`
          };
        } else {
          throw new Error('Retry API call failed');
        }
      } catch (error) {
        console.error('Failed to call retry API:', error);
        return {
          response_type: 'ephemeral',
          text: `🔁 Task retry initiated locally (attempt #${retryCount}).\n` +
                `📊 Keeping ${keptSteps} completed steps, retrying ${retryingSteps} steps.\n` +
                `Use \`/sdlc status ${taskId}\` to check progress.`
        };
      }
      
    } catch (error) {
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to retry task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Enhanced task creation using unified Claude API
  private static async handleCreateTask(
    description: string, 
    type: string, 
    priority: string,
    repository?: string,
    userId?: string
  ): Promise<SlackResponse> {
    try {
      console.log(`🎯 [SLACK] Creating task: ${description}`);
      
      // Use the unified Slack tasks API which already integrates with Claude
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/slack/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          type: type || 'feature',
          priority: priority || 'medium',
          repository: repository || 'auto-detect',
          context: `Task created via Slack by user ${userId || 'unknown'}`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `✅ *Task Created Successfully*\n\n*Description:* ${description}\n*Type:* ${type}\n*Priority:* ${priority}\n*Task ID:* \`${data.task.id}\``
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📊 Check Status' },
                  value: `status_${data.task.id}`,
                  action_id: 'check_task_status'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔗 View Details' },
                  url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                  action_id: 'view_dashboard'
                }
              ]
            }
          ]
        };
      } else {
        throw new Error(data.error || 'Failed to create task');
      }
      
    } catch (error) {
      console.error('[SLACK] Task creation failed:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure Claude AI is properly configured in the Integration Hub.`
      };
    }
  }

  // Enhanced repository analysis using unified Claude API
  private static async handleAnalyzeRepository(repoUrl: string, userId: string): Promise<SlackResponse> {
    try {
      console.log(`🔍 [SLACK] Analyzing repository: ${repoUrl}`);
      
      // Use the unified Claude API for repository analysis
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_repository',
          repositoryUrl: repoUrl,
          forceRefresh: false
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const analysis = data.analysis;
        const cacheStatus = data.cached ? '(cached)' : '(fresh analysis)';
        
        return {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🔍 *Repository Analysis Complete* ${cacheStatus}\n\n*Repository:* ${analysis.repoUrl}\n*Framework:* ${analysis.framework}\n*Language:* ${analysis.primaryLanguage}\n*Files:* ${analysis.fileCount}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Summary:*\n${analysis.summary}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Architecture:* ${analysis.patterns.architecture.join(', ')}\n*Technologies:* ${analysis.patterns.technologies.slice(0, 5).join(', ')}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔧 Generate Code' },
                  value: `generate_code_${repoUrl}`,
                  action_id: 'generate_code_from_analysis'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🐛 Analyze Bugs' },
                  value: `analyze_bugs_${repoUrl}`,
                  action_id: 'analyze_repository_bugs'
                }
              ]
            }
          ]
        };
      } else {
        throw new Error(data.error || 'Repository analysis failed');
      }
      
    } catch (error) {
      console.error('[SLACK] Repository analysis failed:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Repository analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nEnsure the repository URL is valid and you have GitHub integration configured.`
      };
    }
  }

  // Enhanced bug analysis using unified Claude API
  private static async handleAnalyzeBug(
    bugDescription: string, 
    repoUrl?: string, 
    severity: string = 'medium',
    userId?: string
  ): Promise<SlackResponse> {
    try {
      console.log(`🐛 [SLACK] Analyzing bug: ${bugDescription}`);
      
      // Use the unified Claude API for bug analysis
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_bug',
          bugDescription,
          repositoryUrl: repoUrl,
          severity,
          category: 'other', // Default category
          context: `Bug reported via Slack by user ${userId || 'unknown'}`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const analysis = data.analysis;
        const hasRepoContext = data.hasRepositoryContext !== false;
        
        return {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🐛 *Bug Analysis Complete*${hasRepoContext ? ' (with repository context)' : ' (basic analysis)'}\n\n*Bug:* ${analysis.bugReport.description}\n*Severity:* ${analysis.bugReport.severity}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Root Cause Analysis:*\n${analysis.analysis.rootCause}\n\n*Confidence:* ${analysis.analysis.confidence}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Suggested Fixes:*\n${analysis.suggestedFixes.map((fix: any, index: number) => 
                  `${index + 1}. *${fix.approach}* (${fix.priority} priority, ${fix.complexity} complexity)`
                ).join('\n')}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Estimated Effort:* ${analysis.estimatedEffort}\n*Impact:* User ${analysis.impactAssessment.userImpact}, Business ${analysis.impactAssessment.businessImpact}`
              }
            },
            hasRepoContext ? {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔧 Create Fix PR' },
                  value: `create_bugfix_pr_${repoUrl}_${bugDescription.slice(0, 50)}`,
                  action_id: 'create_bugfix_pr'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📋 Create Task' },
                  value: `create_task_bugfix_${bugDescription.slice(0, 50)}`,
                  action_id: 'create_bug_task'
                }
              ]
            } : {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📋 Create Investigation Task' },
                  value: `create_task_investigation_${bugDescription.slice(0, 50)}`,
                  action_id: 'create_investigation_task'
                }
              ]
            }
          ].filter(Boolean)
        };
      } else {
        throw new Error(data.error || 'Bug analysis failed');
      }
      
    } catch (error) {
      console.error('[SLACK] Bug analysis failed:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Bug analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure Claude AI is properly configured.`
      };
    }
  }

  // Enhanced code generation using unified Claude API
  private static async handleGenerateCode(
    description: string,
    repoUrl: string,
    type: string = 'feature',
    userId?: string
  ): Promise<SlackResponse> {
    try {
      console.log(`🔧 [SLACK] Generating code: ${description} for ${repoUrl}`);
      
      // Use the unified Claude API for code generation
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_code',
          repositoryUrl: repoUrl,
          description,
          type,
          requirements: [description],
          context: `Code generation requested via Slack by user ${userId || 'unknown'}`
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const generation = data.generation;
        const hasRepoContext = data.hasRepositoryContext !== false;
        
        return {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🔧 *Code Generation Complete*${hasRepoContext ? ' (with repository context)' : ' (basic generation)'}\n\n*Feature:* ${generation.specification.description}\n*Type:* ${generation.specification.type}\n*Complexity:* ${generation.estimatedComplexity}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Files to Create:* ${generation.implementation.files_to_create.length}\n*Files to Modify:* ${generation.implementation.files_to_modify.length}\n*Tests Added:* ${generation.tests.unit_tests.length} unit, ${generation.tests.integration_tests.length} integration`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Claude's Reasoning:*\n${generation.reasoning.slice(0, 300)}${generation.reasoning.length > 300 ? '...' : ''}`
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Risk Assessment:* ${generation.riskAssessment.level}\n${generation.riskAssessment.concerns.length > 0 ? `*Concerns:* ${generation.riskAssessment.concerns.slice(0, 2).join(', ')}` : '*No major concerns identified*'}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🚀 Create Implementation PR' },
                  value: `create_impl_pr_${repoUrl}_${description.slice(0, 50)}`,
                  action_id: 'create_implementation_pr'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '📋 Create Task' },
                  value: `create_task_${description.slice(0, 50)}`,
                  action_id: 'create_implementation_task'
                },
                {
                  type: 'button',
                  text: { type: 'plain_text', text: '🔍 View Details' },
                  url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
                  action_id: 'view_generation_details'
                }
              ]
            }
          ]
        };
      } else {
        throw new Error(data.error || 'Code generation failed');
      }
      
    } catch (error) {
      console.error('[SLACK] Code generation failed:', error);
      return {
        response_type: 'ephemeral',
        text: `❌ Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure Claude AI and GitHub integration are properly configured.`
      };
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private static async getUserIdBySlackUser(slackUserId: string, teamId: string): Promise<string | null> {
    try {
      const supabase = await createClient();
      
      const { data } = await supabase
        .from('user_integrations')
        .select('user_id, config')
        .eq('integration_type', 'slack')
        .eq('is_active', true);
      
      if (!data) return null;
      
      // Find user by Slack user ID and team ID
      for (const integration of data) {
        const config = integration.config;
        if (config.workspaceId === teamId) {
          // For now, return the user_id (we'd need to store Slack user mapping)
          return integration.user_id;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Error finding user by Slack ID:', error);
      return null;
    }
  }

  private static inferTaskType(description: string): TaskType {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('test') || lowerDesc.includes('spec')) {
      return TaskType.TESTING;
    } else if (lowerDesc.includes('fix') || lowerDesc.includes('bug')) {
      return TaskType.CODE_ANALYSIS;
    } else if (lowerDesc.includes('add') || lowerDesc.includes('implement') || lowerDesc.includes('create')) {
      return TaskType.IMPLEMENTATION;
    } else {
      return TaskType.CODE_ANALYSIS;
    }
  }

  private static inferPriority(description: string): Priority {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('urgent') || lowerDesc.includes('critical') || lowerDesc.includes('asap')) {
      return Priority.URGENT;
    } else if (lowerDesc.includes('important') || lowerDesc.includes('high')) {
      return Priority.HIGH;
    } else if (lowerDesc.includes('low') || lowerDesc.includes('minor')) {
      return Priority.LOW;
    } else {
      return Priority.MEDIUM;
    }
  }

  private static createProgressBar(progress: number): string {
    const total = 10;
    const filled = Math.round((progress / 100) * total);
    const empty = total - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
  }

  private static getTaskProgress(task: Task): number {
    switch (task.status) {
      case TaskStatus.QUEUED:
        return 0;
      case TaskStatus.PROCESSING:
        return 50;
      case TaskStatus.COMPLETED:
        return 100;
      case TaskStatus.FAILED:
        return 0;
      default:
        return 0;
    }
  }

  private static getStatusEmoji(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.QUEUED:
        return '⏳';
      case TaskStatus.PROCESSING:
        return '⚡';
      case TaskStatus.COMPLETED:
        return '✅';
      case TaskStatus.FAILED:
        return '❌';
      case TaskStatus.CANCELLED:
        return '🛑';
      default:
        return '❓';
    }
  }

  /**
   * Send notification to Slack channel
   */
  static async sendNotification(
    userId: string,
    channelId: string,
    message: string,
    blocks?: any[]
  ): Promise<void> {
    try {
      const config = await getUserSlackConfig(userId);
      if (!config) {
        console.log('❌ No Slack config found for user:', userId);
        return;
      }

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId,
          text: message,
          blocks: blocks || undefined
        })
      });

      const data = await response.json();
      
      if (!data.ok) {
        console.error('❌ Slack notification failed:', data.error);
      } else {
        console.log('✅ Slack notification sent successfully');
      }
      
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error);
    }
  }
} 