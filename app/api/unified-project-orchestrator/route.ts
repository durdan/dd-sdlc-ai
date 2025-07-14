import { NextRequest, NextResponse } from 'next/server';

interface ProjectPlatformConfig {
  github?: {
    enabled: boolean;
    repositoryOwner: string;
    repositoryName: string;
    projectName: string;
    includeIssues?: boolean;
    includeCustomFields?: boolean;
  };
  clickup?: {
    enabled: boolean;
    apiToken: string;
    teamId?: string;
    spaceId?: string;
    projectName: string;
    includeTimeTracking?: boolean;
    autoAssignment?: boolean;
  };
  trello?: {
    enabled: boolean;
    apiKey: string;
    token: string;
    organizationId?: string;
    projectName: string;
    teamMembers?: string[];
    autoAssignment?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sdlcDocument, config } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'create-unified-project':
        return await handleCreateUnifiedProject(sdlcDocument, config);
      
      case 'validate-configuration':
        return await handleValidateConfiguration(config);
      
      case 'get-project-status':
        return await handleGetProjectStatus(body.projectIds);
      
      case 'export-unified-project':
        return await handleExportUnifiedProject(body.projectIds);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Unified project orchestrator error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCreateUnifiedProject(sdlcDocument: any, config: ProjectPlatformConfig) {
  try {
    if (!sdlcDocument) {
      return NextResponse.json({ 
        error: 'SDLC document is required' 
      }, { status: 400 });
    }

    // Validate configuration
    const validation = validateConfiguration(config);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Invalid configuration',
        details: validation.errors 
      }, { status: 400 });
    }

    console.log('🚀 Starting unified project creation across platforms...');
    
    const enabledPlatforms = getEnabledPlatforms(config);
    console.log(`📊 Creating projects on ${enabledPlatforms.length} platforms:`, enabledPlatforms.join(', '));

    const results = {
      success: false,
      platforms: {} as any,
      summary: {
        totalPlatforms: enabledPlatforms.length,
        successfulPlatforms: 0,
        failedPlatforms: 0,
        estimatedTimeline: '',
        projectOverview: '',
      },
    };

    // Create projects in parallel for better performance
    const platformPromises = [];

    if (config.github?.enabled) {
      platformPromises.push(
        createGitHubProject(sdlcDocument, config.github)
          .then(result => ({ platform: 'github', result }))
          .catch(error => ({ platform: 'github', result: { success: false, error: error.message } }))
      );
    }

    if (config.clickup?.enabled) {
      platformPromises.push(
        createClickUpProject(sdlcDocument, config.clickup)
          .then(result => ({ platform: 'clickup', result }))
          .catch(error => ({ platform: 'clickup', result: { success: false, error: error.message } }))
      );
    }

    if (config.trello?.enabled) {
      platformPromises.push(
        createTrelloProject(sdlcDocument, config.trello)
          .then(result => ({ platform: 'trello', result }))
          .catch(error => ({ platform: 'trello', result: { success: false, error: error.message } }))
      );
    }

    // Wait for all platform creations to complete
    const platformResults = await Promise.all(platformPromises);

    // Process results
    for (const { platform, result } of platformResults) {
      results.platforms[platform] = result;
      
      if (result.success) {
        results.summary.successfulPlatforms++;
        console.log(`✅ ${platform} project created successfully`);
      } else {
        results.summary.failedPlatforms++;
        console.error(`❌ ${platform} project creation failed:`, result.error);
      }
    }

    // Generate summary
    results.success = results.summary.successfulPlatforms > 0;
    results.summary.estimatedTimeline = calculateEstimatedTimeline(sdlcDocument);
    results.summary.projectOverview = generateProjectOverview(sdlcDocument, results);

    console.log(`🎯 Unified project creation completed: ${results.summary.successfulPlatforms}/${results.summary.totalPlatforms} platforms successful`);

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully created projects on ${results.summary.successfulPlatforms}/${results.summary.totalPlatforms} platforms`,
    });
  } catch (error) {
    console.error('❌ Error creating unified project:', error);
    return NextResponse.json(
      { error: `Failed to create unified project: ${error.message}` },
      { status: 500 }
    );
  }
}

async function handleValidateConfiguration(config: ProjectPlatformConfig) {
  try {
    const validation = validateConfiguration(config);
    
    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to validate configuration: ${error.message}` },
      { status: 500 }
    );
  }
}

