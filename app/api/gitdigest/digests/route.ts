import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sort_by') || 'last_analyzed'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // Get user's digests
    const { data: digests, error } = await supabase
      .from('repo_digests')
      .select('*')
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching digests:', error)
      return NextResponse.json({ error: 'Failed to fetch digests' }, { status: 500 })
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('repo_digests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting digests:', countError)
    }

    return NextResponse.json({
      digests,
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error in digests GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { repo_url, repo_name, repo_owner, digest_data, sdlc_score } = await request.json()

    if (!repo_url || !repo_name || !repo_owner || !digest_data) {
      return NextResponse.json({ 
        error: 'Missing required fields: repo_url, repo_name, repo_owner, digest_data' 
      }, { status: 400 })
    }

    // Create new digest
    const { data: newDigest, error } = await supabase
      .from('repo_digests')
      .insert({
        user_id: user.id,
        repo_url,
        repo_name,
        repo_owner,
        repo_full_name: `${repo_owner}/${repo_name}`,
        digest_data,
        sdlc_score: sdlc_score || 0,
        last_analyzed: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating digest:', error)
      return NextResponse.json({ error: 'Failed to create digest' }, { status: 500 })
    }

    return NextResponse.json({
      digest: newDigest,
      message: 'Digest created successfully'
    })

  } catch (error) {
    console.error('Error in digests POST endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 