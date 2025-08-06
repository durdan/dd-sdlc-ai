import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'
import { GitHubProjectsService } from '@/lib/github-projects-service'
import { SDLCGitHubProjectsMapping } from '@/lib/github-projects-sdlc-mapping'

// ============================================================================
// GitHub Projects Integration API
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's GitHub integration from database
    const { data: gitHubConfig, error: configError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (configError || !gitHubConfig || !gitHubConfig.access_token_encrypted) {
      return NextResponse.json({ 
        error: 'GitHub not connected. Please connect your GitHub account first.',
        connected: false 
      }, { status: 400 })
    }

    const { action, ...params } = await req.json()

    // Initialize GitHub Projects service with user's token
    const githubService = new GitHubProjectsService(gitHubConfig.access_token_encrypted)
    const mappingService = new SDLCGitHubProjectsMapping(githubService)

    switch (action) {
      case 'connect':
        return await handleConnect(githubService)
      
      case 'get-user':
        return await handleGetUser(githubService)
      
      case 'get-organizations':
        return await handleGetOrganizations(githubService, params)
      
      case 'get-projects':
        return await handleGetProjects(githubService, params)
      
      case 'create-project':
        return await handleCreateProject(githubService, params)
      
      case 'create-sdlc-project':
        return await handleCreateSDLCProject(githubService, mappingService, params, user.id)
      
      case 'get-project':
        return await handleGetProject(githubService, params)
      
      case 'update-project':
        return await handleUpdateProject(githubService, params)
      
      case 'delete-project':
        return await handleDeleteProject(githubService, params)
      
      case 'create-milestone':
        return await handleCreateMilestone(githubService, params)
      
      case 'create-issue':
        return await handleCreateIssue(githubService, params)
      
      case 'add-item-to-project':
        return await handleAddItemToProject(githubService, params)
      
      case 'update-item-field':
        return await handleUpdateItemField(githubService, params)
      
      case 'export-project':
        return await handleExportProject(githubService, params)
      
      case 'get-repositories':
        return await handleGetRepositories(githubService, params)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('GitHub Projects API error:', error)
    return NextResponse.json({ 
      error: 'GitHub Projects integration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's GitHub integration from database
    const { data: gitHubConfig, error: configError } = await supabase
      .from('sdlc_github_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (configError || !gitHubConfig || !gitHubConfig.access_token_encrypted) {
      return NextResponse.json({ 
        error: 'GitHub not connected. Please connect your GitHub account first.',
        connected: false 
      }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    // Initialize GitHub Projects service with user's token
    const githubService = new GitHubProjectsService(gitHubConfig.access_token_encrypted)

    switch (action) {
      case 'status':
        return await handleGetStatus(githubService)
      
      case 'projects':
        return await handleGetUserProjects(githubService, searchParams)
      
      case 'organizations':
        return await handleGetUserOrganizations(githubService)
      
      case 'repositories':
        return await handleGetUserRepositories(githubService, searchParams, gitHubConfig.access_token_encrypted)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('GitHub Projects API error:', error)
    return NextResponse.json({ 
      error: 'GitHub Projects integration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ============================================================================
// Connection Handlers
// ============================================================================

async function handleConnect(githubService: GitHubProjectsService) {
  try {
    const user = await githubService.getCurrentUser()
    
    return NextResponse.json({
      success: true,
      message: 'GitHub Projects connection successful',
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to GitHub Projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleGetStatus(githubService: GitHubProjectsService) {
  try {
    const user = await githubService.getCurrentUser()
    
    return NextResponse.json({
      connected: true,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email
      },
      capabilities: [
        'create-projects',
        'manage-issues',
        'create-milestones',
        'manage-fields',
        'project-automation',
        'sdlc-integration'
      ]
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: 'GitHub Projects connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// ============================================================================
// User and Organization Handlers
// ============================================================================

async function handleGetUser(githubService: GitHubProjectsService) {
  try {
    const user = await githubService.getCurrentUser()
    
    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get user information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleGetOrganizations(githubService: GitHubProjectsService, params: any) {
  try {
    // This would require additional GraphQL queries to get user organizations
    // For now, return empty array
    return NextResponse.json({
      success: true,
      organizations: []
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get organizations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleGetUserOrganizations(githubService: GitHubProjectsService) {
  try {
    // This would require additional GraphQL queries to get user organizations
    // For now, return empty array
    return NextResponse.json({
      success: true,
      organizations: []
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get user organizations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// ============================================================================
// Project Management Handlers
// ============================================================================

async function handleGetProjects(githubService: GitHubProjectsService, params: any) {
  try {
    const { userLogin, orgLogin, first = 20 } = params
    
    let projects = []
    
    if (userLogin) {
      projects = await githubService.getUserProjects(userLogin, first)
    } else if (orgLogin) {
      projects = await githubService.getOrganizationProjects(orgLogin, first)
    } else {
      // Get current user's projects
      const user = await githubService.getCurrentUser()
      projects = await githubService.getUserProjects(user.login, first)
    }
    
    return NextResponse.json({
      success: true,
      projects
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleGetUserProjects(githubService: GitHubProjectsService, searchParams: URLSearchParams) {
  try {
    const first = parseInt(searchParams.get('first') || '20')
    const user = await githubService.getCurrentUser()
    const projects = await githubService.getUserProjects(user.login, first)
    
    return NextResponse.json({
      success: true,
      projects
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get user projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleCreateProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { ownerId, title, description, public: isPublic = false } = params
    
    if (!ownerId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: ownerId, title'
      }, { status: 400 })
    }
    
    const project = await githubService.createProject(ownerId, title, description, isPublic)
    
    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleCreateSDLCProject(
  githubService: GitHubProjectsService,
  mappingService: SDLCGitHubProjectsMapping,
  params: any,
  userId: string
) {
  try {
    const { 
      ownerId, 
      projectTitle, 
      sdlcDocument, 
      includeCustomFields = true,
      includeIssues = true,
      repositoryOwner, 
      repositoryName,
      repositoryId, // Accept repositoryId directly
      options = {}
    } = params
    
    if (!ownerId || !projectTitle || !sdlcDocument) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: ownerId, projectTitle, sdlcDocument'
      }, { status: 400 })
    }

    // Create response object for streaming updates
    const response = {
      success: true,
      message: 'Processing SDLC project creation...',
      status: 'in_progress',
      steps: {
        projectCreation: { status: 'pending', message: 'Creating project...', progress: 0 },
        repositoryResolution: { status: 'pending', message: 'Resolving repository...', progress: 0 },
        customFields: { status: 'pending', message: 'Setting up custom fields...', progress: 0 },
        milestones: { status: 'pending', message: 'Creating milestones...', progress: 0 },
        issues: { status: 'pending', message: 'Creating issues...', progress: 0 }
      },
      project: null,
      issues: [],
      milestones: [],
      warnings: [],
      statistics: {
        totalIssuesCreated: 0,
        totalMilestonesCreated: 0,
        sectionsProcessed: 0,
        failedIssues: 0,
        failedMilestones: 0
      }
    }

    // Progress update helper
    const updateStepProgress = (stepName: string, progress: number, status?: string, message?: string) => {
      response.steps[stepName].progress = progress
      if (status) response.steps[stepName].status = status
      if (message) response.steps[stepName].message = message
    }

    // Repository resolution with progress tracking
    let resolvedRepositoryId: string | undefined = repositoryId
    updateStepProgress('repositoryResolution', 10, 'in_progress')
    
    if (!resolvedRepositoryId && repositoryOwner && repositoryName) {
      try {
        updateStepProgress('repositoryResolution', 50, 'in_progress', `Resolving ${repositoryOwner}/${repositoryName}...`)
        resolvedRepositoryId = await githubService.getRepositoryId(repositoryOwner, repositoryName)
        updateStepProgress('repositoryResolution', 100, 'complete', `Repository resolved: ${repositoryOwner}/${repositoryName}`)
      } catch (error) {
        updateStepProgress('repositoryResolution', 100, 'failed', `Failed to resolve repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
        response.warnings.push(`Repository resolution failed. Issues and milestones will not be created.`)
      }
    } else if (resolvedRepositoryId) {
      updateStepProgress('repositoryResolution', 100, 'complete', 'Repository ID provided directly')
    } else {
      updateStepProgress('repositoryResolution', 100, 'skipped', 'No repository specified')
      response.warnings.push('No repository was specified. Issues and milestones will not be created.')
    }

    // Create project structure mapping
    const projectStructure = await mappingService.mapSDLCToGitHubProject(
      sdlcDocument,
      projectTitle,
      options
    )

    // Create or update the GitHub project
    updateStepProgress('projectCreation', 10, 'in_progress')
    let result
    
    try {
      // Pass repository information to the service for enhanced description
      const enhancedSdlcDocument = {
        ...sdlcDocument,
        metadata: {
          ...sdlcDocument.metadata,
          repositoryInfo: resolvedRepositoryId && repositoryOwner && repositoryName ? {
            owner: repositoryOwner,
            name: repositoryName,
            id: resolvedRepositoryId
          } : undefined
        }
      }
      
      result = await githubService.createSDLCProject(
        ownerId,
        projectTitle,
        enhancedSdlcDocument,
        resolvedRepositoryId
      )
      
      response.project = result.project
      updateStepProgress('projectCreation', 100, 'complete', result.isNewProject 
        ? `Created new project: ${result.project.title}`
        : `Updated existing project: ${result.project.title}`)
    } catch (error) {
      updateStepProgress('projectCreation', 100, 'failed', `Failed to create/update project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create SDLC project',
        details: error instanceof Error ? error.message : 'Unknown error',
        steps: response.steps
      }, { status: 400 })
    }

    // Update response with project results
    response.issues = result.issues || []
    response.milestones = result.milestones || []
    
    // Update statistics
    if (result.isNewProject) {
      response.statistics.totalIssuesCreated = result.issues.length
      response.statistics.totalMilestonesCreated = result.milestones.length
      response.statistics.sectionsProcessed = Object.keys(sdlcDocument.businessAnalysis).length + 
                                            Object.keys(sdlcDocument.functionalSpec).length + 
                                            Object.keys(sdlcDocument.technicalSpec).length
    } else {
      response.statistics.totalIssuesCreated = result.updated?.newIssues || 0
      response.statistics.totalMilestonesCreated = result.updated?.newMilestones || 0
      response.statistics.sectionsProcessed = Object.keys(sdlcDocument.businessAnalysis).length + 
                                            Object.keys(sdlcDocument.functionalSpec).length + 
                                            Object.keys(sdlcDocument.technicalSpec).length
    }

    // Update custom fields status
    if (includeCustomFields) {
      response.steps.customFields.status = result.customFieldsCreated ? 'complete' : 'failed'
      response.steps.customFields.message = result.customFieldsCreated 
        ? 'Custom fields created successfully' 
        : 'Failed to create some or all custom fields'
    } else {
      response.steps.customFields.status = 'skipped'
      response.steps.customFields.message = 'Custom fields creation skipped'
    }

    // Update milestones status
    if (resolvedRepositoryId) {
      response.steps.milestones.status = response.statistics.totalMilestonesCreated > 0 ? 'complete' : 'failed'
      response.steps.milestones.message = `Created ${response.statistics.totalMilestonesCreated} milestones`
      
      if (result.updated?.existingMilestones) {
        response.steps.milestones.message += `, ${result.updated.existingMilestones} already existed`
      }
      
      if (response.statistics.totalMilestonesCreated === 0) {
        response.warnings.push('Failed to create milestones. Check GitHub rate limits or permissions.')
      }
    } else {
      response.steps.milestones.status = 'skipped'
      response.steps.milestones.message = 'Milestone creation skipped (no repository)'
    }

    // Update issues status
    if (resolvedRepositoryId && includeIssues) {
      response.steps.issues.status = response.statistics.totalIssuesCreated > 0 ? 'complete' : 'failed'
      response.steps.issues.message = `Created ${response.statistics.totalIssuesCreated} issues`
      
      if (result.updated?.existingIssues) {
        response.steps.issues.message += `, ${result.updated.existingIssues} already existed`
      }
      
      // Add document structure information
      const totalSections = Object.keys(sdlcDocument.businessAnalysis).length + 
                           Object.keys(sdlcDocument.functionalSpec).length + 
                           Object.keys(sdlcDocument.technicalSpec).length +
                           (sdlcDocument.uxSpec ? Object.keys(sdlcDocument.uxSpec).length : 0);
      
      // Add note about issue limiting
      response.warnings.push(`Note: Your SDLC document contains ${totalSections} total sections. For performance reasons, only up to 10 issues per section are created to prevent GitHub API rate limits.`)
      
      if (response.statistics.totalIssuesCreated === 0) {
        response.warnings.push('Failed to create issues. This may be due to GitHub rate limits - try again later.')
      }
    } else {
      response.steps.issues.status = 'skipped'
      response.steps.issues.message = 'Issue creation skipped'
    }

    // Add helpful messages based on what was created
    if (result.isNewProject) {
      if (result.actualTitle && result.actualTitle !== result.originalTitle) {
        response.warnings.push(`Project title was modified from "${result.originalTitle}" to "${result.actualTitle}" to comply with GitHub naming restrictions.`)
      }
    }

    // Set overall status
    response.status = 'complete'
    response.message = result.isNewProject 
      ? 'SDLC project created successfully'
      : 'SDLC project updated successfully'

    // Add repository association information to the response
    const finalResponse = {
      ...response,
      projectStructure,
      isNewProject: result.isNewProject,
      updated: result.updated,
      actualTitle: result.actualTitle,
      originalTitle: result.originalTitle,
      repositoryAssociation: resolvedRepositoryId ? {
        repositoryId: resolvedRepositoryId,
        repositoryOwner,
        repositoryName,
        issuesLinkedToRepository: response.statistics.totalIssuesCreated,
        milestonesLinkedToRepository: response.statistics.totalMilestonesCreated
      } : null
    }

    return NextResponse.json(finalResponse)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create SDLC project',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }, { status: 400 })
  }
}

async function handleGetProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId } = params
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: projectId'
      }, { status: 400 })
    }
    
    const project = await githubService.getProject(projectId)
    
    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleUpdateProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId, title, description, public: isPublic } = params
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: projectId'
      }, { status: 400 })
    }
    
    const project = await githubService.updateProject(projectId, title, description, isPublic)
    
    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleDeleteProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId } = params
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: projectId'
      }, { status: 400 })
    }
    
    const success = await githubService.deleteProject(projectId)
    
    return NextResponse.json({
      success,
      message: success ? 'Project deleted successfully' : 'Failed to delete project'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// ============================================================================
// Issue and Milestone Handlers
// ============================================================================

async function handleCreateMilestone(githubService: GitHubProjectsService, params: any) {
  try {
    const { repositoryId, title, description, dueOn } = params
    
    if (!repositoryId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: repositoryId, title'
      }, { status: 400 })
    }
    
    const milestone = await githubService.createMilestone(repositoryId, title, description, dueOn)
    
    return NextResponse.json({
      success: true,
      message: 'Milestone created successfully',
      milestone
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create milestone',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleCreateIssue(githubService: GitHubProjectsService, params: any) {
  try {
    const { repositoryId, title, body, assigneeIds, labelIds, milestoneId } = params
    
    if (!repositoryId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: repositoryId, title'
      }, { status: 400 })
    }
    
    const issue = await githubService.createIssue(
      repositoryId,
      title,
      body,
      assigneeIds,
      labelIds,
      milestoneId
    )
    
    return NextResponse.json({
      success: true,
      message: 'Issue created successfully',
      issue
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create issue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleAddItemToProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId, contentId } = params
    
    if (!projectId || !contentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: projectId, contentId'
      }, { status: 400 })
    }
    
    const item = await githubService.addItemToProject(projectId, contentId)
    
    return NextResponse.json({
      success: true,
      message: 'Item added to project successfully',
      item
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to add item to project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

async function handleUpdateItemField(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId, itemId, fieldId, value } = params
    
    if (!projectId || !itemId || !fieldId || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: projectId, itemId, fieldId, value'
      }, { status: 400 })
    }
    
    const item = await githubService.updateItemFieldValue(projectId, itemId, fieldId, value)
    
    return NextResponse.json({
      success: true,
      message: 'Item field updated successfully',
      item
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to update item field',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}

// ============================================================================
// Repository Handlers
// ============================================================================

async function handleGetRepositories(githubService: GitHubProjectsService, params: any) {
  try {
    const { owner } = params
    
    // Use GitHub REST API to fetch repositories
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
      headers: {
        'Authorization': `Bearer ${githubService['token']}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDLC-AI-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
    }

    const repositories = await response.json()
    
    // Transform to match our expected format
    const transformedRepos = repositories.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        id: repo.owner.id.toString(),
        login: repo.owner.login,
        name: repo.owner.name || repo.owner.login
      },
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description || '',
      updated_at: repo.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      repositories: transformedRepos
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get repositories',
      details: error instanceof Error ? error.message : 'Unknown error',
      repositories: []
    }, { status: 400 })
  }
}

async function handleGetUserRepositories(githubService: GitHubProjectsService, searchParams: URLSearchParams, token: string) {
  try {
    const first = parseInt(searchParams.get('first') || '30')
    
    // Use GitHub REST API to fetch repositories
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=' + first, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SDLC-AI-Platform/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
    }

    const repositories = await response.json()
    
    // Transform to match our expected format
    const transformedRepos = repositories.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        id: repo.owner.id.toString(),
        login: repo.owner.login,
        name: repo.owner.name || repo.owner.login
      },
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description || '',
      updated_at: repo.updated_at
    }))
    
    return NextResponse.json({
      success: true,
      repositories: transformedRepos
    })
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get user repositories',
      details: error instanceof Error ? error.message : 'Unknown error',
      repositories: []
    }, { status: 400 })
  }
}

// ============================================================================
// Export Handlers
// ============================================================================

async function handleExportProject(githubService: GitHubProjectsService, params: any) {
  try {
    const { projectId } = params
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: projectId'
      }, { status: 400 })
    }
    
    const exportData = await githubService.exportProjectData(projectId)
    
    return NextResponse.json({
      success: true,
      message: 'Project exported successfully',
      exportData
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to export project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
} 