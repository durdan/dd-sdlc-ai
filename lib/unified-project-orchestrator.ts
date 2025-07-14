// Unified Project Orchestrator
// Creates projects across multiple platforms simultaneously from SDLC documents

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

interface UnifiedProjectResult {
  success: boolean;
  platforms: {
    github?: {
      success: boolean;
      project?: any;
      error?: string;
      projectUrl?: string;
    };
    clickup?: {
      success: boolean;
      project?: any;
      error?: string;
      projectUrl?: string;
    };
    trello?: {
      success: boolean;
      project?: any;
      error?: string;
      boardUrl?: string;
    };
  };
  summary: {
    totalPlatforms: number;
    successfulPlatforms: number;
    failedPlatforms: number;
    estimatedTimeline: string;
    projectOverview: string;
  };
}

export class UnifiedProjectOrchestrator {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/integrations') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create projects across all specified platforms simultaneously
   */
  async createUnifiedProject(
    sdlcDocument: any,
    config: ProjectPlatformConfig
  ): Promise<UnifiedProjectResult> {
    console.log('🚀 Starting unified project creation across platforms...');

    const enabledPlatforms = this.getEnabledPlatforms(config);
    console.log(`📊 Creating projects on ${enabledPlatforms.length} platforms:`, enabledPlatforms.join(', '));

    const results: UnifiedProjectResult = {
      success: false,
      platforms: {},
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
        this.createGitHubProject(sdlcDocument, config.github)
          .then(result => ({ platform: 'github', result }))
          .catch(error => ({ platform: 'github', result: { success: false, error: error.message } }))
      );
    }

    if (config.clickup?.enabled) {
      platformPromises.push(
        this.createClickUpProject(sdlcDocument, config.clickup)
          .then(result => ({ platform: 'clickup', result }))
          .catch(error => ({ platform: 'clickup', result: { success: false, error: error.message } }))
      );
    }

    if (config.trello?.enabled) {
      platformPromises.push(
        this.createTrelloProject(sdlcDocument, config.trello)
          .then(result => ({ platform: 'trello', result }))
          .catch(error => ({ platform: 'trello', result: { success: false, error: error.message } }))
      );
    }

    // Wait for all platform creations to complete
    const platformResults = await Promise.all(platformPromises);

    // Process results
    for (const { platform, result } of platformResults) {
      results.platforms[platform as keyof typeof results.platforms] = result;
      
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
    results.summary.estimatedTimeline = this.calculateEstimatedTimeline(sdlcDocument);
    results.summary.projectOverview = this.generateProjectOverview(sdlcDocument, results);

    console.log(`🎯 Unified project creation completed: ${results.summary.successfulPlatforms}/${results.summary.totalPlatforms} platforms successful`);

    return results;
  }

