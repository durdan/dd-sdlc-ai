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

    // Fetch all projects with their documents using the view we created
    const { data: projects, error: projectsError } = await adminSupabase
      .from('admin_all_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Fetch documents for each project
    const projectsWithDocs = await Promise.all(
      (projects || []).map(async (project) => {
        const { data: docs } = await adminSupabase
          .from('documents')
          .select('document_type, content')
          .eq('project_id', project.id)

        const documents: Record<string, string> = {}
        docs?.forEach(doc => {
          const key = doc.document_type === 'business_analysis' ? 'business' :
                     doc.document_type === 'functional_spec' ? 'functional' :
                     doc.document_type === 'technical_spec' ? 'technical' :
                     doc.document_type === 'ux_spec' ? 'ux' :
                     doc.document_type === 'architecture' ? 'mermaid' :
                     doc.document_type
          documents[key] = doc.content
        })

        return {
          ...project,
          documents
        }
      })
    )

    // Calculate statistics
    const stats = {
      total_projects: projectsWithDocs.length,
      anonymous_projects: projectsWithDocs.filter(p => p.project_type === 'anonymous').length,
      authenticated_projects: projectsWithDocs.filter(p => p.project_type === 'authenticated').length,
      business_docs: 0,
      functional_docs: 0,
      technical_docs: 0,
      ux_docs: 0,
      architecture_docs: 0,
      projects_today: 0,
      projects_this_week: 0,
      unique_users: new Set(projectsWithDocs.filter(p => p.user_id).map(p => p.user_id)).size,
      unique_anonymous_sessions: new Set(projectsWithDocs.filter(p => p.session_id).map(p => p.session_id)).size
    }

    // Count document types and recent activity
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    projectsWithDocs.forEach((project) => {
      const createdAt = new Date(project.created_at)
      
      if (createdAt >= todayStart) {
        stats.projects_today++
      }
      if (createdAt >= weekAgo) {
        stats.projects_this_week++
      }
      
      if (project.documents) {
        if (project.documents.business) stats.business_docs++
        if (project.documents.functional) stats.functional_docs++
        if (project.documents.technical) stats.technical_docs++
        if (project.documents.ux) stats.ux_docs++
        if (project.documents.mermaid) stats.architecture_docs++
      }
    })

    return NextResponse.json({
      success: true,
      projects: projectsWithDocs,
      stats
    })
  } catch (error) {
    console.error('Error in all projects API:', error)
    return NextResponse.json(
      { error: 'Failed to get projects' },
      { status: 500 }
    )
  }
}