import { RepositoryAnalysis } from './repository-analyzer'
import { GeneratedCode } from './code-generator'
import { BugFix } from './bug-detector'

export interface GitHubRepository {
  owner: string
  name: string
  full_name: string
  default_branch: string
  private: boolean
  clone_url: string
  html_url: string
}

export interface PullRequestData {
  title: string
  body: string
  head: string
  base: string
  draft?: boolean
  maintainer_can_modify?: boolean
}

export interface GitHubCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
  }
  files: Array<{
    filename: string
    status: 'added' | 'modified' | 'removed'
    changes: number
  }>
}

export interface PullRequestResult {
  url: string
  number: number
  title: string
  body: string
  state: 'open' | 'closed' | 'merged'
  mergeable: boolean | null
  created_at: string
  commits: GitHubCommit[]
}

export class GitHubClaudeService {
  private githubToken: string
  private baseApiUrl = 'https://api.github.com'

  constructor(githubToken: string) {
    this.githubToken = githubToken
  }

  /**
   * Create implementation branch and PR for Claude-generated code
   */
  async createImplementationBranch(
    repoUrl: string,
    generatedCode: GeneratedCode,
    options: {
      branchName?: string
      prTitle?: string
      prDescription?: string
      isDraft?: boolean
    } = {}
  ): Promise<PullRequestResult> {
    console.log(`🔀 Creating implementation branch for: ${repoUrl}`)
    console.log(`📁 Files to create: ${generatedCode.implementation.files_to_create.length}`)
    console.log(`✏️ Files to modify: ${generatedCode.implementation.files_to_modify.length}`)

    try {
      const { owner, name } = this.parseRepoUrl(repoUrl)
      const repo = await this.getRepository(owner, name)
      
      // Generate branch name
      const branchName = options.branchName || 
        `claude/feature/${this.sanitizeBranchName(generatedCode.specification.description)}-${Date.now()}`
      
      // Create feature branch from default branch
      await this.createBranch(owner, name, branchName, repo.default_branch)
      
      // Apply all changes to the branch
      const commits = await this.applyCodeChanges(owner, name, branchName, generatedCode)
      
      // Create pull request
      const prData: PullRequestData = {
        title: options.prTitle || `✨ ${generatedCode.specification.description}`,
        body: this.generatePRDescription(generatedCode),
        head: branchName,
        base: repo.default_branch,
        draft: options.isDraft || false,
        maintainer_can_modify: true
      }
      
      const pullRequest = await this.createPullRequest(owner, name, prData)
      
      console.log(`✅ Implementation PR created: ${pullRequest.url}`)
      return pullRequest

    } catch (error) {
      console.error(`❌ Failed to create implementation branch:`, error)
      throw new Error(`Failed to create implementation branch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create bug fix PR with automated testing
   */
  async createBugFixPR(
    repoUrl: string,
    bugFix: BugFix,
    options: {
      branchName?: string
      prTitle?: string
      includePrevention?: boolean
    } = {}
  ): Promise<PullRequestResult> {
    console.log(`🐛 Creating bug fix PR for: ${repoUrl}`)
    
    try {
      const { owner, name } = this.parseRepoUrl(repoUrl)
      const repo = await this.getRepository(owner, name)
      
      // Generate branch name
      const branchName = options.branchName || 
        `claude/bugfix/${this.sanitizeBranchName(bugFix.analysis.bugReport.description)}-${Date.now()}`
      
      // Create hotfix branch
      await this.createBranch(owner, name, branchName, repo.default_branch)
      
      // Apply bug fix changes
      await this.applyBugFixChanges(owner, name, branchName, bugFix)
      
      // Create pull request with comprehensive description
      const prData: PullRequestData = {
        title: options.prTitle || `🐛 Fix: ${bugFix.analysis.bugReport.description}`,
        body: this.generateBugFixPRDescription(bugFix),
        head: branchName,
        base: repo.default_branch,
        draft: false,
        maintainer_can_modify: true
      }
      
      const pullRequest = await this.createPullRequest(owner, name, prData)
      
      console.log(`✅ Bug fix PR created: ${pullRequest.url}`)
      return pullRequest

    } catch (error) {
      console.error(`❌ Failed to create bug fix PR:`, error)
      throw new Error(`Failed to create bug fix PR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create documentation PR from repository analysis
   */
  async createDocumentationPR(
    repoUrl: string,
    repositoryAnalysis: RepositoryAnalysis,
    generatedDocs: Array<{
      path: string
      content: string
      type: 'readme' | 'api' | 'guide'
    }>
  ): Promise<PullRequestResult> {
    console.log(`📚 Creating documentation PR for: ${repoUrl}`)
    
    try {
      const { owner, name } = this.parseRepoUrl(repoUrl)
      const repo = await this.getRepository(owner, name)
      
      const branchName = `claude/docs/update-documentation-${Date.now()}`
      
      // Create documentation branch
      await this.createBranch(owner, name, branchName, repo.default_branch)
      
      // Apply documentation changes
      await this.applyDocumentationChanges(owner, name, branchName, generatedDocs)
      
      // Create pull request
      const prData: PullRequestData = {
        title: '📚 Update project documentation',
        body: this.generateDocumentationPRDescription(repositoryAnalysis, generatedDocs),
        head: branchName,
        base: repo.default_branch,
        draft: false,
        maintainer_can_modify: true
      }
      
      const pullRequest = await this.createPullRequest(owner, name, prData)
      
      console.log(`✅ Documentation PR created: ${pullRequest.url}`)
      return pullRequest

    } catch (error) {
      console.error(`❌ Failed to create documentation PR:`, error)
      throw new Error(`Failed to create documentation PR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update project status by linking PR to SDLC.dev project
   */
  async updateProjectStatus(
    projectId: string,
    pullRequestUrl: string,
    status: 'created' | 'merged' | 'closed'
  ): Promise<void> {
    console.log(`🔄 Updating project ${projectId} status: ${status}`)
    
    // This would integrate with your SDLC.dev database
    // For now, just log the status update
    console.log(`📊 Project ${projectId} PR ${pullRequestUrl} is now ${status}`)
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, name: string): Promise<GitHubRepository> {
    const response = await this.githubApiRequest(`/repos/${owner}/${name}`)
    
    return {
      owner: response.owner.login,
      name: response.name,
      full_name: response.full_name,
      default_branch: response.default_branch,
      private: response.private,
      clone_url: response.clone_url,
      html_url: response.html_url
    }
  }

  /**
   * Create a new branch
   */
  private async createBranch(
    owner: string,
    name: string,
    branchName: string,
    baseBranch: string
  ): Promise<void> {
    // Get the SHA of the base branch
    const baseRef = await this.githubApiRequest(`/repos/${owner}/${name}/git/refs/heads/${baseBranch}`)
    const baseSha = baseRef.object.sha
    
    // Create new branch
    await this.githubApiRequest(`/repos/${owner}/${name}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      })
    })
    
    console.log(`✅ Created branch: ${branchName}`)
  }

  /**
   * Apply code changes from Claude generation
   */
  private async applyCodeChanges(
    owner: string,
    name: string,
    branchName: string,
    generatedCode: GeneratedCode
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = []
    
    // Create new files
    for (const file of generatedCode.implementation.files_to_create) {
      await this.createFile(owner, name, branchName, file.path, file.content, file.description)
      commits.push({
        sha: 'pending',
        message: `Create ${file.path}: ${file.description}`,
        author: { name: 'Claude AI', email: 'claude@sdlc.dev' },
        files: [{ filename: file.path, status: 'added', changes: file.content.split('\n').length }]
      })
    }
    
    // Modify existing files
    for (const file of generatedCode.implementation.files_to_modify) {
      await this.updateFile(owner, name, branchName, file.path, file.changes, file.description)
      commits.push({
        sha: 'pending',
        message: `Update ${file.path}: ${file.description}`,
        author: { name: 'Claude AI', email: 'claude@sdlc.dev' },
        files: [{ filename: file.path, status: 'modified', changes: file.changes.split('\n').length }]
      })
    }
    
    // Create test files
    for (const test of generatedCode.tests.unit_tests) {
      await this.createFile(owner, name, branchName, test.file_path, test.test_content, `Unit test: ${test.description}`)
      commits.push({
        sha: 'pending',
        message: `Add unit test: ${test.description}`,
        author: { name: 'Claude AI', email: 'claude@sdlc.dev' },
        files: [{ filename: test.file_path, status: 'added', changes: test.test_content.split('\n').length }]
      })
    }
    
    // Create documentation
    for (const doc of generatedCode.documentation.new_docs) {
      await this.createFile(owner, name, branchName, doc.file_path, doc.content, `Documentation: ${doc.type}`)
      commits.push({
        sha: 'pending',
        message: `Add documentation: ${doc.file_path}`,
        author: { name: 'Claude AI', email: 'claude@sdlc.dev' },
        files: [{ filename: doc.file_path, status: 'added', changes: doc.content.split('\n').length }]
      })
    }
    
    return commits
  }

  /**
   * Apply bug fix changes
   */
  private async applyBugFixChanges(
    owner: string,
    name: string,
    branchName: string,
    bugFix: BugFix
  ): Promise<void> {
    // Apply bug fix changes
    for (const file of bugFix.implementation.files_to_modify) {
      await this.updateFile(owner, name, branchName, file.path, file.content, file.changes_summary)
    }
    
    // Create new files if needed
    for (const file of bugFix.implementation.files_to_create) {
      await this.createFile(owner, name, branchName, file.path, file.content, file.purpose)
    }
    
    // Create test files
    for (const test of bugFix.validation.test_files) {
      await this.createFile(owner, name, branchName, test.path, test.content, `Bug fix test: ${test.framework}`)
    }
  }

  /**
   * Apply documentation changes
   */
  private async applyDocumentationChanges(
    owner: string,
    name: string,
    branchName: string,
    docs: Array<{ path: string; content: string; type: string }>
  ): Promise<void> {
    for (const doc of docs) {
      await this.createFile(owner, name, branchName, doc.path, doc.content, `Update ${doc.type} documentation`)
    }
  }

  /**
   * Create a file in the repository
   */
  private async createFile(
    owner: string,
    name: string,
    branch: string,
    path: string,
    content: string,
    message: string
  ): Promise<void> {
    const encodedContent = Buffer.from(content).toString('base64')
    
    await this.githubApiRequest(`/repos/${owner}/${name}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Claude AI: ${message}`,
        content: encodedContent,
        branch: branch
      })
    })
  }

  /**
   * Update an existing file in the repository
   */
  private async updateFile(
    owner: string,
    name: string,
    branch: string,
    path: string,
    content: string,
    message: string
  ): Promise<void> {
    try {
      // Get current file to get its SHA
      const currentFile = await this.githubApiRequest(`/repos/${owner}/${name}/contents/${path}?ref=${branch}`)
      const encodedContent = Buffer.from(content).toString('base64')
      
      await this.githubApiRequest(`/repos/${owner}/${name}/contents/${path}`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Claude AI: ${message}`,
          content: encodedContent,
          sha: currentFile.sha,
          branch: branch
        })
      })
    } catch (error) {
      console.warn(`File ${path} may not exist, creating new file`)
      await this.createFile(owner, name, branch, path, content, message)
    }
  }

  /**
   * Create a pull request
   */
  private async createPullRequest(
    owner: string,
    name: string,
    prData: PullRequestData
  ): Promise<PullRequestResult> {
    const response = await this.githubApiRequest(`/repos/${owner}/${name}/pulls`, {
      method: 'POST',
      body: JSON.stringify(prData)
    })
    
    return {
      url: response.html_url,
      number: response.number,
      title: response.title,
      body: response.body,
      state: response.state,
      mergeable: response.mergeable,
      created_at: response.created_at,
      commits: [] // Would need separate API call to get commits
    }
  }

  /**
   * Generate comprehensive PR description for generated code
   */
  private generatePRDescription(generatedCode: GeneratedCode): string {
    return `## 🤖 Claude AI Generated Implementation

**Description:** ${generatedCode.specification.description}

**Type:** ${generatedCode.specification.type}

### 📋 Requirements Implemented
${generatedCode.specification.requirements.map(req => `- ${req}`).join('\n')}

### 🏗️ Implementation Details

**Estimated Complexity:** ${generatedCode.estimatedComplexity}
**Risk Level:** ${generatedCode.riskAssessment.level}

#### 📁 Files Created (${generatedCode.implementation.files_to_create.length})
${generatedCode.implementation.files_to_create.map(file => `- \`${file.path}\` - ${file.description}`).join('\n')}

#### ✏️ Files Modified (${generatedCode.implementation.files_to_modify.length})
${generatedCode.implementation.files_to_modify.map(file => `- \`${file.path}\` - ${file.description}`).join('\n')}

#### 🧪 Tests Added
- Unit tests: ${generatedCode.tests.unit_tests.length}
- Integration tests: ${generatedCode.tests.integration_tests.length}

### 🤔 Claude's Reasoning
${generatedCode.reasoning}

### ✅ Validation Steps
${generatedCode.validation_steps.map(step => `- [ ] ${step}`).join('\n')}

### ⚠️ Risk Assessment
**Level:** ${generatedCode.riskAssessment.level}

**Concerns:**
${generatedCode.riskAssessment.concerns.map(concern => `- ${concern}`).join('\n')}

**Mitigations:**
${generatedCode.riskAssessment.mitigations.map(mitigation => `- ${mitigation}`).join('\n')}

### 📚 Documentation
${generatedCode.documentation.new_docs.map(doc => `- \`${doc.file_path}\` (${doc.type})`).join('\n')}

---
*This PR was generated by Claude AI based on repository analysis and context-aware code generation.*`
  }

  /**
   * Generate comprehensive PR description for bug fixes
   */
  private generateBugFixPRDescription(bugFix: BugFix): string {
    const { analysis, selectedFix } = bugFix
    
    return `## 🐛 Claude AI Bug Fix

**Bug:** ${analysis.bugReport.description}

**Severity:** ${analysis.bugReport.severity} | **Category:** ${analysis.bugReport.category}

### 🔍 Root Cause Analysis
**Root Cause:** ${analysis.analysis.rootCause}
**Confidence:** ${analysis.analysis.confidence}

**Affected Components:**
${analysis.analysis.affectedComponents.map(comp => `- ${comp}`).join('\n')}

### 🛠️ Fix Applied
**Approach:** ${selectedFix.approach}
**Priority:** ${selectedFix.priority} | **Complexity:** ${selectedFix.complexity} | **Risk:** ${selectedFix.riskLevel}

**Description:** ${selectedFix.description}

#### 🔧 Changes Made
${selectedFix.files.map(file => `- \`${file.path}\`: ${file.reasoning}`).join('\n')}

### 🧪 Validation
#### Tests Added
${selectedFix.testCases.map(test => `- **${test.type.toUpperCase()}**: ${test.description}`).join('\n')}

#### Manual Testing Required
${bugFix.validation.manual_tests.map(test => `- [ ] ${test}`).join('\n')}

### 🚀 Deployment
${bugFix.deployment.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Rollback Plan:** ${bugFix.deployment.rollback_plan}

### 📊 Impact Assessment
- **User Impact:** ${analysis.impactAssessment.userImpact}
- **Business Impact:** ${analysis.impactAssessment.businessImpact}
- **Technical Complexity:** ${analysis.impactAssessment.technicalComplexity}

### 🔮 Prevention Recommendations
${analysis.preventionRecommendations.map(rec => `- ${rec}`).join('\n')}

### 📈 Monitoring
${analysis.monitoringRecommendations.map(rec => `- ${rec}`).join('\n')}

**Estimated Effort:** ${analysis.estimatedEffort}

---
*This bug fix was analyzed and generated by Claude AI with comprehensive root cause analysis and validation.*`
  }

  /**
   * Generate PR description for documentation
   */
  private generateDocumentationPRDescription(
    repositoryAnalysis: RepositoryAnalysis,
    docs: Array<{ path: string; content: string; type: string }>
  ): string {
    return `## 📚 Claude AI Documentation Update

**Repository Analysis Summary:**
${repositoryAnalysis.summary}

**Framework:** ${repositoryAnalysis.framework} | **Language:** ${repositoryAnalysis.primaryLanguage}

### 📝 Documentation Added
${docs.map(doc => `- \`${doc.path}\` (${doc.type})`).join('\n')}

### 🔍 Repository Insights
**Architecture:** ${repositoryAnalysis.patterns.architecture.join(', ')}
**Patterns:** ${repositoryAnalysis.patterns.patterns.join(', ')}
**Technologies:** ${repositoryAnalysis.patterns.technologies.join(', ')}

**File Analysis:**
- Total files: ${repositoryAnalysis.fileCount}
- Code files: ${repositoryAnalysis.codeFiles.length}
- Test files: ${repositoryAnalysis.testFiles.length}
- Config files: ${repositoryAnalysis.configFiles.length}

### 💡 Recommendations
${repositoryAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This documentation was generated by Claude AI based on comprehensive repository analysis.*`
  }

  // Utility methods
  private parseRepoUrl(repoUrl: string): { owner: string; name: string } {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub repository URL')
    }
    return { owner: match[1], name: match[2].replace('.git', '') }
  }

  private sanitizeBranchName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30)
  }

  private async githubApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseApiUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${error}`)
    }

    return response.json()
  }
} 