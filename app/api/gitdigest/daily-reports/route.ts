import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRepoAnalyzer } from '@/lib/gitdigest-repo-analyzer'
import { createDigestGenerator } from '@/lib/gitdigest-generator'

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
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

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

    // Get daily reports for the digest
    const { data: reports, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('repo_digest_id', digestId)
      .order('report_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching daily reports:', error)
      return NextResponse.json({ error: 'Failed to fetch daily reports' }, { status: 500 })
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('daily_reports')
      .select('*', { count: 'exact', head: true })
      .eq('repo_digest_id', digestId)

    if (countError) {
      console.error('Error counting daily reports:', countError)
    }

    return NextResponse.json({
      reports,
      total: count || 0,
      limit,
      offset
    })

  } catch (error) {
    console.error('Error in daily reports GET endpoint:', error)
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

    const { digest_id, report_date, force_regenerate = false } = await request.json()

    if (!digest_id || !report_date) {
      return NextResponse.json({ 
        error: 'digest_id and report_date are required' 
      }, { status: 400 })
    }

    // Verify user owns the digest
    const { data: digest, error: digestError } = await supabase
      .from('repo_digests')
      .select('*')
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

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('repo_digest_id', digest_id)
      .eq('report_date', report_date)
      .single()

    if (existingReport && !force_regenerate) {
      return NextResponse.json({
        report: existingReport,
        message: 'Daily report already exists for this date'
      })
    }

    // Parse repository info
    const [owner, repo] = digest.repo_full_name.split('/')

    // Create repository analyzer
    const analyzer = await createRepoAnalyzer()
    
    // Analyze repository for the specific date
    console.log(`📅 Generating daily report for ${digest.repo_full_name} - ${report_date}`)
    const analysis = await analyzer.analyzeRepository(owner, repo, {
      includeCommits: true,
      includePRs: true,
      includeIssues: true,
      includeCodeStructure: false, // Not needed for daily reports
      includeSecurity: false, // Not needed for daily reports
      daysBack: 1 // Only look at the specific day
    })

    // Generate daily report
    const digestGenerator = createDigestGenerator()
    const dailyReport = await digestGenerator.generateDailyReport(analysis, report_date, {
      userId: user.id
    })

    // Save daily report
    const reportData = {
      repo_digest_id: digest_id,
      report_date,
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

    const { data: savedReport, error: saveError } = await supabase
      .from('daily_reports')
      .upsert(reportData, {
        onConflict: 'repo_digest_id,report_date'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving daily report:', saveError)
      return NextResponse.json({ error: 'Failed to save daily report' }, { status: 500 })
    }

    // Log analytics event
    await supabase
      .from('digest_analytics')
      .insert({
        repo_digest_id: digest_id,
        user_id: user.id,
        event_type: 'daily_report',
        event_data: {
          report_date,
          commit_count: dailyReport.commitCount,
          contributors_count: dailyReport.contributors.length
        }
      })

    console.log(`✅ Daily report generated for ${digest.repo_full_name} - ${report_date}`)

    return NextResponse.json({
      report: savedReport,
      message: 'Daily report generated successfully'
    })

  } catch (error) {
    console.error('Error in daily reports POST endpoint:', error)
    
    // Return appropriate error message
    if (error instanceof Error) {
      if (error.message.includes('GitHub token not found')) {
        return NextResponse.json({ 
          error: 'GitHub authentication required. Please connect your GitHub account first.' 
        }, { status: 401 })
      }
      
      if (error.message.includes('Not Found')) {
        return NextResponse.json({ 
          error: 'Repository not found or not accessible.' 
        }, { status: 404 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate daily report. Please try again.' 
    }, { status: 500 })
  }
} 