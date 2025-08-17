import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin check
    let isAdmin = false
    if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.email === 'durgeshdandotiya@gmail.com') {
      isAdmin = true
    } else {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
        isAdmin = true
      }
    }
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Create SERVICE ROLE CLIENT for admin operations
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get anonymous documents directly from the table
    const { data: anonymousData, error: docsError } = await adminSupabase
      .from('anonymous_analytics')
      .select('*')
      .in('action_type', ['document_generation', 'diagram_generation', 'meeting_transcript_generation'])
      .order('timestamp', { ascending: false })
      .limit(100)

    if (docsError) {
      console.error('Error fetching anonymous documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Transform the data to match expected format
    const documents = anonymousData?.map(item => ({
      id: item.id,
      session_id: item.session_id,
      action_type: item.action_type,
      created_at: item.timestamp,
      documents: item.action_data?.documents || {},
      input: item.action_data?.input || '',
      user_agent: item.user_agent
    })) || []

    // Calculate statistics
    const stats = {
      total_anonymous_projects: documents?.length || 0,
      business_docs: 0,
      functional_docs: 0,
      technical_docs: 0,
      ux_docs: 0,
      architecture_docs: 0,
      unique_sessions: new Set(documents?.map((d: any) => d.session_id) || []).size,
      recent_activity: 0
    }

    // Count document types and recent activity
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    documents?.forEach((doc: any) => {
      // Check action_data for document types
      const actionData = doc.documents || {}
      if (actionData.business || actionData.businessAnalysis) stats.business_docs++
      if (actionData.functional || actionData.functionalSpec) stats.functional_docs++
      if (actionData.technical || actionData.technicalSpec) stats.technical_docs++
      if (actionData.ux || actionData.uxSpec) stats.ux_docs++
      if (actionData.mermaid || actionData.architecture || actionData.mermaidDiagrams) stats.architecture_docs++
      
      if (new Date(doc.created_at) > twentyFourHoursAgo) {
        stats.recent_activity++
      }
    })

    return NextResponse.json({
      success: true,
      documents: documents || [],
      stats
    })
  } catch (error) {
    console.error('Error in anonymous documents API:', error)
    return NextResponse.json(
      { error: 'Failed to get anonymous documents' },
      { status: 500 }
    )
  }
}