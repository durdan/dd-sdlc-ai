import { ClaudeCodeService, CodeAnalysisRequest } from './claude-service'
import { RepositoryAnalysis } from './repository-analyzer'

export interface BugReport {
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'logic' | 'performance' | 'security' | 'ui' | 'data' | 'integration' | 'other'
  steps?: string[]
  expectedBehavior?: string
  actualBehavior?: string
  environment?: {
    browser?: string
    os?: string
    version?: string
  }
  affectedFiles?: string[]
  stackTrace?: string
  logs?: string[]
}

export interface BugAnalysis {
  bugReport: BugReport
  repository: RepositoryAnalysis
  analysis: {
    rootCause: string
    confidence: 'low' | 'medium' | 'high'
    affectedComponents: string[]
    relatedFiles: Array<{
      path: string
      relevance: 'high' | 'medium' | 'low'
      reason: string
    }>
    executionPath: string[]
    dataFlow: Array<{
      from: string
      to: string
      data: string
    }>
  }
  suggestedFixes: Array<{
    approach: string
    description: string
    priority: 'high' | 'medium' | 'low'
    complexity: 'low' | 'medium' | 'high'
    riskLevel: 'low' | 'medium' | 'high'
    files: Array<{
      path: string
      changes: string
      reasoning: string
    }>
    testCases: Array<{
      description: string
      testCode: string
      type: 'unit' | 'integration' | 'e2e'
    }>
    rollbackPlan?: string
  }>
  preventionRecommendations: string[]
  monitoringRecommendations: string[]
  estimatedEffort: string
  impactAssessment: {
    userImpact: 'low' | 'medium' | 'high'
    businessImpact: 'low' | 'medium' | 'high'
    technicalComplexity: 'low' | 'medium' | 'high'
  }
}

export interface BugFix {
  analysis: BugAnalysis
  selectedFix: BugAnalysis['suggestedFixes'][0]
  implementation: {
    files_to_modify: Array<{
      path: string
      content: string
      backup_content?: string
      changes_summary: string
    }>
    files_to_create: Array<{
      path: string
      content: string
      purpose: string
    }>
    configuration_changes: Array<{
      file: string
      changes: string
      reason: string
    }>
  }
  validation: {
    test_files: Array<{
      path: string
      content: string
      framework: string
    }>
    manual_tests: string[]
    performance_checks: string[]
  }
  deployment: {
    steps: string[]
    rollback_plan: string
    monitoring_points: string[]
  }
}

export class BugDetector {
  private claudeService: ClaudeCodeService

  constructor(claudeService: ClaudeCodeService) {
    this.claudeService = claudeService
  }

