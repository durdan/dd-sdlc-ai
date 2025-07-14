import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRepoAnalyzer } from '@/lib/gitdigest-repo-analyzer'
import { createDigestGenerator } from '@/lib/gitdigest-generator'

/**
 * GitDigest Webhook API
 * Called by GitHub Actions to trigger automated digest generation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🪝 GitDigest webhook called')
    
    const supabase = await createClient()
    
    // Verify authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid authorization header',
        details: 'Include your SDLC.dev platform token as: Authorization: Bearer <token>'
      }, { status: 401 })
    }

    const userToken = authHeader.replace('Bearer ', '')
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(userToken)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid user token',
        details: 'Your SDLC_USER_TOKEN may be expired. Please regenerate it in the SDLC.dev platform.'
      }, { status: 401 })
    }

    console.log('✅ Authenticated user:', user.email)

    const body = await request.json()
    const { trigger, repository, changes, github } = body

    console.log('📝 Webhook request:', {
      repository: repository.full_name,
      trigger_type: trigger.type,
      commit_count: changes.commit_count,
      event_name: github.event_name
    })

    // Validate required fields
    if (!repository?.url || !trigger?.type) {
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: 'Missing required fields: repository.url or trigger.type'
      }, { status: 400 })
    }

    // Check if GitDigest is enabled for this repository
    const isEnabled = await isGitDigestEnabledForUser(user.id, repository.full_name)
    if (!isEnabled) {
      return NextResponse.json({ 
        error: 'GitDigest not enabled',
        details: `GitDigest is not enabled for repository ${repository.full_name}. Enable it in your SDLC.dev dashboard.`
      }, { status: 403 })
    }

    // Get user's OpenAI API key
    const openaiKey = await getUserOpenAIKey(user.id)
    if (!openaiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key required',
        details: 'Please configure your OpenAI API key in the SDLC.dev Settings tab.'
      }, { status: 400 })
    }

    // Check for recent digest to avoid duplicates
    const recentDigest = await getRecentDigest(user.id, repository.url)
    if (recentDigest && shouldSkipGeneration(trigger.type, recentDigest)) {
      return NextResponse.json({
        message: 'Skipped - recent digest exists',
        digest_id: recentDigest.id,
        reason: 'A digest was generated recently for this repository'
      })
    }

    // Generate unique digest ID
    const digestId = `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`🚀 Starting GitDigest generation: ${digestId}`)

    // Start async processing
    processGitDigestAsync(digestId, user.id, repository.url, openaiKey, trigger, changes)

    return NextResponse.json({
      status: 'accepted',
      message: 'GitDigest generation started',
      digest_id: digestId,
      estimated_duration: '2-5 minutes',
      trigger: trigger.type
    })

  } catch (error) {
    console.error('❌ GitDigest webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Process GitDigest generation asynchronously
async function processGitDigestAsync(
  digestId: string,
  userId: string,
  repoUrl: string,
  openaiKey: string,
  trigger: any,
  changes: any
): Promise<void> {
  try {
    console.log(`🔄 Processing GitDigest ${digestId}`)
    
    const supabase = await createClient()
    
    // Update status to processing
    await updateDigestStatus(digestId, 'processing', 'Analyzing repository...')

    // Analyze repository
    const repoAnalyzer = createRepoAnalyzer()
    const analysis = await repoAnalyzer.analyzeRepository(repoUrl, {
      includeCommits: true,
      includePRs: true,
      includeIssues: true,
      includeCodeStructure: true,
      includeSecurity: true,
      daysBack: getDaysBack(trigger.type)
    })

    // Update status
    await updateDigestStatus(digestId, 'processing', 'Generating AI digest...')

    // Generate digest
    const digestGenerator = createDigestGenerator()
    const digestResult = await digestGenerator.generateDigest(analysis, {
      userId: userId,
      openaiKey: openaiKey,
      includeArtifacts: true,
      customPrompt: getCustomPrompt(trigger.type)
    })

    // Save digest to database
    const digestData = {
      id: digestId,
      user_id: userId,
      repo_url: repoUrl,
      repo_name: extractRepoName(repoUrl),
      repo_owner: extractRepoOwner(repoUrl),
      repo_full_name: extractRepoFullName(repoUrl),
      digest_data: digestResult,
      sdlc_score: digestResult.sdlcScore,
      trigger_type: trigger.type,
      trigger_context: trigger.context,
      changes_context: changes,
      last_analyzed: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: saveError } = await supabase
      .from('repo_digests')
      .upsert(digestData, {
        onConflict: 'user_id,repo_url'
      })

    if (saveError) {
      throw new Error(`Failed to save digest: ${saveError.message}`)
    }

    // Update status to completed
    await updateDigestStatus(digestId, 'completed', 'GitDigest generated successfully')

    console.log(`✅ GitDigest ${digestId} completed successfully`)

  } catch (error) {
    console.error(`❌ GitDigest ${digestId} failed:`, error)
    await updateDigestStatus(digestId, 'failed', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Helper functions
async function isGitDigestEnabledForUser(userId: string, repoFullName: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data } = await supabase
      .from('gitdigest_settings')
      .select('enabled')
      .eq('user_id', userId)
      .eq('repository_full_name', repoFullName)
      .single()
    
    return data?.enabled || false
  } catch {
    // If no settings exist, default to enabled for existing users
    return true
  }
}

async function getUserOpenAIKey(userId: string): Promise<string | null> {
  try {
    const supabase = await createClient()
    
    // Try new AI configurations system first
    const OPENAI_PROVIDER_ID = '1fdbbf27-6411-476a-bc4d-517c54f68f1d'
    
    const { data: config } = await supabase
      .from('sdlc_user_ai_configurations')
      .select('encrypted_api_key')
      .eq('user_id', userId)
      .eq('provider_id', OPENAI_PROVIDER_ID)
      .eq('is_active', true)
      .single()

    if (config?.encrypted_api_key) {
      return config.encrypted_api_key
    }

    // Fallback to old user_configurations table
    const { data: oldConfig } = await supabase
      .from('user_configurations')
      .select('openai_api_key')
      .eq('user_id', userId)
      .single()

    return oldConfig?.openai_api_key || null
  } catch {
    return null
  }
}

async function getRecentDigest(userId: string, repoUrl: string): Promise<any> {
  try {
    const supabase = await createClient()
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data } = await supabase
      .from('repo_digests')
      .select('id, last_analyzed, trigger_type')
      .eq('user_id', userId)
      .eq('repo_url', repoUrl)
      .gte('last_analyzed', oneHourAgo)
      .order('last_analyzed', { ascending: false })
      .limit(1)
      .single()
    
    return data
  } catch {
    return null
  }
}

function shouldSkipGeneration(triggerType: string, recentDigest: any): boolean {
  // Don't skip manual or scheduled triggers
  if (triggerType === 'manual' || triggerType === 'scheduled') {
    return false
  }
  
  // Skip if recent digest exists and was triggered by same type
  return recentDigest.trigger_type === triggerType
}

function getDaysBack(triggerType: string): number {
  switch (triggerType) {
    case 'scheduled': return 1  // Daily digest
    case 'push': return 7       // Weekly context for pushes
    case 'pull_request': return 14  // Bi-weekly for PR merges
    default: return 30          // Monthly for manual
  }
}

function getCustomPrompt(triggerType: string): string | undefined {
  switch (triggerType) {
    case 'scheduled':
      return 'Generate a daily digest focusing on recent changes and immediate priorities.'
    case 'push':
      return 'Generate a digest focusing on the recent commits and their impact on the codebase.'
    case 'pull_request':
      return 'Generate a digest highlighting the merged changes and their integration impact.'
    default:
      return undefined
  }
}

async function updateDigestStatus(digestId: string, status: string, message: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    await supabase
      .from('gitdigest_queue')
      .upsert({
        digest_id: digestId,
        status: status,
        message: message,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'digest_id'
      })
  } catch (error) {
    console.error('Failed to update digest status:', error)
  }
}

function extractRepoName(repoUrl: string): string {
  return repoUrl.split('/').pop() || ''
}

function extractRepoOwner(repoUrl: string): string {
  const parts = repoUrl.split('/')
  return parts[parts.length - 2] || ''
}

function extractRepoFullName(repoUrl: string): string {
  const parts = repoUrl.split('/')
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
} 