// GitHub Projects API v2 Service - Comprehensive project management integration
// Supports: Project creation, issue/PR management, custom fields, automation

// ============================================================================
// TypeScript Interfaces for GitHub Projects API v2
// ============================================================================

interface GitHubProjectsUser {
  id: string
  login: string
  name?: string
  email?: string
}

interface GitHubProjectsOrganization {
  id: string
  login: string
  name?: string
}

interface GitHubProjectsRepository {
  id: string
  name: string
  full_name: string
  owner: GitHubProjectsUser
  private: boolean
  html_url: string
}

interface GitHubProjectsField {
  id: string
  name: string
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION'
  options?: GitHubProjectsFieldOption[]
}

interface GitHubProjectsFieldOption {
  id: string
  name: string
  description?: string
  color?: string
}

interface GitHubProjectsItem {
  id: string
  content?: {
    id: string
    title: string
    url: string
    state?: string
    number?: number
    repository?: GitHubProjectsRepository
    type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE'
  }
  fieldValues?: Record<string, any>
  project: {
    id: string
  }
  createdAt: string
  updatedAt: string
}

interface GitHubProjectsProject {
  id: string
  number: number
  title: string
  description?: string
  shortDescription?: string
  url: string
  public: boolean
  closed: boolean
  owner: GitHubProjectsUser | GitHubProjectsOrganization
  fields: GitHubProjectsField[]
  items: GitHubProjectsItem[]
  createdAt: string
  updatedAt: string
}

interface GitHubProjectsIssue {
  id: string
  number: number
  title: string
  body?: string
  state: 'OPEN' | 'CLOSED'
  url: string
  repository: GitHubProjectsRepository
  assignees: GitHubProjectsUser[]
  labels: GitHubProjectsLabel[]
  milestone?: GitHubProjectsMilestone
  createdAt: string
  updatedAt: string
}

interface GitHubProjectsLabel {
  id: string
  name: string
  description?: string
  color: string
}

interface GitHubProjectsMilestone {
  id: string
  number: number
  title: string
  description?: string
  state: 'OPEN' | 'CLOSED'
  dueOn?: string
  createdAt: string
  updatedAt: string
}

interface GitHubProjectsPullRequest {
  id: string
  number: number
  title: string
  body?: string
  state: 'OPEN' | 'CLOSED' | 'MERGED'
  url: string
  repository: GitHubProjectsRepository
  headRef: string
  baseRef: string
  mergeable: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// SDLC Document Interfaces for Project Creation
// ============================================================================

interface SDLCBusinessAnalysis {
  executiveSummary: string
  stakeholderAnalysis: string
  requirementsAnalysis: string
  riskAssessment: string
  successMetrics: string
  userStories: string
  personas: string
  competitiveAnalysis: string
  businessModel: string
  financialProjections: string
}

interface SDLCFunctionalSpec {
  systemOverview: string
  functionalRequirements: string
  dataRequirements: string
  integrationRequirements: string
  performanceRequirements: string
  securityRequirements: string
  userInterfaceRequirements: string
  workflowDefinitions: string
  businessRules: string
  acceptanceCriteria: string
}

interface SDLCTechnicalSpec {
  systemArchitecture: string
  technologyStack: string
  dataModels: string
  apiSpecifications: string
  securityImplementation: string
  deploymentStrategy: string
  monitoringStrategy: string
  testingStrategy: string
  performanceOptimization: string
  scalabilityPlan: string
}

interface SDLCDocument {
  businessAnalysis: SDLCBusinessAnalysis
  functionalSpec: SDLCFunctionalSpec
  technicalSpec: SDLCTechnicalSpec
  uxSpec?: any
  dataSpec?: any
  serviceSpec?: any
  deploymentSpec?: any
  observabilitySpec?: any
  implementationGuide?: any
  metadata?: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
    tokenEstimate: number
    contextContinuity: boolean
    repositoryInfo?: { owner: string; name: string }
  }
}

// ============================================================================
// GitHub Projects Service Implementation
// ============================================================================

export class GitHubProjectsService {
  private token: string
  private baseUrl = 'https://api.github.com/graphql'
  
  constructor(token: string) {
    this.token = token
  }

  // ============================================================================
  // Public Token Access Methods
  // ============================================================================

  /**
   * Get the GitHub token (for internal API use only)
   * @returns The GitHub access token
   */
  public getToken(): string {
    return this.token
  }

  /**
   * Validate if the current token is valid
   * @returns Promise<boolean> indicating if token is valid
   */
  public async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  // ============================================================================
  // Core GraphQL Query Methods
  // ============================================================================