  /**
   * Analyze a bug report and provide comprehensive analysis
   */
  async analyzeBugReport(
    bugReport: BugReport,
    repository: RepositoryAnalysis
  ): Promise<BugAnalysis> {
    console.log(`🐛 Analyzing bug: ${bugReport.description}`)
    console.log(`📊 Severity: ${bugReport.severity}, Category: ${bugReport.category}`)

    try {
      // Find relevant files based on bug description
      const relevantFiles = await this.findRelevantFiles(bugReport, repository)
      
      // Trace execution path
      const executionPath = await this.traceExecutionPath(bugReport, repository, relevantFiles)
      
      // Analyze root cause
      const rootCauseAnalysis = await this.analyzeRootCause(bugReport, repository, relevantFiles)
      
      // Generate fix suggestions
      const suggestedFixes = await this.generateFixSuggestions(bugReport, repository, rootCauseAnalysis)
      
      // Create comprehensive analysis
      const analysis: BugAnalysis = {
        bugReport,
        repository,
        analysis: {
          rootCause: rootCauseAnalysis.rootCause,
          confidence: rootCauseAnalysis.confidence,
          affectedComponents: rootCauseAnalysis.affectedComponents,
          relatedFiles: relevantFiles,
          executionPath,
          dataFlow: await this.analyzeDataFlow(bugReport, repository, relevantFiles)
        },
        suggestedFixes,
        preventionRecommendations: await this.generatePreventionRecommendations(bugReport, repository),
        monitoringRecommendations: await this.generateMonitoringRecommendations(bugReport, repository),
        estimatedEffort: this.estimateEffort(suggestedFixes),
        impactAssessment: this.assessImpact(bugReport, repository)
      }

      console.log(`✅ Bug analysis completed with ${suggestedFixes.length} fix suggestions`)
      return analysis

    } catch (error) {
      console.error(`❌ Bug analysis failed:`, error)
      throw new Error(`Bug analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a bug fix implementation
   */
  async generateBugFix(
    analysis: BugAnalysis,
    selectedFixIndex = 0
  ): Promise<BugFix> {
    console.log(`🔧 Generating bug fix implementation...`)
    
    const selectedFix = analysis.suggestedFixes[selectedFixIndex]
    if (!selectedFix) {
      throw new Error('Invalid fix selection')
    }

    try {
      // Generate detailed implementation
      const implementation = await this.generateFixImplementation(selectedFix, analysis.repository)
      
      // Generate validation tests
      const validation = await this.generateValidationTests(selectedFix, analysis)
      
      // Generate deployment plan
      const deployment = await this.generateDeploymentPlan(selectedFix, analysis)

      const bugFix: BugFix = {
        analysis,
        selectedFix,
        implementation,
        validation,
        deployment
      }

      console.log(`✅ Bug fix implementation generated`)
      return bugFix

    } catch (error) {
      console.error(`❌ Bug fix generation failed:`, error)
      throw new Error(`Bug fix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find files relevant to the bug using smart search algorithms
   */
  private async findRelevantFiles(
    bugReport: BugReport,
    repository: RepositoryAnalysis
  ): Promise<Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }>> {
    const relevantFiles: Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }> = []

    // Start with explicitly mentioned files
    if (bugReport.affectedFiles) {
      bugReport.affectedFiles.forEach(file => {
        relevantFiles.push({
          path: file,
          relevance: 'high',
          reason: 'Explicitly mentioned in bug report'
        })
      })
    }

    // Use Claude to analyze and find relevant files
    const searchPrompt = `
Based on this bug description and repository structure, identify the most likely files that could be related to this issue:

BUG DESCRIPTION: ${bugReport.description}
CATEGORY: ${bugReport.category}
EXPECTED BEHAVIOR: ${bugReport.expectedBehavior || 'Not specified'}
ACTUAL BEHAVIOR: ${bugReport.actualBehavior || 'Not specified'}

REPOSITORY INFO:
Framework: ${repository.framework}
Primary Language: ${repository.primaryLanguage}
Architecture: ${repository.patterns.architecture.join(', ')}

CODE FILES (sample):
${repository.codeFiles.slice(0, 50).join('\n')}

DEPENDENCIES:
${Object.entries(repository.dependencies.imports)
  .slice(0, 20)
  .map(([file, deps]) => `${file}: ${deps.slice(0, 3).join(', ')}`)
  .join('\n')}

Please identify 5-10 files most likely to be related to this bug, with relevance level (high/medium/low) and reasoning.
Focus on files that could contain the logic related to the bug description.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: searchPrompt,
        analysisType: 'bug_fix',
        context: 'Finding relevant files for bug analysis'
      })

      // Parse Claude's response for file suggestions
      const claudeFiles = this.parseFileRelevance(result.analysis, repository)
      relevantFiles.push(...claudeFiles)

    } catch (error) {
      console.warn('Claude file analysis failed, using keyword matching')
      
      // Fallback: simple keyword matching
      const keywords = this.extractKeywords(bugReport)
      const keywordFiles = this.findFilesByKeywords(keywords, repository)
      relevantFiles.push(...keywordFiles)
    }

    // Remove duplicates and sort by relevance
    const uniqueFiles = relevantFiles.filter((file, index, self) => 
      self.findIndex(f => f.path === file.path) === index
    )

    return uniqueFiles
      .sort((a, b) => {
        const relevanceOrder = { high: 3, medium: 2, low: 1 }
        return relevanceOrder[b.relevance] - relevanceOrder[a.relevance]
      })
      .slice(0, 15) // Limit to top 15 files
  }

  /**
   * Trace the execution path that could lead to the bug
   */
  private async traceExecutionPath(
    bugReport: BugReport,
    repository: RepositoryAnalysis,
    relevantFiles: Array<{ path: string; relevance: string; reason: string }>
  ): Promise<string[]> {
    const executionPrompt = `
Trace the likely execution path that leads to this bug:

BUG: ${bugReport.description}
STEPS TO REPRODUCE: ${bugReport.steps?.join(' → ') || 'Not provided'}

RELEVANT FILES:
${relevantFiles.slice(0, 10).map(f => `${f.path} (${f.relevance})`).join('\n')}

DEPENDENCIES:
${Object.entries(repository.dependencies.relationships)
  .slice(0, 20)
  .map(([, rel]) => `${rel.from} → ${rel.to} (${rel.type})`)
  .join('\n')}

Based on the framework (${repository.framework}) and architecture patterns, provide a step-by-step execution path that could lead to this bug.
Focus on the flow from user action to the problematic code.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: executionPrompt,
        analysisType: 'bug_fix',
        context: 'Tracing execution path for bug'
      })