async function handleGetProjectStatus(projectIds: any) {
  try {
    if (!projectIds) {
      return NextResponse.json({ 
        error: 'Project IDs are required' 
      }, { status: 400 });
    }

    // Mock implementation - in real scenario, this would query each platform
    const status = {
      github: projectIds.github ? { status: 'active', progress: 100, url: `https://github.com/projects/${projectIds.github}` } : undefined,
      clickup: projectIds.clickup ? { status: 'active', progress: 100, url: `https://app.clickup.com/project/${projectIds.clickup}` } : undefined,
      trello: projectIds.trello ? { status: 'active', progress: 100, url: `https://trello.com/b/${projectIds.trello}` } : undefined,
    };

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get project status: ${error.message}` },
      { status: 500 }
    );
  }
}

async function handleExportUnifiedProject(projectIds: any) {
  try {
    if (!projectIds) {
      return NextResponse.json({ 
        error: 'Project IDs are required' 
      }, { status: 400 });
    }

    // Mock implementation - in real scenario, this would aggregate data from all platforms
    const exportData = {
      platforms: {
        github: projectIds.github ? { tasks: 15, completed: 8, members: 3 } : undefined,
        clickup: projectIds.clickup ? { tasks: 12, completed: 6, members: 4 } : undefined,
        trello: projectIds.trello ? { tasks: 18, completed: 10, members: 3 } : undefined,
      },
      summary: {
        totalTasks: 45,
        completedTasks: 24,
        overallProgress: '53%',
        activeMembers: 5,
      },
    };

    return NextResponse.json({
      success: true,
      export: exportData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to export unified project: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper functions

async function createGitHubProject(sdlcDocument: any, config: any): Promise<any> {
  console.log('🐙 Creating GitHub Projects project...');

  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/integrations/github-projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-sdlc-project',
      ownerId: config.repositoryOwner, // FIXED: Added missing ownerId parameter
      projectTitle: config.projectName, // FIXED: Changed projectName to projectTitle
      sdlcDocument,
      repositoryOwner: config.repositoryOwner,
      repositoryName: config.repositoryName,
      includeIssues: config.includeIssues || true,
      includeCustomFields: config.includeCustomFields || true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'GitHub Projects creation failed');
  }

  return {
    success: true,
    project: data.project,
    projectUrl: data.projectUrl,
  };
}

async function createClickUpProject(sdlcDocument: any, config: any): Promise<any> {
  console.log('🎯 Creating ClickUp project...');

  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/integrations/clickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-sdlc-project',
      apiToken: config.apiToken,
      sdlcDocument,
      projectName: config.projectName,
      teamId: config.teamId,
      spaceId: config.spaceId,
      includeTimeTracking: config.includeTimeTracking || false,
      autoAssignment: config.autoAssignment || false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'ClickUp project creation failed');
  }

  return {
    success: true,
    project: data.project,
    projectUrl: data.projectUrl,
  };
}

async function createTrelloProject(sdlcDocument: any, config: any): Promise<any> {
  console.log('📋 Creating Trello project...');

  const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/integrations/trello`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create-sdlc-project',
      apiKey: config.apiKey,
      token: config.token,
      sdlcDocument,
      projectName: config.projectName,
      organizationId: config.organizationId,
      teamMembers: config.teamMembers,
      autoAssignment: config.autoAssignment || false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Trello project creation failed');
  }

  return {
    success: true,
    project: data.project,
    boardUrl: data.boardUrl,
  };
}

function getEnabledPlatforms(config: ProjectPlatformConfig): string[] {
  const platforms = [];
  if (config.github?.enabled) platforms.push('GitHub Projects');
  if (config.clickup?.enabled) platforms.push('ClickUp');
  if (config.trello?.enabled) platforms.push('Trello');
  return platforms;
}

function calculateEstimatedTimeline(sdlcDocument: any): string {
  let estimatedWeeks = 4; // Base timeline

  // Add complexity factors
  if (sdlcDocument.detailed_features?.length > 5) estimatedWeeks += 2;
  if (sdlcDocument.technical_requirements?.functional_requirements?.length > 10) estimatedWeeks += 2;
  if (sdlcDocument.database_design?.tables?.length > 10) estimatedWeeks += 1;
  if (sdlcDocument.api_specifications?.endpoints?.length > 20) estimatedWeeks += 1;

  return `${estimatedWeeks}-${estimatedWeeks + 2} weeks`;
}

function generateProjectOverview(sdlcDocument: any, results: any): string {
  const sections = [];

  if (sdlcDocument.project_overview?.description) {
    sections.push(`**Project**: ${sdlcDocument.project_overview.description}`);
  }

  const platformSummary = [];
  if (results.platforms.github?.success) {
    platformSummary.push('✅ GitHub Projects');
  }
  if (results.platforms.clickup?.success) {
    platformSummary.push('✅ ClickUp');
  }
  if (results.platforms.trello?.success) {
    platformSummary.push('✅ Trello');
  }

  if (platformSummary.length > 0) {
    sections.push(`**Created on**: ${platformSummary.join(', ')}`);
  }

  const featureCount = sdlcDocument.detailed_features?.length || 0;
  const requirementCount = sdlcDocument.technical_requirements?.functional_requirements?.length || 0;
  
  sections.push(`**Scope**: ${featureCount} features, ${requirementCount} requirements`);

  return sections.join('\n');
}

function validateConfiguration(config: ProjectPlatformConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.github?.enabled) {
    if (!config.github.repositoryOwner) errors.push('GitHub repository owner is required');
    if (!config.github.repositoryName) errors.push('GitHub repository name is required');
    if (!config.github.projectName) errors.push('GitHub project name is required');
  }

  if (config.clickup?.enabled) {
    if (!config.clickup.apiToken) errors.push('ClickUp API token is required');
    if (!config.clickup.projectName) errors.push('ClickUp project name is required');
  }

  if (config.trello?.enabled) {
    if (!config.trello.apiKey) errors.push('Trello API key is required');
    if (!config.trello.token) errors.push('Trello token is required');
    if (!config.trello.projectName) errors.push('Trello project name is required');
  }

  const enabledPlatforms = getEnabledPlatforms(config);
  if (enabledPlatforms.length === 0) {
    errors.push('At least one platform must be enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
} 