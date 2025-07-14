import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GitDigest Digests API
 * Fetches user's repository digests from the existing repo_digests table
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Loading digests for user:', user.email)

    // Get user's repository digests
    const { data: digests, error } = await supabase
      .from('repo_digests')
      .select(`
        id,
        repo_url,
        repo_name,
        repo_owner,
        repo_full_name,
        digest_data,
        sdlc_score,
        last_analyzed,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading user digests:', error)
      return NextResponse.json({ error: 'Failed to load digests' }, { status: 500 })
    }

    console.log(`✅ Found ${digests?.length || 0} digests for user`)

    // Transform the data to match the expected format
    const transformedDigests = digests?.map(digest => ({
      id: digest.id,
      repo_url: digest.repo_url,
      repo_name: digest.repo_name,
      repo_owner: digest.repo_owner,
      repo_full_name: digest.repo_full_name,
      digest_data: {
        summary: digest.digest_data?.summary || '',
        keyChanges: digest.digest_data?.keyChanges || [],
        sdlcScore: digest.sdlc_score,
        sdlcBreakdown: digest.digest_data?.sdlcBreakdown || {
          documentation: 0,
          testing: 0,
          security: 0,
          maintenance: 0,
          community: 0,
          activity: 0
        },
        recommendations: digest.digest_data?.recommendations || [],
        artifacts: digest.digest_data?.artifacts || {}
      },
      sdlc_score: digest.sdlc_score,
      last_analyzed: digest.last_analyzed,
      created_at: digest.created_at,
      updated_at: digest.updated_at
    })) || []

    return NextResponse.json({
      digests: transformedDigests,
      count: transformedDigests.length
    })

  } catch (error) {
    console.error('Error in GitDigest digests GET:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { repo_url, repo_name, repo_owner, repo_full_name, digest_data, sdlc_score } = body

    console.log('💾 Creating new digest for user:', user.email, 'repo:', repo_full_name)

    // Insert new digest
    const { data: newDigest, error } = await supabase
      .from('repo_digests')
      .insert({
        user_id: user.id,
        repo_url,
        repo_name,
        repo_owner,
        repo_full_name,
        digest_data,
        sdlc_score: sdlc_score || 0,
        last_analyzed: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating digest:', error)
      return NextResponse.json({ error: 'Failed to create digest' }, { status: 500 })
    }

    console.log('✅ Digest created successfully')

    return NextResponse.json({
      message: 'Digest created successfully',
      digest: newDigest
    })

  } catch (error) {
    console.error('Error in GitDigest digests POST:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 