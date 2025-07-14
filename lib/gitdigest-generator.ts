// GitDigest Generator Service
// Uses existing AI services and prompt management to generate repository digests

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createServerPromptService } from '@/lib/prompt-service-server'
import { ComprehensiveRepoAnalysis, calculateSDLCReadinessScore } from '@/lib/gitdigest-repo-analyzer'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// INTERFACES
// ============================================================================

export interface DigestResult {
  summary: string
  keyChanges: string[]
  sdlcScore: number
  sdlcBreakdown: {
    documentation: number
    testing: number
    security: number
    maintenance: number
    community: number
    activity: number
  }
  recommendations: string[]
  artifacts: {
    requirementsDoc?: string
    architectureDiagram?: string
    testPlan?: string
    securityAudit?: string
  }
  metadata: {
    generatedAt: string
    analysisVersion: string
    aiModel: string
    promptVersion: string
  }
}

export interface DailyReportResult {
  summary: string
  keyChanges: string[]
  contributors: string[]
  issuesResolved: number
  issuesCreated: number
  prsMerged: number
  prsCreated: number
  commitCount: number
  linesAdded: number
  linesRemoved: number
  recommendations: string[]
  metadata: {
    generatedAt: string
    reportDate: string
    aiModel: string
  }
}

export interface SDLCScoreBreakdown {
  overall: number
  categories: {
    documentation: {
      score: number
      details: string[]
      recommendations: string[]
    }
    testing: {
      score: number
      details: string[]
      recommendations: string[]
    }
    codeQuality: {
      score: number
      details: string[]
      recommendations: string[]
    }
    cicd: {
      score: number
      details: string[]
      recommendations: string[]
    }
    security: {
      score: number
      details: string[]
      recommendations: string[]
    }
    collaboration: {
      score: number
      details: string[]
      recommendations: string[]
    }
  }
}

// ============================================================================
// GITDIGEST GENERATOR CLASS
// ============================================================================

export class GitDigestGenerator {
  private promptService = createServerPromptService()
  private supabase = createClient()

  // ============================================================================
  // MAIN DIGEST GENERATION
  // ============================================================================

  async generateDigest(
    analysis: ComprehensiveRepoAnalysis,
    options: {
      userId?: string
      openaiKey?: string
      includeArtifacts?: boolean
      customPrompt?: string
      aiModel?: string
    } = {}
  ): Promise<DigestResult> {
    const {
      userId = 'anonymous',
      openaiKey,
      includeArtifacts = true,
      customPrompt,
      aiModel = 'gpt-4o'
    } = options

    console.log(`🤖 Generating digest for ${analysis.basic.full_name}`)

    try {
      // Get or create OpenAI client
      const openaiKeyToUse = openaiKey || await this.getOpenAIKey(userId)
      const openaiClient = createOpenAI({ apiKey: openaiKeyToUse })

      // Generate main summary
      const summary = await this.generateSummary(analysis, userId, customPrompt, openaiClient)
      
      // Calculate SDLC score
      const sdlcScore = calculateSDLCReadinessScore(analysis)
      const sdlcBreakdown = this.calculateSDLCBreakdown(analysis)
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(analysis, userId, openaiClient)
      
      // Generate artifacts if requested
      const artifacts = includeArtifacts 
        ? await this.generateArtifacts(analysis, userId, openaiClient)
        : {}

      // Extract key changes from recent activity
      const keyChanges = this.extractKeyChanges(analysis)

      return {
        summary,
        keyChanges,
        sdlcScore,
        sdlcBreakdown,
        recommendations,
        artifacts,
        metadata: {
          generatedAt: new Date().toISOString(),
          analysisVersion: '1.0.0',
          aiModel,
          promptVersion: '1.0.0'
        }
      }
    } catch (error) {
      console.error('Error generating digest:', error)
      throw new Error(`Failed to generate digest: ${error}`)
    }
  }

  // ============================================================================
  // DAILY REPORT GENERATION
  // ============================================================================

