import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import taskStore from '@/lib/task-store'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log(`🔍 Debug: Checking all task storage for user ${user.id}`)

    // Check TaskStore (in-memory)
    const memoryTasks = taskStore.getUserTasks(user.id)
    const memoryStats = taskStore.getStats()

    // Check enhanced_claude_tasks table
    const { data: enhancedTasks, error: enhancedError } = await supabase
      .from('enhanced_claude_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Check sdlc_ai_task_executions table
    const { data: agenticTasks, error: agenticError } = await supabase
      .from('sdlc_ai_task_executions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Check task_queue table
    const { data: queueTasks, error: queueError } = await supabase
      .from('task_queue')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Check comprehensive_development_results table
    const { data: devResults, error: devError } = await supabase
      .from('comprehensive_development_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const debugInfo = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      memory_store: {
        task_count: memoryTasks.length,
        stats: memoryStats,
        tasks: memoryTasks.map(t => ({
          id: t.id,
          type: t.type,
          status: t.status,
          description: t.description,
          created_at: t.createdAt
        }))
      },
      database_tables: {
        enhanced_claude_tasks: {
          count: enhancedTasks?.length || 0,
          error: enhancedError?.message,
          tasks: enhancedTasks?.slice(0, 5).map(t => ({
            id: t.id,
            type: t.type,
            status: t.status,
            description: t.description,
            created_at: t.created_at
          })) || []
        },
        sdlc_ai_task_executions: {
          count: agenticTasks?.length || 0,
          error: agenticError?.message,
          tasks: agenticTasks?.slice(0, 5).map(t => ({
            id: t.id,
            task_type: t.task_type,
            status: t.status,
            description: t.description,
            created_at: t.created_at
          })) || []
        },
        task_queue: {
          count: queueTasks?.length || 0,
          error: queueError?.message,
          tasks: queueTasks?.slice(0, 5).map(t => ({
            task_id: t.task_id,
            task_type: t.task_type,
            status: t.status,
            created_at: t.created_at
          })) || []
        },
        comprehensive_development_results: {
          count: devResults?.length || 0,
          error: devError?.message,
          results: devResults?.slice(0, 5).map(r => ({
            task_id: r.task_id,
            development_type: r.development_type,
            quality_score: r.quality_score,
            created_at: r.created_at
          })) || []
        }
      },
      total_database_tasks: (enhancedTasks?.length || 0) + (agenticTasks?.length || 0) + (queueTasks?.length || 0) + (devResults?.length || 0)
    }

    console.log(`🔍 Debug summary for user ${user.id}:`, {
      memory_tasks: memoryTasks.length,
      enhanced_tasks: enhancedTasks?.length || 0,
      agentic_tasks: agenticTasks?.length || 0,
      queue_tasks: queueTasks?.length || 0,
      dev_results: devResults?.length || 0
    })

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 })
  }
} 