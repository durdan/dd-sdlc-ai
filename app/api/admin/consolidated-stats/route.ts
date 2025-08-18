import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DOCUMENT_TYPES = {
  'business_analysis': { label: 'Business Analysis', color: 'blue' },
  'functional_spec': { label: 'Functional Spec', color: 'green' },
  'technical_spec': { label: 'Technical Spec', color: 'purple' },
  'ux_spec': { label: 'UX Spec', color: 'pink' },
  'architecture': { label: 'Architecture', color: 'orange' },
  'comprehensive': { label: 'Comprehensive', color: 'indigo' },
  'wireframe': { label: 'Wireframe', color: 'teal' },
  'coding_assistant': { label: 'AI Coding', color: 'yellow' },
  'test_spec': { label: 'Test Spec', color: 'red' },
  'meeting_transcript': { label: 'Meeting Notes', color: 'amber' }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current date info
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekAgo = new Date(now.setDate(now.getDate() - 7))
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1))

    // === OVERALL STATISTICS ===
    const { count: totalProjects } = await supabase
      .from('sdlc_projects')
      .select('id', { count: 'exact', head: true })

    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })

    const { data: users } = await supabase
      .from('sdlc_projects')
      .select('user_id')
      .not('user_id', 'is', null)
    
    const uniqueUsers = new Set(users?.map(u => u.user_id) || []).size

    // === DOCUMENTS BY TYPE ===
    const documentsByType: Record<string, number> = {}
    for (const docType of Object.keys(DOCUMENT_TYPES)) {
      const { count } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('document_type', docType)
      documentsByType[docType] = count || 0
    }

    // === TODAY'S ACTIVITY ===
    const { count: todayProjects } = await supabase
      .from('sdlc_projects')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    const { count: todayDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    // === WEEKLY TRENDS ===
    const weeklyTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const { count: projects } = await supabase
        .from('sdlc_projects')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateStr)
        .lt('created_at', nextDate.toISOString().split('T')[0])

      const { count: documents } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateStr)
        .lt('created_at', nextDate.toISOString().split('T')[0])

      weeklyTrends.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        projects: projects || 0,
        documents: documents || 0
      })
    }

    // === RECENT ACTIVITY (Combined) ===
    const { data: recentProjects } = await supabase
      .from('sdlc_projects')
      .select(`
        id,
        title,
        user_id,
        created_at,
        documents(
          document_type,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: recentAnonymous } = await supabase
      .from('anonymous_analytics')
      .select('*')
      .in('action_type', ['document_generation', 'diagram_generation', 'meeting_transcript_generation'])
      .order('timestamp', { ascending: false })
      .limit(10)

    // Format recent activity
    const recentActivity = [
      ...(recentProjects || []).map(p => ({
        type: 'project',
        title: p.title,
        user_id: p.user_id,
        user_type: 'logged_in',
        documents: p.documents?.length || 0,
        created_at: p.created_at
      })),
      ...(recentAnonymous || []).map(a => ({
        type: 'anonymous',
        title: a.action_data?.input?.substring(0, 50) || 'Anonymous Generation',
        user_id: null,
        user_type: 'anonymous',
        action: a.action_type,
        created_at: a.timestamp
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 15)

    // === ANONYMOUS USAGE STATS ===
    const { count: anonymousPageViews } = await supabase
      .from('anonymous_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action_type', 'page_visit')

    const { count: anonymousGenerations } = await supabase
      .from('anonymous_analytics')
      .select('id', { count: 'exact', head: true })
      .in('action_type', ['document_generation', 'diagram_generation', 'meeting_transcript_generation'])

    // === TOP USERS ===
    const { data: topUsers } = await supabase
      .from('sdlc_projects')
      .select('user_id')
      .not('user_id', 'is', null)

    const userCounts: Record<string, number> = {}
    topUsers?.forEach(u => {
      userCounts[u.user_id] = (userCounts[u.user_id] || 0) + 1
    })

    const topUsersList = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, projectCount: count }))

    return NextResponse.json({
      overview: {
        totalProjects: totalProjects || 0,
        totalDocuments: totalDocuments || 0,
        uniqueUsers,
        todayProjects: todayProjects || 0,
        todayDocuments: todayDocuments || 0,
        anonymousPageViews: anonymousPageViews || 0,
        anonymousGenerations: anonymousGenerations || 0
      },
      documentTypes: Object.entries(documentsByType).map(([type, count]) => ({
        type,
        label: DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES]?.label || type,
        color: DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES]?.color || 'gray',
        count
      })),
      weeklyTrends,
      recentActivity,
      topUsers: topUsersList
    })
  } catch (error) {
    console.error('Error fetching consolidated stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}