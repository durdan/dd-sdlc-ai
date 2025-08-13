import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get subsection details
    const { data: subsection, error: subsectionError } = await supabase
      .from('document_subsections')
      .select('document_type, section_id')
      .eq('id', params.id)
      .single()
    
    if (subsectionError || !subsection) {
      return NextResponse.json({ error: 'Subsection not found' }, { status: 404 })
    }
    
    // Check for existing custom prompt
    const { data: existingPrompt, error: promptError } = await supabase
      .from('prompt_templates')
      .select('prompt_content')
      .eq('document_type', subsection.document_type)
      .eq('section_id', subsection.section_id)
      .single()
    
    if (promptError && promptError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching prompt:', promptError)
      return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 })
    }
    
    // If no custom prompt exists, load default from code
    if (!existingPrompt) {
      let defaultPrompt = ''
      
      try {
        switch (subsection.document_type) {
          case 'business':
            const { businessAnalysisSections } = await import('@/lib/business-analysis-sections')
            defaultPrompt = businessAnalysisSections[subsection.section_id]?.prompt || ''
            break
          case 'technical':
            const { techSpecSections } = await import('@/lib/tech-spec-sections')
            defaultPrompt = techSpecSections[subsection.section_id]?.prompt || ''
            break
          case 'ux':
            const { uxDesignSections } = await import('@/lib/ux-design-sections')
            defaultPrompt = uxDesignSections[subsection.section_id]?.prompt || ''
            break
          case 'mermaid':
            const { architectureSections } = await import('@/lib/architecture-sections')
            defaultPrompt = architectureSections[subsection.section_id]?.prompt || ''
            break
          case 'functional':
            const { functionalSpecSections } = await import('@/lib/functional-spec-sections')
            defaultPrompt = functionalSpecSections[subsection.section_id]?.prompt || ''
            break
        }
      } catch (error) {
        console.error('Error loading default prompt:', error)
      }
      
      return NextResponse.json({ 
        prompt_content: defaultPrompt,
        is_default: true 
      })
    }
    
    return NextResponse.json({ 
      prompt_content: existingPrompt.prompt_content,
      is_default: false 
    })
    
  } catch (error) {
    console.error('Error in prompt GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { prompt_content, document_type, section_id } = body
    
    // Get subsection details
    const { data: subsection, error: subsectionError } = await supabase
      .from('document_subsections')
      .select('section_name')
      .eq('id', params.id)
      .single()
    
    if (subsectionError || !subsection) {
      return NextResponse.json({ error: 'Subsection not found' }, { status: 404 })
    }
    
    // Check if prompt template already exists
    const { data: existingPrompt } = await supabase
      .from('prompt_templates')
      .select('id')
      .eq('document_type', document_type)
      .eq('section_id', section_id)
      .single()
    
    if (existingPrompt) {
      // Update existing prompt
      const { error: updateError } = await supabase
        .from('prompt_templates')
        .update({
          prompt_content,
          section_name: subsection.section_name,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', existingPrompt.id)
      
      if (updateError) {
        console.error('Error updating prompt:', updateError)
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 })
      }
    } else {
      // Create new prompt template
      const { error: insertError } = await supabase
        .from('prompt_templates')
        .insert({
          name: `${subsection.section_name} - Custom`,
          document_type,
          section_id,
          section_name: subsection.section_name,
          parent_document_type: document_type,
          prompt_content,
          is_active: true,
          created_by: user.id,
          updated_by: user.id
        })
      
      if (insertError) {
        console.error('Error creating prompt:', insertError)
        return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in prompt PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}