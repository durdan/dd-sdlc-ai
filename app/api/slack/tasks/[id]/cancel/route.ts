import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import taskStore from '@/lib/task-store'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: taskId } = await params

    console.log(`🛑 Attempting to cancel task: ${taskId}`)

    // Get task from store
    const task = taskStore.getTask(taskId)
    
    if (!task) {
      console.log(`❌ Task ${taskId} not found for cancellation`)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this task
    const userTasks = taskStore.getUserTasks(user.id)
    const hasAccess = userTasks.some(userTask => userTask.id === taskId)
    
    if (!hasAccess) {
      console.log(`🚫 Access denied for canceling task ${taskId} to user ${user.id}`)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if task can be cancelled
    if (task.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel completed task' }, { status: 400 })
    }

    if (task.status === 'failed') {
      return NextResponse.json({ error: 'Cannot cancel failed task' }, { status: 400 })
    }

    if (task.status === 'cancelled') {
      return NextResponse.json({ error: 'Task is already cancelled' }, { status: 400 })
    }

    // Cancel the task
    task.status = 'cancelled'
    task.completedAt = new Date().toISOString()
    
    // Add cancellation step
    if (!task.steps) task.steps = []
    task.steps.push({
      id: `${task.id}-cancelled`,
      taskId: task.id,
      stepNumber: task.steps.length + 1,
      type: 'review',
      status: 'completed',
      title: '🛑 Task cancelled by user',
      description: 'Task execution was cancelled by user request',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    })

    // Update progress to show cancellation
    task.progress = task.progress || 0 // Keep current progress, don't reset

    // Move to completed store (cancelled tasks are considered "completed")
    taskStore.completeTask(task.id)
    
    console.log(`✅ Task ${taskId} cancelled successfully`)

    return NextResponse.json({
      message: 'Task cancelled successfully',
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        completed_at: task.completedAt
      }
    })

  } catch (error) {
    console.error('Error cancelling task:', error)
    return NextResponse.json({ error: 'Failed to cancel task' }, { status: 500 })
  }
} 