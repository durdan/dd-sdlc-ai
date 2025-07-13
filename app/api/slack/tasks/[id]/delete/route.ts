import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import taskStore from '@/lib/task-store'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: taskId } = await params

    console.log(`🗑️ Attempting to delete task: ${taskId}`)

    // Get task from store
    const task = taskStore.getTask(taskId)
    
    if (!task) {
      console.log(`❌ Task ${taskId} not found for deletion`)
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this task
    const userTasks = taskStore.getUserTasks(user.id)
    const hasAccess = userTasks.some(userTask => userTask.id === taskId)
    
    if (!hasAccess) {
      console.log(`🚫 Access denied for deleting task ${taskId} to user ${user.id}`)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if task can be deleted (prevent deletion of running tasks)
    if (task.status === 'pending' || task.status === 'analyzing' || task.status === 'planning' || task.status === 'executing' || task.status === 'reviewing') {
      return NextResponse.json({ 
        error: 'Cannot delete running task. Please cancel it first.' 
      }, { status: 400 })
    }

    // Delete the task from store
    taskStore.deleteTask(taskId)
    
    console.log(`✅ Task ${taskId} deleted successfully`)

    return NextResponse.json({
      message: 'Task deleted successfully',
      taskId: taskId
    })

  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
} 