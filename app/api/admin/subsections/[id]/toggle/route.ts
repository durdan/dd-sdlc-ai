import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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
    const { is_active } = body
    
    // Update subsection active status
    const { data, error } = await supabase
      .from('document_subsections')
      .update({ 
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error toggling subsection:', error)
      return NextResponse.json({ error: 'Failed to update subsection' }, { status: 500 })
    }
    
    return NextResponse.json({ subsection: data })
    
  } catch (error) {
    console.error('Error in subsection toggle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}