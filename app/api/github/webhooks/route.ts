import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * GitHub Webhooks for GitDigest Automation
 * Handles repository events to trigger automatic digest generation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🪝 GitHub webhook received')
    
    // Get webhook payload
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')
    const delivery = request.headers.get('x-github-delivery')
    
    console.log('📊 Webhook details:', { event, delivery, hasSignature: !!signature })

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.log('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    
    // Handle different GitHub events
    switch (event) {
      case 'push':
        return await handlePushEvent(payload)
      
      case 'pull_request':
        return await handlePullRequestEvent(payload)
      
      case 'issues':
        return await handleIssuesEvent(payload)
      
      case 'repository':
        return await handleRepositoryEvent(payload)
      
      case 'schedule':
        return await handleScheduledEvent(payload)
      
      default:
        console.log(`❓ Unhandled event type: ${event}`)
        return NextResponse.json({ message: 'Event received' }, { status: 200 })
    }

  } catch (error) {
    console.error('❌ GitHub webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.GITHUB_WEBHOOK_SECRET) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  )
}

// Handle push events (commits to main branch)
async function handlePushEvent(payload: any): Promise<NextResponse> {
  const { repository, commits, ref, pusher } = payload
  
  // Only process pushes to main/master branch
  if (!ref.endsWith('/main') && !ref.endsWith('/master')) {
    return NextResponse.json({ message: 'Ignoring non-main branch push' })
  }

  console.log(`📝 Push to ${repository.full_name} by ${pusher.name}`)
  console.log(`📊 ${commits.length} commits pushed`)

  // Check if repository has GitDigest enabled
  const isEnabled = await isGitDigestEnabled(repository.full_name)
  if (!isEnabled) {
    return NextResponse.json({ message: 'GitDigest not enabled for this repository' })
  }

  // Queue digest generation
  await queueDigestGeneration({
    repository: repository.full_name,
    trigger: 'push',
    context: {
      commits: commits.length,
      pusher: pusher.name,
      ref,
      timestamp: new Date().toISOString()
    }
  })

  return NextResponse.json({ message: 'Digest generation queued' })
}

// Handle pull request events
async function handlePullRequestEvent(payload: any): Promise<NextResponse> {
  const { action, pull_request, repository } = payload
  
  // Only process merged PRs
  if (action !== 'closed' || !pull_request.merged) {
    return NextResponse.json({ message: 'Ignoring non-merged PR' })
  }

  console.log(`🔀 PR #${pull_request.number} merged in ${repository.full_name}`)

  // Check if repository has GitDigest enabled
  const isEnabled = await isGitDigestEnabled(repository.full_name)
  if (!isEnabled) {
    return NextResponse.json({ message: 'GitDigest not enabled for this repository' })
  }

  // Queue digest generation
  await queueDigestGeneration({
    repository: repository.full_name,
    trigger: 'pull_request',
    context: {
      pr_number: pull_request.number,
      pr_title: pull_request.title,
      author: pull_request.user.login,
      merged_at: pull_request.merged_at,
      timestamp: new Date().toISOString()
    }
  })

  return NextResponse.json({ message: 'Digest generation queued' })
}

// Handle issues events (for manual triggers)
async function handleIssuesEvent(payload: any): Promise<NextResponse> {
  const { action, issue, repository } = payload
  
  // Look for GitDigest trigger labels
  if (action === 'labeled' && issue.labels.some((label: any) => label.name === 'gitdigest')) {
    console.log(`🏷️ GitDigest label added to issue #${issue.number}`)
    
    await queueDigestGeneration({
      repository: repository.full_name,
      trigger: 'manual',
      context: {
        issue_number: issue.number,
        issue_title: issue.title,
        author: issue.user.login,
        timestamp: new Date().toISOString()
      }
    })
  }

  return NextResponse.json({ message: 'Issue event processed' })
}

// Handle repository events (for setup)
async function handleRepositoryEvent(payload: any): Promise<NextResponse> {
  const { action, repository } = payload
  
  if (action === 'created' || action === 'publicized') {
    console.log(`📁 Repository ${repository.full_name} ${action}`)
    
    // Auto-enable GitDigest for new repositories (if user has it configured)
    await autoEnableGitDigest(repository.full_name)
  }

  return NextResponse.json({ message: 'Repository event processed' })
}

// Handle scheduled events (daily digests)
async function handleScheduledEvent(payload: any): Promise<NextResponse> {
  console.log('⏰ Scheduled digest generation triggered')
  
  // Get all repositories with daily digest enabled
  const repositories = await getScheduledRepositories()
  
  for (const repo of repositories) {
    await queueDigestGeneration({
      repository: repo.full_name,
      trigger: 'scheduled',
      context: {
        type: 'daily',
        timestamp: new Date().toISOString()
      }
    })
  }

  return NextResponse.json({ 
    message: 'Scheduled digests queued',
    count: repositories.length 
  })
}

// Check if GitDigest is enabled for a repository by any user
async function isGitDigestEnabled(repositoryFullName: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // Check if any user has GitDigest enabled for this repository
    const { data } = await supabase
      .from('gitdigest_settings')
      .select('enabled')
      .eq('repository_full_name', repositoryFullName)
      .eq('enabled', true)
      .limit(1)
    
    return (data && data.length > 0) || false
  } catch (error) {
    console.error('Error checking GitDigest enabled status:', error)
    return false
  }
}

