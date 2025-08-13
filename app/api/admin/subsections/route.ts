import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get document type from query params
    const documentType = req.nextUrl.searchParams.get('documentType') || 'business'
    
    // Fetch subsections
    const { data: subsections, error } = await supabase
      .from('document_subsections')
      .select('*')
      .eq('document_type', documentType)
      .order('sort_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching subsections:', error)
      return NextResponse.json({ error: 'Failed to fetch subsections' }, { status: 500 })
    }
    
    // For each subsection, check if it has a custom prompt
    const transformedSubsections = await Promise.all(
      (subsections || []).map(async (subsection) => {
        try {
          // Check for custom prompt
          const { data: promptData } = await supabase
            .from('prompt_templates')
            .select('id, prompt_content')
            .eq('document_type', subsection.document_type)
            .eq('section_id', subsection.section_id)
            .maybeSingle() // Use maybeSingle instead of single to avoid error when no row exists
          
          const hasCustomPrompt = !!(promptData?.prompt_content && promptData.prompt_content.trim() !== '')
          
          return {
            ...subsection,
            has_custom_prompt: hasCustomPrompt
          }
        } catch (error) {
          console.warn(`Error checking prompt for ${subsection.section_id}:`, error)
          return {
            ...subsection,
            has_custom_prompt: false
          }
        }
      })
    )
    
    return NextResponse.json({ 
      subsections: transformedSubsections,
      count: transformedSubsections.length 
    })
    
  } catch (error) {
    console.error('Error in subsections GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!userRole || !['admin', 'manager'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const body = await req.json()
    const {
      document_type,
      section_id,
      section_name,
      icon,
      description,
      detailed_description,
      best_for,
      output_sections,
      sort_order
    } = body
    
    // Insert new subsection
    const { data, error } = await supabase
      .from('document_subsections')
      .insert({
        document_type,
        section_id,
        section_name,
        icon: icon || '📄',
        description,
        detailed_description,
        best_for: best_for || [],
        output_sections: output_sections || [],
        sort_order: sort_order || 999,
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating subsection:', error)
      return NextResponse.json({ error: 'Failed to create subsection' }, { status: 500 })
    }
    
    return NextResponse.json({ subsection: data })
    
  } catch (error) {
    console.error('Error in subsections POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}