  /**
   * Create GitHub Projects project
   */
  private async createGitHubProject(sdlcDocument: any, config: any): Promise<any> {
    console.log('🐙 Creating GitHub Projects project...');

    const response = await fetch(`${this.baseUrl}/github-projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-sdlc-project',
        sdlcDocument,
        repositoryOwner: config.repositoryOwner,
        repositoryName: config.repositoryName,
        projectName: config.projectName,
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

  /**
   * Create ClickUp project
   */
  private async createClickUpProject(sdlcDocument: any, config: any): Promise<any> {
    console.log('🎯 Creating ClickUp project...');

    const response = await fetch(`${this.baseUrl}/clickup`, {
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

  /**
   * Create Trello project
   */
  private async createTrelloProject(sdlcDocument: any, config: any): Promise<any> {
    console.log('📋 Creating Trello project...');

    const response = await fetch(`${this.baseUrl}/trello`, {
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

  /**
   * Get list of enabled platforms
   */
  private getEnabledPlatforms(config: ProjectPlatformConfig): string[] {
    const platforms = [];
    if (config.github?.enabled) platforms.push('GitHub Projects');
    if (config.clickup?.enabled) platforms.push('ClickUp');
    if (config.trello?.enabled) platforms.push('Trello');
    return platforms;
  }

  /**
   * Calculate estimated timeline based on SDLC document complexity
   */
  private calculateEstimatedTimeline(sdlcDocument: any): string {
    let estimatedWeeks = 4; // Base timeline

    // Add complexity factors
    if (sdlcDocument.detailed_features?.length > 5) estimatedWeeks += 2;
    if (sdlcDocument.technical_requirements?.functional_requirements?.length > 10) estimatedWeeks += 2;
    if (sdlcDocument.database_design?.tables?.length > 10) estimatedWeeks += 1;
    if (sdlcDocument.api_specifications?.endpoints?.length > 20) estimatedWeeks += 1;

    return `${estimatedWeeks}-${estimatedWeeks + 2} weeks`;
  }

  /**
   * Generate project overview summary
   */
  private generateProjectOverview(sdlcDocument: any, results: UnifiedProjectResult): string {
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

  /**
   * Validate platform configurations
   */
  validateConfiguration(config: ProjectPlatformConfig): { valid: boolean; errors: string[] } {
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

    const enabledPlatforms = this.getEnabledPlatforms(config);
    if (enabledPlatforms.length === 0) {
      errors.push('At least one platform must be enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get project creation status for all platforms
   */
  async getProjectStatus(projectIds: {
    github?: string;
    clickup?: string;
    trello?: string;
  }): Promise<{
    github?: { status: string; progress: number; url?: string };
    clickup?: { status: string; progress: number; url?: string };
    trello?: { status: string; progress: number; url?: string };
  }> {
    const statusPromises = [];

    if (projectIds.github) {
      statusPromises.push(
        this.getGitHubProjectStatus(projectIds.github)
          .then(status => ({ platform: 'github', status }))
          .catch(() => ({ platform: 'github', status: { status: 'error', progress: 0 } }))
      );
    }

    if (projectIds.clickup) {
      statusPromises.push(
        this.getClickUpProjectStatus(projectIds.clickup)
          .then(status => ({ platform: 'clickup', status }))
          .catch(() => ({ platform: 'clickup', status: { status: 'error', progress: 0 } }))
      );
    }

    if (projectIds.trello) {
      statusPromises.push(
        this.getTrelloProjectStatus(projectIds.trello)
          .then(status => ({ platform: 'trello', status }))
          .catch(() => ({ platform: 'trello', status: { status: 'error', progress: 0 } }))
      );
    }

    const results = await Promise.all(statusPromises);
    const statusMap: any = {};

    for (const { platform, status } of results) {
      statusMap[platform] = status;
    }

    return statusMap;
  }

  private async getGitHubProjectStatus(projectId: string): Promise<any> {
    // Implementation would query GitHub Projects API for project status
    return { status: 'active', progress: 100, url: `https://github.com/projects/${projectId}` };
  }

  private async getClickUpProjectStatus(projectId: string): Promise<any> {
    // Implementation would query ClickUp API for project status
    return { status: 'active', progress: 100, url: `https://app.clickup.com/project/${projectId}` };
  }

  private async getTrelloProjectStatus(boardId: string): Promise<any> {
    // Implementation would query Trello API for board status
    return { status: 'active', progress: 100, url: `https://trello.com/b/${boardId}` };
  }

  /**
   * Export unified project data for reporting
   */
  async exportUnifiedProject(projectIds: {
    github?: string;
    clickup?: string;
    trello?: string;
  }): Promise<{
    platforms: any;
    summary: {
      totalTasks: number;
      completedTasks: number;
      overallProgress: string;
      activeMembers: number;
    };
  }> {
    const exportPromises = [];

    if (projectIds.github) {
      exportPromises.push(
        fetch(`${this.baseUrl}/github-projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export-project',
            projectId: projectIds.github,
          }),
        })
          .then(res => res.json())
          .then(data => ({ platform: 'github', data }))
          .catch(error => ({ platform: 'github', error: error.message }))
      );
    }

    if (projectIds.clickup) {
      exportPromises.push(
        fetch(`${this.baseUrl}/clickup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export-project',
            projectId: projectIds.clickup,
          }),
        })
          .then(res => res.json())
          .then(data => ({ platform: 'clickup', data }))
          .catch(error => ({ platform: 'clickup', error: error.message }))
      );
    }

    if (projectIds.trello) {
      exportPromises.push(
        fetch(`${this.baseUrl}/trello`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'export-project',
            projectBoardId: projectIds.trello,
          }),
        })
          .then(res => res.json())
          .then(data => ({ platform: 'trello', data }))
          .catch(error => ({ platform: 'trello', error: error.message }))
      );
    }

    const results = await Promise.all(exportPromises);
    const platformData: any = {};

    let totalTasks = 0;
    let completedTasks = 0;
    const activeMembers = new Set();

    for (const result of results) {
      platformData[result.platform] = result.data || { error: result.error };

      // Aggregate metrics from successful exports
      if (result.data?.export?.summary) {
        totalTasks += result.data.export.summary.totalCards || result.data.export.summary.totalTasks || 0;
        completedTasks += result.data.export.summary.completedCards || result.data.export.summary.completedTasks || 0;
      }

      // Count active members across platforms
      if (result.data?.export?.members) {
        result.data.export.members.forEach((member: any) => activeMembers.add(member.id || member.email));
      }
    }

    const overallProgress = totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%';

    return {
      platforms: platformData,
      summary: {
        totalTasks,
        completedTasks,
        overallProgress,
        activeMembers: activeMembers.size,
      },
    };
  }
} 