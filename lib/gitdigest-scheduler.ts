// GitDigest Daily Report Scheduler
// Handles automated daily report generation and notifications

import { createClient } from '@/lib/supabase/server'
import { createRepoAnalyzer } from '@/lib/gitdigest-repo-analyzer'
import { createDigestGenerator } from '@/lib/gitdigest-generator'

// ============================================================================
// INTERFACES
// ============================================================================

interface ScheduledDigest {
  id: string
  repo_full_name: string
  user_id: string
  last_analyzed: string
  subscription_settings: {
    daily_reports: boolean
    notification_method: 'email' | 'slack' | 'webhook'
    notification_config: any
  }
}

interface DailyReportJob {
  digest_id: string
  repo_full_name: string
  user_id: string
  report_date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  completed_at?: string
}

// ============================================================================
// DAILY REPORT SCHEDULER CLASS
// ============================================================================

export class GitDigestScheduler {
  private supabase = createClient()

  // ============================================================================
  // MAIN SCHEDULER METHODS
  // ============================================================================

  /**
   * Generate daily reports for all subscribed repositories
   * This should be called by a cron job or scheduled task
   */
  async generateDailyReports(targetDate?: string): Promise<void> {
    const reportDate = targetDate || new Date().toISOString().split('T')[0]
    
    console.log(`📅 Starting daily report generation for ${reportDate}`)

    try {
      // Get all digests that have daily report subscriptions
      const subscribedDigests = await this.getSubscribedDigests()
      
      if (subscribedDigests.length === 0) {
        console.log('No subscribed digests found')
        return
      }

      console.log(`Found ${subscribedDigests.length} subscribed digests`)

      // Process each digest
      const jobs: Promise<void>[] = []
      
      for (const digest of subscribedDigests) {
        jobs.push(this.processDigestDailyReport(digest, reportDate))
      }

      // Wait for all jobs to complete
      await Promise.allSettled(jobs)

      console.log(`✅ Daily report generation completed for ${reportDate}`)

    } catch (error) {
      console.error('Error in daily report generation:', error)
      throw error
    }
  }

  /**
   * Generate a daily report for a specific digest
   */
  async generateDailyReportForDigest(
    digestId: string, 
    reportDate: string,
    forceRegenerate = false
  ): Promise<DailyReportJob> {
    console.log(`📊 Generating daily report for digest ${digestId} - ${reportDate}`)

    try {
      // Get digest information
      const { data: digest, error: digestError } = await this.supabase
        .from('repo_digests')
        .select('*')
        .eq('id', digestId)
        .single()

      if (digestError) {
        throw new Error(`Failed to fetch digest: ${digestError.message}`)
      }

      // Check if report already exists
      const { data: existingReport } = await this.supabase
        .from('daily_reports')
        .select('*')
        .eq('repo_digest_id', digestId)
        .eq('report_date', reportDate)
        .single()

      if (existingReport && !forceRegenerate) {
        console.log(`Daily report already exists for ${digest.repo_full_name} - ${reportDate}`)
        return {
          digest_id: digestId,
          repo_full_name: digest.repo_full_name,
          user_id: digest.user_id,
          report_date: reportDate,
          status: 'completed',
          created_at: existingReport.created_at,
          completed_at: existingReport.created_at
        }
      }

      // Parse repository info
      const [owner, repo] = digest.repo_full_name.split('/')

      // Create repository analyzer
      const analyzer = await createRepoAnalyzer()
      
      // Analyze repository for the specific date
      const analysis = await analyzer.analyzeRepository(owner, repo, {
        includeCommits: true,
        includePRs: true,
        includeIssues: true,
        includeCodeStructure: false,
        includeSecurity: false,
        daysBack: 1
      })

      // Generate daily report
      const digestGenerator = createDigestGenerator()
      const dailyReport = await digestGenerator.generateDailyReport(analysis, reportDate, {
        userId: digest.user_id
      })

      // Save daily report
      const reportData = {
        repo_digest_id: digestId,
        report_date: reportDate,
        changes_summary: {
          summary: dailyReport.summary,
          keyChanges: dailyReport.keyChanges,
          contributors: dailyReport.contributors
        },
        commit_count: dailyReport.commitCount,
        pr_count: dailyReport.prsMerged + dailyReport.prsCreated,
        issue_count: dailyReport.issuesResolved + dailyReport.issuesCreated,
        contributors_count: dailyReport.contributors.length,
        lines_added: dailyReport.linesAdded,
        lines_removed: dailyReport.linesRemoved,
        ai_summary: dailyReport.summary,
        key_changes: dailyReport.keyChanges
      }

      const { data: savedReport, error: saveError } = await this.supabase
        .from('daily_reports')
        .upsert(reportData, {
          onConflict: 'repo_digest_id,report_date'
        })
        .select()
        .single()

      if (saveError) {
        throw new Error(`Failed to save daily report: ${saveError.message}`)
      }

      // Log analytics event
      await this.supabase
        .from('digest_analytics')
        .insert({
          repo_digest_id: digestId,
          user_id: digest.user_id,
          event_type: 'daily_report',
          event_data: {
            report_date: reportDate,
            commit_count: dailyReport.commitCount,
            contributors_count: dailyReport.contributors.length,
            automated: true
          }
        })

      console.log(`✅ Daily report generated for ${digest.repo_full_name} - ${reportDate}`)

      return {
        digest_id: digestId,
        repo_full_name: digest.repo_full_name,
        user_id: digest.user_id,
        report_date: reportDate,
        status: 'completed',
        created_at: savedReport.created_at,
        completed_at: new Date().toISOString()
      }

    } catch (error) {
      console.error(`Error generating daily report for digest ${digestId}:`, error)
      
      return {
        digest_id: digestId,
        repo_full_name: 'unknown',
        user_id: 'unknown',
        report_date: reportDate,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString()
      }
    }
  }

