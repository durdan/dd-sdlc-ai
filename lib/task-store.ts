// Unified task management for Claude integrations

export interface ExecutionStep {
  id: string
  taskId: string
  stepNumber: number
  type: 'analysis' | 'planning' | 'code_generation' | 'file_creation' | 'file_modification' | 'testing' | 'commit' | 'pull_request' | 'review'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  title: string
  description: string
  startedAt?: string
  completedAt?: string
  result?: any
  error?: string
  metadata?: Record<string, any>
}

export interface AgenticTask {
  id: string
  type: 'bug_fix' | 'feature' | 'review' | 'refactoring' | 'testing'
  status: 'pending' | 'analyzing' | 'planning' | 'executing' | 'reviewing' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  repository: {
    owner: string
    name: string
    branch: string
  }
  githubIssueUrl?: string
  context?: string
  requirements?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  actualDuration?: number
}

export interface StoredTask extends AgenticTask {
  steps?: ExecutionStep[]
  progress?: number
  result?: any
  userId?: string // Add explicit user ID for proper task ownership
}

// Global task store for sharing between API routes
class TaskStore {
  private activeTasks = new Map<string, StoredTask>()
  private completedTasks = new Map<string, StoredTask>()

  // Add task to active store
  addActiveTask(task: StoredTask): void {
    console.log(`📝 TaskStore: Adding active task ${task.id}`)
    this.activeTasks.set(task.id, task)
    this.logStoreState()
  }

  // Get task by ID from either store
  getTask(taskId: string): StoredTask | undefined {
    console.log(`🔍 TaskStore: Looking for task ${taskId}`)
    const activeTask = this.activeTasks.get(taskId)
    if (activeTask) {
      console.log(`✅ TaskStore: Found active task ${taskId}`)
      return activeTask
    }
    
    const completedTask = this.completedTasks.get(taskId)
    if (completedTask) {
      console.log(`✅ TaskStore: Found completed task ${taskId}`)
      return completedTask
    }

    console.log(`❌ TaskStore: Task ${taskId} not found`)
    this.logStoreState()
    return undefined
  }

  // Get all tasks for a user
  getUserTasks(userId: string): StoredTask[] {
    console.log(`📋 TaskStore: Getting tasks for user ${userId}`)
    const userTasks: StoredTask[] = []
    
    // Get active tasks
    for (const task of this.activeTasks.values()) {
      if (this.isUserTask(task, userId)) {
        userTasks.push(task)
      }
    }
    
    // Get completed tasks
    for (const task of this.completedTasks.values()) {
      if (this.isUserTask(task, userId)) {
        userTasks.push(task)
      }
    }
    
    const sortedTasks = userTasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    console.log(`📊 TaskStore: Found ${sortedTasks.length} tasks for user ${userId}`)
    return sortedTasks
  }

  // Update task in store
  updateTask(task: StoredTask): void {
    console.log(`🔄 TaskStore: Updating task ${task.id} with status ${task.status}`)
    
    if (this.activeTasks.has(task.id)) {
      this.activeTasks.set(task.id, task)
    } else if (this.completedTasks.has(task.id)) {
      this.completedTasks.set(task.id, task)
    } else {
      console.log(`⚠️  TaskStore: Task ${task.id} not found for update, adding to active`)
      this.activeTasks.set(task.id, task)
    }
  }

  // Move task from active to completed
  completeTask(taskId: string, result?: any, error?: string): void {
    console.log(`✅ TaskStore: Completing task ${taskId}`)
    const task = this.activeTasks.get(taskId)
    if (task) {
      if (result) task.result = result
      if (error) task.status = 'failed'
      else if (task.status !== 'cancelled') task.status = 'completed'
      
      this.completedTasks.set(taskId, task)
      this.activeTasks.delete(taskId)
      console.log(`✅ TaskStore: Task ${taskId} moved to completed`)
    } else {
      console.log(`⚠️  TaskStore: Task ${taskId} not found in active tasks`)
    }
    this.logStoreState()
  }

  // Delete task completely from both stores
  deleteTask(taskId: string): void {
    console.log(`🗑️ TaskStore: Deleting task ${taskId}`)
    
    const wasInActive = this.activeTasks.has(taskId)
    const wasInCompleted = this.completedTasks.has(taskId)
    
    this.activeTasks.delete(taskId)
    this.completedTasks.delete(taskId)
    
    if (wasInActive || wasInCompleted) {
      console.log(`✅ TaskStore: Task ${taskId} deleted successfully`)
    } else {
      console.log(`⚠️  TaskStore: Task ${taskId} not found for deletion`)
    }
    
    this.logStoreState()
  }

  // Check if task belongs to user
  private isUserTask(task: StoredTask, userId: string): boolean {
    // If task has explicit userId, use that
    if (task.userId) {
      return task.userId === userId
    }
    
    // Fallback: check if task ID contains user ID (for backward compatibility)
    return task.id.includes(userId)
  }

  // Debug logging
  private logStoreState(): void {
    console.log(`📊 TaskStore State:`)
    console.log(`   Active tasks: ${this.activeTasks.size}`)
    console.log(`   Completed tasks: ${this.completedTasks.size}`)
    console.log(`   Active task IDs: [${Array.from(this.activeTasks.keys()).join(', ')}]`)
    console.log(`   Completed task IDs: [${Array.from(this.completedTasks.keys()).join(', ')}]`)
  }

  // Get store statistics
  getStats() {
    return {
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.size,
      totalTasks: this.activeTasks.size + this.completedTasks.size,
      activeTaskIds: Array.from(this.activeTasks.keys()),
      completedTaskIds: Array.from(this.completedTasks.keys())
    }
  }

  // Clear all tasks (for cleanup)
  clearAll(): void {
    console.log('🗑️ TaskStore: Clearing all tasks')
    this.activeTasks.clear()
    this.completedTasks.clear()
  }

  // Get all tasks (for migration/export)
  getAllTasks(): StoredTask[] {
    return [
      ...Array.from(this.activeTasks.values()),
      ...Array.from(this.completedTasks.values())
    ]
  }
}

// Singleton instance
const globalTaskStore = (() => {
  if (!(global as any).taskStoreInstance) {
    console.log('🚀 TaskStore: Creating new global instance')
    ;(global as any).taskStoreInstance = new TaskStore()
  }
  return (global as any).taskStoreInstance as TaskStore
})()

export { globalTaskStore }
export default globalTaskStore 