// Queue digest generation for users who have this repository enabled
async function queueDigestGeneration(params: {
  repository: string
  trigger: string
  context: any
}): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Find users who have GitDigest enabled for this repository
    const { data: userSettings } = await supabase
      .from('gitdigest_settings')
      .select('user_id, auto_digest_on_push, auto_digest_on_pr, enabled')
      .eq('repository_full_name', params.repository)
      .eq('enabled', true)
    
    if (!userSettings || userSettings.length === 0) {
      console.log(`ℹ️ No users have GitDigest enabled for ${params.repository}`)
      return
    }
    
    // Filter users based on trigger preferences
    const enabledUsers = userSettings.filter(user => 
      shouldTriggerForEventExisting(user, params.trigger)
    )
    
    if (enabledUsers.length === 0) {
      console.log(`ℹ️ No users have GitDigest enabled for ${params.repository} with trigger ${params.trigger}`)
      return
    }
    
    // Queue digest generation for each enabled user
    const queueEntries = enabledUsers.map(user => ({
      user_id: user.user_id,
      repository_full_name: params.repository,
      trigger_type: params.trigger,
      trigger_context: params.context,
      status: 'pending',
      created_at: new Date().toISOString()
    }))
    
    await supabase
      .from('gitdigest_queue')
      .insert(queueEntries)
    
    console.log(`✅ Queued digest generation for ${params.repository} (${enabledUsers.length} users)`)
    
    // TODO: Trigger background job processor
    // This could be a separate API endpoint or background worker
    
  } catch (error) {
    console.error('❌ Failed to queue digest generation:', error)
  }
}

// Check if trigger should fire for this event type (existing table structure)
function shouldTriggerForEventExisting(userSetting: any, eventType: string): boolean {
  switch (eventType) {
    case 'push':
      return userSetting.auto_digest_on_push === true
    case 'pull_request':
      return userSetting.auto_digest_on_pr === true
    case 'issues':
      return false // Not supported in existing schema
    case 'release':
      return false // Not supported in existing schema
    default:
      return false
  }
}

// Auto-enable GitDigest for new repositories
async function autoEnableGitDigest(repositoryFullName: string): Promise<void> {
  try {
    const supabase = await createClient()
    
    // Check if user has auto-enable preference
    const { data: settings } = await supabase
      .from('user_preferences')
      .select('auto_enable_gitdigest')
      .eq('repository_full_name', repositoryFullName)
      .single()
    
    if (settings?.auto_enable_gitdigest) {
      await supabase
        .from('gitdigest_settings')
        .upsert({
          repository_full_name: repositoryFullName,
          enabled: true,
          auto_digest_on_push: true,
          auto_digest_on_pr: true,
          daily_digest_enabled: false
        })
      
      console.log(`✅ Auto-enabled GitDigest for ${repositoryFullName}`)
    }
  } catch (error) {
    console.error('❌ Failed to auto-enable GitDigest:', error)
  }
}

// Get repositories with scheduled digests enabled
async function getScheduledRepositories(): Promise<Array<{ full_name: string }>> {
  try {
    const supabase = await createClient()
    
    const { data } = await supabase
      .from('gitdigest_settings')
      .select('repository_full_name')
      .eq('enabled', true)
      .eq('daily_digest_enabled', true)
    
    return data?.map(item => ({ full_name: item.repository_full_name })) || []
  } catch {
    return []
  }
} 