  async generateDailyReport(
    analysis: ComprehensiveRepoAnalysis,
    reportDate: string,
    options: {
      userId?: string
      customPrompt?: string
      aiModel?: string
    } = {}
  ): Promise<DailyReportResult> {
    const {
      userId = 'anonymous',
      customPrompt,
      aiModel = 'gpt-4o'
    } = options

    console.log(`📅 Generating daily report for ${analysis.basic.full_name} - ${reportDate}`)

    try {
      const openaiKey = await this.getOpenAIKey(userId)
      const openaiClient = createOpenAI({ apiKey: openaiKey })

      // Filter data for the specific date
      const dateAnalysis = this.filterAnalysisForDate(analysis, reportDate)
      
      // Generate daily summary
      const summary = await this.generateDailySummary(dateAnalysis, reportDate, userId, customPrompt, openaiClient)
      
      // Extract daily metrics
      const metrics = this.extractDailyMetrics(dateAnalysis)
      
      // Generate daily recommendations
      const recommendations = await this.generateDailyRecommendations(dateAnalysis, userId, openaiClient)

      return {
        summary,
        keyChanges: metrics.keyChanges,
        contributors: metrics.contributors,
        issuesResolved: metrics.issuesResolved,
        issuesCreated: metrics.issuesCreated,
        prsMerged: metrics.prsMerged,
        prsCreated: metrics.prsCreated,
        commitCount: metrics.commitCount,
        linesAdded: metrics.linesAdded,
        linesRemoved: metrics.linesRemoved,
        recommendations,
        metadata: {
          generatedAt: new Date().toISOString(),
          reportDate,
          aiModel
        }
      }
    } catch (error) {
      console.error('Error generating daily report:', error)
      throw new Error(`Failed to generate daily report: ${error}`)
    }
  }

  // ============================================================================
  // SUMMARY GENERATION
  // ============================================================================

  private async generateSummary(
    analysis: ComprehensiveRepoAnalysis,
    userId: string,
    customPrompt?: string,
    openaiClient?: any
  ): Promise<string> {
    try {
      // Use custom prompt if provided
      if (customPrompt) {
        const processedPrompt = this.processPromptVariables(customPrompt, analysis)
        const result = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedPrompt,
        })
        return result.text
      }

      // Get prompt from database
      const promptTemplate = await this.promptService.getPromptForExecution('repo_analysis', userId)
      
