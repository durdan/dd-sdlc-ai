import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRepoAnalyzer, parseRepoUrl } from '@/lib/gitdigest-repo-analyzer'
import { createDigestGenerator } from '@/lib/gitdigest-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { repo_url, openaiKey, include_artifacts = true, custom_prompt } = await request.json()

    if (!repo_url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json({ error: 'OpenAI API key is required' }, { status: 400 })
    }

    // Parse repository URL
    const parsedRepo = parseRepoUrl(repo_url)
    if (!parsedRepo) {
      return NextResponse.json({ 
        error: 'Invalid repository URL. Please provide a valid GitHub repository URL.' 
      }, { status: 400 })
    }

    const { owner, repo } = parsedRepo

    console.log(`🔍 Analyzing repository: ${owner}/${repo} for user ${user.id}`)

    // Check if digest already exists
    const { data: existingDigest } = await supabase
      .from('repo_digests')
      .select('*')
      .eq('user_id', user.id)
      .eq('repo_url', repo_url)
      .single()

    // If digest exists and was analyzed recently (within 24 hours), return it
    if (existingDigest) {
      const lastAnalyzed = new Date(existingDigest.last_analyzed)
      const now = new Date()
      const hoursSinceAnalysis = (now.getTime() - lastAnalyzed.getTime()) / (1000 * 60 * 60)

      if (hoursSinceAnalysis < 24) {
        console.log(`📋 Returning existing digest for ${owner}/${repo}`)
        return NextResponse.json({
          digest: existingDigest,
          message: 'Returning cached analysis (analyzed within 24 hours)'
        })
      }
    }

    // Create repository analyzer
    const analyzer = await createRepoAnalyzer()
    
    // Analyze repository
    console.log(`🤖 Starting repository analysis...`)
    const analysis = await analyzer.analyzeRepository(owner, repo, {
      includeCommits: true,
      includePRs: true,
      includeIssues: true,
      includeCodeStructure: true,
      includeSecurity: true,
      daysBack: 30
    })

    // Generate digest
    console.log(`📝 Generating digest...`)
    const digestGenerator = createDigestGenerator()
    const digestResult = await digestGenerator.generateDigest(analysis, {
      userId: user.id,
      openaiKey: openaiKey,
      includeArtifacts: include_artifacts,
      customPrompt: custom_prompt
    })

    // Save or update digest in database
    const digestData = {
      user_id: user.id,
      repo_url: repo_url,
      repo_name: repo,
      repo_owner: owner,
      repo_full_name: `${owner}/${repo}`,
      digest_data: digestResult,
      sdlc_score: digestResult.sdlcScore,
      analysis_metadata: {
        analysis_version: '1.0.0',
        generated_at: new Date().toISOString(),
        analysis_options: {
          includeCommits: true,
          includePRs: true,
          includeIssues: true,
          includeCodeStructure: true,
          includeSecurity: true,
          daysBack: 30
        }
      },
      last_analyzed: new Date().toISOString()
    }

    const { data: savedDigest, error: saveError } = await supabase
      .from('repo_digests')
      .upsert(digestData, {
        onConflict: 'user_id,repo_url'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving digest:', saveError)
      return NextResponse.json({ error: 'Failed to save digest' }, { status: 500 })
    }

    // Log analytics event
    await supabase
      .from('digest_analytics')
      .insert({
        repo_digest_id: savedDigest.id,
        user_id: user.id,
        event_type: 'analyze',
        event_data: {
          repo_url,
          sdlc_score: digestResult.sdlcScore,
          analysis_duration: 'calculated_separately' // Would track this in production
        }
      })

    console.log(`✅ Analysis complete for ${owner}/${repo}`)

    return NextResponse.json({
      digest: savedDigest,
      message: 'Repository analyzed successfully'
    })

  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    
    // Return appropriate error message
    if (error instanceof Error) {
      if (error.message.includes('GitHub token not found')) {
        return NextResponse.json({ 
          error: 'GitHub authentication required. Please connect your GitHub account first.' 
        }, { status: 401 })
      }
      
      if (error.message.includes('Not Found')) {
        return NextResponse.json({ 
          error: 'Repository not found or not accessible. Please check the URL and your permissions.' 
        }, { status: 404 })
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'GitHub API rate limit exceeded. Please try again later.' 
        }, { status: 429 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to analyze repository. Please try again.' 
    }, { status: 500 })
  }
} 