  /**
   * Send daily report notifications to users
   */
  async sendDailyReportNotifications(reportDate: string): Promise<void> {
    console.log(`📧 Sending daily report notifications for ${reportDate}`)

    try {
      // Get all daily reports for the date
      const { data: reports, error } = await this.supabase
        .from('daily_reports')
        .select(`
          *,
          repo_digests (
            user_id,
            repo_full_name,
            repo_name,
            repo_owner
          )
        `)
        .eq('report_date', reportDate)

      if (error) {
        throw new Error(`Failed to fetch daily reports: ${error.message}`)
      }

      if (!reports || reports.length === 0) {
        console.log('No daily reports found for notification')
        return
      }

      // Group reports by user
      const userReports = new Map<string, any[]>()
      
      for (const report of reports) {
        const userId = report.repo_digests.user_id
        if (!userReports.has(userId)) {
          userReports.set(userId, [])
        }
        userReports.get(userId)!.push(report)
      }

      // Send notifications to each user
      const notificationJobs: Promise<void>[] = []
      
      for (const [userId, userReportList] of userReports) {
        notificationJobs.push(
          this.sendUserDailyReportNotification(userId, userReportList, reportDate)
        )
      }

      await Promise.allSettled(notificationJobs)

      console.log(`✅ Daily report notifications sent for ${reportDate}`)

    } catch (error) {
      console.error('Error sending daily report notifications:', error)
      throw error
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Subscribe a digest to daily reports
   */
  async subscribeToDailyReports(
    digestId: string,
    userId: string,
    subscriptionType: 'daily' | 'weekly' | 'on_change' = 'daily',
    deliveryMethod: 'email' | 'slack' | 'webhook' = 'email',
    deliveryConfig: any = {}
  ): Promise<void> {
    const { error } = await this.supabase
      .from('digest_subscriptions')
      .upsert({
        user_id: userId,
        repo_digest_id: digestId,
        subscription_type: subscriptionType,
        delivery_method: deliveryMethod,
        delivery_config: deliveryConfig,
        is_active: true
      }, {
        onConflict: 'user_id,repo_digest_id,subscription_type'
      })

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`)
    }

    console.log(`✅ Subscription created for digest ${digestId}`)
  }

  /**
   * Unsubscribe from daily reports
   */
  async unsubscribeFromDailyReports(
    digestId: string,
    userId: string,
    subscriptionType: 'daily' | 'weekly' | 'on_change' = 'daily'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('digest_subscriptions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('repo_digest_id', digestId)
      .eq('subscription_type', subscriptionType)

    if (error) {
      throw new Error(`Failed to unsubscribe: ${error.message}`)
    }

    console.log(`✅ Unsubscribed from digest ${digestId}`)
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<any[]> {
    const { data: subscriptions, error } = await this.supabase
      .from('digest_subscriptions')
      .select(`
        *,
        repo_digests (
          repo_full_name,
          repo_name,
          repo_owner,
          sdlc_score,
          last_analyzed
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    }

    return subscriptions || []
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getSubscribedDigests(): Promise<ScheduledDigest[]> {
    const { data: subscriptions, error } = await this.supabase
      .from('digest_subscriptions')
      .select(`
        *,
        repo_digests (
          id,
          repo_full_name,
          user_id,
          last_analyzed
        )
      `)
      .eq('is_active', true)
      .eq('subscription_type', 'daily')

    if (error) {
      throw new Error(`Failed to fetch subscribed digests: ${error.message}`)
    }

    return (subscriptions || []).map(sub => ({
      id: sub.repo_digests.id,
      repo_full_name: sub.repo_digests.repo_full_name,
      user_id: sub.repo_digests.user_id,
      last_analyzed: sub.repo_digests.last_analyzed,
      subscription_settings: {
        daily_reports: true,
        notification_method: sub.delivery_method,
        notification_config: sub.delivery_config
      }
    }))
  }

  private async processDigestDailyReport(
    digest: ScheduledDigest,
    reportDate: string
  ): Promise<void> {
    try {
      await this.generateDailyReportForDigest(digest.id, reportDate)
    } catch (error) {
      console.error(`Failed to generate daily report for ${digest.repo_full_name}:`, error)
      // Continue processing other digests even if one fails
    }
  }

  private async sendUserDailyReportNotification(
    userId: string,
    reports: any[],
    reportDate: string
  ): Promise<void> {
    try {
      // Get user information
      const { data: user, error: userError } = await this.supabase.auth.admin.getUserById(userId)
      
      if (userError) {
        console.error(`Failed to fetch user ${userId}:`, userError)
        return
      }

      // Format notification content
      const notificationContent = this.formatDailyReportNotification(reports, reportDate)

      // Send notification based on user preferences
      // This would integrate with your existing notification system
      console.log(`📧 Sending daily report notification to ${user.user?.email}`)
      
      // For now, just log the notification
      // In production, you would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - Slack API
      // - Webhook endpoints
      
      console.log('Notification content:', notificationContent)

    } catch (error) {
      console.error(`Failed to send notification to user ${userId}:`, error)
    }
  }

  private formatDailyReportNotification(reports: any[], reportDate: string): string {
    const date = new Date(reportDate).toLocaleDateString()
    
    let content = `# Daily Repository Report - ${date}\n\n`
    
    for (const report of reports) {
      const repoName = report.repo_digests.repo_full_name
      
      content += `## ${repoName}\n\n`
      content += `**Summary:** ${report.ai_summary}\n\n`
      content += `**Activity:**\n`
      content += `- Commits: ${report.commit_count}\n`
      content += `- Pull Requests: ${report.pr_count}\n`
      content += `- Issues: ${report.issue_count}\n`
      content += `- Contributors: ${report.contributors_count}\n`
      content += `- Lines Added: ${report.lines_added}\n`
      content += `- Lines Removed: ${report.lines_removed}\n\n`
      
      if (report.key_changes && report.key_changes.length > 0) {
        content += `**Key Changes:**\n`
        for (const change of report.key_changes) {
          content += `- ${change}\n`
        }
        content += '\n'
      }
      
      content += '---\n\n'
    }
    
    content += `*Generated by GitDigest.ai on ${new Date().toLocaleString()}*`
    
    return content
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createGitDigestScheduler(): GitDigestScheduler {
  return new GitDigestScheduler()
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the previous business day (skipping weekends)
 */
export function getPreviousBusinessDay(date?: Date): string {
  const targetDate = date || new Date()
  
  // Go back one day
  targetDate.setDate(targetDate.getDate() - 1)
  
  // If it's Sunday (0), go back to Friday
  if (targetDate.getDay() === 0) {
    targetDate.setDate(targetDate.getDate() - 2)
  }
  
  // If it's Saturday (6), go back to Friday
  if (targetDate.getDay() === 6) {
    targetDate.setDate(targetDate.getDate() - 1)
  }
  
  return targetDate.toISOString().split('T')[0]
}

/**
 * Check if a date is a business day
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5 // Monday to Friday
}

/**
 * Get the next business day
 */
export function getNextBusinessDay(date?: Date): string {
  const targetDate = date || new Date()
  
  // Go forward one day
  targetDate.setDate(targetDate.getDate() + 1)
  
  // If it's Saturday (6), go to Monday
  if (targetDate.getDay() === 6) {
    targetDate.setDate(targetDate.getDate() + 2)
  }
  
  // If it's Sunday (0), go to Monday
  if (targetDate.getDay() === 0) {
    targetDate.setDate(targetDate.getDate() + 1)
  }
  
  return targetDate.toISOString().split('T')[0]
} 