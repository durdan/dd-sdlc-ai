import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { digest_id, is_public = true, expires_in_days } = await request.json()

    if (!digest_id) {
      return NextResponse.json({ error: 'digest_id is required' }, { status: 400 })
    }

    // Verify user owns the digest
    const { data: digest, error: digestError } = await supabase
      .from('repo_digests')
      .select('id')
      .eq('id', digest_id)
      .eq('user_id', user.id)
      .single()

    if (digestError) {
      if (digestError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
      }
      console.error('Error fetching digest:', digestError)
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 })
    }

    // Generate unique share token
    const shareToken = randomBytes(32).toString('base64url')

    // Calculate expiration date if specified
    let expiresAt: string | null = null
    if (expires_in_days) {
      const expDate = new Date()
      expDate.setDate(expDate.getDate() + expires_in_days)
      expiresAt = expDate.toISOString()
    }

    // Create share record
    const { data: shareRecord, error: shareError } = await supabase
      .from('digest_shares')
      .insert({
        repo_digest_id: digest_id,
        share_token: shareToken,
        is_public,
        expires_at: expiresAt,
        created_by: user.id
      })
      .select()
      .single()

    if (shareError) {
      console.error('Error creating share record:', shareError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    // Log analytics event
    await supabase
      .from('digest_analytics')
      .insert({
        repo_digest_id: digest_id,
        user_id: user.id,
        event_type: 'share',
        event_data: {
          share_token: shareToken,
          is_public,
          expires_at: expiresAt
        }
      })

    return NextResponse.json({
      share_token: shareToken,
      share_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/digest/${shareToken}`,
      expires_at: expiresAt,
      is_public,
      message: 'Share link created successfully'
    })

  } catch (error) {
    console.error('Error in share POST endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const digestId = searchParams.get('digest_id')

    if (!digestId) {
      return NextResponse.json({ error: 'digest_id is required' }, { status: 400 })
    }

    // Verify user owns the digest
    const { data: digest, error: digestError } = await supabase
      .from('repo_digests')
      .select('id')
      .eq('id', digestId)
      .eq('user_id', user.id)
      .single()

    if (digestError) {
      if (digestError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Digest not found' }, { status: 404 })
      }
      console.error('Error fetching digest:', digestError)
      return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 })
    }

    // Get existing share records for this digest
    const { data: shares, error: sharesError } = await supabase
      .from('digest_shares')
      .select('*')
      .eq('repo_digest_id', digestId)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (sharesError) {
      console.error('Error fetching shares:', sharesError)
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }

    // Filter out expired shares
    const now = new Date()
    const activeShares = shares.filter(share => 
      !share.expires_at || new Date(share.expires_at) > now
    )

    return NextResponse.json({
      shares: activeShares,
      total: activeShares.length
    })

  } catch (error) {
    console.error('Error in share GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { share_token } = await request.json()

    if (!share_token) {
      return NextResponse.json({ error: 'share_token is required' }, { status: 400 })
    }

    // Verify user owns the share
    const { data: share, error: shareError } = await supabase
      .from('digest_shares')
      .select('id')
      .eq('share_token', share_token)
      .eq('created_by', user.id)
      .single()

    if (shareError) {
      if (shareError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Share not found' }, { status: 404 })
      }
      console.error('Error fetching share:', shareError)
      return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 })
    }

    // Delete share record
    const { error: deleteError } = await supabase
      .from('digest_shares')
      .delete()
      .eq('share_token', share_token)
      .eq('created_by', user.id)

    if (deleteError) {
      console.error('Error deleting share:', deleteError)
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Share link deleted successfully'
    })

  } catch (error) {
    console.error('Error in share DELETE endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 