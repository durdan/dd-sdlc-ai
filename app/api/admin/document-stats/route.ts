import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DOCUMENT_TYPES = {
  'business_analysis': 'Business Analysis',
  'functional_spec': 'Functional Spec',
  'technical_spec': 'Technical Spec',
  'ux_spec': 'UX Spec',
  'architecture': 'Architecture/Mermaid',
  'comprehensive': 'Comprehensive',
  'wireframe': 'Wireframe',
  'coding_assistant': 'AI Coding Prompt',
  'test_spec': 'Test Spec',
  'meeting_transcript': 'Meeting Transcript'
}

export async function GET() {
  try {
    // Use service role client to access all data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get document stats by type
    const documentStats: Record<string, number> = {}
    let totalDocuments = 0

    for (const docType of Object.keys(DOCUMENT_TYPES)) {
      const { count } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('document_type', docType)
      
      documentStats[docType] = count || 0
      totalDocuments += count || 0
    }

    // Get stats for logged-in users
    const { count: totalProjects } = await supabase
      .from('sdlc_projects')
      .select('id', { count: 'exact', head: true })

    // Get unique users from projects
    const { data: projectUsers } = await supabase
      .from('sdlc_projects')
      .select('user_id')
      .not('user_id', 'is', null)
    
    const uniqueLoggedInUsers = new Set(projectUsers?.map(p => p.user_id) || []).size

    // Get anonymous activity stats
    const { count: anonymousGenerations } = await supabase
      .from('anonymous_analytics')
      .select('id', { count: 'exact', head: true })
      .in('action_type', ['document_generation', 'diagram_generation', 'meeting_transcript_generation'])

    // Get page visits
    const { count: pageVisits } = await supabase
      .from('anonymous_analytics')
      .select('id', { count: 'exact', head: true })
      .eq('action_type', 'page_visit')

    // Get recent document generations (last 20)
    const { data: recentDocs } = await supabase
      .from('documents')
      .select(`
        id,
        document_type,
        title,
        created_at,
        sdlc_projects!inner(
          title,
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get recent anonymous generations
    const { data: recentAnonymous } = await supabase
      .from('anonymous_analytics')
      .select('action_type, action_data, user_agent, timestamp')
      .in('action_type', ['document_generation', 'diagram_generation', 'meeting_transcript_generation'])
      .order('timestamp', { ascending: false })
      .limit(10)

    // Format recent generations
    const recentGenerations = [
      ...(recentDocs || []).map(doc => ({
        user_type: 'logged_in',
        user_id: doc.sdlc_projects?.user_id,
        document_type: doc.document_type,
        document_name: DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES] || doc.document_type,
        project_title: doc.sdlc_projects?.title || doc.title,
        created_at: doc.created_at
      })),
      ...(recentAnonymous || []).map(gen => ({
        user_type: 'anonymous',
        user_id: null,
        document_type: gen.action_data?.documentType || gen.action_type,
        document_name: gen.action_data?.documentName || gen.action_type,
        project_title: gen.action_data?.input?.substring(0, 50) || 'Anonymous Generation',
        user_agent: gen.user_agent,
        created_at: gen.timestamp
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 20)

    // Calculate trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const dailyStats = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const { count: dayDocs } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', `${dateStr}T00:00:00`)
        .lt('created_at', `${dateStr}T23:59:59`)
      
      dailyStats.push({
        date: dateStr,
        count: dayDocs || 0
      })
    }

    return NextResponse.json({
      overview: {
        totalDocuments,
        totalProjects: totalProjects || 0,
        uniqueLoggedInUsers,
        anonymousGenerations: anonymousGenerations || 0,
        pageVisits: pageVisits || 0
      },
      documentsByType: documentStats,
      recentGenerations,
      dailyTrends: dailyStats.reverse(),
      documentTypeLabels: DOCUMENT_TYPES
    })
  } catch (error) {
    console.error('Error fetching document stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document statistics' },
      { status: 500 }
    )
  }
}