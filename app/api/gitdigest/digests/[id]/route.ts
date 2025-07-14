import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    // Get specific digest
    const { data: digest, error } = await supabase
      .from('repo_digests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
      }
      console.error('Error fetching digest:', error)
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 })
    }

    // Log analytics event
    await supabase
      .from('digest_analytics')
      .insert({
        repo_digest_id: id,
        user_id: user.id,
        event_type: 'view',
        event_data: {
          view_source: 'api'
        }
      })

    return NextResponse.json({ digest })

  } catch (error) {
    console.error('Error in digest GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const updateData = await request.json()

    // Validate that user owns the digest
    const { data: existingDigest, error: fetchError } = await supabase
      .from('repo_digests')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
      }
      console.error('Error fetching digest for update:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 })
    }

    // Update digest
    const { data: updatedDigest, error } = await supabase
      .from('repo_digests')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating digest:', error)
      return NextResponse.json({ error: 'Failed to update digest' }, { status: 500 })
    }

    return NextResponse.json({
      digest: updatedDigest,
      message: 'Digest updated successfully'
    })

  } catch (error) {
    console.error('Error in digest PUT endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    // Validate that user owns the digest
    const { data: existingDigest, error: fetchError } = await supabase
      .from('repo_digests')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
      }
      console.error('Error fetching digest for deletion:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 })
    }

    // Delete digest (this will cascade to related tables)
    const { error } = await supabase
      .from('repo_digests')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting digest:', error)
      return NextResponse.json({ error: 'Failed to delete digest' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Digest deleted successfully'
    })

  } catch (error) {
    console.error('Error in digest DELETE endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 