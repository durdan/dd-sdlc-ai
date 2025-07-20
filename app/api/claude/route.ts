import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClaudeCodeService, CodeAnalysisRequest, AgenticCodeRequest } from '@/lib/claude-service'
import { RepositoryAnalyzer } from '@/lib/repository-analyzer'
import { CodeGenerator, CodeSpecification } from '@/lib/code-generator'
import { BugDetector } from '@/lib/bug-detector'
import { GitHubClaudeService } from '@/lib/github-claude-service'
import { cookies } from 'next/headers'
import { withClaudeFreemium, ClaudeFreemiumResult } from '@/lib/claude-freemium-middleware'
import { UsageTrackingService } from '@/lib/usage-tracking-service'

// GET handler for retrieving specific projects
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const projectId = searchParams.get('project_id')
    
    if (action === 'get_project' && projectId) {
      const supabase = await createClient()
      
      // First try to find the project in project_generations (Claude Code Assistant projects)
      let { data: project, error } = await supabase
        .from('project_generations')
        .select('*')
        .eq('id', projectId)
        .single()
      
      // If not found there, try sdlc_ai_task_executions (AI task executions)
      if (error || !project) {
        console.log('Project not found in project_generations, trying sdlc_ai_task_executions...')
        const { data: taskProject, error: taskError } = await supabase
          .from('sdlc_ai_task_executions')
          .select('*')
          .eq('id', projectId)
          .single()
        
        if (taskError || !taskProject) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        
        project = taskProject
      }
      
      // Check if project has content
      const hasContent = project.metadata && Object.keys(project.metadata).length > 0
      const hasResultData = project.execution_result && Object.keys(project.execution_result).length > 0
      
      if (!hasContent && !hasResultData) {
        // Project exists but has no content - return project info with empty content flag
        return NextResponse.json({ 
          project: {
            ...project,
            has_content: false,
            message: 'Project exists but no content was stored. This may be an analytics-only record.'
          }
        })
      }
      
      return NextResponse.json({ project })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in Claude API GET:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Main Claude API handler with freemium support
export const POST = (request: NextRequest) => withClaudeFreemium(
  request,
  {
    projectType: 'claude_code_assistant',
    requiresAuth: true,
    allowSystemKey: true,
    maxTokens: 8192,
    estimatedCost: 0.024
  },
  async (freemiumResult: ClaudeFreemiumResult, usageTracker: UsageTrackingService) => {
    try {
      // Use the parsed body from the middleware instead of parsing again
      const body = freemiumResult.requestBody
      
      console.log('🔄 Unified Claude API Request received:', new Date().toISOString())
      console.log('📋 Action requested:', body.action)
      console.log('👤 User ID:', freemiumResult.userId)
      console.log('🔑 Using system key:', freemiumResult.useSystemKey)
      console.log('📝 Request params:', JSON.stringify(body, null, 2))

      // SECURITY CHECK: Prevent SDLC document creation from using Claude API
      if (body.action === 'create_sdlc_document' || 
          body.action === 'generate_sdlc' || 
          body.action === 'generate_document' ||
          body.documentType === 'business' ||
          body.documentType === 'functional' ||
          body.documentType === 'technical' ||
          body.documentType === 'ux' ||
          body.documentType === 'mermaid') {
        console.error('🚨 BLOCKED: SDLC document creation attempt via Claude API')
        console.error('🚨 This should use /api/generate-document or /api/sdlc-documents instead')
        return NextResponse.json({
          error: 'SDLC document creation should use the dedicated SDLC endpoints, not the Claude API',
          suggestion: 'Use /api/generate-document or /api/sdlc-documents for SDLC document creation'
        }, { status: 400 })
      }

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
          console.log('🔑 Found GitHub token in cookies')
        }
      } catch (error) {
        console.log('⚠️ No GitHub token found in cookies')
      }

      if (!githubToken) {
        githubToken = process.env.GITHUB_TOKEN
        console.log('🔑 Using system GitHub token from environment')
      }

      // Initialize services
      console.log('🔧 Initializing services...')
      const supabase = await createClient()
      
      // Fix service constructor calls
      const repositoryAnalyzer = githubToken ? new RepositoryAnalyzer(claudeService, githubToken) : null
      const codeGenerator = new CodeGenerator(claudeService)
      const bugDetector = new BugDetector(claudeService)
      const githubClaudeService = githubToken ? new GitHubClaudeService(githubToken) : null
      
      console.log('✅ Services initialized successfully')

      // Route to appropriate handler
      console.log('🎯 Routing to handler for action:', action)
      switch (action) {
        case 'analyze_code':
          console.log('📊 Executing analyze_code handler')
          return await handleAnalyzeCode(claudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'generate_code':
          console.log('🔨 Executing generate_code handler')
          if (!repositoryAnalyzer) {
            return NextResponse.json({ error: 'GitHub token required for code generation' }, { status: 400 })
          }
          return await handleGenerateCode(codeGenerator, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'create_implementation_pr':
          console.log('📤 Executing create_implementation_pr handler')
          if (!githubClaudeService) {
            return NextResponse.json({ error: 'GitHub token required for PR creation' }, { status: 400 })
          }
          return await handleCreateImplementationPR(githubClaudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'analyze_bug':
          console.log('🐛 Executing analyze_bug handler')
          return await handleAnalyzeBug(bugDetector, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'fix_bug':
          console.log('🔧 Executing fix_bug handler')
          return await handleFixBug(bugDetector, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'generate_tests':
          console.log('🧪 Executing generate_tests handler')
          if (!repositoryAnalyzer) {
            return NextResponse.json({ error: 'GitHub token required for test generation' }, { status: 400 })
          }
          return await handleGenerateTests(claudeService, repositoryAnalyzer, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'review_code':
          console.log('👀 Executing review_code handler')
          return await handleReviewCode(claudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'create_task':
          console.log('📋 Executing create_task handler')
          return await handleCreateTask(claudeService, params, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'list_tasks':
          console.log('📝 Executing list_tasks handler')
          return await handleListTasks(freemiumResult.userId!, supabase)
        
        case 'get_task':
          console.log('🔍 Executing get_task handler for taskId:', params.taskId)
          return await handleGetTask(params.taskId, freemiumResult.userId!, supabase)
        
        case 'retry_task':
          console.log('🔄 Executing retry_task handler for taskId:', params.taskId)
          return await handleRetryTask(params.taskId, claudeService, freemiumResult.userId!, supabase, freemiumResult)
        
        case 'cancel_task':
          console.log('❌ Executing cancel_task handler for taskId:', params.taskId)
          return await handleCancelTask(params.taskId, freemiumResult.userId!, supabase)
        
        case 'delete_task':
          console.log('🗑️ Executing delete_task handler for taskId:', params.taskId)
          return await handleDeleteTask(params.taskId, freemiumResult.userId!, supabase)
        
        default:
          console.log('❌ Invalid action requested:', action)
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } catch (error) {
      console.error('Error in Claude API:', error)
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
    structure: { path: 'unknown', type: 'directory' as const },
    patterns: {
      framework: 'unknown',
      architecture: ['unknown'],
      patterns: [],
      conventions: {
        naming: 'unknown',
        structure: 'unknown',
        imports: 'unknown'
      },
      technologies: []
    },
    dependencies: {
      imports: {},
      exports: {},
      functions: {},
      classes: {},
      relationships: []
    },
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

    let pullRequest
    try {
      pullRequest = await githubService.createImplementationBranch(
        params.repositoryUrl,
        params.generatedCode,
        {
          branchName: params.branchName,
          prTitle: params.prTitle,
          prDescription: params.prDescription,
          isDraft: params.isDraft
        }
      )
    } catch (error: any) {
      // Check for branch already exists error
      if (error.message && error.message.includes('Reference already exists')) {
        console.warn('Branch already exists, checking for existing PR...')
        const existingPR = await githubService.findPullRequestForBranch(params.repositoryUrl, params.branchName)
        if (existingPR) {
          return NextResponse.json({
            success: true,
            pull_request: existingPR,
            message: 'PR already exists for this branch',
            usage_info: {
              used_system_key: freemiumResult.useSystemKey,
              remaining_free_projects: freemiumResult.remainingProjects,
              ai_provider: 'claude'
            }
          })
        }
      }
      // Otherwise, rethrow
      throw error
    }

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

    const pullRequest = await githubService.createImplementationBranch(
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

// Handle bug fix generation with freemium
async function handleFixBug(
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
        error: 'Bug description is required for bug fix generation'
      }, { status: 400 })
    }

    console.log(`🔧 Generating bug fix for: ${params.bugDescription}`)

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
        console.warn('Repository analysis failed for bug fix generation')
      }
    }

    // First analyze the bug to get comprehensive analysis
    if (!repositoryAnalysis) {
      // Create a minimal repository analysis for bugs without repository context
      repositoryAnalysis = {
        repoUrl: 'unknown',
        structure: { path: 'unknown', type: 'directory' as const },
        patterns: { 
          framework: 'unknown', 
          architecture: ['unknown'], 
          patterns: [], 
          conventions: {
            naming: 'unknown',
            structure: 'unknown',
            imports: 'unknown'
          }, 
          technologies: [] 
        },
        dependencies: {
          imports: {},
          exports: {},
          functions: {},
          classes: {},
          relationships: []
        },
        framework: 'unknown',
        primaryLanguage: 'unknown',
        summary: 'No repository context available',
        recommendations: [],
        analyzedAt: new Date().toISOString(),
        fileCount: 0,
        codeFiles: [],
        testFiles: [],
        configFiles: []
      }
    }
    
    const bugAnalysis = await bugDetector.analyzeBugReport(bugReport, repositoryAnalysis)
    
    // Then generate the fix implementation
    const bugFix = await bugDetector.generateBugFix(bugAnalysis)

    // Store bug fix in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'bug_fix',
      repository_url: params.repositoryUrl,
      task_description: bugReport.description,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: bugFix,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      bug_fix: bugFix,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Bug fix generation error:', error)
    return NextResponse.json({
      error: 'Bug fix generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle test generation with freemium
async function handleGenerateTests(
  claudeService: ClaudeCodeService,
  repositoryAnalyzer: RepositoryAnalyzer,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    if (!params.codeContent && !params.repositoryUrl) {
      return NextResponse.json({
        error: 'Code content or repository URL is required for test generation'
      }, { status: 400 })
    }

    console.log(`🧪 Generating tests for: ${params.repositoryUrl || 'provided code'}`)

    // Get repository analysis if available
    let repositoryAnalysis = null
    if (params.repositoryUrl) {
      try {
        repositoryAnalysis = await repositoryAnalyzer.analyzeRepository(params.repositoryUrl)
      } catch (error) {
        console.warn('Repository analysis failed for test generation')
      }
    }

    // Create test generation request
    const testRequest = {
      codeContent: params.codeContent,
      repositoryUrl: params.repositoryUrl,
      testType: params.testType || 'unit',
      testFramework: params.testFramework,
      coverage: params.coverage || 'comprehensive',
      context: params.context
    }

    // Generate tests using Claude
    const analysisRequest = {
      repositoryUrl: params.repositoryUrl,
      codeContent: params.codeContent,
      analysisType: 'code_review' as const,
      context: `Generate comprehensive tests for the provided code. Test type: ${testRequest.testType}. Framework: ${testRequest.testFramework || 'auto-detect'}. Coverage: ${testRequest.coverage}.`,
      requirements: params.requirements || 'Generate comprehensive test suite with good coverage'
    }

    const testGeneration = await claudeService.analyzeCode(analysisRequest)

    // Store test generation in database with freemium info
    await supabase.from('sdlc_ai_task_executions').insert({
      user_id: userId,
      task_type: 'test_generation',
      repository_url: params.repositoryUrl,
      task_description: `Test generation for ${params.repositoryUrl || 'provided code'}`,
      status: 'completed',
      ai_provider: 'claude',
      model_used: 'claude-3-5-sonnet-20241022',
      result_data: testGeneration,
      completed_at: new Date().toISOString(),
      used_system_key: freemiumResult.useSystemKey
    })

    return NextResponse.json({
      success: true,
      test_generation: testGeneration,
      usage_info: {
        used_system_key: freemiumResult.useSystemKey,
        remaining_free_projects: freemiumResult.remainingProjects,
        ai_provider: 'claude'
      }
    })

  } catch (error) {
    console.error('Test generation error:', error)
    return NextResponse.json({
      error: 'Test generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Utility function to format task for response
function formatTaskForResponse(task: any): any {
  return {
    id: task.id,
    type: task.task_type,
    status: task.status,
    priority: task.priority,
    description: task.description,
    repository: task.repository_owner && task.repository_name ? {
      owner: task.repository_owner,
      name: task.repository_name,
      branch: task.repository_branch || 'main'
    } : null,
    github_issue_url: task.github_issue_url,
    context: task.context,
    requirements: task.requirements,
    created_at: task.created_at,
    started_at: task.started_at,
    completed_at: task.completed_at,
    progress: calculateTaskProgress(task.status),
    steps: generateTaskSteps(task.task_type, task.status),
    execution_result: task.execution_result,
    result: task.execution_result
  }
}

// Utility function to map task types from API to database constraint values
function mapTaskTypeForDatabase(taskType: string): string {
  const typeMapping: Record<string, string> = {
    'bug_fix': 'bug-fix',
    'feature': 'feature',
    'review': 'review',
    'test-generation': 'test-generation',
    'testing': 'test-generation',
    'refactor': 'refactor',
    'refactoring': 'refactor'
  }
  
  return typeMapping[taskType] || 'feature'
}

// Handle task creation with freemium integration
async function handleCreateTask(
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    console.log(`🎯 Creating task for user: ${userId}`)
    console.log(`📝 Task parameters:`, JSON.stringify(params, null, 2))
    
    // Extract repository information from params
    let repositoryOwner = null
    let repositoryName = null
    let repositoryBranch = 'main'
    
    // Parse repository information if provided
    if (params.repository) {
      if (typeof params.repository === 'string') {
        // Handle "owner/repo" format
        const parts = params.repository.split('/')
        if (parts.length >= 2) {
          repositoryOwner = parts[0]
          repositoryName = parts[1]
        }
      } else if (typeof params.repository === 'object') {
        // Handle repository object format
        repositoryOwner = params.repository.owner
        repositoryName = params.repository.name
        repositoryBranch = params.repository.branch || 'main'
      }
    }
    
    console.log(`🏗️ Repository info:`, { repositoryOwner, repositoryName, repositoryBranch })

    // Generate task ID
    const taskId = `claude-task-${userId}-${Date.now()}`
    console.log(`🆔 Generated task ID: ${taskId}`)

    // Create the task record in database
    const { data: insertedTask, error: insertError } = await supabase
      .from('sdlc_ai_task_executions')
      .insert({
        id: taskId,
        user_id: userId,
        task_type: mapTaskTypeForDatabase(params.type || 'feature'),
        status: 'pending',
        priority: params.priority || 'medium',
        description: params.description || params.task || 'No description provided',
        repository_owner: repositoryOwner,
        repository_name: repositoryName,
        repository_branch: repositoryBranch,
        github_issue_url: params.github_issue_url || null,
        context: params.context || params.codebase_context || 'No context provided',
        requirements: params.requirements || params.specific_request || params.description || 'No requirements provided',
        execution_config: {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8192,
          temperature: 0.1,
          use_system_key: freemiumResult.useSystemKey
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error inserting task:', insertError)
      return NextResponse.json({
        error: 'Failed to create task',
        details: insertError.message
      }, { status: 500 })
    }

    console.log(`✅ Task created successfully in database:`, taskId)

        // Record usage for freemium tracking
    console.log(`📊 Recording project generation...`)
    if (freemiumResult.usageTracker) {
      await freemiumResult.usageTracker.recordProjectGeneration({
        user_id: userId,
        project_type: 'claude_code_assistant',
        generation_method: freemiumResult.useSystemKey ? 'system_key' : 'user_key',
        ai_provider: 'claude',
        tokens_used: 0, // Will be updated when task completes
        cost_estimate: 0, // Will be updated when task completes
        generation_time_ms: 0, // Will be updated when task completes
        success: true, // Task creation was successful
        metadata: {
          task_id: insertedTask.id,
          task_type: params.type,
          repository: params.repository,
          description: params.description
        }
      })
      console.log(`✅ Project generation recorded successfully`)
    }

    // Execute the task synchronously to get immediate feedback
    console.log('🚀 Starting synchronous task processing...')
    
    try {
      // Call the actual executeTaskAsync function synchronously
      const result = await executeTaskAsync(insertedTask.id, claudeService, params, userId, supabase, freemiumResult)
      console.log('✅ Synchronous task processing completed successfully for task:', insertedTask.id)
      
      // Get the updated task from database with the execution result
      const { data: updatedTask, error: fetchError } = await supabase
        .from('sdlc_ai_task_executions')
        .select('*')
        .eq('id', insertedTask.id)
        .single()
      
      if (fetchError) {
        console.error('❌ Error fetching updated task:', fetchError)
        return NextResponse.json({
          success: true,
          task: formatTaskForResponse(insertedTask),
          warning: 'Task executed but failed to fetch updated status'
        })
      }
      
      console.log('📤 Returning task execution response with results...')
      return NextResponse.json({
        success: true,
        task: formatTaskForResponse(updatedTask),
        execution_result: updatedTask.execution_result
      })
      
    } catch (error) {
      console.error('❌ Synchronous task processing failed for task:', insertedTask.id, error)
      
      // Update task status to failed
      await supabase
        .from('sdlc_ai_task_executions')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', insertedTask.id)
      
      return NextResponse.json({
        success: false,
        error: 'Task execution failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        task: formatTaskForResponse(insertedTask)
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in handleCreateTask:', error)
    return NextResponse.json({
      error: 'Failed to create task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle task listing
async function handleListTasks(
  userId: string,
  supabase: any
): Promise<NextResponse> {
  try {
    const { data: tasks, error } = await supabase
      .from('sdlc_ai_task_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({
        error: 'Failed to fetch tasks',
        details: error.message
      }, { status: 500 })
    }

    // Transform tasks to match expected format
    const formattedTasks = tasks.map((task: any) => ({
      id: task.id,
      type: task.task_type,
      status: task.status,
      priority: task.priority,
      description: task.description,
      repository: task.repository_owner && task.repository_name ? {
        owner: task.repository_owner,
        name: task.repository_name,
        branch: task.repository_branch || 'main'
      } : null,
      github_issue_url: task.github_issue_url,
      context: task.context,
      requirements: task.requirements,
      execution_config: task.execution_config,
      execution_result: task.execution_result,
      execution_logs: task.execution_logs,
      safety_checks: task.safety_checks,
      rollback_points: task.rollback_points,
      estimated_duration: task.estimated_duration,
      actual_duration: task.actual_duration,
      created_at: task.created_at,
      started_at: task.started_at,
      completed_at: task.completed_at,
      progress: calculateTaskProgress(task.status),
      steps: generateTaskSteps(task.task_type, task.status),
      result: task.execution_result
    }))

    return NextResponse.json({
      success: true,
      tasks: formattedTasks
    })
  } catch (error) {
    console.error('Error in handleListTasks:', error)
    return NextResponse.json({
      error: 'Failed to fetch tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle getting a specific task
async function handleGetTask(
  taskId: string,
  userId: string,
  supabase: any
): Promise<NextResponse> {
  try {
    const { data: tasks, error } = await supabase
      .from('sdlc_ai_task_executions')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching task:', error)
      return NextResponse.json({
        error: 'Failed to fetch task',
        details: error.message
      }, { status: 500 })
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        error: 'Task not found'
      }, { status: 404 })
    }

    const task = tasks[0] // Get the first task

    // Transform task to match expected format
    const formattedTask = {
      id: task.id,
      type: task.task_type,
      status: task.status,
      priority: task.priority,
      description: task.description,
      repository: task.repository_owner && task.repository_name ? {
        owner: task.repository_owner,
        name: task.repository_name,
        branch: task.repository_branch || 'main'
      } : null,
      github_issue_url: task.github_issue_url,
      context: task.context,
      requirements: task.requirements,
      execution_config: task.execution_config,
      execution_result: task.execution_result,
      execution_logs: task.execution_logs,
      safety_checks: task.safety_checks,
      rollback_points: task.rollback_points,
      estimated_duration: task.estimated_duration,
      actual_duration: task.actual_duration,
      created_at: task.created_at,
      started_at: task.started_at,
      completed_at: task.completed_at,
      progress: calculateTaskProgress(task.status),
      steps: generateTaskSteps(task.task_type, task.status)
    }

    return NextResponse.json({
      success: true,
      task: formattedTask
    })
  } catch (error) {
    console.error('Error in handleGetTask:', error)
    return NextResponse.json({
      error: 'Failed to fetch task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle task retry
async function handleRetryTask(
  taskId: string,
  claudeService: ClaudeCodeService,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
): Promise<NextResponse> {
  try {
    // First get the task to verify ownership and get details
    const { data: task, error: fetchError } = await supabase
      .from('sdlc_ai_task_executions')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching task for retry:', fetchError)
      return NextResponse.json({
        error: 'Failed to fetch task for retry',
        details: fetchError.message
      }, { status: 500 })
    }

    if (!task) {
      return NextResponse.json({
        error: 'Task not found'
      }, { status: 404 })
    }

    // Reset task to pending status
    const { error: updateError } = await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: 'pending',
        execution_result: null,
        execution_logs: [],
        started_at: null,
        completed_at: null,
        actual_duration: null
      })
      .eq('id', taskId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating task for retry:', updateError)
      return NextResponse.json({
        error: 'Failed to update task for retry',
        details: updateError.message
      }, { status: 500 })
    }

    // Re-queue the task for execution
    // This would normally trigger background processing
    console.log(`🔄 Task ${taskId} has been reset for retry`)

    return NextResponse.json({
      success: true,
      message: 'Task has been reset for retry',
      task: {
        id: taskId,
        status: 'pending'
      }
    })
  } catch (error) {
    console.error('Error in handleRetryTask:', error)
    return NextResponse.json({
      error: 'Failed to retry task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle task cancellation
async function handleCancelTask(
  taskId: string,
  userId: string,
  supabase: any
): Promise<NextResponse> {
  try {
    const { error } = await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error cancelling task:', error)
      return NextResponse.json({
        error: 'Failed to cancel task',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task cancelled successfully'
    })
  } catch (error) {
    console.error('Error in handleCancelTask:', error)
    return NextResponse.json({
      error: 'Failed to cancel task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Handle task deletion
async function handleDeleteTask(
  taskId: string,
  userId: string,
  supabase: any
): Promise<NextResponse> {
  try {
    const { error } = await supabase
      .from('sdlc_ai_task_executions')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({
        error: 'Failed to delete task',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error in handleDeleteTask:', error)
    return NextResponse.json({
      error: 'Failed to delete task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Progress tracking helper function
async function updateTaskProgress(
  taskId: string,
  supabase: any,
  status: string,
  progressMessage: string,
  progressPercentage?: number
) {
  try {
    const currentTime = new Date().toISOString()
    
    // Get current execution logs
    const { data: currentTask } = await supabase
      .from('sdlc_ai_task_executions')
      .select('execution_logs')
      .eq('id', taskId)
      .single()
    
    const currentLogs = currentTask?.execution_logs || []
    const newLog = {
      timestamp: currentTime,
      message: progressMessage,
      progress: progressPercentage || 0
    }
    
    // Update task with new progress
    await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: status,
        execution_logs: [...currentLogs, newLog],
        ...(progressPercentage && { progress: progressPercentage })
      })
      .eq('id', taskId)
      
    console.log(`📊 Progress updated: ${progressMessage}`)
  } catch (error) {
    console.error('❌ Error updating progress:', error)
  }
}

// Async task execution function
async function executeTaskAsync(
  taskId: string,
  claudeService: ClaudeCodeService,
  params: any,
  userId: string,
  supabase: any,
  freemiumResult: ClaudeFreemiumResult
) {
  try {
    console.log(`🚀 Starting async execution for task: ${taskId}`)
    console.log(`📋 Task params:`, JSON.stringify(params, null, 2))
    console.log(`👤 User ID: ${userId}`)
    console.log(`🔑 Using system key: ${freemiumResult.useSystemKey}`)

    // Progress update: Starting task
    await updateTaskProgress(taskId, supabase, 'analyzing', '🚀 Starting task execution...', 10)

    // Get task details from database to access repository information
    const { data: taskData, error: taskError } = await supabase
      .from('sdlc_ai_task_executions')
      .select('*')
      .eq('id', taskId)
      .single()

    if (taskError || !taskData) {
      console.error('❌ Error fetching task details:', taskError)
      throw new Error('Failed to fetch task details')
    }

    // Progress update: Analyzing requirements
    await updateTaskProgress(taskId, supabase, 'analyzing', '📋 Analyzing task requirements...', 20)

    // Update task status to in progress
    console.log(`📝 Updating task status to 'executing'...`)
    await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: 'executing',
        started_at: new Date().toISOString()
      })
      .eq('id', taskId)

    console.log(`✅ Task status updated to 'executing'`)

    // Build repository context if repository information is available
    let repositoryContext = params.context || 'No specific context provided'
    
    if (taskData.repository_owner && taskData.repository_name) {
      console.log(`🏗️ Building repository context for: ${taskData.repository_owner}/${taskData.repository_name}`)
      
      // Progress update: Building repository context
      await updateTaskProgress(taskId, supabase, 'planning', '🏗️ Building repository context...', 30)
      
      // Try to get GitHub token from cookies/user config
      let githubToken = null
      try {
        const { data: githubConfig } = await supabase
          .from('sdlc_user_integrations')
          .select('encrypted_api_key')
          .eq('user_id', userId)
          .eq('integration_type', 'github')
          .eq('is_active', true)
          .single()
        
        if (githubConfig?.encrypted_api_key) {
          githubToken = githubConfig.encrypted_api_key
          console.log(`🔑 Found user GitHub token`)
        }
      } catch (error) {
        console.log(`⚠️ No user GitHub token found, using system token if available`)
      }

      // Fall back to system GitHub token
      if (!githubToken) {
        githubToken = process.env.GITHUB_TOKEN
        if (githubToken) {
          console.log(`🔑 Using system GitHub token`)
        }
      }

      // Enhanced repository context with GitHub information
      const repoInfo = {
        owner: taskData.repository_owner,
        name: taskData.repository_name,
        branch: taskData.repository_branch || 'main',
        url: `https://github.com/${taskData.repository_owner}/${taskData.repository_name}`,
        issue_url: taskData.github_issue_url
      }

      repositoryContext = `
Repository Information:
- Repository: ${repoInfo.owner}/${repoInfo.name}
- Branch: ${repoInfo.branch}
- URL: ${repoInfo.url}
${repoInfo.issue_url ? `- Related Issue: ${repoInfo.issue_url}` : ''}

Original Context:
${params.context || 'No additional context provided'}

Please analyze this repository and provide context-aware solutions that consider the existing codebase structure and patterns.
      `.trim()

      console.log(`📋 Enhanced repository context built`)
    }

    // Progress update: Preparing Claude request
    await updateTaskProgress(taskId, supabase, 'planning', '🤖 Preparing Claude API request...', 50)

    // Create the appropriate request based on task type
    let result
    console.log(`🤖 Preparing Claude API request for task type: ${params.type}`)
    
    if (params.type === 'bug_fix') {
      console.log(`🐛 Making Claude API call for bug fix...`)
      
      // Progress update: Starting bug fix analysis
      await updateTaskProgress(taskId, supabase, 'executing', '🐛 Starting bug fix analysis...', 60)
      
      const claudeRequest = {
        task_type: 'bug_fix' as const,
        codebase_context: repositoryContext,
        specific_request: params.description,
        requirements: params.requirements || params.context || params.description
      }
      console.log(`📤 Claude request payload:`, JSON.stringify(claudeRequest, null, 2))
      
      // Progress update: Calling Claude API
      await updateTaskProgress(taskId, supabase, 'executing', '🚀 Calling Claude API for bug fix...', 70)
      
      result = await claudeService.generateAgenticCode(claudeRequest)
      console.log(`✅ Claude API call completed for bug fix`)
    } else {
      console.log(`⚡ Making Claude API call for feature implementation...`)
      
      // Progress update: Starting feature implementation
      await updateTaskProgress(taskId, supabase, 'executing', '⚡ Starting feature implementation...', 60)
      
      const claudeRequest = {
        task_type: 'feature_implementation' as const,
        codebase_context: repositoryContext,
        specific_request: params.description,
        requirements: params.requirements || params.context || params.description
      }
      console.log(`📤 Claude request payload:`, JSON.stringify(claudeRequest, null, 2))
      
      // Progress update: Calling Claude API
      await updateTaskProgress(taskId, supabase, 'executing', '🚀 Calling Claude API for feature implementation...', 70)
      
      result = await claudeService.generateAgenticCode(claudeRequest)
      console.log(`✅ Claude API call completed for feature implementation`)
    }

    console.log(`📊 Claude API response received:`, result ? 'Success' : 'No result')
    
    // Progress update: Processing results
    await updateTaskProgress(taskId, supabase, 'reviewing', '📊 Processing Claude API response...', 80)
    
    // Progress update: Finalizing task
    await updateTaskProgress(taskId, supabase, 'reviewing', '✅ Finalizing task completion...', 90)
    
    console.log(`📝 Updating task status to 'completed'...`)

    // Update task as completed
    await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: 'completed',
        execution_result: result,
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)

    // Final progress update
    await updateTaskProgress(taskId, supabase, 'completed', '🎉 Task completed successfully!', 100)

    console.log(`✅ Task ${taskId} completed successfully`)
    
    // Return the result for synchronous execution
    return result

  } catch (error) {
    console.error(`❌ ===============================`)
    console.error(`❌ TASK EXECUTION FAILURE`)
    console.error(`❌ ===============================`)
    console.error(`❌ Task ID: ${taskId}`)
    console.error(`❌ User ID: ${userId}`)
    console.error(`❌ Task Type: ${params.type}`)
    console.error(`❌ Repository: ${params.repository}`)
    console.error(`❌ Error:`, error)
    console.error(`❌ Error Message:`, error instanceof Error ? error.message : 'Unknown error')
    console.error(`❌ Error Stack:`, error instanceof Error ? error.stack : 'No stack trace')
    console.error(`❌ ===============================`)
    
    // Determine error type and create detailed error message
    let errorMessage = 'Unknown error occurred'
    let errorType = 'unknown'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Categorize error types
      if (error.message.includes('API key')) {
        errorType = 'api_key'
        errorMessage = 'Claude API key not configured or invalid'
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorType = 'rate_limit'
        errorMessage = 'Claude API rate limit exceeded'
      } else if (error.message.includes('timeout')) {
        errorType = 'timeout'
        errorMessage = 'Claude API request timed out'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorType = 'network'
        errorMessage = 'Network error connecting to Claude API'
      } else {
        errorType = 'claude_api'
        errorMessage = `Claude API error: ${error.message}`
      }
    }
    
    console.error(`❌ Error Type: ${errorType}`)
    console.error(`❌ Processed Message: ${errorMessage}`)
    
    // Update task as failed with detailed error information
    await supabase
      .from('sdlc_ai_task_executions')
      .update({
        status: 'failed',
        error_message: errorMessage,
        execution_result: {
          error: true,
          error_type: errorType,
          error_message: errorMessage,
          raw_error: error instanceof Error ? error.message : String(error),
          stack_trace: error instanceof Error ? error.stack : null,
          timestamp: new Date().toISOString()
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
    
    console.error(`❌ Task status updated to 'failed' in database`)
    console.error(`❌ ===============================`)
  }
}

// Utility function to calculate task progress based on status
function calculateTaskProgress(status: string): number {
  const progressMap: Record<string, number> = {
    'pending': 0,
    'analyzing': 20,
    'planning': 40,
    'executing': 60,
    'reviewing': 80,
    'completed': 100,
    'failed': 0,
    'cancelled': 0,
    'rollback_completed': 100
  }
  return progressMap[status] || 0
}

// Utility function to generate task steps based on type and status
function generateTaskSteps(taskType: string, currentStatus: string): Array<{
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}> {
  const stepSequence = [
    'pending',
    'analyzing', 
    'planning',
    'executing',
    'reviewing',
    'completed'
  ]
  
  const stepNames: Record<string, string> = {
    'pending': 'Queue Task',
    'analyzing': 'Analyze Requirements',
    'planning': 'Create Implementation Plan',
    'executing': 'Execute Changes',
    'reviewing': 'Review & Validate',
    'completed': 'Task Complete'
  }
  
  const currentIndex = stepSequence.indexOf(currentStatus)
  
  return stepSequence.slice(0, -1).map((step, index) => {
    let status: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending'
    
    if (currentStatus === 'failed' || currentStatus === 'cancelled') {
      status = index <= currentIndex ? 'failed' : 'pending'
    } else if (index < currentIndex) {
      status = 'completed'
    } else if (index === currentIndex) {
      status = 'in_progress'
    }
    
    return {
      name: stepNames[step] || step,
      status
    }
  })
}