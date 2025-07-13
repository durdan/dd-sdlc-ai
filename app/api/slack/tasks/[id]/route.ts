import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import taskStore from '@/lib/task-store'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id: taskId } = await params

    console.log(`🔍 Looking for task: ${taskId}`)

    // Get real task data from the shared task store
    const task = taskStore.getTask(taskId)
    
    if (!task) {
      console.log(`❌ Task ${taskId} not found in store`)
      console.log(`📊 Current store stats:`, taskStore.getStats())
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // More flexible access control - check if task belongs to user
    const userTasks = taskStore.getUserTasks(user.id)
    const hasAccess = userTasks.some(userTask => userTask.id === taskId)
    
    if (!hasAccess) {
      console.log(`🚫 Access denied for task ${taskId} to user ${user.id}`)
      console.log(`📋 User has ${userTasks.length} tasks, but ${taskId} is not among them`)
      console.log(`🔍 Task details:`, { 
        taskId: task.id, 
        taskCreatedAt: task.createdAt,
        taskType: task.type,
        taskDescription: task.description
      })
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log(`📋 Retrieved task details for: ${taskId}`)
    console.log(`📊 Task status: ${task.status}`)
    console.log(`🎯 Task steps: ${task.steps ? task.steps.length : 0}`)

    // Calculate progress based on step completion
    let progress = task.progress || 0
    if (task.steps && task.steps.length > 0) {
      const completedSteps = task.steps.filter(step => step.status === 'completed').length
      progress = Math.round((completedSteps / task.steps.length) * 100)
    } else {
      // Default progress based on status
      switch (task.status) {
        case 'pending': progress = 0; break
        case 'analyzing': progress = 20; break
        case 'planning': progress = 40; break
        case 'executing': progress = 60; break
        case 'reviewing': progress = 80; break
        case 'completed': progress = 100; break
        case 'failed': progress = 0; break
      }
    }

    // Format task for frontend
    const formattedTask = {
      ...task,
      progress,
      steps: task.steps?.map(step => ({
        id: step.id,
        name: step.title || step.type,
        status: step.status === 'in_progress' ? 'running' : step.status,
        description: step.description,
        duration: step.completedAt && step.startedAt ? 
          Math.round((new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()) / 1000) : 
          undefined,
        output: step.result ? JSON.stringify(step.result, null, 2) : undefined
      })) || []
    }

    return NextResponse.json({ task: formattedTask })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
} 