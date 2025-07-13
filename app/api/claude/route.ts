import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, CodeAnalysisRequest, AgenticCodeRequest } from '@/lib/claude-service'
import { RepositoryAnalyzer } from '@/lib/repository-analyzer'
import { CodeGenerator, CodeSpecification } from '@/lib/code-generator'
import { BugDetector } from '@/lib/bug-detector'
import { GitHubClaudeService } from '@/lib/github-claude-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Unified Claude API Request received:', new Date().toISOString())
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body
    console.log('📋 Action requested:', action)
    console.log('👤 User ID:', user.id)

    // Initialize Claude service with user's database configuration
    let claudeService: ClaudeCodeService
    try {
      claudeService = await ClaudeCodeService.createForUser(user.id)
      console.log('✅ Claude service initialized with user database configuration')
    } catch (error) {
      console.log('❌ Failed to initialize with user config, trying environment variables...', error)
      const envApiKey = process.env.ANTHROPIC_API_KEY
      if (!envApiKey) {
        return NextResponse.json({
          error: 'Claude API key not configured. Please configure Claude in the Integration Hub or set ANTHROPIC_API_KEY environment variable.',
          details: 'Go to the Integration Hub → Claude AI tab to set up your API key.'
        }, { status: 400 })
      }
      claudeService = new ClaudeCodeService({
        apiKey: envApiKey,
        model: params.model || 'claude-3-5-sonnet-20241022',
        maxTokens: params.maxTokens || 8192,
        temperature: params.temperature || 0.1
      })
      console.log('✅ Claude service initialized with environment API key')
    }

    // Get GitHub token for repository operations
    let githubToken = null
    try {
      const cookieStore = await cookies()
      const userGithubToken = cookieStore.get('github_token')
      if (userGithubToken?.value) {
        githubToken = userGithubToken.value
      }
    } catch (error) {
      console.log('No GitHub token found in cookies')
    }

    if (!githubToken) {
      githubToken = process.env.GITHUB_TOKEN
    }

    // Initialize additional services

    // Initialize other services if GitHub token is available
    let repositoryAnalyzer: RepositoryAnalyzer | null = null
    let codeGenerator: CodeGenerator | null = null
    let bugDetector: BugDetector | null = null
    let githubService: GitHubClaudeService | null = null

    if (githubToken) {
      repositoryAnalyzer = new RepositoryAnalyzer(claudeService, githubToken)
      codeGenerator = new CodeGenerator(claudeService)
      bugDetector = new BugDetector(claudeService)
      githubService = new GitHubClaudeService(githubToken)
    }

    // Route to appropriate action
    switch (action) {
      case 'test_connection':
        return await handleTestConnection(claudeService)
      
      case 'analyze_code':
        return await handleAnalyzeCode(claudeService, params, user.id, supabase)
      
      case 'generate_code':
        if (!codeGenerator || !repositoryAnalyzer) {
          return NextResponse.json({ 
            error: 'GitHub integration required for code generation',
            details: 'Please connect your GitHub account in the Integration Hub'
          }, { status: 400 })
        }
        return await handleGenerateCode(codeGenerator, repositoryAnalyzer, params, user.id, supabase)
      
      case 'analyze_repository':
        if (!repositoryAnalyzer) {
          return NextResponse.json({ 
            error: 'GitHub integration required for repository analysis',
            details: 'Please connect your GitHub account in the Integration Hub'
          }, { status: 400 })
        }
        return await handleAnalyzeRepository(repositoryAnalyzer, params, user.id, supabase)
      
      case 'analyze_bug':
        if (!bugDetector) {
          return NextResponse.json({ 
            error: 'GitHub integration required for bug analysis',
            details: 'Please connect your GitHub account in the Integration Hub'
          }, { status: 400 })
        }
        return await handleAnalyzeBug(bugDetector, repositoryAnalyzer, params, user.id, supabase)
      
      case 'create_implementation_pr':
        if (!githubService) {
          return NextResponse.json({ 
            error: 'GitHub integration required for PR creation',
            details: 'Please connect your GitHub account in the Integration Hub'
          }, { status: 400 })
        }
        return await handleCreateImplementationPR(githubService, params, user.id, supabase)
      
      case 'create_bugfix_pr':
        if (!githubService) {
          return NextResponse.json({ 
            error: 'GitHub integration required for PR creation',
            details: 'Please connect your GitHub account in the Integration Hub'
          }, { status: 400 })
        }
        return await handleCreateBugfixPR(githubService, params, user.id, supabase)
      
      case 'review_code':
        return await handleReviewCode(claudeService, params, user.id, supabase)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Unified Claude API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Test Claude API connection
async function handleTestConnection(claudeService: ClaudeCodeService) {
  try {
    const connectionSuccess = await claudeService.testConnection()
    return NextResponse.json({
      success: connectionSuccess,
      message: connectionSuccess ? 'Connection successful' : 'Connection failed'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// Handle code analysis
async function handleAnalyzeCode(
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    const request: CodeAnalysisRequest = {
      repositoryUrl: params.repositoryUrl,
      codeContent: params.codeContent,
      analysisType: params.analysisType || 'code_review',
      context: params.context,
      requirements: params.requirements
    }

    const result = await claudeService.analyzeCode(request)

    // Store analysis in database
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_analysis',
      repository_url: params.repositoryUrl,
      task_description: `${request.analysisType} analysis`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: params.model || 'claude-3-5-sonnet-20241022',
      result_data: result,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      analysis: result
    })
  } catch (error) {
    console.error('Code analysis error:', error)
    return NextResponse.json({
      error: 'Code analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle code generation with repository context - ENHANCED
async function handleGenerateCode(
  codeGenerator: CodeGenerator,
  repositoryAnalyzer: RepositoryAnalyzer,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    if (!params.repositoryUrl || !params.description) {
      return NextResponse.json({
        error: 'Repository URL and description are required for code generation'
      }, { status: 400 })
    }

    console.log(`🔧 Generating code for repository: ${params.repositoryUrl}`)

    // Get or create repository analysis
    let repositoryAnalysis
    try {
      repositoryAnalysis = await repositoryAnalyzer.analyzeRepository(params.repositoryUrl)
    } catch (error) {
      console.warn('Repository analysis failed, using basic context')
      repositoryAnalysis = null
    }

    // Create code specification
    const specification: CodeSpecification = {
      description: params.description,
      type: params.type || 'feature',
      requirements: params.requirements || [params.description],
      constraints: params.constraints,
      targetFiles: params.targetFiles,
      dependencies: params.dependencies,
      testRequirements: params.testRequirements
    }

    // Generate code with repository context
    const generatedCode = repositoryAnalysis 
      ? await codeGenerator.generateFromSpecification(specification, repositoryAnalysis)
      : await generateCodeFallback(codeGenerator, specification)

    // Store generation result in database
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_generation',
      repository_url: params.repositoryUrl,
      task_description: specification.description,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: generatedCode,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      generation: generatedCode,
      hasRepositoryContext: !!repositoryAnalysis
    })

  } catch (error) {
    console.error('Code generation error:', error)
    return NextResponse.json({
      error: 'Code generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle repository analysis - ENHANCED
async function handleAnalyzeRepository(
  repositoryAnalyzer: RepositoryAnalyzer,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    if (!params.repositoryUrl) {
      return NextResponse.json({
        error: 'Repository URL is required for analysis'
      }, { status: 400 })
    }

    console.log(`🔍 Starting repository analysis for: ${params.repositoryUrl}`)
    
    // Check if we have a recent analysis cached
    const { data: cachedAnalysis } = await supabase
      .from('claude_repository_analysis')
      .select('*')
      .eq('repo_url', params.repositoryUrl)
      .gte('analyzed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 24 hours
      .single()

    if (cachedAnalysis && !params.forceRefresh) {
      console.log(`✅ Using cached analysis for ${params.repositoryUrl}`)
      return NextResponse.json({
        success: true,
        analysis: {
          repoUrl: cachedAnalysis.repo_url,
          structure: cachedAnalysis.structure,
          patterns: cachedAnalysis.patterns,
          dependencies: cachedAnalysis.dependencies,
          framework: cachedAnalysis.framework,
          primaryLanguage: cachedAnalysis.primary_language,
          summary: cachedAnalysis.summary,
          recommendations: cachedAnalysis.recommendations,
          analyzedAt: cachedAnalysis.analyzed_at,
          fileCount: cachedAnalysis.file_count,
          codeFiles: cachedAnalysis.code_files,
          testFiles: cachedAnalysis.test_files,
          configFiles: cachedAnalysis.config_files
        },
        cached: true
      })
    }

    // Perform fresh analysis
    const analysis = await repositoryAnalyzer.analyzeRepository(params.repositoryUrl)

    // Store analysis in database
    await supabase.from('claude_repository_analysis').upsert({
      repo_url: analysis.repoUrl,
      structure: analysis.structure,
      patterns: analysis.patterns,
      dependencies: analysis.dependencies,
      framework: analysis.framework,
      primary_language: analysis.primaryLanguage,
      summary: analysis.summary,
      recommendations: analysis.recommendations,
      analyzed_at: analysis.analyzedAt,
      file_count: analysis.fileCount,
      code_files: analysis.codeFiles,
      test_files: analysis.testFiles,
      config_files: analysis.configFiles
    })

    // Also store in task executions for tracking
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'repository_analysis',
      repository_url: params.repositoryUrl,
      task_description: 'Repository analysis and pattern detection',
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: analysis,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      analysis,
      cached: false
    })

  } catch (error) {
    console.error('Repository analysis error:', error)
    return NextResponse.json({
      error: 'Repository analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle bug analysis - ENHANCED
async function handleAnalyzeBug(
  bugDetector: BugDetector,
  repositoryAnalyzer: RepositoryAnalyzer | null,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    if (!params.bugDescription) {
      return NextResponse.json({
        error: 'Bug description is required'
      }, { status: 400 })
    }

    // Create bug report
    const bugReport = {
      description: params.bugDescription,
      severity: params.severity || 'medium',
      category: params.category || 'other',
      steps: params.steps,
      expectedBehavior: params.expectedBehavior,
      actualBehavior: params.actualBehavior,
      environment: params.environment,
      affectedFiles: params.affectedFiles,
      stackTrace: params.stackTrace,
      logs: params.logs
    }

    // Get repository analysis if available
    let repositoryAnalysis = null
    if (repositoryAnalyzer && params.repositoryUrl) {
      try {
        repositoryAnalysis = await repositoryAnalyzer.analyzeRepository(params.repositoryUrl)
      } catch (error) {
        console.warn('Repository analysis failed for bug detection')
      }
    }

    if (!repositoryAnalysis) {
      // Fallback bug analysis without repository context
      return await handleAnalyzeBugFallback(bugReport, userId, supabase)
    }

    // Perform comprehensive bug analysis
    const analysis = await bugDetector.analyzeBugReport(bugReport, repositoryAnalysis)

    // Store bug analysis
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'bug_analysis',
      repository_url: params.repositoryUrl,
      task_description: bugReport.description,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: analysis,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error) {
    console.error('Bug analysis error:', error)
    return NextResponse.json({
      error: 'Bug analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// NEW: Handle creating implementation PR
async function handleCreateImplementationPR(
  githubService: GitHubClaudeService,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    if (!params.repositoryUrl || !params.generatedCode) {
      return NextResponse.json({
        error: 'Repository URL and generated code are required'
      }, { status: 400 })
    }

    console.log(`🔀 Creating implementation PR for: ${params.repositoryUrl}`)

    const pullRequest = await githubService.createImplementationBranch(
      params.repositoryUrl,
      params.generatedCode,
      {
        branchName: params.branchName,
        prTitle: params.prTitle,
        prDescription: params.prDescription,
        isDraft: params.isDraft
      }
    )

    // Store PR creation in database
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'pr_creation',
      repository_url: params.repositoryUrl,
      task_description: `Created implementation PR: ${pullRequest.title}`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: pullRequest,
      completed_at: new Date().toISOString()
    })

    // CRITICAL FIX: Update the task result in task store with PR information
    // This makes the PR visible in the UI permanently
    if (params.taskId) {
      const { default: taskStore } = await import('@/lib/task-store')
      const task = taskStore.getTask(params.taskId)
      
      if (task && task.result) {
        console.log(`📝 Updating task ${params.taskId} with PR information`)
        task.result.pull_request = {
          url: pullRequest.url,
          number: pullRequest.number,
          title: pullRequest.title,
          state: pullRequest.state,
          created_at: pullRequest.created_at
        }
        taskStore.updateTask(task)
        console.log(`✅ Task ${params.taskId} updated with PR: ${pullRequest.url}`)
      }
    }

    return NextResponse.json({
      success: true,
      pullRequest
    })

  } catch (error) {
    console.error('PR creation error:', error)
    return NextResponse.json({
      error: 'Failed to create implementation PR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// NEW: Handle creating bug fix PR
async function handleCreateBugfixPR(
  githubService: GitHubClaudeService,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    if (!params.repositoryUrl || !params.bugFix) {
      return NextResponse.json({
        error: 'Repository URL and bug fix are required'
      }, { status: 400 })
    }

    console.log(`🐛 Creating bug fix PR for: ${params.repositoryUrl}`)

    const pullRequest = await githubService.createBugFixPR(
      params.repositoryUrl,
      params.bugFix,
      {
        branchName: params.branchName,
        prTitle: params.prTitle,
        includePrevention: params.includePrevention
      }
    )

    // Store PR creation in database
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'bugfix_pr_creation',
      repository_url: params.repositoryUrl,
      task_description: `Created bug fix PR: ${pullRequest.title}`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: pullRequest,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      pullRequest
    })

  } catch (error) {
    console.error('Bug fix PR creation error:', error)
    return NextResponse.json({
      error: 'Failed to create bug fix PR',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle code review
async function handleReviewCode(
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any
) {
  try {
    const request: CodeAnalysisRequest = {
      codeContent: params.codeContent,
      analysisType: 'code_review',
      context: params.context,
      requirements: 'Provide comprehensive code review with suggestions'
    }

    const result = await claudeService.analyzeCode(request)

    // Store code review
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_review',
      task_description: 'Code review and recommendations',
      status: 'completed',
      ai_provider: 'claude',
      model_used: params.model || 'claude-3-5-sonnet-20241022',
      result_data: result,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      review: result
    })
  } catch (error) {
    console.error('Code review error:', error)
    return NextResponse.json({
      error: 'Code review failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback functions for when repository analysis is not available
async function generateCodeFallback(
  codeGenerator: CodeGenerator,
  specification: CodeSpecification
) {
  // Generate basic repository analysis for fallback
  const basicRepository = {
    repoUrl: 'unknown',
    structure: { path: 'root', type: 'directory' as const, children: [] },
    patterns: {
      framework: 'Unknown',
      architecture: ['Standard'],
      patterns: ['Module Pattern'],
      conventions: {
        naming: 'camelCase',
        structure: 'Standard',
        imports: 'ES6'
      },
      technologies: ['JavaScript']
    },
    dependencies: {
      imports: {},
      exports: {},
      functions: {},
      classes: {},
      relationships: []
    },
    framework: 'Unknown',
    primaryLanguage: 'javascript',
    summary: 'Repository analysis not available',
    recommendations: [],
    analyzedAt: new Date().toISOString(),
    fileCount: 0,
    codeFiles: [],
    testFiles: [],
    configFiles: []
  }

  return await codeGenerator.generateFromSpecification(specification, basicRepository)
}

async function handleAnalyzeBugFallback(
  bugReport: any,
  userId: string,
  supabase: any
) {
  // Basic bug analysis without repository context
  const basicAnalysis = {
    bugReport,
    repository: null,
    analysis: {
      rootCause: `Potential ${bugReport.category} issue requiring investigation`,
      confidence: 'low' as const,
      affectedComponents: [],
      relatedFiles: [],
      executionPath: ['User action', 'System processing', 'Error occurs'],
      dataFlow: []
    },
    suggestedFixes: [{
      approach: 'Investigation Required',
      description: 'Further investigation needed to identify root cause',
      priority: 'medium' as const,
      complexity: 'medium' as const,
      riskLevel: 'medium' as const,
      files: [],
      testCases: []
    }],
    preventionRecommendations: [
      'Add comprehensive logging',
      'Implement error monitoring',
      'Add input validation'
    ],
    monitoringRecommendations: [
      'Monitor error rates',
      'Track user feedback',
      'Set up alerts'
    ],
    estimatedEffort: 'Unknown - requires investigation',
    impactAssessment: {
      userImpact: bugReport.severity === 'critical' ? 'high' as const : 'medium' as const,
      businessImpact: 'medium' as const,
      technicalComplexity: 'medium' as const
    }
  }

  await supabase.from('sdlc_ai_task_executions').insert({
    user_id: userId,
    task_type: 'bug_analysis',
    task_description: bugReport.description,
    status: 'completed',
    ai_provider: 'claude',
    model_used: 'claude-3-5-sonnet-20241022',
    result_data: basicAnalysis,
    completed_at: new Date().toISOString()
  })

  return NextResponse.json({
    success: true,
    analysis: basicAnalysis,
    hasRepositoryContext: false
  })
} 