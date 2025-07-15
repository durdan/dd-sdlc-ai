import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, CodeAnalysisRequest, AgenticCodeRequest } from '@/lib/claude-service'
import { RepositoryAnalyzer } from '@/lib/repository-analyzer'
import { CodeGenerator, CodeSpecification } from '@/lib/code-generator'
import { BugDetector } from '@/lib/bug-detector'
import { GitHubClaudeService } from '@/lib/github-claude-service'
import { cookies } from 'next/headers'
import { withClaudeFreemiumSupport, ClaudeFreemiumResult } from '@/lib/claude-freemium-middleware'

// Main Claude API handler with freemium support
export const POST = withClaudeFreemiumSupport(
  {
    projectType: 'claude_code_assistant',
    requiresAuth: true,
    allowSystemKey: true,
    maxTokens: 8192,
    estimatedCost: 0.024
  },
  async (request: NextRequest, freemiumResult: ClaudeFreemiumResult, body: any) => {
    try {
      console.log('🔄 Unified Claude API Request received:', new Date().toISOString())
      console.log('📋 Action requested:', body.action)
      console.log('👤 User ID:', freemiumResult.userId)
      console.log('🔑 Using system key:', freemiumResult.useSystemKey)

      const { action, ...params } = body
      
      // Use the Claude service from freemium middleware
      const claudeService = freemiumResult.claudeService!

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

      // Initialize additional services if GitHub token is available
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

      // Get supabase client for database operations
      const supabase = createClient()

      // Route to appropriate action
      switch (action) {
        case 'test_connection':
          return await handleTestConnection(claudeService, freemiumResult)
        
        case 'analyze_code':
          return await handleAnalyzeCode(claudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'generate_code':
          if (!codeGenerator || !repositoryAnalyzer) {
            return NextResponse.json({ 
              error: 'GitHub integration required for code generation',
              details: 'Please connect your GitHub account in the Integration Hub'
            }, { status: 400 })
          }
          return await handleGenerateCode(codeGenerator, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'analyze_repository':
          if (!repositoryAnalyzer) {
            return NextResponse.json({ 
              error: 'GitHub integration required for repository analysis',
              details: 'Please connect your GitHub account in the Integration Hub'
            }, { status: 400 })
          }
          return await handleAnalyzeRepository(repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'analyze_bug':
          if (!bugDetector) {
            return NextResponse.json({ 
              error: 'GitHub integration required for bug analysis',
              details: 'Please connect your GitHub account in the Integration Hub'
            }, { status: 400 })
          }
          return await handleAnalyzeBug(bugDetector, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'create_implementation_pr':
          if (!githubService) {
            return NextResponse.json({ 
              error: 'GitHub integration required for PR creation',
              details: 'Please connect your GitHub account in the Integration Hub'
            }, { status: 400 })
          }
          return await handleCreateImplementationPR(githubService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'create_bugfix_pr':
          if (!githubService) {
            return NextResponse.json({ 
              error: 'GitHub integration required for PR creation',
              details: 'Please connect your GitHub account in the Integration Hub'
            }, { status: 400 })
          }
          return await handleCreateBugfixPR(githubService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'review_code':
          return await handleReviewCode(claudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
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
)

// Handle test connection with freemium result
async function handleTestConnection(
  claudeService: ClaudeCodeService,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    const testResult = await claudeService.testConnection()
    
    return NextResponse.json({
      success: true,
      result: testResult,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    }, { status: 500 })
  }
}

// Handle code analysis with freemium integration
async function handleAnalyzeCode(
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    const request: CodeAnalysisRequest = {
      repositoryUrl: params.repositoryUrl,
      codeContent: params.codeContent,
      analysisType: params.analysisType || 'code_review',
      context: params.context,
      requirements: params.requirements
    }

    const result = await claudeService.analyzeCode(request)

    // Store analysis in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_analysis',
      repository_url: params.repositoryUrl,
      task_description: `${request.analysisType} analysis`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: params.model || 'claude-3-5-sonnet-20241022',
      result_data: result,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      analysis: result,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })
  } catch (error) {
    console.error('Code analysis error:', error)
    return NextResponse.json({
      error: 'Code analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle code generation with repository context - ENHANCED with freemium
async function handleGenerateCode(
  codeGenerator: CodeGenerator,
  repositoryAnalyzer: RepositoryAnalyzer,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
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

    // Store generation result in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_generation',
      repository_url: params.repositoryUrl,
      task_description: specification.description,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: generatedCode,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      generated_code: generatedCode,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Code generation error:', error)
    return NextResponse.json({
      error: 'Code generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Continue with other handlers...
// (The rest of the handlers would follow the same pattern with freemium integration)

// Fallback for code generation without repository context
async function generateCodeFallback(
  codeGenerator: CodeGenerator,
  specification: CodeSpecification
): Promise<any> {
  // Generate code without repository context
  return await codeGenerator.generateFromSpecification(specification, {
    repoUrl: 'unknown',
    structure: {},
    patterns: [],
    dependencies: [],
    framework: 'unknown',
    primaryLanguage: 'unknown',
    summary: 'No repository context available',
    recommendations: [],
    analyzedAt: new Date().toISOString(),
    fileCount: 0,
    codeFiles: [],
    testFiles: [],
    configFiles: []
  })
}

// Handle repository analysis - ENHANCED with freemium
async function handleAnalyzeRepository(
  repositoryAnalyzer: RepositoryAnalyzer,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
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
        cached: true,
        usage_info: {
          used_system_key: freemiumResult.useSystemKey,
          remaining_free_projects: freemiumResult.remainingProjects,
          ai_provider: 'claude'
        }
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

    // Also store in task executions for tracking with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'repository_analysis',
      repository_url: params.repositoryUrl,
      task_description: 'Repository analysis and pattern detection',
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: analysis,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      analysis,
      cached: false,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Repository analysis error:', error)
    return NextResponse.json({
      error: 'Repository analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle bug analysis - ENHANCED with freemium
async function handleAnalyzeBug(
  bugDetector: BugDetector,
  repositoryAnalyzer: RepositoryAnalyzer | null,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
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
      return await handleAnalyzeBugFallback(bugReport, userId, supabase, freemiumResult)
    }

    // Perform comprehensive bug analysis
    const analysis = await bugDetector.analyzeBugReport(bugReport, repositoryAnalysis)

    // Store bug analysis with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'bug_analysis',
      repository_url: params.repositoryUrl,
      task_description: bugReport.description,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: analysis,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      analysis,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Bug analysis error:', error)
    return NextResponse.json({
      error: 'Bug analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle bug analysis fallback
async function handleAnalyzeBugFallback(
  bugReport: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  // Simplified bug analysis without repository context
  const analysis = {
    bug_report: bugReport,
    potential_causes: ['Repository context not available for detailed analysis'],
    recommendations: ['Please provide repository URL for more detailed analysis'],
    severity_assessment: bugReport.severity,
    estimated_fix_time: 'Unknown without repository context'
  }

  // Store bug analysis with freemium info
  await supabase.from('sdlc_ai_task_executions').insert({
    user_id: userId,
    task_type: 'bug_analysis',
    repository_url: null,
    task_description: bugReport.description,
    status: 'completed',
    ai_provider: 'claude',
    model_used: 'claude-3-5-sonnet-20241022',
    result_data: analysis,
    completed_at: new Date().toISOString(),
    used_system_key: freemiumResult.useSystemKey
  })

  return NextResponse.json({
    success: true,
    analysis,
    usage_info: {
      used_system_key: freemiumResult.useSystemKey,
      remaining_free_projects: freemiumResult.remainingProjects,
      ai_provider: 'claude'
    }
  })
}

// Handle creating implementation PR with freemium
async function handleCreateImplementationPR(
  githubService: GitHubClaudeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
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

    // Store PR creation in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'pr_creation',
      repository_url: params.repositoryUrl,
      task_description: `Created implementation PR: ${pullRequest.title}`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: pullRequest,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    // Update the task result in task store with PR information
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
      pull_request: pullRequest,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('PR creation error:', error)
    return NextResponse.json({
      error: 'PR creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle creating bugfix PR with freemium
async function handleCreateBugfixPR(
  githubService: GitHubClaudeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    if (!params.repositoryUrl || !params.bugfixCode) {
      return NextResponse.json({
        error: 'Repository URL and bugfix code are required'
      }, { status: 400 })
    }

    console.log(`🐛 Creating bugfix PR for: ${params.repositoryUrl}`)

    const pullRequest = await githubService.createBugfixBranch(
      params.repositoryUrl,
      params.bugfixCode,
      {
        branchName: params.branchName,
        prTitle: params.prTitle,
        prDescription: params.prDescription,
        isDraft: params.isDraft
      }
    )

    // Store PR creation in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'bugfix_pr_creation',
      repository_url: params.repositoryUrl,
      task_description: `Created bugfix PR: ${pullRequest.title}`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: pullRequest,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      pull_request: pullRequest,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Bugfix PR creation error:', error)
    return NextResponse.json({
      error: 'Bugfix PR creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle code review with freemium
async function handleReviewCode(
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    if (!params.codeContent) {
      return NextResponse.json({
        error: 'Code content is required for review'
      }, { status: 400 })
    }

    console.log(`🔍 Starting code review`)

    const reviewRequest: CodeAnalysisRequest = {
      codeContent: params.codeContent,
      analysisType: 'code_review',
      context: params.context,
      requirements: params.requirements,
      repositoryUrl: params.repositoryUrl
    }

    const review = await claudeService.analyzeCode(reviewRequest)

    // Store code review in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'code_review',
      repository_url: params.repositoryUrl,
      task_description: 'Code review analysis',
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: review,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      review,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Code review error:', error)
    return NextResponse.json({
      error: 'Code review failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 