import { Webhooks } from '@octokit/webhooks'
import { App } from '@octokit/app'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

interface GitHubClaudeConfig {
  githubAppId: string
  githubPrivateKey: string
  githubWebhookSecret: string
  claudeApiKey: string
}

export class GitHubClaudeApp {
  private app: App
  private webhooks: Webhooks
  private claude: any

  constructor(config: GitHubClaudeConfig) {
    this.app = new App({
      appId: config.githubAppId,
      privateKey: config.githubPrivateKey,
    })

    this.webhooks = new Webhooks({
      secret: config.githubWebhookSecret,
    })

    this.claude = createAnthropic({
      apiKey: config.claudeApiKey,
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Handle issue comments with /claude command
    this.webhooks.on('issue_comment.created', async ({ payload }) => {
      const comment = payload.comment.body
      
      if (comment.startsWith('/claude ')) {
        const task = comment.replace('/claude ', '').trim()
        await this.handleClaudeTask(payload, task)
      }
    })

    // Handle PR reviews
    this.webhooks.on('pull_request.opened', async ({ payload }) => {
      await this.handlePRReview(payload)
    })
  }

  private async handleClaudeTask(payload: any, task: string) {
    const { repository, issue, installation } = payload
    
    try {
      // Get GitHub API instance for this installation
      const octokit = await this.app.getInstallationOctokit(installation.id)
      
      // Get repository context (limited to avoid token issues)
      const repoContext = await this.getRepositoryContext(octokit, repository, 5) // Max 5 files
      
      // Call Claude with chunked approach
      const response = await this.callClaudeChunked(task, repoContext)
      
      // Post response as comment
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: `## 🤖 Claude AI Assistant\n\n${response}\n\n---\n*Processed by Claude Cloud Service*`
      })

      // If response includes code changes, create a branch and PR
      if (this.shouldCreatePR(response)) {
        await this.createClaudePR(octokit, repository, issue, response)
      }

    } catch (error) {
      console.error('Claude task failed:', error)
      
      // Post error comment
      const octokit = await this.app.getInstallationOctokit(installation.id)
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: `## ❌ Claude Task Failed\n\nError: ${error.message}\n\nPlease try a simpler request or contact support.`
      })
    }
  }

  private async callClaudeChunked(task: string, repoContext: string): Promise<string> {
    // Limit context to prevent token issues
    const maxContextLength = 20000 // Conservative limit
    const context = repoContext.length > maxContextLength 
      ? repoContext.substring(0, maxContextLength) + '\n... (truncated for token limits)'
      : repoContext

    const prompt = `You are a helpful GitHub code assistant. 

Task: ${task}

Repository Context:
${context}

Please provide:
1. A clear analysis of the request
2. Step-by-step implementation plan
3. Any code snippets (keep concise)
4. Testing recommendations

Keep your response under 4000 tokens to ensure reliability.`

    const result = await generateText({
      model: this.claude('claude-3-5-sonnet-20241022'),
      prompt,
      maxTokens: 4000, // Well within Claude's limits
      temperature: 0.1,
    })

    return result.text
  }

  private async getRepositoryContext(octokit: any, repository: any, maxFiles: number = 5): Promise<string> {
    try {
      // Get repository structure
      const { data: contents } = await octokit.rest.repos.getContent({
        owner: repository.owner.login,
        repo: repository.name,
        path: '',
      })

      let context = `Repository: ${repository.full_name}\n\n`
      
      // Get key files (package.json, README, etc.)
      const keyFiles = ['package.json', 'README.md', 'tsconfig.json', '.env.example']
      let fileCount = 0
      
      for (const item of contents) {
        if (fileCount >= maxFiles) break
        
        if (item.type === 'file' && keyFiles.includes(item.name)) {
          try {
            const { data: fileContent } = await octokit.rest.repos.getContent({
              owner: repository.owner.login,
              repo: repository.name,
              path: item.path,
            })
            
            if (fileContent.content) {
              const content = Buffer.from(fileContent.content, 'base64').toString()
              context += `\n--- ${item.name} ---\n${content.substring(0, 2000)}\n`
              fileCount++
            }
          } catch (error) {
            console.log(`Could not read ${item.name}:`, error.message)
          }
        }
      }
      
      return context
    } catch (error) {
      console.error('Error getting repository context:', error)
      return `Repository: ${repository.full_name}\n(Context unavailable)`
    }
  }

  private shouldCreatePR(response: string): boolean {
    // Check if response contains code changes
    const codeIndicators = ['```', 'create file', 'modify file', 'add to', 'update']
    return codeIndicators.some(indicator => 
      response.toLowerCase().includes(indicator)
    )
  }

  private async createClaudePR(octokit: any, repository: any, issue: any, response: string) {
    try {
      // Create a new branch
      const branchName = `claude-task-${issue.number}-${Date.now()}`
      
      // Get default branch SHA
      const { data: defaultBranch } = await octokit.rest.repos.getBranch({
        owner: repository.owner.login,
        repo: repository.name,
        branch: repository.default_branch,
      })
      
      // Create new branch
      await octokit.rest.git.createRef({
        owner: repository.owner.login,
        repo: repository.name,
        ref: `refs/heads/${branchName}`,
        sha: defaultBranch.commit.sha,
      })

      // TODO: Parse response and create actual file changes
      // For now, just create a placeholder file
      const timestamp = new Date().toISOString()
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: repository.owner.login,
        repo: repository.name,
        path: `claude-tasks/task-${issue.number}.md`,
        message: `Claude AI task: ${issue.title}`,
        content: Buffer.from(`# Claude AI Task\n\n**Issue**: #${issue.number}\n**Created**: ${timestamp}\n\n## Response\n\n${response}`).toString('base64'),
        branch: branchName,
      })

      // Create pull request
      const { data: pr } = await octokit.rest.pulls.create({
        owner: repository.owner.login,
        repo: repository.name,
        title: `Claude AI: ${issue.title}`,
        head: branchName,
        base: repository.default_branch,
        body: `## 🤖 Claude AI Generated Changes\n\nThis PR was automatically created by Claude AI in response to issue #${issue.number}.\n\n## Changes Made\n\n${response}\n\n---\n*Generated by Claude Cloud Service*\n\nPlease review carefully before merging.`,
      })

      // Comment on original issue with PR link
      await octokit.rest.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: `## ✅ Pull Request Created\n\nClaude has analyzed your request and created PR #${pr.number}: ${pr.html_url}\n\nPlease review the changes and merge when ready.`
      })

    } catch (error) {
      console.error('Error creating PR:', error)
      throw new Error(`Failed to create PR: ${error.message}`)
    }
  }

  // Start the webhook server
  async start(port: number = 3000) {
    const express = require('express')
    const app = express()
    
    app.use('/webhooks/github', this.webhooks.middleware)
    
    app.listen(port, () => {
      console.log(`🤖 GitHub Claude App listening on port ${port}`)
      console.log(`🔗 Webhook URL: http://localhost:${port}/webhooks/github`)
    })
  }
}

// Usage example
export function createGitHubClaudeApp() {
  const app = new GitHubClaudeApp({
    githubAppId: process.env.GITHUB_APP_ID!,
    githubPrivateKey: process.env.GITHUB_PRIVATE_KEY!,
    githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
    claudeApiKey: process.env.ANTHROPIC_API_KEY!,
  })
  
  return app
} 