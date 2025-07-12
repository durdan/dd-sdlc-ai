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

    // Get task from shared store
    const task = taskStore.getTask(taskId)
    
    if (!task) {
      console.log(`❌ Task ${taskId} not found for cancellation`)
      console.log(`📊 Current store stats:`, taskStore.getStats())
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this task
    if (!task.id.includes(user.id) && !task.id.includes('user-')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if task can be cancelled
    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return NextResponse.json({ error: `Task is already ${task.status} and cannot be cancelled` }, { status: 400 })
    }

    console.log(`🚫 Cancelling task: ${taskId} for user: ${user.id}`)
    console.log(`📊 Task status before cancellation: ${task.status}`)

    // Update task status to cancelled
    task.status = 'cancelled'
    task.completedAt = new Date().toISOString()
    task.actualDuration = Date.now() - new Date(task.startedAt || task.createdAt).getTime()

    // If task has steps, mark any running steps as cancelled
    if (task.steps) {
      task.steps = task.steps.map(step => {
        if (step.status === 'in_progress' || step.status === 'pending') {
          return { ...step, status: 'skipped' }
        }
        return step
      })
    }

    // Move task to completed using the shared store
    taskStore.completeTask(taskId)

    console.log(`✅ Task ${taskId} cancelled successfully`)

    return NextResponse.json({ 
      message: 'Task cancelled successfully',
      taskId,
      task: {
        id: task.id,
        status: task.status,
        completedAt: task.completedAt
      }
    })
  } catch (error) {
    console.error('Error cancelling task:', error)
    return NextResponse.json({ error: 'Failed to cancel task' }, { status: 500 })
  }
} 