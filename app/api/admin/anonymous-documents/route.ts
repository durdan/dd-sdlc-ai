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

    // Get anonymous documents using the function we created
    const { data: documents, error: docsError } = await adminSupabase
      .rpc('get_admin_anonymous_projects')

    if (docsError) {
      console.error('Error fetching anonymous documents:', docsError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

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
      if (doc.documents) {
        if (doc.documents.business) stats.business_docs++
        if (doc.documents.functional) stats.functional_docs++
        if (doc.documents.technical) stats.technical_docs++
        if (doc.documents.ux) stats.ux_docs++
        if (doc.documents.mermaid) stats.architecture_docs++
      }
      
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