// GitDigest Repository Analyzer Service
// Analyzes GitHub repositories to extract comprehensive data for digest generation

import { Octokit } from '@octokit/rest'
import { createClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'

// ============================================================================
// INTERFACES
// ============================================================================

export interface RepoBasicInfo {
  name: string
  full_name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  watchers: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  default_branch: string
  topics: string[]
  license: string | null
  is_private: boolean
  is_fork: boolean
  is_archived: boolean
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_pages: boolean
  has_downloads: boolean
}

export interface CommitAnalysis {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
  stats: {
    additions: number
    deletions: number
    total: number
  }
  files_changed: number
  url: string
}

export interface PRAnalysis {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'merged'
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  author: {
    login: string
    avatar_url: string
  }
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
    description: string | null
  }>
  milestone: {
    title: string
    description: string | null
    due_on: string | null
  } | null
  comments: number
  review_comments: number
  commits: number
  additions: number
  deletions: number
  changed_files: number
}

export interface IssueAnalysis {
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  closed_at: string | null
  author: {
    login: string
    avatar_url: string
  }
  assignees: Array<{
    login: string
    avatar_url: string
  }>
  labels: Array<{
    name: string
    color: string
    description: string | null
  }>
  milestone: {
    title: string
    description: string | null
    due_on: string | null
  } | null
  comments: number
}

export interface CodeStructureAnalysis {
  languages: Record<string, number>
  total_lines: number
  file_count: number
  directory_structure: DirectoryNode[]
  key_files: KeyFile[]
  has_readme: boolean
  has_license: boolean
  has_contributing: boolean
  has_changelog: boolean
  has_tests: boolean
  has_ci_cd: boolean
  has_docker: boolean
  has_package_json: boolean
  has_requirements: boolean
  has_gemfile: boolean
  has_makefile: boolean
}

export interface DirectoryNode {
  name: string
  type: 'file' | 'dir'
  size?: number
  path: string
  children?: DirectoryNode[]
}

export interface KeyFile {
  name: string
  path: string
  size: number
  type: string
  is_important: boolean
  description: string
}

export interface DocumentationAnalysis {
  has_readme: boolean
  readme_quality_score: number
  has_docs_folder: boolean
  has_wiki: boolean
  has_api_docs: boolean
  has_changelog: boolean
  has_contributing_guide: boolean
  has_code_of_conduct: boolean
  has_security_policy: boolean
  documentation_coverage: number
  inline_comments_ratio: number
}

export interface ContributorAnalysis {
  total_contributors: number
  active_contributors_30d: number
  top_contributors: Array<{
    login: string
    avatar_url: string
    contributions: number
    commits: number
    additions: number
    deletions: number
  }>
  contributor_activity: Array<{
    week: string
    commits: number
    contributors: number
  }>
}

export interface SecurityAnalysis {
  has_security_policy: boolean
  has_dependabot: boolean
  has_code_scanning: boolean
  has_secret_scanning: boolean
  vulnerability_alerts: number
  security_advisories: number
  branch_protection: boolean
  required_reviews: boolean
  signed_commits: boolean
}

export interface ComprehensiveRepoAnalysis {
  basic: RepoBasicInfo
  commits: CommitAnalysis[]
  pullRequests: PRAnalysis[]
  issues: IssueAnalysis[]
  codeStructure: CodeStructureAnalysis
  documentation: DocumentationAnalysis
  contributors: ContributorAnalysis
  security: SecurityAnalysis
  activity: {
    commit_frequency: Array<{
      date: string
      count: number
    }>
    pr_frequency: Array<{
      date: string
      count: number
    }>
    issue_frequency: Array<{
      date: string
      count: number
    }>
  }
  health: {
    overall_score: number
    activity_score: number
    community_score: number
    documentation_score: number
    security_score: number
    maintenance_score: number
  }
}

// ============================================================================
// REPOSITORY ANALYZER CLASS
// ============================================================================

export class GitDigestRepoAnalyzer {
  private octokit: Octokit
  private supabase = createClient()