      return this.parseExecutionPath(result.analysis)
    } catch (error) {
      console.warn('Execution path tracing failed')
      return ['User action', 'Component rendering/execution', 'Business logic', 'Data handling', 'Error occurs']
    }
  }

  /**
   * Analyze the root cause of the bug
   */
  private async analyzeRootCause(
    bugReport: BugReport,
    repository: RepositoryAnalysis,
    relevantFiles: Array<{ path: string; relevance: string; reason: string }>
  ): Promise<{
    rootCause: string
    confidence: 'low' | 'medium' | 'high'
    affectedComponents: string[]
  }> {
    const rootCausePrompt = `
Analyze the root cause of this bug:

BUG DETAILS:
Description: ${bugReport.description}
Category: ${bugReport.category}
Severity: ${bugReport.severity}
Expected: ${bugReport.expectedBehavior || 'Not specified'}
Actual: ${bugReport.actualBehavior || 'Not specified'}

${bugReport.stackTrace ? `STACK TRACE:
${bugReport.stackTrace}` : ''}

${bugReport.logs ? `LOGS:
${bugReport.logs.join('\n')}` : ''}

REPOSITORY CONTEXT:
Framework: ${repository.framework}
Patterns: ${repository.patterns.patterns.join(', ')}
Technologies: ${repository.patterns.technologies.join(', ')}

LIKELY RELEVANT FILES:
${relevantFiles.slice(0, 8).map(f => `${f.path}: ${f.reason}`).join('\n')}

Please provide:
1. The most likely root cause of this bug
2. Your confidence level in this analysis (low/medium/high)
3. The components/modules most likely affected

Focus on technical root causes like logic errors, race conditions, data validation issues, etc.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: rootCausePrompt,
        analysisType: 'bug_fix',
        context: 'Root cause analysis'
      })

      return this.parseRootCauseAnalysis(result.analysis)
    } catch (error) {
      console.warn('Root cause analysis failed, using generic analysis')
      return {
        rootCause: `Potential ${bugReport.category} issue in ${repository.framework} application`,
        confidence: 'low',
        affectedComponents: relevantFiles.slice(0, 3).map(f => f.path)
      }
    }
  }

  /**
   * Generate fix suggestions with different approaches
   */
  private async generateFixSuggestions(
    bugReport: BugReport,
    repository: RepositoryAnalysis,
    rootCauseAnalysis: { rootCause: string; confidence: string; affectedComponents: string[] }
  ): Promise<BugAnalysis['suggestedFixes']> {
    const fixPrompt = `
Generate multiple fix approaches for this bug:

BUG: ${bugReport.description}
ROOT CAUSE: ${rootCauseAnalysis.rootCause}
CONFIDENCE: ${rootCauseAnalysis.confidence}
AFFECTED COMPONENTS: ${rootCauseAnalysis.affectedComponents.join(', ')}

REPOSITORY CONTEXT:
Framework: ${repository.framework}
Language: ${repository.primaryLanguage}
Patterns: ${repository.patterns.patterns.join(', ')}

Please provide 2-3 different fix approaches, each with:
1. Approach name and description
2. Priority (high/medium/low)
3. Complexity (low/medium/high)
4. Risk level (low/medium/high)
5. Specific files to modify and what changes to make
6. Test cases needed to validate the fix
7. Optional rollback plan

Consider quick fixes, comprehensive solutions, and preventive measures.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: fixPrompt,
        analysisType: 'bug_fix',
        context: 'Generating fix suggestions'
      })

      return this.parseFixSuggestions(result.analysis, repository)
    } catch (error) {
      console.warn('Fix suggestion generation failed, using generic fixes')
      return this.generateGenericFixes(bugReport, rootCauseAnalysis)
    }
  }

  // Additional helper methods for data flow, prevention, monitoring, etc.
  private async analyzeDataFlow(
    bugReport: BugReport,
    repository: RepositoryAnalysis,
    relevantFiles: Array<{ path: string; relevance: string; reason: string }>
  ): Promise<Array<{ from: string; to: string; data: string }>> {
    // Simplified data flow analysis
    return relevantFiles.slice(0, 5).map((file, index) => ({
      from: index === 0 ? 'User Input' : relevantFiles[index - 1].path,
      to: file.path,
      data: `Data related to ${bugReport.category}`
    }))
  }

  private async generatePreventionRecommendations(
    bugReport: BugReport,
    repository: RepositoryAnalysis
  ): Promise<string[]> {
    const recommendations = [
      'Add comprehensive unit tests for the affected functionality',
      'Implement better error handling and validation',
      'Add logging for better debugging capabilities',
      'Consider adding integration tests for the workflow'
    ]

    // Add category-specific recommendations
    switch (bugReport.category) {
      case 'security':
        recommendations.push('Implement security scanning in CI/CD pipeline')
        recommendations.push('Add input validation and sanitization')
        break
      case 'performance':
        recommendations.push('Add performance monitoring and alerts')
        recommendations.push('Implement performance regression tests')
        break
      case 'data':
        recommendations.push('Add data validation schemas')
        recommendations.push('Implement database migration testing')
        break
    }

    return recommendations
  }

  private async generateMonitoringRecommendations(
    bugReport: BugReport,
    repository: RepositoryAnalysis
  ): Promise<string[]> {
    return [
      'Add error tracking for this component',
      'Monitor key metrics related to this functionality',
      'Set up alerts for similar error patterns',
      'Implement health checks for affected services',
      `Add specific monitoring for ${bugReport.category} issues`
    ]
  }

  // Parsing and utility methods
  private parseFileRelevance(
    analysis: string,
    repository: RepositoryAnalysis
  ): Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }> {
    const files: Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }> = []
    
    // Extract file mentions from Claude's response
    const lines = analysis.split('\n')
    for (const line of lines) {
      // Look for file paths in the analysis
      const fileMatch = line.match(/([a-zA-Z0-9_\-/\.]+\.(js|ts|jsx|tsx|py|java|go|php|rb|vue|css|html))/g)
      if (fileMatch) {
        fileMatch.forEach(filePath => {
          if (repository.codeFiles.includes(filePath)) {
            const relevance = line.toLowerCase().includes('high') ? 'high' :
                             line.toLowerCase().includes('medium') ? 'medium' : 'low'
            files.push({
              path: filePath,
              relevance,
              reason: 'Identified by Claude analysis'
            })
          }
        })
      }
    }

    return files
  }

  private extractKeywords(bugReport: BugReport): string[] {
    const text = `${bugReport.description} ${bugReport.expectedBehavior} ${bugReport.actualBehavior}`
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10)
  }

  private findFilesByKeywords(
    keywords: string[],
    repository: RepositoryAnalysis
  ): Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }> {
    const files: Array<{ path: string; relevance: 'high' | 'medium' | 'low'; reason: string }> = []
    
    repository.codeFiles.forEach(filePath => {
      const fileName = filePath.toLowerCase()
      const matchCount = keywords.filter(keyword => fileName.includes(keyword)).length
      
      if (matchCount > 0) {
        const relevance = matchCount > 2 ? 'high' : matchCount > 1 ? 'medium' : 'low'
        files.push({
          path: filePath,
          relevance,
          reason: `Matches ${matchCount} keywords`
        })
      }
    })

    return files
  }

  private parseExecutionPath(analysis: string): string[] {
    const lines = analysis.split('\n').filter(line => 
      line.trim().match(/^\d+\./) || 
      line.trim().startsWith('-') || 
      line.trim().startsWith('•')
    )
    
    return lines.slice(0, 8).map(line => 
      line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim()
    ).filter(step => step.length > 0)
  }

  private parseRootCauseAnalysis(analysis: string): {
    rootCause: string
    confidence: 'low' | 'medium' | 'high'
    affectedComponents: string[]
  } {
    // Extract root cause, confidence, and components from Claude's response
    const lines = analysis.split('\n')
    
    let rootCause = 'Analysis unavailable'
    let confidence: 'low' | 'medium' | 'high' = 'low'
    const affectedComponents: string[] = []

    for (const line of lines) {
      if (line.toLowerCase().includes('root cause') || line.toLowerCase().includes('cause:')) {
        rootCause = line.replace(/.*?cause:?\s*/i, '').trim()
      }
      if (line.toLowerCase().includes('confidence')) {
        if (line.toLowerCase().includes('high')) confidence = 'high'
        else if (line.toLowerCase().includes('medium')) confidence = 'medium'
        else confidence = 'low'
      }
      if (line.toLowerCase().includes('component') || line.toLowerCase().includes('affected')) {
        const componentMatch = line.match(/([a-zA-Z0-9_\-/\.]+)/g)
        if (componentMatch) {
          affectedComponents.push(...componentMatch.slice(0, 3))
        }
      }
    }

    return { rootCause, confidence, affectedComponents }
  }

  private parseFixSuggestions(
    analysis: string,
    repository: RepositoryAnalysis
  ): BugAnalysis['suggestedFixes'] {
    // Parse Claude's fix suggestions - simplified implementation
    return [
      {
        approach: 'Quick Fix',
        description: 'Immediate solution to resolve the bug',
        priority: 'high',
        complexity: 'low',
        riskLevel: 'low',
        files: [{
          path: 'src/main.js',
          changes: 'Add proper error handling and validation',
          reasoning: 'Prevents the immediate issue'
        }],
        testCases: [{
          description: 'Test error handling',
          testCode: 'describe("error handling", () => { /* test code */ })',
          type: 'unit'
        }]
      }
    ]
  }

  private generateGenericFixes(
    bugReport: BugReport,
    rootCauseAnalysis: { rootCause: string; confidence: string; affectedComponents: string[] }
  ): BugAnalysis['suggestedFixes'] {
    return [
      {
        approach: 'Standard Fix',
        description: `Address the ${bugReport.category} issue in the affected components`,
        priority: 'high',
        complexity: 'medium',
        riskLevel: 'medium',
        files: rootCauseAnalysis.affectedComponents.map(component => ({
          path: component,
          changes: `Fix ${bugReport.category} issue`,
          reasoning: 'Component identified in root cause analysis'
        })),
        testCases: [{
          description: `Test ${bugReport.category} fix`,
          testCode: `// Test code for ${bugReport.category} fix`,
          type: 'unit'
        }]
      }
    ]
  }

  private estimateEffort(fixes: BugAnalysis['suggestedFixes']): string {
    const highPriorityFix = fixes.find(f => f.priority === 'high')
    if (!highPriorityFix) return 'Unknown'
    
    switch (highPriorityFix.complexity) {
      case 'low': return '1-2 hours'
      case 'medium': return '4-8 hours'
      case 'high': return '1-3 days'
      default: return 'Unknown'
    }
  }

  private assessImpact(bugReport: BugReport, repository: RepositoryAnalysis): BugAnalysis['impactAssessment'] {
    const userImpact = bugReport.severity === 'critical' ? 'high' :
                      bugReport.severity === 'high' ? 'high' :
                      bugReport.severity === 'medium' ? 'medium' : 'low'
    
    const businessImpact = bugReport.category === 'security' ? 'high' :
                          bugReport.category === 'data' ? 'high' :
                          userImpact
    
    const technicalComplexity = repository.patterns.architecture.includes('Microservices') ? 'high' :
                               repository.patterns.architecture.includes('Monolith') ? 'medium' : 'low'

    return { userImpact, businessImpact, technicalComplexity }
  }

  // Implementation generation methods (simplified for now)
  private async generateFixImplementation(
    selectedFix: BugAnalysis['suggestedFixes'][0],
    repository: RepositoryAnalysis
  ): Promise<BugFix['implementation']> {
    return {
      files_to_modify: selectedFix.files.map(file => ({
        path: file.path,
        content: `// Updated ${file.path}\n${file.changes}`,
        changes_summary: file.reasoning
      })),
      files_to_create: [],
      configuration_changes: []
    }
  }

  private async generateValidationTests(
    selectedFix: BugAnalysis['suggestedFixes'][0],
    analysis: BugAnalysis
  ): Promise<BugFix['validation']> {
    return {
      test_files: selectedFix.testCases.map(test => ({
        path: `tests/${test.type}/${analysis.bugReport.category}.test.js`,
        content: test.testCode,
        framework: 'Jest'
      })),
      manual_tests: [
        'Verify the bug is fixed',
        'Test related functionality',
        'Check for regressions'
      ],
      performance_checks: [
        'Monitor response times',
        'Check memory usage',
        'Validate load handling'
      ]
    }
  }

  private async generateDeploymentPlan(
    selectedFix: BugAnalysis['suggestedFixes'][0],
    analysis: BugAnalysis
  ): Promise<BugFix['deployment']> {
    return {
      steps: [
        'Create backup of current code',
        'Apply fix changes',
        'Run test suite',
        'Deploy to staging',
        'Validate fix in staging',
        'Deploy to production'
      ],
      rollback_plan: selectedFix.rollbackPlan || 'Revert to previous deployment',
      monitoring_points: [
        'Error rate monitoring',
        'Performance metrics',
        'User experience metrics'
      ]
    }
  }
} 