      if (promptTemplate) {
        const variables = this.extractPromptVariables(analysis)
        const { processedContent } = await this.promptService.preparePrompt(
          promptTemplate.id,
          variables
        )
        
        const result = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedContent,
        })
        
        // Log usage
        await this.promptService.logUsage({
          prompt_template_id: promptTemplate.id,
          user_id: userId,
          input_text: JSON.stringify(variables),
          generated_content: result.text,
          input_tokens: result.usage?.promptTokens || 0,
          output_tokens: result.usage?.completionTokens || 0,
          response_time_ms: 0, // Would need to track this
          success: true,
          ai_model_used: 'gpt-4o'
        })
        
        return result.text
      }

      // Fallback to hardcoded prompt
      return this.generateFallbackSummary(analysis, openaiClient)
    } catch (error) {
      console.error('Error generating summary:', error)
      return this.generateFallbackSummary(analysis, openaiClient)
    }
  }

  private async generateFallbackSummary(analysis: ComprehensiveRepoAnalysis, openaiClient: any): Promise<string> {
    const fallbackPrompt = `
Analyze the following GitHub repository and provide a comprehensive summary:

Repository: ${analysis.basic.name}
Owner: ${analysis.basic.owner}
Description: ${analysis.basic.description || 'No description provided'}
Primary Language: ${analysis.basic.language || 'Not specified'}
Stars: ${analysis.basic.stars}
Forks: ${analysis.basic.forks}

Recent Activity:
- Commits (last 30 days): ${analysis.commits.length}
- Pull Requests (last 30 days): ${analysis.pullRequests.length}
- Issues (last 30 days): ${analysis.issues.length}
- Contributors: ${analysis.contributors.total_contributors}

Code Structure:
- Total Lines: ${analysis.codeStructure.total_lines}
- File Count: ${analysis.codeStructure.file_count}
- Has README: ${analysis.codeStructure.has_readme}
- Has Tests: ${analysis.codeStructure.has_tests}
- Has CI/CD: ${analysis.codeStructure.has_ci_cd}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Features and Functionality
3. Code Quality Assessment
4. Documentation Quality
5. Recent Activity Summary
6. Overall Health Assessment

Keep the response concise and professional.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: fallbackPrompt,
    })

    return result.text
  }

  // ============================================================================
  // DAILY SUMMARY GENERATION
  // ============================================================================

  private async generateDailySummary(
    analysis: ComprehensiveRepoAnalysis,
    reportDate: string,
    userId: string,
    customPrompt?: string,
    openaiClient?: any
  ): Promise<string> {
    try {
      // Use custom prompt if provided
      if (customPrompt) {
        const processedPrompt = this.processDailyPromptVariables(customPrompt, analysis, reportDate)
        const result = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedPrompt,
        })
        return result.text
      }

      // Get prompt from database
      const promptTemplate = await this.promptService.getPromptForExecution('daily_report', userId)
      
      if (promptTemplate) {
        const variables = this.extractDailyPromptVariables(analysis, reportDate)
        const { processedContent } = await this.promptService.preparePrompt(
          promptTemplate.id,
          variables
        )
        
        const result = await generateText({
          model: openaiClient("gpt-4o"),
          prompt: processedContent,
        })
        
        return result.text
      }

      // Fallback to hardcoded prompt
      return this.generateFallbackDailySummary(analysis, reportDate, openaiClient)
    } catch (error) {
      console.error('Error generating daily summary:', error)
      return this.generateFallbackDailySummary(analysis, reportDate, openaiClient)
    }
  }

  private async generateFallbackDailySummary(
    analysis: ComprehensiveRepoAnalysis,
    reportDate: string,
    openaiClient: any
  ): Promise<string> {
    const dailyMetrics = this.extractDailyMetrics(analysis)
    
    const fallbackPrompt = `
Generate a daily standup report for the following repository changes:

Repository: ${analysis.basic.name}
Date: ${reportDate}

Changes Summary:
- Commits: ${dailyMetrics.commitCount}
- Pull Requests: ${dailyMetrics.prsCreated} created, ${dailyMetrics.prsMerged} merged
- Issues: ${dailyMetrics.issuesCreated} created, ${dailyMetrics.issuesResolved} resolved
- Contributors: ${dailyMetrics.contributors.length}
- Lines Added: ${dailyMetrics.linesAdded}
- Lines Removed: ${dailyMetrics.linesRemoved}

Key Changes:
${dailyMetrics.keyChanges.map(change => `- ${change}`).join('\n')}

Please provide:
1. Executive Summary (1-2 sentences)
2. Key Changes Made
3. Contributors Active Today
4. Issues Status
5. Pull Requests Status
6. Recommendations for Tomorrow

Format as a professional standup report suitable for team communication.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt: fallbackPrompt,
    })

    return result.text
  }

  // ============================================================================
  // RECOMMENDATIONS GENERATION
  // ============================================================================

  private async generateRecommendations(
    analysis: ComprehensiveRepoAnalysis,
    userId: string,
    openaiClient: any
  ): Promise<string[]> {
    const recommendations: string[] = []

    // Documentation recommendations
    if (analysis.health.documentation_score < 70) {
      recommendations.push('Improve documentation coverage by adding README sections and code comments')
    }

    // Testing recommendations
    if (!analysis.codeStructure.has_tests) {
      recommendations.push('Add automated tests to improve code quality and reliability')
    }

    // Security recommendations
    if (analysis.health.security_score < 60) {
      recommendations.push('Implement security best practices including branch protection and dependency scanning')
    }

    // CI/CD recommendations
    if (!analysis.codeStructure.has_ci_cd) {
      recommendations.push('Set up continuous integration and deployment pipelines')
    }

    // Activity recommendations
    if (analysis.health.activity_score < 50) {
      recommendations.push('Increase development activity and community engagement')
    }

    // Community recommendations
    if (analysis.health.community_score < 50) {
      recommendations.push('Add contributing guidelines and code of conduct to encourage community participation')
    }

    return recommendations
  }

  private async generateDailyRecommendations(
    analysis: ComprehensiveRepoAnalysis,
    userId: string,
    openaiClient: any
  ): Promise<string[]> {
    const recommendations: string[] = []
    const metrics = this.extractDailyMetrics(analysis)

    if (metrics.commitCount === 0) {
      recommendations.push('No commits today - consider making progress on pending features')
    }

    if (metrics.issuesCreated > metrics.issuesResolved) {
      recommendations.push('More issues created than resolved - prioritize issue resolution')
    }

    if (metrics.prsCreated > metrics.prsMerged) {
      recommendations.push('Review and merge pending pull requests to maintain development flow')
    }

    if (metrics.contributors.length === 1) {
      recommendations.push('Consider involving more team members in development activities')
    }

    return recommendations
  }

  // ============================================================================
  // ARTIFACTS GENERATION
  // ============================================================================

  private async generateArtifacts(
    analysis: ComprehensiveRepoAnalysis,
    userId: string,
    openaiClient: any
  ): Promise<DigestResult['artifacts']> {
    const artifacts: DigestResult['artifacts'] = {}

    try {
      // Generate requirements document if missing
      if (!analysis.codeStructure.has_readme || analysis.health.documentation_score < 50) {
        artifacts.requirementsDoc = await this.generateRequirementsDoc(analysis, openaiClient)
      }

      // Generate architecture diagram description
      if (analysis.codeStructure.file_count > 50) {
        artifacts.architectureDiagram = await this.generateArchitectureDiagram(analysis, openaiClient)
      }

      // Generate test plan if no tests
      if (!analysis.codeStructure.has_tests) {
        artifacts.testPlan = await this.generateTestPlan(analysis, openaiClient)
      }

      // Generate security audit if security score is low
      if (analysis.health.security_score < 60) {
        artifacts.securityAudit = await this.generateSecurityAudit(analysis, openaiClient)
      }
    } catch (error) {
      console.error('Error generating artifacts:', error)
    }

    return artifacts
  }

  private async generateRequirementsDoc(analysis: ComprehensiveRepoAnalysis, openaiClient: any): Promise<string> {
    const prompt = `
Based on the following repository analysis, generate a comprehensive requirements document:

Repository: ${analysis.basic.name}
Description: ${analysis.basic.description || 'No description provided'}
Language: ${analysis.basic.language}
File Structure: ${JSON.stringify(analysis.codeStructure.key_files, null, 2)}

Generate a requirements document that includes:
1. Project Overview
2. Functional Requirements
3. Non-Functional Requirements
4. Technical Requirements
5. Dependencies
6. Acceptance Criteria

Format as markdown.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt,
    })

    return result.text
  }

  private async generateArchitectureDiagram(analysis: ComprehensiveRepoAnalysis, openaiClient: any): Promise<string> {
    const prompt = `
Based on the following repository analysis, generate a Mermaid architecture diagram:

Repository: ${analysis.basic.name}
Language: ${analysis.basic.language}
File Count: ${analysis.codeStructure.file_count}
Key Files: ${JSON.stringify(analysis.codeStructure.key_files, null, 2)}
Languages: ${JSON.stringify(analysis.codeStructure.languages, null, 2)}

Generate a Mermaid diagram that shows:
1. System components
2. Data flow
3. Key modules
4. External dependencies

Return only the Mermaid diagram code.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt,
    })

    return result.text
  }

  private async generateTestPlan(analysis: ComprehensiveRepoAnalysis, openaiClient: any): Promise<string> {
    const prompt = `
Based on the following repository analysis, generate a comprehensive test plan:

Repository: ${analysis.basic.name}
Language: ${analysis.basic.language}
File Structure: ${JSON.stringify(analysis.codeStructure.key_files, null, 2)}

Generate a test plan that includes:
1. Testing Strategy
2. Unit Testing Plan
3. Integration Testing Plan
4. End-to-End Testing Plan
5. Test Environment Setup
6. Test Data Requirements
7. Success Criteria

Format as markdown.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt,
    })

    return result.text
  }

  private async generateSecurityAudit(analysis: ComprehensiveRepoAnalysis, openaiClient: any): Promise<string> {
    const prompt = `
Based on the following repository analysis, generate a security audit report:

Repository: ${analysis.basic.name}
Security Score: ${analysis.health.security_score}
Security Analysis: ${JSON.stringify(analysis.security, null, 2)}

Generate a security audit that includes:
1. Current Security Posture
2. Identified Vulnerabilities
3. Risk Assessment
4. Recommended Security Measures
5. Implementation Priority
6. Security Best Practices

Format as markdown.
`

    const result = await generateText({
      model: openaiClient("gpt-4o"),
      prompt,
    })

    return result.text
  }

  // ============================================================================
  // SDLC SCORE BREAKDOWN
  // ============================================================================

  private calculateSDLCBreakdown(analysis: ComprehensiveRepoAnalysis): DigestResult['sdlcBreakdown'] {
    return {
      documentation: analysis.health.documentation_score,
      testing: analysis.codeStructure.has_tests ? 80 : 20,
      security: analysis.health.security_score,
      maintenance: analysis.health.maintenance_score,
      community: analysis.health.community_score,
      activity: analysis.health.activity_score,
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractKeyChanges(analysis: ComprehensiveRepoAnalysis): string[] {
    const changes: string[] = []

    // Recent commits
    analysis.commits.slice(0, 5).forEach(commit => {
      changes.push(`${commit.message.split('\n')[0]} (${commit.author.name})`)
    })

    // Recent PRs
    analysis.pullRequests.slice(0, 3).forEach(pr => {
      changes.push(`PR #${pr.number}: ${pr.title} (${pr.state})`)
    })

    // Recent issues
    analysis.issues.slice(0, 3).forEach(issue => {
      changes.push(`Issue #${issue.number}: ${issue.title} (${issue.state})`)
    })

    return changes
  }

  private filterAnalysisForDate(analysis: ComprehensiveRepoAnalysis, date: string): ComprehensiveRepoAnalysis {
    const targetDate = new Date(date)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    return {
      ...analysis,
      commits: analysis.commits.filter(commit => {
        const commitDate = new Date(commit.author.date)
        return commitDate >= targetDate && commitDate < nextDay
      }),
      pullRequests: analysis.pullRequests.filter(pr => {
        const prDate = new Date(pr.updated_at)
        return prDate >= targetDate && prDate < nextDay
      }),
      issues: analysis.issues.filter(issue => {
        const issueDate = new Date(issue.updated_at)
        return issueDate >= targetDate && issueDate < nextDay
      })
    }
  }

  private extractDailyMetrics(analysis: ComprehensiveRepoAnalysis) {
    const contributors = new Set(analysis.commits.map(c => c.author.name))
    const issuesResolved = analysis.issues.filter(i => i.state === 'closed').length
    const issuesCreated = analysis.issues.filter(i => i.state === 'open').length
    const prsMerged = analysis.pullRequests.filter(pr => pr.state === 'merged').length
    const prsCreated = analysis.pullRequests.filter(pr => pr.state === 'open').length
    const commitCount = analysis.commits.length
    const linesAdded = analysis.commits.reduce((sum, c) => sum + c.stats.additions, 0)
    const linesRemoved = analysis.commits.reduce((sum, c) => sum + c.stats.deletions, 0)

    return {
      contributors: Array.from(contributors),
      issuesResolved,
      issuesCreated,
      prsMerged,
      prsCreated,
      commitCount,
      linesAdded,
      linesRemoved,
      keyChanges: this.extractKeyChanges(analysis)
    }
  }

  private extractPromptVariables(analysis: ComprehensiveRepoAnalysis): Record<string, string> {
    return {
      repo_name: analysis.basic.name,
      repo_owner: analysis.basic.owner,
      repo_description: analysis.basic.description || 'No description provided',
      primary_language: analysis.basic.language || 'Not specified',
      stars: analysis.basic.stars.toString(),
      forks: analysis.basic.forks.toString(),
      recent_commits: JSON.stringify(analysis.commits.slice(0, 10)),
      recent_prs: JSON.stringify(analysis.pullRequests.slice(0, 5)),
      recent_issues: JSON.stringify(analysis.issues.slice(0, 5)),
      code_structure: JSON.stringify(analysis.codeStructure)
    }
  }

  private extractDailyPromptVariables(analysis: ComprehensiveRepoAnalysis, reportDate: string): Record<string, string> {
    const metrics = this.extractDailyMetrics(analysis)
    
    return {
      repo_name: analysis.basic.name,
      report_date: reportDate,
      commit_count: metrics.commitCount.toString(),
      pr_count: metrics.prsCreated.toString(),
      issue_count: metrics.issuesCreated.toString(),
      contributors_count: metrics.contributors.length.toString(),
      lines_added: metrics.linesAdded.toString(),
      lines_removed: metrics.linesRemoved.toString(),
      detailed_changes: JSON.stringify(metrics.keyChanges)
    }
  }

  private processPromptVariables(prompt: string, analysis: ComprehensiveRepoAnalysis): string {
    const variables = this.extractPromptVariables(analysis)
    let processedPrompt = prompt
    
    Object.entries(variables).forEach(([key, value]) => {
      processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    return processedPrompt
  }

  private processDailyPromptVariables(prompt: string, analysis: ComprehensiveRepoAnalysis, reportDate: string): string {
    const variables = this.extractDailyPromptVariables(analysis, reportDate)
    let processedPrompt = prompt
    
    Object.entries(variables).forEach(([key, value]) => {
      processedPrompt = processedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    
    return processedPrompt
  }

  private async getOpenAIKey(userId: string): Promise<string> {
    // Try to get user's OpenAI key from the new AI configurations system
    if (userId !== 'anonymous') {
      try {
        const OPENAI_PROVIDER_ID = '1fdbbf27-6411-476a-bc4d-517c54f68f1d'
        
        const { data: config } = await this.supabase
          .from('sdlc_user_ai_configurations')
          .select('encrypted_api_key')
          .eq('user_id', userId)
          .eq('provider_id', OPENAI_PROVIDER_ID)
          .eq('is_active', true)
          .single()

        if (config?.encrypted_api_key) {
          return config.encrypted_api_key
        }
      } catch (error) {
        console.warn('Could not get user OpenAI key from new system, trying old system:', error)
      }
      
      // Fallback to old user_configurations table
      try {
        const { data: config } = await this.supabase
          .from('user_configurations')
          .select('openai_api_key')
          .eq('user_id', userId)
          .single()

        if (config?.openai_api_key) {
          return config.openai_api_key
        }
      } catch (error) {
        console.warn('Could not get user OpenAI key from old system:', error)
      }
    }

    // Fallback to environment variable
    const envKey = process.env.OPENAI_API_KEY
    if (!envKey) {
      throw new Error('OpenAI API key not found. Please configure your API key in the Settings tab.')
    }

    return envKey
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDigestGenerator(): GitDigestGenerator {
  return new GitDigestGenerator()
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatDigestForDisplay(digest: DigestResult): string {
  return `
# Repository Digest

## Summary
${digest.summary}

## SDLC Readiness Score: ${digest.sdlcScore}/100

### Score Breakdown
- Documentation: ${digest.sdlcBreakdown.documentation}/100
- Testing: ${digest.sdlcBreakdown.testing}/100
- Security: ${digest.sdlcBreakdown.security}/100
- Maintenance: ${digest.sdlcBreakdown.maintenance}/100
- Community: ${digest.sdlcBreakdown.community}/100
- Activity: ${digest.sdlcBreakdown.activity}/100

## Key Changes
${digest.keyChanges.map(change => `- ${change}`).join('\n')}

## Recommendations
${digest.recommendations.map(rec => `- ${rec}`).join('\n')}

${digest.artifacts.requirementsDoc ? `## Requirements Document\n${digest.artifacts.requirementsDoc}\n` : ''}
${digest.artifacts.architectureDiagram ? `## Architecture Diagram\n\`\`\`mermaid\n${digest.artifacts.architectureDiagram}\n\`\`\`\n` : ''}
${digest.artifacts.testPlan ? `## Test Plan\n${digest.artifacts.testPlan}\n` : ''}
${digest.artifacts.securityAudit ? `## Security Audit\n${digest.artifacts.securityAudit}\n` : ''}

---
*Generated on ${new Date(digest.metadata.generatedAt).toLocaleString()}*
`
}

export function formatDailyReportForDisplay(report: DailyReportResult): string {
  return `
# Daily Report - ${new Date(report.metadata.reportDate).toLocaleDateString()}

## Summary
${report.summary}

## Daily Metrics
- **Commits**: ${report.commitCount}
- **Lines Added**: ${report.linesAdded}
- **Lines Removed**: ${report.linesRemoved}
- **Pull Requests**: ${report.prsCreated} created, ${report.prsMerged} merged
- **Issues**: ${report.issuesCreated} created, ${report.issuesResolved} resolved
- **Active Contributors**: ${report.contributors.length}

## Key Changes
${report.keyChanges.map(change => `- ${change}`).join('\n')}

## Active Contributors
${report.contributors.map(contributor => `- ${contributor}`).join('\n')}

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated on ${new Date(report.metadata.generatedAt).toLocaleString()}*
`
} 