  constructor(githubToken: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    })
  }

  // ============================================================================
  // MAIN ANALYSIS METHOD
  // ============================================================================

  async analyzeRepository(
    owner: string,
    repo: string,
    options: {
      includeCommits?: boolean
      includePRs?: boolean
      includeIssues?: boolean
      includeCodeStructure?: boolean
      includeSecurity?: boolean
      daysBack?: number
    } = {}
  ): Promise<ComprehensiveRepoAnalysis> {
    const {
      includeCommits = true,
      includePRs = true,
      includeIssues = true,
      includeCodeStructure = true,
      includeSecurity = true,
      daysBack = 30
    } = options

    console.log(`🔍 Analyzing repository: ${owner}/${repo}`)

    // Get basic repository information
    const basic = await this.getBasicInfo(owner, repo)
    
    // Run analysis in parallel for better performance
    const [
      commits,
      pullRequests,
      issues,
      codeStructure,
      documentation,
      contributors,
      security,
      activity
    ] = await Promise.all([
      includeCommits ? this.getCommitAnalysis(owner, repo, daysBack) : [],
      includePRs ? this.getPRAnalysis(owner, repo, daysBack) : [],
      includeIssues ? this.getIssueAnalysis(owner, repo, daysBack) : [],
      includeCodeStructure ? this.getCodeStructureAnalysis(owner, repo) : this.getEmptyCodeStructure(),
      this.getDocumentationAnalysis(owner, repo),
      this.getContributorAnalysis(owner, repo, daysBack),
      includeSecurity ? this.getSecurityAnalysis(owner, repo) : this.getEmptySecurityAnalysis(),
      this.getActivityAnalysis(owner, repo, daysBack)
    ])

    // Calculate health scores
    const health = this.calculateHealthScores({
      basic,
      commits,
      pullRequests,
      issues,
      codeStructure,
      documentation,
      contributors,
      security,
      activity
    })

    return {
      basic,
      commits,
      pullRequests,
      issues,
      codeStructure,
      documentation,
      contributors,
      security,
      activity,
      health
    }
  }

  // ============================================================================
  // BASIC REPOSITORY INFORMATION
  // ============================================================================

  private async getBasicInfo(owner: string, repo: string): Promise<RepoBasicInfo> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      })

      return {
        name: data.name,
        full_name: data.full_name,
        owner: data.owner.login,
        description: data.description,
        language: data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        size: data.size,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        default_branch: data.default_branch,
        topics: data.topics || [],
        license: data.license?.name || null,
        is_private: data.private,
        is_fork: data.fork,
        is_archived: data.archived,
        has_issues: data.has_issues,
        has_projects: data.has_projects,
        has_wiki: data.has_wiki,
        has_pages: data.has_pages,
        has_downloads: data.has_downloads,
      }
    } catch (error) {
      console.error('Error fetching basic repo info:', error)
      throw new Error(`Failed to fetch repository information: ${error}`)
    }
  }

  // ============================================================================
  // COMMIT ANALYSIS
  // ============================================================================

  private async getCommitAnalysis(owner: string, repo: string, daysBack: number): Promise<CommitAnalysis[]> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        per_page: 100,
      })

      const commitAnalysis: CommitAnalysis[] = []

      // Get detailed stats for each commit (limited to avoid rate limits)
      for (const commit of commits.slice(0, 50)) {
        try {
          const { data: commitDetail } = await this.octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          })

          commitAnalysis.push({
            sha: commit.sha,
            message: commit.commit.message,
            author: {
              name: commit.commit.author?.name || 'Unknown',
              email: commit.commit.author?.email || 'unknown@example.com',
              date: commit.commit.author?.date || new Date().toISOString(),
            },
            committer: {
              name: commit.commit.committer?.name || 'Unknown',
              email: commit.commit.committer?.email || 'unknown@example.com',
              date: commit.commit.committer?.date || new Date().toISOString(),
            },
            stats: {
              additions: commitDetail.stats?.additions || 0,
              deletions: commitDetail.stats?.deletions || 0,
              total: commitDetail.stats?.total || 0,
            },
            files_changed: commitDetail.files?.length || 0,
            url: commit.html_url,
          })
        } catch (error) {
          console.warn(`Failed to get details for commit ${commit.sha}:`, error)
        }
      }

      return commitAnalysis
    } catch (error) {
      console.error('Error fetching commit analysis:', error)
      return []
    }
  }

  // ============================================================================
  // PULL REQUEST ANALYSIS
  // ============================================================================

  private async getPRAnalysis(owner: string, repo: string, daysBack: number): Promise<PRAnalysis[]> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const { data: prs } = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 50,
      })

      const prAnalysis: PRAnalysis[] = []

      for (const pr of prs) {
        // Filter by date
        if (new Date(pr.updated_at) < since) continue

        prAnalysis.push({
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.merged_at ? 'merged' : pr.state as 'open' | 'closed',
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          closed_at: pr.closed_at,
          merged_at: pr.merged_at,
          author: {
            login: pr.user?.login || 'Unknown',
            avatar_url: pr.user?.avatar_url || '',
          },
          assignees: pr.assignees?.map(assignee => ({
            login: assignee.login,
            avatar_url: assignee.avatar_url,
          })) || [],
          labels: pr.labels.map(label => ({
            name: label.name,
            color: label.color,
            description: label.description,
          })),
          milestone: pr.milestone ? {
            title: pr.milestone.title,
            description: pr.milestone.description,
            due_on: pr.milestone.due_on,
          } : null,
          comments: pr.comments,
          review_comments: pr.review_comments,
          commits: pr.commits,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          changed_files: pr.changed_files || 0,
        })
      }

      return prAnalysis
    } catch (error) {
      console.error('Error fetching PR analysis:', error)
      return []
    }
  }

  // ============================================================================
  // ISSUE ANALYSIS
  // ============================================================================

  private async getIssueAnalysis(owner: string, repo: string, daysBack: number): Promise<IssueAnalysis[]> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 50,
        since: since.toISOString(),
      })

      return issues
        .filter(issue => !issue.pull_request) // Exclude PRs
        .map(issue => ({
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state as 'open' | 'closed',
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          closed_at: issue.closed_at,
          author: {
            login: issue.user?.login || 'Unknown',
            avatar_url: issue.user?.avatar_url || '',
          },
          assignees: issue.assignees?.map(assignee => ({
            login: assignee.login,
            avatar_url: assignee.avatar_url,
          })) || [],
          labels: issue.labels.map(label => ({
            name: typeof label === 'string' ? label : label.name,
            color: typeof label === 'string' ? '' : label.color,
            description: typeof label === 'string' ? null : label.description,
          })),
          milestone: issue.milestone ? {
            title: issue.milestone.title,
            description: issue.milestone.description,
            due_on: issue.milestone.due_on,
          } : null,
          comments: issue.comments,
        }))
    } catch (error) {
      console.error('Error fetching issue analysis:', error)
      return []
    }
  }

  // ============================================================================
  // CODE STRUCTURE ANALYSIS
  // ============================================================================

  private async getCodeStructureAnalysis(owner: string, repo: string): Promise<CodeStructureAnalysis> {
    try {
      // Get languages
      const { data: languages } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo,
      })

      // Get repository contents
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      })

      const directoryStructure = await this.buildDirectoryStructure(owner, repo, contents)
      const keyFiles = this.identifyKeyFiles(directoryStructure)
      
      // Calculate totals
      const totalLines = Object.values(languages).reduce((sum, lines) => sum + lines, 0)
      const fileCount = this.countFiles(directoryStructure)

      // Check for important files
      const hasReadme = this.hasFile(directoryStructure, ['README.md', 'README.txt', 'README.rst', 'README'])
      const hasLicense = this.hasFile(directoryStructure, ['LICENSE', 'LICENSE.md', 'LICENSE.txt'])
      const hasContributing = this.hasFile(directoryStructure, ['CONTRIBUTING.md', 'CONTRIBUTING.txt'])
      const hasChangelog = this.hasFile(directoryStructure, ['CHANGELOG.md', 'CHANGELOG.txt', 'HISTORY.md'])
      const hasTests = this.hasTestFiles(directoryStructure)
      const hasCiCd = this.hasCiCdFiles(directoryStructure)
      const hasDocker = this.hasFile(directoryStructure, ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'])
      const hasPackageJson = this.hasFile(directoryStructure, ['package.json'])
      const hasRequirements = this.hasFile(directoryStructure, ['requirements.txt', 'requirements.in', 'pyproject.toml'])
      const hasGemfile = this.hasFile(directoryStructure, ['Gemfile'])
      const hasMakefile = this.hasFile(directoryStructure, ['Makefile', 'makefile'])

      return {
        languages,
        total_lines: totalLines,
        file_count: fileCount,
        directory_structure: directoryStructure,
        key_files: keyFiles,
        has_readme: hasReadme,
        has_license: hasLicense,
        has_contributing: hasContributing,
        has_changelog: hasChangelog,
        has_tests: hasTests,
        has_ci_cd: hasCiCd,
        has_docker: hasDocker,
        has_package_json: hasPackageJson,
        has_requirements: hasRequirements,
        has_gemfile: hasGemfile,
        has_makefile: hasMakefile,
      }
    } catch (error) {
      console.error('Error analyzing code structure:', error)
      return this.getEmptyCodeStructure()
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async buildDirectoryStructure(
    owner: string,
    repo: string,
    contents: any[],
    path = ''
  ): Promise<DirectoryNode[]> {
    const nodes: DirectoryNode[] = []

    for (const item of contents.slice(0, 50)) { // Limit to avoid rate limits
      const node: DirectoryNode = {
        name: item.name,
        type: item.type,
        path: item.path,
        size: item.size,
      }

      if (item.type === 'dir') {
        try {
          const { data: subContents } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
          })
          node.children = await this.buildDirectoryStructure(owner, repo, Array.isArray(subContents) ? subContents : [subContents], item.path)
        } catch (error) {
          console.warn(`Failed to get contents for directory ${item.path}:`, error)
          node.children = []
        }
      }

      nodes.push(node)
    }

    return nodes
  }

  private identifyKeyFiles(structure: DirectoryNode[]): KeyFile[] {
    const keyFiles: KeyFile[] = []
    
    const importantFiles = [
      'README.md', 'README.txt', 'README.rst', 'README',
      'LICENSE', 'LICENSE.md', 'LICENSE.txt',
      'CONTRIBUTING.md', 'CONTRIBUTING.txt',
      'CHANGELOG.md', 'CHANGELOG.txt', 'HISTORY.md',
      'package.json', 'requirements.txt', 'Gemfile', 'Cargo.toml',
      'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
      'Makefile', 'makefile',
      '.gitignore', '.env.example', '.env.template'
    ]

    const findKeyFiles = (nodes: DirectoryNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file' && importantFiles.includes(node.name)) {
          keyFiles.push({
            name: node.name,
            path: node.path,
            size: node.size || 0,
            type: this.getFileType(node.name),
            is_important: true,
            description: this.getFileDescription(node.name)
          })
        }
        
        if (node.children) {
          findKeyFiles(node.children)
        }
      }
    }

    findKeyFiles(structure)
    return keyFiles
  }

  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const typeMap: Record<string, string> = {
      'md': 'markdown',
      'txt': 'text',
      'rst': 'restructuredtext',
      'json': 'json',
      'yml': 'yaml',
      'yaml': 'yaml',
      'toml': 'toml',
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
    }
    return typeMap[ext || ''] || 'unknown'
  }

  private getFileDescription(filename: string): string {
    const descriptions: Record<string, string> = {
      'README.md': 'Project documentation and overview',
      'README.txt': 'Project documentation and overview',
      'README.rst': 'Project documentation and overview',
      'README': 'Project documentation and overview',
      'LICENSE': 'Software license terms',
      'LICENSE.md': 'Software license terms',
      'LICENSE.txt': 'Software license terms',
      'CONTRIBUTING.md': 'Contribution guidelines',
      'CONTRIBUTING.txt': 'Contribution guidelines',
      'CHANGELOG.md': 'Project change history',
      'CHANGELOG.txt': 'Project change history',
      'HISTORY.md': 'Project change history',
      'package.json': 'Node.js package configuration',
      'requirements.txt': 'Python dependencies',
      'Gemfile': 'Ruby gem dependencies',
      'Cargo.toml': 'Rust package configuration',
      'Dockerfile': 'Docker container configuration',
      'docker-compose.yml': 'Docker compose configuration',
      'docker-compose.yaml': 'Docker compose configuration',
      'Makefile': 'Build automation script',
      'makefile': 'Build automation script',
      '.gitignore': 'Git ignore patterns',
      '.env.example': 'Environment variables template',
      '.env.template': 'Environment variables template'
    }
    return descriptions[filename] || 'Configuration file'
  }

  private hasFile(structure: DirectoryNode[], filenames: string[]): boolean {
    const findFile = (nodes: DirectoryNode[]): boolean => {
      for (const node of nodes) {
        if (node.type === 'file' && filenames.includes(node.name)) {
          return true
        }
        if (node.children && findFile(node.children)) {
          return true
        }
      }
      return false
    }
    return findFile(structure)
  }

  private hasTestFiles(structure: DirectoryNode[]): boolean {
    const testPatterns = ['test', 'tests', 'spec', 'specs', '__tests__']
    const testFileExtensions = ['.test.', '.spec.', '_test.', '_spec.']
    
    const findTests = (nodes: DirectoryNode[]): boolean => {
      for (const node of nodes) {
        if (node.type === 'dir' && testPatterns.some(pattern => node.name.toLowerCase().includes(pattern))) {
          return true
        }
        if (node.type === 'file' && testFileExtensions.some(ext => node.name.toLowerCase().includes(ext))) {
          return true
        }
        if (node.children && findTests(node.children)) {
          return true
        }
      }
      return false
    }
    return findTests(structure)
  }

  private hasCiCdFiles(structure: DirectoryNode[]): boolean {
    const cicdPatterns = ['.github/workflows', '.gitlab-ci.yml', '.travis.yml', 'circle.yml', 'appveyor.yml', 'azure-pipelines.yml']
    
    const findCiCd = (nodes: DirectoryNode[], currentPath = ''): boolean => {
      for (const node of nodes) {
        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name
        
        if (cicdPatterns.some(pattern => fullPath.includes(pattern))) {
          return true
        }
        
        if (node.children && findCiCd(node.children, fullPath)) {
          return true
        }
      }
      return false
    }
    return findCiCd(structure)
  }

  private countFiles(structure: DirectoryNode[]): number {
    let count = 0
    const countRecursive = (nodes: DirectoryNode[]) => {
      for (const node of nodes) {
        if (node.type === 'file') {
          count++
        }
        if (node.children) {
          countRecursive(node.children)
        }
      }
    }
    countRecursive(structure)
    return count
  }

  // ============================================================================
  // DOCUMENTATION ANALYSIS
  // ============================================================================

  private async getDocumentationAnalysis(owner: string, repo: string): Promise<DocumentationAnalysis> {
    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      })

      const structure = await this.buildDirectoryStructure(owner, repo, contents)
      
      const hasReadme = this.hasFile(structure, ['README.md', 'README.txt', 'README.rst', 'README'])
      const hasDocsFolder = this.hasFile(structure, ['docs', 'documentation', 'doc'])
      const hasChangelog = this.hasFile(structure, ['CHANGELOG.md', 'CHANGELOG.txt', 'HISTORY.md'])
      const hasContributing = this.hasFile(structure, ['CONTRIBUTING.md', 'CONTRIBUTING.txt'])
      const hasCodeOfConduct = this.hasFile(structure, ['CODE_OF_CONDUCT.md', 'CODE_OF_CONDUCT.txt'])
      const hasSecurityPolicy = this.hasFile(structure, ['SECURITY.md', 'SECURITY.txt'])

      // Get README quality score
      let readmeQualityScore = 0
      if (hasReadme) {
        readmeQualityScore = await this.calculateReadmeQuality(owner, repo)
      }

      // Check for wiki
      let hasWiki = false
      try {
        const { data: repo_info } = await this.octokit.rest.repos.get({ owner, repo })
        hasWiki = repo_info.has_wiki
      } catch (error) {
        console.warn('Could not check wiki status:', error)
      }

      return {
        has_readme: hasReadme,
        readme_quality_score: readmeQualityScore,
        has_docs_folder: hasDocsFolder,
        has_wiki: hasWiki,
        has_api_docs: this.hasFile(structure, ['api.md', 'API.md', 'api']) || hasDocsFolder,
        has_changelog: hasChangelog,
        has_contributing_guide: hasContributing,
        has_code_of_conduct: hasCodeOfConduct,
        has_security_policy: hasSecurityPolicy,
        documentation_coverage: this.calculateDocumentationCoverage({
          hasReadme,
          hasDocsFolder,
          hasWiki,
          hasChangelog,
          hasContributing,
          hasCodeOfConduct,
          hasSecurityPolicy
        }),
        inline_comments_ratio: 0, // Would need to analyze code files
      }
    } catch (error) {
      console.error('Error analyzing documentation:', error)
      return {
        has_readme: false,
        readme_quality_score: 0,
        has_docs_folder: false,
        has_wiki: false,
        has_api_docs: false,
        has_changelog: false,
        has_contributing_guide: false,
        has_code_of_conduct: false,
        has_security_policy: false,
        documentation_coverage: 0,
        inline_comments_ratio: 0,
      }
    }
  }

  private async calculateReadmeQuality(owner: string, repo: string): Promise<number> {
    try {
      const readmeFiles = ['README.md', 'README.txt', 'README.rst', 'README']
      let readmeContent = ''

      for (const filename of readmeFiles) {
        try {
          const { data } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: filename,
          })

          if ('content' in data) {
            readmeContent = Buffer.from(data.content, 'base64').toString('utf-8')
            break
          }
        } catch (error) {
          // File doesn't exist, try next
          continue
        }
      }

      if (!readmeContent) return 0

      let score = 0
      const content = readmeContent.toLowerCase()

      // Check for essential sections
      if (content.includes('description') || content.includes('about')) score += 20
      if (content.includes('installation') || content.includes('install')) score += 20
      if (content.includes('usage') || content.includes('example')) score += 20
      if (content.includes('contributing') || content.includes('contribute')) score += 15
      if (content.includes('license')) score += 10
      if (content.includes('contact') || content.includes('support')) score += 10
      if (content.includes('badge') || content.includes('shield')) score += 5

      return Math.min(score, 100)
    } catch (error) {
      console.error('Error calculating README quality:', error)
      return 0
    }
  }

  private calculateDocumentationCoverage(docs: {
    hasReadme: boolean
    hasDocsFolder: boolean
    hasWiki: boolean
    hasChangelog: boolean
    hasContributing: boolean
    hasCodeOfConduct: boolean
    hasSecurityPolicy: boolean
  }): number {
    const total = 7
    let score = 0

    if (docs.hasReadme) score += 1
    if (docs.hasDocsFolder) score += 1
    if (docs.hasWiki) score += 1
    if (docs.hasChangelog) score += 1
    if (docs.hasContributing) score += 1
    if (docs.hasCodeOfConduct) score += 1
    if (docs.hasSecurityPolicy) score += 1

    return Math.round((score / total) * 100)
  }

  // ============================================================================
  // CONTRIBUTOR ANALYSIS
  // ============================================================================

  private async getContributorAnalysis(owner: string, repo: string, daysBack: number): Promise<ContributorAnalysis> {
    try {
      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 100,
      })

      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      // Get recent commits to find active contributors
      const { data: recentCommits } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        per_page: 100,
      })

      const activeContributors = new Set(
        recentCommits.map(commit => commit.author?.login).filter(Boolean)
      )

      const topContributors = contributors.slice(0, 10).map(contributor => ({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        contributions: contributor.contributions,
        commits: recentCommits.filter(commit => commit.author?.login === contributor.login).length,
        additions: 0, // Would need detailed commit analysis
        deletions: 0, // Would need detailed commit analysis
      }))

      return {
        total_contributors: contributors.length,
        active_contributors_30d: activeContributors.size,
        top_contributors: topContributors,
        contributor_activity: [], // Would need more detailed analysis
      }
    } catch (error) {
      console.error('Error analyzing contributors:', error)
      return {
        total_contributors: 0,
        active_contributors_30d: 0,
        top_contributors: [],
        contributor_activity: [],
      }
    }
  }

  // ============================================================================
  // SECURITY ANALYSIS
  // ============================================================================

  private async getSecurityAnalysis(owner: string, repo: string): Promise<SecurityAnalysis> {
    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      })

      const structure = await this.buildDirectoryStructure(owner, repo, contents)
      
      const hasSecurityPolicy = this.hasFile(structure, ['SECURITY.md', 'SECURITY.txt'])
      const hasDependabot = this.hasFile(structure, ['.github/dependabot.yml', '.github/dependabot.yaml'])
      
      // Check for GitHub security features (requires different API calls)
      let branchProtection = false
      let requiredReviews = false
      
      try {
        const { data: branch } = await this.octokit.rest.repos.getBranch({
          owner,
          repo,
          branch: 'main', // or 'master'
        })
        branchProtection = branch.protection?.enabled || false
        requiredReviews = branch.protection?.required_pull_request_reviews?.required_approving_review_count > 0
      } catch (error) {
        // Branch protection info not available
      }

      return {
        has_security_policy: hasSecurityPolicy,
        has_dependabot: hasDependabot,
        has_code_scanning: false, // Would need security API access
        has_secret_scanning: false, // Would need security API access
        vulnerability_alerts: 0, // Would need security API access
        security_advisories: 0, // Would need security API access
        branch_protection: branchProtection,
        required_reviews: requiredReviews,
        signed_commits: false, // Would need to check commit signatures
      }
    } catch (error) {
      console.error('Error analyzing security:', error)
      return this.getEmptySecurityAnalysis()
    }
  }

  // ============================================================================
  // ACTIVITY ANALYSIS
  // ============================================================================

  private async getActivityAnalysis(owner: string, repo: string, daysBack: number) {
    try {
      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const [commits, prs, issues] = await Promise.all([
        this.octokit.rest.repos.listCommits({
          owner,
          repo,
          since: since.toISOString(),
          per_page: 100,
        }),
        this.octokit.rest.pulls.list({
          owner,
          repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        }),
        this.octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
          since: since.toISOString(),
        }),
      ])

      // Group by date
      const commitFrequency = this.groupByDate(commits.data.map(c => c.commit.author?.date || ''))
      const prFrequency = this.groupByDate(prs.data.filter(pr => new Date(pr.updated_at) >= since).map(pr => pr.updated_at))
      const issueFrequency = this.groupByDate(issues.data.filter(issue => !issue.pull_request).map(issue => issue.updated_at))

      return {
        commit_frequency: commitFrequency,
        pr_frequency: prFrequency,
        issue_frequency: issueFrequency,
      }
    } catch (error) {
      console.error('Error analyzing activity:', error)
      return {
        commit_frequency: [],
        pr_frequency: [],
        issue_frequency: [],
      }
    }
  }

  private groupByDate(dates: string[]): Array<{ date: string; count: number }> {
    const groups: Record<string, number> = {}
    
    dates.forEach(dateStr => {
      const date = new Date(dateStr).toISOString().split('T')[0]
      groups[date] = (groups[date] || 0) + 1
    })

    return Object.entries(groups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // ============================================================================
  // HEALTH SCORE CALCULATION
  // ============================================================================

  private calculateHealthScores(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): ComprehensiveRepoAnalysis['health'] {
    const activityScore = this.calculateActivityScore(analysis)
    const communityScore = this.calculateCommunityScore(analysis)
    const documentationScore = this.calculateDocumentationScore(analysis)
    const securityScore = this.calculateSecurityScore(analysis)
    const maintenanceScore = this.calculateMaintenanceScore(analysis)

    const overallScore = Math.round(
      (activityScore + communityScore + documentationScore + securityScore + maintenanceScore) / 5
    )

    return {
      overall_score: overallScore,
      activity_score: activityScore,
      community_score: communityScore,
      documentation_score: documentationScore,
      security_score: securityScore,
      maintenance_score: maintenanceScore,
    }
  }

  private calculateActivityScore(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): number {
    let score = 0
    
    // Recent commits
    if (analysis.commits.length > 10) score += 30
    else if (analysis.commits.length > 5) score += 20
    else if (analysis.commits.length > 0) score += 10

    // Recent PRs
    if (analysis.pullRequests.length > 5) score += 25
    else if (analysis.pullRequests.length > 2) score += 15
    else if (analysis.pullRequests.length > 0) score += 5

    // Recent issues
    if (analysis.issues.length > 0) score += 15

    // Repository age and activity
    const daysSinceLastPush = Math.floor(
      (Date.now() - new Date(analysis.basic.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceLastPush < 7) score += 20
    else if (daysSinceLastPush < 30) score += 15
    else if (daysSinceLastPush < 90) score += 10

    // Stars and forks indicate activity
    if (analysis.basic.stars > 100) score += 10
    else if (analysis.basic.stars > 10) score += 5

    return Math.min(score, 100)
  }

  private calculateCommunityScore(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): number {
    let score = 0

    // Contributors
    if (analysis.contributors.total_contributors > 10) score += 25
    else if (analysis.contributors.total_contributors > 5) score += 15
    else if (analysis.contributors.total_contributors > 1) score += 10

    // Active contributors
    if (analysis.contributors.active_contributors_30d > 5) score += 25
    else if (analysis.contributors.active_contributors_30d > 2) score += 15
    else if (analysis.contributors.active_contributors_30d > 0) score += 10

    // Community features
    if (analysis.basic.has_issues) score += 10
    if (analysis.documentation.has_contributing_guide) score += 15
    if (analysis.documentation.has_code_of_conduct) score += 10
    if (analysis.basic.stars > 50) score += 15
    if (analysis.basic.forks > 10) score += 10

    return Math.min(score, 100)
  }

  private calculateDocumentationScore(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): number {
    return analysis.documentation.documentation_coverage
  }

  private calculateSecurityScore(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): number {
    let score = 0

    if (analysis.security.has_security_policy) score += 20
    if (analysis.security.has_dependabot) score += 15
    if (analysis.security.branch_protection) score += 20
    if (analysis.security.required_reviews) score += 15
    if (analysis.codeStructure.has_license) score += 10
    if (analysis.security.has_code_scanning) score += 10
    if (analysis.security.has_secret_scanning) score += 10

    return Math.min(score, 100)
  }

  private calculateMaintenanceScore(analysis: Omit<ComprehensiveRepoAnalysis, 'health'>): number {
    let score = 0

    // Recent activity
    const daysSinceLastPush = Math.floor(
      (Date.now() - new Date(analysis.basic.pushed_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceLastPush < 30) score += 30
    else if (daysSinceLastPush < 90) score += 20
    else if (daysSinceLastPush < 180) score += 10

    // CI/CD
    if (analysis.codeStructure.has_ci_cd) score += 20

    // Tests
    if (analysis.codeStructure.has_tests) score += 20

    // Documentation maintenance
    if (analysis.documentation.has_changelog) score += 15
    if (analysis.documentation.has_readme) score += 15

    return Math.min(score, 100)
  }

  // ============================================================================
  // EMPTY OBJECT HELPERS
  // ============================================================================

  private getEmptyCodeStructure(): CodeStructureAnalysis {
    return {
      languages: {},
      total_lines: 0,
      file_count: 0,
      directory_structure: [],
      key_files: [],
      has_readme: false,
      has_license: false,
      has_contributing: false,
      has_changelog: false,
      has_tests: false,
      has_ci_cd: false,
      has_docker: false,
      has_package_json: false,
      has_requirements: false,
      has_gemfile: false,
      has_makefile: false,
    }
  }

  private getEmptySecurityAnalysis(): SecurityAnalysis {
    return {
      has_security_policy: false,
      has_dependabot: false,
      has_code_scanning: false,
      has_secret_scanning: false,
      vulnerability_alerts: 0,
      security_advisories: 0,
      branch_protection: false,
      required_reviews: false,
      signed_commits: false,
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export async function createRepoAnalyzer(): Promise<GitDigestRepoAnalyzer> {
  // Get GitHub token from cookies (server-side)
  const cookieStore = await cookies()
  const githubToken = cookieStore.get('github_token')

  if (!githubToken) {
    throw new Error('GitHub token not found. Please authenticate with GitHub first.')
  }

  return new GitDigestRepoAnalyzer(githubToken.value)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
    /^git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?$/,
    /^([^\/]+)\/([^\/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      }
    }
  }

  return null
}

export function calculateSDLCReadinessScore(analysis: ComprehensiveRepoAnalysis): number {
  const weights = {
    documentation: 0.25,
    testing: 0.20,
    security: 0.20,
    maintenance: 0.15,
    community: 0.10,
    activity: 0.10,
  }

  return Math.round(
    analysis.health.documentation_score * weights.documentation +
    (analysis.codeStructure.has_tests ? 80 : 20) * weights.testing +
    analysis.health.security_score * weights.security +
    analysis.health.maintenance_score * weights.maintenance +
    analysis.health.community_score * weights.community +
    analysis.health.activity_score * weights.activity
  )
} 