  private async graphqlQuery(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SDLC-AI-Platform/1.0'
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors.map((e: any) => e.message).join(', ')}`)
    }

    return result.data
  }

  // ============================================================================
  // Project Management Methods
  // ============================================================================

  async createProject(
    ownerId: string,
    title: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<GitHubProjectsProject> {
    const query = `
      mutation CreateProject($ownerId: ID!, $title: String!) {
        createProjectV2(input: {
          ownerId: $ownerId
          title: $title
        }) {
          projectV2 {
            id
            number
            title
            shortDescription
            url
            closed
            owner {
              ... on User {
                id
                login
                name
                email
              }
              ... on Organization {
                id
                login
                name
              }
            }
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                    description
                    color
                  }
                }
                ... on ProjectV2IterationField {
                  id
                  name
                  dataType
                  configuration {
                    duration
                    startDay
                  }
                }
              }
            }
            createdAt
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      ownerId,
      title
    })

    const project = data.createProjectV2.projectV2
    
    // Note: GitHub Projects v2 API no longer supports setting description or public status at creation
    // These fields have been removed from the API. Projects are private by default and can be managed
    // through the web interface or separate update operations if needed.
    
    return {
      ...project,
      description: description || '', // Fallback for interface compatibility
      public: false // Projects v2 are private by default
    }
  }

  async getProject(projectId: string): Promise<GitHubProjectsProject> {
    const query = `
      query GetProject($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            id
            number
            title
            shortDescription
            url
            closed
            owner {
              ... on User {
                id
                login
                name
                email
              }
              ... on Organization {
                id
                login
                name
              }
            }
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                    description
                    color
                  }
                }
              }
            }
            items(first: 50) {
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    title
                    url
                    state
                    number
                    repository {
                      id
                      name
                      full_name: nameWithOwner
                    }
                  }
                  ... on PullRequest {
                    id
                    title
                    url
                    state
                    number
                    repository {
                      id
                      name
                      full_name: nameWithOwner
                    }
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                      text
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                      number
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field {
                        ... on ProjectV2Field {
                          id
                          name
                        }
                      }
                      date
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2SingleSelectField {
                          id
                          name
                        }
                      }
                      name
                    }
                  }
                }
                createdAt
                updatedAt
              }
            }
            createdAt
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { projectId })
    
    // Transform the response to match our interface
    const project = data.node
    
    // Ensure items is an array, not just the nodes object from the API
    if (project && project.items && project.items.nodes) {
      project.items = project.items.nodes || []
    } else {
      project.items = []
    }
    
    return project
  }

  async getOrganizationProjects(orgLogin: string, first: number = 20): Promise<GitHubProjectsProject[]> {
    const query = `
      query GetOrganizationProjects($orgLogin: String!, $first: Int!) {
        organization(login: $orgLogin) {
          projectsV2(first: $first) {
            nodes {
              id
              number
              title
              shortDescription
              url
              public
              closed
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { orgLogin, first })
    return data.organization.projectsV2.nodes
  }

  async getUserProjects(userLogin: string, first: number = 20): Promise<GitHubProjectsProject[]> {
    const query = `
      query GetUserProjects($userLogin: String!, $first: Int!) {
        user(login: $userLogin) {
          projectsV2(first: $first) {
            nodes {
              id
              number
              title
              shortDescription
              url
              public
              closed
              createdAt
              updatedAt
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { userLogin, first })
    return data.user.projectsV2.nodes
  }

  async updateProject(
    projectId: string,
    title?: string,
    description?: string,
    isPublic?: boolean
  ): Promise<GitHubProjectsProject> {
    const query = `
      mutation UpdateProject($projectId: ID!, $title: String) {
        updateProjectV2(input: {
          projectId: $projectId
          title: $title
        }) {
          projectV2 {
            id
            number
            title
            shortDescription
            url
            closed
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      title
    })

    const project = data.updateProjectV2.projectV2
    
    // Note: GitHub Projects v2 API no longer supports updating description or public status
    // These fields have been deprecated and removed from the updateProjectV2 mutation
    
    return {
      ...project,
      description: description || '', // Fallback for interface compatibility  
      public: false // Projects v2 are private by default
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const query = `
      mutation DeleteProject($projectId: ID!) {
        deleteProjectV2(input: { projectId: $projectId }) {
          projectV2 {
            id
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { projectId })
    return !!data.deleteProjectV2.projectV2
  }

  // ============================================================================
  // Field Management Methods
  // ============================================================================

  async createField(
    projectId: string,
    name: string,
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION'
  ): Promise<GitHubProjectsField> {
    const query = `
      mutation CreateField($projectId: ID!, $name: String!, $dataType: ProjectV2CustomFieldType!) {
        createProjectV2Field(input: {
          projectId: $projectId
          name: $name
          dataType: $dataType
        }) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                description
                color
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      name,
      dataType
    })

    return data.createProjectV2Field.projectV2Field
  }

  async createSingleSelectField(
    projectId: string,
    name: string,
    options: { name: string; description?: string; color?: string }[]
  ): Promise<GitHubProjectsField> {
    const query = `
      mutation CreateSingleSelectField($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
        createProjectV2Field(input: {
          projectId: $projectId
          name: $name
          dataType: SINGLE_SELECT
          singleSelectOptions: $options
        }) {
          projectV2Field {
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                description
                color
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      name,
      options
    })

    return data.createProjectV2Field.projectV2Field
  }

  async updateField(
    projectId: string,
    fieldId: string,
    name: string
  ): Promise<GitHubProjectsField> {
    const query = `
      mutation UpdateField($projectId: ID!, $fieldId: ID!, $name: String!) {
        updateProjectV2Field(input: {
          projectId: $projectId
          fieldId: $fieldId
          name: $name
        }) {
          projectV2Field {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id
                name
                description
                color
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      fieldId,
      name
    })

    return data.updateProjectV2Field.projectV2Field
  }

  async deleteField(projectId: string, fieldId: string): Promise<boolean> {
    const query = `
      mutation DeleteField($projectId: ID!, $fieldId: ID!) {
        deleteProjectV2Field(input: {
          projectId: $projectId
          fieldId: $fieldId
        }) {
          projectV2Field {
            ... on ProjectV2Field {
              id
            }
            ... on ProjectV2SingleSelectField {
              id
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      fieldId
    })

    return !!data.deleteProjectV2Field.projectV2Field
  }

  // ============================================================================
  // Issue Management Methods
  // ============================================================================

  async createIssue(
    repositoryId: string,
    title: string,
    body?: string,
    assigneeIds?: string[],
    labelIds?: string[],
    milestoneId?: string
  ): Promise<GitHubProjectsIssue> {
    const query = `
      mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String, $assigneeIds: [ID!], $labelIds: [ID!], $milestoneId: ID) {
        createIssue(input: {
          repositoryId: $repositoryId
          title: $title
          body: $body
          assigneeIds: $assigneeIds
          labelIds: $labelIds
          milestoneId: $milestoneId
        }) {
          issue {
            id
            number
            title
            body
            state
            url
            repository {
              id
              name
              nameWithOwner
            }
            assignees(first: 10) {
              nodes {
                id
                login
                name
              }
            }
            labels(first: 10) {
              nodes {
                id
                name
                description
                color
              }
            }
            milestone {
              id
              number
              title
              description
              state
              dueOn
            }
            createdAt
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      repositoryId,
      title,
      body,
      assigneeIds,
      labelIds,
      milestoneId
    })

    return data.createIssue.issue
  }

  async getIssue(issueId: string): Promise<GitHubProjectsIssue> {
    const query = `
      query GetIssue($issueId: ID!) {
        node(id: $issueId) {
          ... on Issue {
            id
            number
            title
            body
            state
            url
            repository {
              id
              name
              nameWithOwner
            }
            assignees(first: 10) {
              nodes {
                id
                login
                name
              }
            }
            labels(first: 10) {
              nodes {
                id
                name
                description
                color
              }
            }
            milestone {
              id
              number
              title
              description
              state
              dueOn
            }
            createdAt
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { issueId })
    return data.node
  }

  async updateIssue(
    issueId: string,
    title?: string,
    body?: string,
    state?: 'OPEN' | 'CLOSED',
    assigneeIds?: string[],
    labelIds?: string[],
    milestoneId?: string
  ): Promise<GitHubProjectsIssue> {
    const query = `
      mutation UpdateIssue($issueId: ID!, $title: String, $body: String, $state: IssueState, $assigneeIds: [ID!], $labelIds: [ID!], $milestoneId: ID) {
        updateIssue(input: {
          id: $issueId
          title: $title
          body: $body
          state: $state
          assigneeIds: $assigneeIds
          labelIds: $labelIds
          milestoneId: $milestoneId
        }) {
          issue {
            id
            number
            title
            body
            state
            url
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      issueId,
      title,
      body,
      state,
      assigneeIds,
      labelIds,
      milestoneId
    })

    return data.updateIssue.issue
  }

  // ============================================================================
  // Milestone Management Methods
  // ============================================================================

  async createMilestone(
    repositoryId: string,
    title: string,
    description?: string,
    dueOn?: string
  ): Promise<GitHubProjectsMilestone> {
    // GitHub milestones need to be created via REST API, not GraphQL
    // First, we need to get repository info from the node ID
    const repoQuery = `
      query GetRepository($id: ID!) {
        node(id: $id) {
          ... on Repository {
            owner {
              login
            }
            name
          }
        }
      }
    `
    
    const repoData = await this.graphqlQuery(repoQuery, { id: repositoryId })
    if (!repoData.node) {
      throw new Error(`Repository not found with ID: ${repositoryId}`)
    }
    
    const { owner, name } = repoData.node
    
    // Use REST API to create milestone
    const restResponse = await fetch(`https://api.github.com/repos/${owner.login}/${name}/milestones`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        due_on: dueOn
      })
    })

    if (!restResponse.ok) {
      const errorText = await restResponse.text()
      throw new Error(`Failed to create milestone: ${restResponse.status} ${errorText}`)
    }

    const milestone = await restResponse.json()
    
    // Convert REST API response to our expected format
    return {
      id: milestone.node_id, // Use node_id for GraphQL compatibility
      number: milestone.number,
      title: milestone.title,
      description: milestone.description || undefined,
      state: milestone.state === 'open' ? 'OPEN' : 'CLOSED',
      dueOn: milestone.due_on || undefined,
      createdAt: milestone.created_at,
      updatedAt: milestone.updated_at
    }
  }

  async getMilestones(repositoryId: string, first: number = 20): Promise<GitHubProjectsMilestone[]> {
    const query = `
      query GetMilestones($repositoryId: ID!, $first: Int!) {
        node(id: $repositoryId) {
          ... on Repository {
            milestones(first: $first, states: [OPEN, CLOSED]) {
              nodes {
                id
                number
                title
                description
                state
                dueOn
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, { repositoryId, first })
    return data.node.milestones.nodes
  }

  // ============================================================================
  // Project Item Management Methods
  // ============================================================================

  async addItemToProject(
    projectId: string,
    contentId: string
  ): Promise<GitHubProjectsItem> {
    const query = `
      mutation AddItemToProject($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
          projectId: $projectId
          contentId: $contentId
        }) {
          item {
            id
            content {
              ... on Issue {
                id
                title
                url
                state
                number
                repository {
                  id
                  name
                  nameWithOwner
                }
              }
              ... on PullRequest {
                id
                title
                url
                state
                number
                repository {
                  id
                  name
                  nameWithOwner
                }
              }
            }
            project {
              id
            }
            createdAt
            updatedAt
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      contentId
    })

    return data.addProjectV2ItemById.item
  }

  async removeItemFromProject(
    projectId: string,
    itemId: string
  ): Promise<boolean> {
    const query = `
      mutation RemoveItemFromProject($projectId: ID!, $itemId: ID!) {
        deleteProjectV2Item(input: {
          projectId: $projectId
          itemId: $itemId
        }) {
          deletedItemId
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      itemId
    })

    return !!data.deleteProjectV2Item.deletedItemId
  }

  async updateItemFieldValue(
    projectId: string,
    itemId: string,
    fieldId: string,
    value: any
  ): Promise<GitHubProjectsItem> {
    const query = `
      mutation UpdateItemFieldValue($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: $value
        }) {
          projectV2Item {
            id
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                  text
                }
                ... on ProjectV2ItemFieldNumberValue {
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                  number
                }
                ... on ProjectV2ItemFieldDateValue {
                  field {
                    ... on ProjectV2Field {
                      id
                      name
                    }
                  }
                  date
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  field {
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                    }
                  }
                  name
                }
              }
            }
          }
        }
      }
    `

    const data = await this.graphqlQuery(query, {
      projectId,
      itemId,
      fieldId,
      value
    })

    return data.updateProjectV2ItemFieldValue.projectV2Item
  }

  // ============================================================================
  // SDLC-Specific Project Creation Methods
  // ============================================================================

  async createSDLCProject(
    ownerId: string,
    projectTitle: string,
    sdlcDocument: SDLCDocument,
    repositoryId?: string
  ): Promise<{
    project: GitHubProjectsProject
    issues: GitHubProjectsIssue[]
    milestones: GitHubProjectsMilestone[]
    isNewProject?: boolean
    customFieldsCreated?: boolean
    updated?: {
      newIssues: number
      newMilestones: number
      existingIssues: number
      existingMilestones: number
    }
    actualTitle?: string
    originalTitle?: string
    progress?: {
      total: number
      current: number
      message: string
    }
  }> {
    // Step 1: Check if project already exists
    console.log(`🔍 Resolving owner ID for: ${ownerId}`)
    const resolvedOwnerId = await this.resolveOwnerToNodeId(ownerId)
    console.log(`✅ Resolved owner ID: ${resolvedOwnerId}`)
    
    // Search for existing project by title
    const existingProject = await this.findProjectByTitle(resolvedOwnerId, projectTitle)
    
    if (existingProject) {
      console.log(`📝 Found existing project: ${existingProject.title} (${existingProject.id})`)
      console.log(`🔄 Updating existing project with new SDLC content...`)
      
      // Update existing project instead of creating new one
      const updateResult = await this.updateSDLCProject(existingProject, sdlcDocument, repositoryId)
      
      return {
        ...updateResult,
        isNewProject: false
      }
    }
    
    // Step 2: Create new project
    console.log(`📝 Creating new project: ${projectTitle}`)
    
    // Generate project description from SDLC document with repository info
    let repositoryInfo: { owner: string, name: string } | undefined
    if (repositoryId && sdlcDocument.metadata?.repositoryInfo) {
      repositoryInfo = {
        owner: sdlcDocument.metadata.repositoryInfo.owner,
        name: sdlcDocument.metadata.repositoryInfo.name
      }
    }
    
    const description = generateProjectDescription(sdlcDocument, repositoryInfo)
    
    // Try to create project with fallback titles if needed
    let project: GitHubProjectsProject
    let actualTitle: string
    
    try {
      project = await this.tryCreateProjectWithFallback(resolvedOwnerId, projectTitle, description)
      actualTitle = project.title
    } catch (error) {
      console.error(`🚫 Failed to create project after multiple attempts:`, error)
      throw error
    }
    
    console.log(`✅ Successfully created project: "${project.title}" (${project.id})`)
    
    // Step 3: Create custom fields (if project was created successfully)
    let customFieldsCreated = false
    try {
      console.log(`📝 Setting up custom fields for project...`)
      await this.createCustomFields(project.id)
      console.log(`✅ Custom fields created successfully`)
      customFieldsCreated = true
    } catch (error) {
      console.log(`⚠️ Failed to create custom fields:`, error)
      // Continue despite custom fields failure - this is non-critical
    }
    
    // Step 4: Create content (milestones, issues) if repository is provided
    let issues: GitHubProjectsIssue[] = []
    let milestones: GitHubProjectsMilestone[] = []
    
    if (repositoryId) {
      try {
        console.log(`📝 Creating SDLC content (milestones, issues) in repository...`)
        
        // Process sections in batches with delays to avoid rate limiting
        const sections = [
          { name: 'Business Analysis', data: sdlcDocument.businessAnalysis },
          { name: 'Functional Specification', data: sdlcDocument.functionalSpec },
          { name: 'Technical Specification', data: sdlcDocument.technicalSpec },
          { name: 'UX Specification', data: sdlcDocument.uxSpec },
          { name: 'Data Specification', data: sdlcDocument.dataSpec },
          { name: 'Service Specification', data: sdlcDocument.serviceSpec },
          { name: 'Deployment Specification', data: sdlcDocument.deploymentSpec },
          { name: 'Observability Specification', data: sdlcDocument.observabilitySpec },
          { name: 'Implementation Guide', data: sdlcDocument.implementationGuide }
        ].filter(section => section.data)
        
        // Process each section with delays between them
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]
          
          // Add delay between sections to avoid rate limiting
          if (i > 0) {
            console.log(`⏱️ Adding delay between sections to avoid rate limiting...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
          console.log(`🚀 Processing section ${i+1}/${sections.length}: ${section.name}`)
          
          // Try to create milestone for this section
          const milestoneTitle = `${section.name} Phase`
          let milestoneId: string | undefined
          
          try {
            const milestone = await this.createMilestone(
              repositoryId,
              milestoneTitle,
              `Milestone for ${section.name} phase implementation`
            )
            milestones.push(milestone)
            milestoneId = milestone.id
            console.log(`✅ Created new milestone: ${milestoneTitle}`)
          } catch (error) {
            console.log(`⚠️ Failed to create milestone ${milestoneTitle} (continuing without it):`, error)
          }
          
          // Try to create issues for this section
          if (section.data) {
            try {
              const sectionIssues = await this.createIssuesFromSDLCSection(
                repositoryId,
                section.name,
                section.data,
                milestoneId
              )
              
              // Add each issue to the project
              for (const issue of sectionIssues) {
                issues.push(issue)
                
                try {
                  await this.addItemToProject(project.id, issue.id)
                  console.log(`✅ Added issue to project: ${issue.title}`)
                } catch (error) {
                  console.log(`⚠️ Failed to add issue to project (issue still created):`, error)
                }
              }
            } catch (error) {
              console.log(`⚠️ Failed to create issues for section ${section.name}:`, error)
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Failed to create SDLC content:`, error)
        // Continue despite content creation failure - project still exists
      }
    } else {
      console.log(`📋 No repository provided - skipping milestone and issue creation`)
    }
    
    console.log(`🔄 Project creation complete:`)
    console.log(`  - Project created: ${project.title} (${project.id})`)
    console.log(`  - Issues created: ${issues.length}`)
    console.log(`  - Milestones created: ${milestones.length}`)
    
    return {
      project,
      issues,
      milestones,
      isNewProject: true,
      customFieldsCreated,
      actualTitle,
      originalTitle: projectTitle
    }
  }

  private async createIssuesFromSDLCSection(
    repositoryId: string,
    sectionName: string,
    sectionData: any,
    milestoneId?: string
  ): Promise<GitHubProjectsIssue[]> {
    console.log(`📝 Creating issues for section: ${sectionName}`)
    const issues: GitHubProjectsIssue[] = []
    
    // Get all keys from the section data (each key is a subsection)
    const subsections = Object.keys(sectionData)
    
    // Limit the number of issues per section to avoid overwhelming GitHub's API
    const MAX_ISSUES_PER_SECTION = 10
    const subsectionsToProcess = subsections.slice(0, MAX_ISSUES_PER_SECTION)
    const skippedCount = Math.max(0, subsections.length - MAX_ISSUES_PER_SECTION)
    
    console.log(`📋 Found ${subsections.length} subsections, processing max ${MAX_ISSUES_PER_SECTION}, skipping ${skippedCount}`)
    
    // Process each subsection with rate limiting
    for (let i = 0; i < subsectionsToProcess.length; i++) {
      const subsection = subsectionsToProcess[i]
      const content = sectionData[subsection]
      
      if (content && typeof content === 'string' && content.trim().length > 0) {
        const title = `${sectionName}: ${this.formatSubsectionTitle(subsection)}`
        console.log(`📝 Creating issue ${i+1}/${subsectionsToProcess.length}: ${title}`)
        
        // Create markdown body with content
        const body = `## ${this.formatSubsectionTitle(subsection)}

${content}

### Definition of Done
- [ ] Content reviewed and approved
- [ ] Documentation updated
- [ ] Stakeholder sign-off received
        `

        try {
          // Add a delay to avoid rate limiting (1 second between calls)
          if (i > 0) {
            console.log(`⏱️ Adding delay to avoid rate limiting...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          const issue = await this.createIssue(
            repositoryId,
            title,
            body,
            undefined, // assigneeIds
            undefined, // labelIds
            milestoneId
          )

          issues.push(issue)
          console.log(`✅ Created issue ${i+1}/${subsectionsToProcess.length}: ${title}`)
        } catch (error) {
          console.log(`❌ Failed to create issue ${i+1}/${subsectionsToProcess.length}: ${title}`)
          console.error(`Error details:`, error)
          
          // If we hit a rate limit, add a longer delay and retry once
          if (error instanceof Error && error.message.includes('submitted too quickly')) {
            console.log(`⏱️ Rate limit hit, waiting 5 seconds before retry...`)
            await new Promise(resolve => setTimeout(resolve, 5000))
            
            try {
              console.log(`🔄 Retrying issue creation: ${title}`)
              const issue = await this.createIssue(
                repositoryId,
                title,
                body,
                undefined,
                undefined,
                milestoneId
              )
              
              issues.push(issue)
              console.log(`✅ Successfully created issue on retry: ${title}`)
            } catch (retryError) {
              console.log(`❌ Retry also failed for issue: ${title}`)
              // Continue with the next issue instead of failing the whole batch
            }
          }
          // Continue with next issue instead of failing the whole batch
        }
      }
    }
    
    // Log summary of what was skipped
    if (skippedCount > 0) {
      console.log(`⚠️ Skipped ${skippedCount} subsections in ${sectionName} section to avoid GitHub API rate limits`)
    }

    return issues
  }

  private formatSubsectionTitle(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  private getPriorityFromIssueTitle(title: string): string {
    if (title.includes('Executive Summary') || title.includes('System Architecture')) {
      return 'Critical'
    } else if (title.includes('Requirements') || title.includes('Security')) {
      return 'High'
    } else if (title.includes('Testing') || title.includes('Documentation')) {
      return 'Medium'
    } else {
      return 'Low'
    }
  }

  private getEpicFromIssueTitle(title: string): string {
    if (title.includes('Business Analysis')) return 'Business Analysis'
    if (title.includes('Functional Specification')) return 'Functional Specification'
    if (title.includes('Technical Specification')) return 'Technical Architecture'
    if (title.includes('UX')) return 'UX Design'
    if (title.includes('Data')) return 'Data Architecture'
    if (title.includes('Service')) return 'Service Design'
    if (title.includes('Deployment')) return 'Deployment'
    if (title.includes('Observability') || title.includes('Monitoring')) return 'Observability'
    if (title.includes('Implementation')) return 'Implementation'
    return 'Business Analysis'
  }

  private getStoryPointsFromIssueTitle(title: string): number {
    if (title.includes('Executive Summary') || title.includes('System Architecture')) {
      return 8
    } else if (title.includes('Requirements') || title.includes('Design')) {
      return 5
    } else if (title.includes('Testing') || title.includes('Documentation')) {
      return 3
    } else {
      return 2
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async getRepositoryId(owner: string, name: string): Promise<string> {
    const query = `
      query GetRepository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `

    const data = await this.graphqlQuery(query, { owner, name })
    return data.repository.id
  }

  async getOrganizationId(login: string): Promise<string> {
    const query = `
      query GetOrganization($login: String!) {
        organization(login: $login) {
          id
        }
      }
    `

    const data = await this.graphqlQuery(query, { login })
    return data.organization.id
  }

  async getUserId(login: string): Promise<string> {
    
    const query = `
      query GetUser($login: String!) {
        user(login: $login) {
          id
        }
      }
    `

    try {
      const data = await this.graphqlQuery(query, { login })
      
      if (!data.user) {
        throw new Error(`User "${login}" not found or not accessible`)
      }
      
      return data.user.id
    } catch (error) {
      throw error
    }
  }

  async getCurrentUser(): Promise<GitHubProjectsUser> {
    const query = `
      query GetCurrentUser {
        viewer {
          id
          login
          name
          email
        }
      }
    `

    const data = await this.graphqlQuery(query)
    return data.viewer
  }

  /**
   * Resolves a username or organization name to its GitHub node ID
   * @param ownerLogin Username or organization name
   * @returns GitHub node ID
   */
  async resolveOwnerToNodeId(ownerLogin: string): Promise<string> {
    // If it's already a node ID, return as-is
    if (this.isNodeId(ownerLogin)) {
      return ownerLogin
    }

    // Try to resolve as user first
    try {
      const nodeId = await this.getUserId(ownerLogin)
      return nodeId
    } catch (userError: any) {
      // If user lookup fails, try as organization
      try {
        const nodeId = await this.getOrganizationId(ownerLogin)
        return nodeId
      } catch (orgError: any) {
        throw new Error(`Could not resolve "${ownerLogin}" to a GitHub user or organization. User error: ${userError.message || userError}. Org error: ${orgError.message || orgError}. Please verify the username/organization name exists and you have permission to access it.`)
      }
    }
  }

  /**
   * Checks if a string is likely a GitHub node ID
   * @param id String to check
   * @returns True if it looks like a node ID
   */
  private isNodeId(id: string): boolean {
    
    // GitHub node IDs have specific characteristics:
    // - They're base64-encoded and longer than typical usernames  
    // - They start with specific prefixes for different entity types
    // - They contain equals signs for padding
    // - Minimum length is typically 16+ characters
    
    const isValidNodeId = (
      // Must be at least 16 characters (node IDs are much longer than usernames)
      id.length >= 16 &&
      (
        // Traditional base64 node IDs with prefixes
        id.startsWith('MDQ6') ||      // User prefix
        id.startsWith('MDEy') ||      // Organization prefix  
        id.startsWith('PR_kwDO') ||   // ProjectV2 prefix
        id.startsWith('R_kgDO') ||    // Repository prefix
        // Or base64 patterns with equals padding
        (id.includes('=') && /^[A-Za-z0-9+/]+=*$/.test(id))
      )
    )
    
    return isValidNodeId
  }

  // ============================================================================
  // Project Template Methods
  // ============================================================================

  async createProjectTemplate(
    ownerId: string,
    templateName: string,
    description: string
  ): Promise<GitHubProjectsProject> {
    const project = await this.createProject(
      ownerId,
      `Template: ${templateName}`,
      description,
      true
    )

    // Create standard SDLC fields
    await this.createSingleSelectField(project.id, 'Status', [
      { name: 'Backlog', color: 'GRAY' },
      { name: 'In Progress', color: 'BLUE' },
      { name: 'In Review', color: 'YELLOW' },
      { name: 'Done', color: 'GREEN' },
      { name: 'Blocked', color: 'RED' }
    ])

    await this.createSingleSelectField(project.id, 'Priority', [
      { name: 'Critical', color: 'RED' },
      { name: 'High', color: 'ORANGE' },
      { name: 'Medium', color: 'YELLOW' },
      { name: 'Low', color: 'GREEN' }
    ])

    await this.createField(project.id, 'Story Points', 'NUMBER')
    await this.createField(project.id, 'Start Date', 'DATE')
    await this.createField(project.id, 'Due Date', 'DATE')

    return project
  }

  // ============================================================================
  // Webhook and Automation Support
  // ============================================================================

  async setupProjectAutomation(
    projectId: string,
    rules: {
      autoCloseIssues?: boolean
      autoAssignPRs?: boolean
      autoUpdateStatus?: boolean
    }
  ): Promise<boolean> {
    // This would integrate with GitHub's built-in project automation
    // For now, return true to indicate setup is complete
    return true
  }

  // ============================================================================
  // Export and Import Methods
  // ============================================================================

  async exportProjectData(projectId: string): Promise<any> {
    const project = await this.getProject(projectId)
    
    return {
      project: {
        title: project.title,
        description: project.description,
        public: project.public
      },
      fields: project.fields,
      items: project.items,
      exportedAt: new Date().toISOString()
    }
  }

  async importProjectData(
    ownerId: string,
    projectData: any,
    repositoryId?: string
  ): Promise<GitHubProjectsProject> {
    const project = await this.createProject(
      ownerId,
      projectData.project.title,
      projectData.project.description,
      projectData.project.public
    )

    // Recreate fields
    for (const field of projectData.fields) {
      if (field.dataType === 'SINGLE_SELECT') {
        await this.createSingleSelectField(project.id, field.name, field.options || [])
      } else {
        await this.createField(project.id, field.name, field.dataType)
      }
    }

    return project
  }

  // ============================================================================
  // Project Search and Update Methods
  // ============================================================================

  async findProjectByTitle(ownerId: string, title: string): Promise<GitHubProjectsProject | null> {
    try {
      console.log(`🔍 Searching for existing project: "${title}"`)
      
      // Generate possible title variations to search for
      const titleVariations = [
        title,
        this.sanitizeProjectName(title),
        `${this.sanitizeProjectName(title)} - SDLC Project`,
        `Project: ${this.sanitizeProjectName(title)}`,
        `${this.sanitizeProjectName(title)} (${new Date().getFullYear()})`
      ]
      
      console.log(`🔍 Searching for project with title variations:`, titleVariations)
      
      // First try to get user projects
      let projects: GitHubProjectsProject[] = []
      
      // Check if ownerId is a node ID, if so we need to resolve it to login first
      let ownerLogin = ownerId
      if (this.isNodeId(ownerId)) {
        try {
          console.log(`🔍 Resolving node ID ${ownerId} to username...`)
          // Query to get login from node ID
          const ownerQuery = `
            query GetOwner($id: ID!) {
              node(id: $id) {
                ... on User {
                  login
                }
                ... on Organization {
                  login
                }
              }
            }
          `
          const ownerData = await this.graphqlQuery(ownerQuery, { id: ownerId })
          if (ownerData.node && ownerData.node.login) {
            ownerLogin = ownerData.node.login
            console.log(`✅ Resolved to username: ${ownerLogin}`)
          } else {
            console.log(`⚠️ Could not resolve node ID to username, using as-is`)
          }
        } catch (error) {
          console.log(`⚠️ Error resolving node ID, using as-is:`, error)
          ownerLogin = ownerId
        }
      }
      
      try {
        // Try as user first
        const userProjects = await this.getUserProjects(ownerLogin, 50)
        projects = userProjects
        console.log(`📋 Found ${projects.length} user projects to search`)
      } catch (error) {
        console.log(`⚠️ User projects search failed, trying organization search...`)
        // If user search fails, try as organization
        try {
          const orgProjects = await this.getOrganizationProjects(ownerLogin, 50)
          projects = orgProjects
          console.log(`📋 Found ${projects.length} organization projects to search`)
        } catch (orgError: any) {
          console.error('Failed to search both user and org projects:', orgError)
          return null
        }
      }

      // Find project with matching title (case-insensitive, checking all variations)
      for (const variation of titleVariations) {
        const existingProject = projects.find(p => 
          p.title.toLowerCase() === variation.toLowerCase()
        )
        
        if (existingProject) {
          console.log(`✅ Found existing project: "${existingProject.title}" (ID: ${existingProject.id})`)
          console.log(`📝 Matched with variation: "${variation}"`)
          return existingProject
        }
      }

      console.log(`❌ No existing project found with any title variation`)
      return null
    } catch (error) {
      console.error('Error searching for existing project:', error)
      return null
    }
  }

  async updateSDLCProject(
    project: GitHubProjectsProject,
    sdlcDocument: SDLCDocument,
    repositoryId?: string
  ): Promise<{
    project: GitHubProjectsProject
    issues: GitHubProjectsIssue[]
    milestones: GitHubProjectsMilestone[]
    updated: {
      newIssues: number
      newMilestones: number
      existingIssues: number
      existingMilestones: number
    }
  }> {
    console.log(`🔄 Updating existing project: ${project.title}`)

    // Initialize tracking variables
    let newIssues: GitHubProjectsIssue[] = []
    let newMilestones: GitHubProjectsMilestone[] = []
    let existingIssueCount = 0
    let existingMilestoneCount = 0

    // Get existing items in the project (safely)
    let existingProject = project
    try {
      existingProject = await this.getProject(project.id)
    } catch (error) {
      console.log('⚠️ Could not fetch detailed project info, using basic info')
    }

    // Ensure items is an array before filtering
    const existingItems = Array.isArray(existingProject.items) ? existingProject.items : []
    const existingIssues = existingItems
      .filter(item => item && item.content?.type === 'ISSUE')
      .map(item => item.content?.title || '')

    // Get existing milestones (safely)
    let existingMilestones: string[] = []
    if (repositoryId) {
      try {
        const milestones = await this.getMilestones(repositoryId)
        existingMilestones = milestones.map(m => m.title)
        console.log(`📋 Found ${existingMilestones.length} existing milestones`)
      } catch (error) {
        console.log('⚠️ Could not fetch existing milestones - continuing without milestone checks')
      }
    }

    // Only attempt milestone/issue creation if repository is provided
    if (repositoryId) {
      console.log('📋 Repository provided - attempting to create/update milestones and issues...')
      
      // Process each section of the SDLC document
      const sections = [
        { name: 'Business Analysis', data: sdlcDocument.businessAnalysis },
        { name: 'Functional Specification', data: sdlcDocument.functionalSpec },
        { name: 'Technical Specification', data: sdlcDocument.technicalSpec },
        { name: 'UX Specification', data: sdlcDocument.uxSpec },
        { name: 'Data Specification', data: sdlcDocument.dataSpec },
        { name: 'Service Specification', data: sdlcDocument.serviceSpec },
        { name: 'Deployment Specification', data: sdlcDocument.deploymentSpec },
        { name: 'Observability Specification', data: sdlcDocument.observabilitySpec },
        { name: 'Implementation Guide', data: sdlcDocument.implementationGuide }
      ].filter(section => section.data)

      for (const section of sections) {
        console.log(`🚀 Processing section: ${section.name}`)
        
        // Try to create milestone for this section
        const milestoneTitle = `${section.name} Phase`
        let milestoneId: string | undefined
        
        if (!existingMilestones.includes(milestoneTitle)) {
          try {
            const milestone = await this.createMilestone(
              repositoryId,
              milestoneTitle,
              `Milestone for ${section.name} phase implementation`
            )
            newMilestones.push(milestone)
            milestoneId = milestone.id
            console.log(`✅ Created new milestone: ${milestoneTitle}`)
          } catch (error) {
            console.log(`⚠️ Failed to create milestone ${milestoneTitle} (continuing without it):`, error)
          }
        } else {
          existingMilestoneCount++
          console.log(`📋 Milestone already exists: ${milestoneTitle}`)
        }

        // Try to create issues for this section
        if (section.data) {
          try {
            const sectionIssues = await this.createIssuesFromSDLCSection(
              repositoryId,
              section.name,
              section.data,
              milestoneId
            )

            for (const issue of sectionIssues) {
              if (!existingIssues.includes(issue.title)) {
                newIssues.push(issue)
                // Try to add the new issue to the project
                try {
                  await this.addItemToProject(project.id, issue.id)
                  console.log(`✅ Added new issue to project: ${issue.title}`)
                } catch (error) {
                  console.log(`⚠️ Failed to add issue to project (issue still created):`, error)
                }
              } else {
                existingIssueCount++
                console.log(`📝 Issue already exists: ${issue.title}`)
              }
            }
          } catch (error) {
            console.log(`⚠️ Failed to create issues for section ${section.name}:`, error)
          }
        }
      }
    } else {
      console.log('📋 No repository provided - skipping milestone and issue creation')
    }

    console.log(`🔄 Project update complete:`)
    console.log(`  - New issues created: ${newIssues.length}`)
    console.log(`  - Existing issues found: ${existingIssueCount}`)
    console.log(`  - New milestones created: ${newMilestones.length}`)
    console.log(`  - Existing milestones found: ${existingMilestoneCount}`)

    return {
      project: existingProject,
      issues: newIssues,
      milestones: newMilestones,
      updated: {
        newIssues: newIssues.length,
        newMilestones: newMilestones.length,
        existingIssues: existingIssueCount,
        existingMilestones: existingMilestoneCount
      }
    }
  }

  // ============================================================================
  // Project Name Sanitization and Fallback Logic
  // ============================================================================

  private sanitizeProjectName(title: string): string {
    // Common GitHub reserved words to avoid
    const reservedWords = [
      'create', 'new', 'add', 'delete', 'remove', 'update', 'edit', 
      'admin', 'api', 'app', 'application', 'auth', 'authentication',
      'system', 'service', 'server', 'client', 'database', 'db',
      'config', 'configuration', 'settings', 'setup', 'install',
      'main', 'master', 'default', 'public', 'private', 'test'
    ]

    let sanitized = title.toLowerCase()
    
    // Replace reserved words with alternatives
    reservedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      sanitized = sanitized.replace(regex, match => {
        switch(match.toLowerCase()) {
          case 'create': return 'build'
          case 'system': return 'platform'
          case 'service': return 'solution'
          case 'new': return 'fresh'
          case 'admin': return 'management'
          default: return `${match}_proj`
        }
      })
    })

    // Capitalize first letter of each word
    return sanitized.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  private async tryCreateProjectWithFallback(
    ownerId: string, 
    originalTitle: string, 
    description: string, 
    isPublic: boolean = false
  ): Promise<GitHubProjectsProject> {
    const attempts = [
      originalTitle,
      this.sanitizeProjectName(originalTitle),
      `${this.sanitizeProjectName(originalTitle)} - SDLC Project`,
      `Project: ${this.sanitizeProjectName(originalTitle)}`,
      `${this.sanitizeProjectName(originalTitle)} (${new Date().getFullYear()})`
    ]

    console.log(`🔍 Attempting to create project with potential titles:`, attempts)

    for (let i = 0; i < attempts.length; i++) {
      const title = attempts[i]
      console.log(`📝 Attempt ${i + 1}: Trying project title: "${title}"`)
      
      try {
        const project = await this.createProject(ownerId, title, description, isPublic)
        console.log(`✅ Successfully created project: "${title}"`)
        return project
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.log(`❌ Attempt ${i + 1} failed: ${errorMessage}`)
        
        if (i === attempts.length - 1) {
          // Last attempt failed, throw the error
          console.error(`🚫 All ${attempts.length} project creation attempts failed`)
          throw error
        }
        
        // Continue to next attempt if this wasn't the last one
        console.log(`🔄 Trying next variation...`)
      }
    }

    throw new Error('Failed to create project with any title variation')
  }

  // Helper method to create custom fields
  private async createCustomFields(projectId: string): Promise<void> {
    console.log('📝 Creating Task Status field...')
    const statusField = await this.createSingleSelectField(projectId, 'Task Status', [
      { name: 'Backlog', description: 'Not started', color: 'GRAY' },
      { name: 'In Progress', description: 'Currently being worked on', color: 'BLUE' },
      { name: 'In Review', description: 'Under review', color: 'YELLOW' },
      { name: 'Done', description: 'Completed', color: 'GREEN' },
      { name: 'Blocked', description: 'Blocked by dependencies', color: 'RED' }
    ])
    console.log('✅ Task Status field created successfully')

    console.log('📝 Creating Task Priority field...')
    const priorityField = await this.createSingleSelectField(projectId, 'Task Priority', [
      { name: 'Critical', description: 'Must be completed first', color: 'RED' },
      { name: 'High', description: 'High priority', color: 'YELLOW' },
      { name: 'Medium', description: 'Medium priority', color: 'YELLOW' },
      { name: 'Low', description: 'Low priority', color: 'GREEN' }
    ])
    console.log('✅ Task Priority field created successfully')

    console.log('📝 Creating Epic Category field...')
    const epicField = await this.createSingleSelectField(projectId, 'Epic Category', [
      { name: 'Business Analysis', description: 'Business requirements and analysis', color: 'BLUE' },
      { name: 'Functional Specification', description: 'Functional requirements and specs', color: 'GREEN' },
      { name: 'Technical Architecture', description: 'Technical design and architecture', color: 'PURPLE' },
      { name: 'UX Design', description: 'User experience and design', color: 'PINK' },
      { name: 'Data Architecture', description: 'Data modeling and architecture', color: 'YELLOW' },
      { name: 'Service Design', description: 'Service architecture and APIs', color: 'RED' },
      { name: 'Deployment', description: 'Deployment and infrastructure', color: 'GRAY' },
      { name: 'Observability', description: 'Monitoring and observability', color: 'BLUE' },
      { name: 'Implementation', description: 'Development and implementation', color: 'GREEN' }
    ])
    console.log('✅ Epic Category field created successfully')

    console.log('📝 Creating additional fields...')
    const estimateField = await this.createField(projectId, 'Story Points', 'NUMBER')
    console.log('✅ Story Points field created')
  }

  // Helper method to create SDLC content
  private async createSDLCContent(
    projectId: string,
    repositoryId: string,
    sdlcDocument: SDLCDocument
  ): Promise<{ issues: GitHubProjectsIssue[], milestones: GitHubProjectsMilestone[] }> {
    console.log('📋 Processing SDLC phases...')
    
    const allIssues: GitHubProjectsIssue[] = []
    const allMilestones: GitHubProjectsMilestone[] = []
    
    // Process each section of the SDLC document
    const sections = [
      { name: 'Business Analysis', data: sdlcDocument.businessAnalysis },
      { name: 'Functional Specification', data: sdlcDocument.functionalSpec },
      { name: 'Technical Specification', data: sdlcDocument.technicalSpec },
      { name: 'UX Specification', data: sdlcDocument.uxSpec }
    ].filter(section => section.data)

    console.log(`📋 Processing ${sections.length} SDLC phases...`)

    for (const section of sections) {
      console.log(`🚀 Processing phase: ${section.name}`)
      
      // Create milestone for this phase
      try {
        console.log(`📅 Creating milestone: ${section.name} Phase`)
        const milestone = await this.createMilestone(
          repositoryId,
          `${section.name} Phase`,
          `Milestone for ${section.name} phase implementation`
        )
        allMilestones.push(milestone)
        console.log(`✅ Created milestone: ${milestone.title}`)
        
        // Create issues for this section
        const sectionIssues = await this.createIssuesFromSDLCSection(
          repositoryId,
          section.name,
          section.data,
          milestone.id
        )
        
        // Add issues to project
        for (const issue of sectionIssues) {
          allIssues.push(issue)
          try {
            await this.addItemToProject(projectId, issue.id)
            console.log(`✅ Added issue to project: ${issue.title}`)
          } catch (error) {
            console.log(`⚠️ Could not add issue to project: ${issue.title}`)
          }
        }
        
      } catch (error) {
        console.log(`❌ Error processing phase ${section.name}:`, error)
      }
    }
    
    return { issues: allIssues, milestones: allMilestones }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createGitHubProjectsService(token: string): GitHubProjectsService {
  return new GitHubProjectsService(token)
}

export function isValidGitHubToken(token: string): boolean {
  return !!token && typeof token === 'string' && token.startsWith('ghp_') && token.length >= 40
}

export function formatProjectTitle(title: string, addTimestamp: boolean = false): string {
  // Clean the title by removing special characters
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').trim()
  
  // Add timestamp for uniqueness if requested
  if (addTimestamp) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    return `${cleanTitle} (${timestamp})`
  }
  
  return cleanTitle
}

export function generateProjectDescription(sdlcDocument: SDLCDocument, repositoryInfo?: { owner: string, name: string }): string {
  const metadata = sdlcDocument.metadata
  const sectionsCount = Object.keys(sdlcDocument.businessAnalysis).length + 
                       Object.keys(sdlcDocument.functionalSpec).length + 
                       Object.keys(sdlcDocument.technicalSpec).length +
                       (sdlcDocument.uxSpec ? Object.keys(sdlcDocument.uxSpec).length : 0) +
                       (sdlcDocument.dataSpec ? Object.keys(sdlcDocument.dataSpec).length : 0) +
                       (sdlcDocument.serviceSpec ? Object.keys(sdlcDocument.serviceSpec).length : 0) +
                       (sdlcDocument.deploymentSpec ? Object.keys(sdlcDocument.deploymentSpec).length : 0) +
                       (sdlcDocument.observabilitySpec ? Object.keys(sdlcDocument.observabilitySpec).length : 0) +
                       (sdlcDocument.implementationGuide ? Object.keys(sdlcDocument.implementationGuide).length : 0)

  return `# SDLC Project

**Generated**: ${new Date().toISOString()}
**Sections**: ${metadata?.sectionsGenerated || sectionsCount}
**Detail Level**: ${metadata?.detailLevel || 'Comprehensive'}
**Token Estimate**: ${metadata?.tokenEstimate || 'N/A'}
${repositoryInfo ? `**Repository**: [${repositoryInfo.owner}/${repositoryInfo.name}](https://github.com/${repositoryInfo.owner}/${repositoryInfo.name})` : ''}

## Overview
This project contains a comprehensive breakdown of the SDLC process with detailed issues, milestones, and tracking for:
${repositoryInfo ? `\n**All issues and milestones are linked to the [${repositoryInfo.owner}/${repositoryInfo.name}](https://github.com/${repositoryInfo.owner}/${repositoryInfo.name}) repository.**\n` : ''}

### Documentation Sections
- **Business Analysis**: ${Object.keys(sdlcDocument.businessAnalysis).length} sections
- **Functional Specification**: ${Object.keys(sdlcDocument.functionalSpec).length} sections  
- **Technical Specification**: ${Object.keys(sdlcDocument.technicalSpec).length} sections
${sdlcDocument.uxSpec ? `- **UX Specification**: ${Object.keys(sdlcDocument.uxSpec).length} sections` : ''}
${sdlcDocument.dataSpec ? `- **Data Specification**: ${Object.keys(sdlcDocument.dataSpec).length} sections` : ''}
${sdlcDocument.serviceSpec ? `- **Service Specification**: ${Object.keys(sdlcDocument.serviceSpec).length} sections` : ''}
${sdlcDocument.deploymentSpec ? `- **Deployment Specification**: ${Object.keys(sdlcDocument.deploymentSpec).length} sections` : ''}
${sdlcDocument.observabilitySpec ? `- **Observability Specification**: ${Object.keys(sdlcDocument.observabilitySpec).length} sections` : ''}
${sdlcDocument.implementationGuide ? `- **Implementation Guide**: ${Object.keys(sdlcDocument.implementationGuide).length} sections` : ''}

## Project Structure
- **Epics**: Organized by major SDLC phases
- **Milestones**: Phase-based delivery milestones${repositoryInfo ? ` (linked to ${repositoryInfo.owner}/${repositoryInfo.name})` : ''}
- **Issues**: Detailed tasks for each section${repositoryInfo ? ` (created in ${repositoryInfo.owner}/${repositoryInfo.name})` : ''}
- **Custom Fields**: Priority, Story Points, Epic mapping, dates

## Getting Started
1. Review the epics and milestones
2. Assign team members to issues
3. Update issue status as work progresses
4. Use the project board to track overall progress
${repositoryInfo ? `5. View all issues in the [${repositoryInfo.owner}/${repositoryInfo.name} repository](https://github.com/${repositoryInfo.owner}/${repositoryInfo.name}/issues)` : ''}

---
*Auto-generated by SDLC AI Platform*`
} 