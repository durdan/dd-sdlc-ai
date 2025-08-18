/**
 * Research Coordinator
 * Orchestrates multiple research agents to gather comprehensive information
 * for SDLC document generation
 */

import { WebSearchAgent, WebSearchQuery, WebSearchResponse } from './web-search-agent'
import { DocumentationAgent, DocumentationQuery, DocumentationResponse } from './documentation-agent'
import { TechnologyAgent, TechnologyQuery, TechnologyResponse } from './technology-agent'

export interface ResearchRequest {
  projectDescription: string
  projectType: 'web_app' | 'mobile_app' | 'api' | 'desktop_app' | 'microservice' | 'enterprise'
  technologies?: string[]
  industry?: string
  targetAudience?: string
  researchDepth: 'basic' | 'standard' | 'comprehensive'
}

export interface ResearchFindings {
  webSearchResults: WebSearchResponse[]
  documentationFindings: DocumentationResponse[]
  technologyAnalysis: TechnologyResponse[]
  synthesizedInsights: {
    bestPractices: string[]
    commonPatterns: string[]
    potentialChallenges: string[]
    recommendations: string[]
  }
  metadata: {
    totalSourcesAnalyzed: number
    confidenceScore: number
    timestamp: Date
    researchDuration: number
  }
}

export interface ResearchTask {
  id: string
  type: 'web_search' | 'documentation' | 'technology'
  query: any
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}

export class ResearchCoordinator {
  private webSearchAgent: WebSearchAgent
  private documentationAgent: DocumentationAgent
  private technologyAgent: TechnologyAgent
  private tasks: Map<string, ResearchTask>
  
  constructor(config: {
    webSearchApiKey?: string
    webSearchProvider?: 'tavily' | 'serper' | 'perplexity'
  }) {
    // Initialize research agents
    this.webSearchAgent = new WebSearchAgent({
      apiKey: config.webSearchApiKey || process.env.TAVILY_API_KEY || '',
      provider: config.webSearchProvider || 'tavily'
    })
    
    this.documentationAgent = new DocumentationAgent()
    this.technologyAgent = new TechnologyAgent()
    this.tasks = new Map()
  }

  /**
   * Conduct comprehensive research for a project
   */
  async conductResearch(request: ResearchRequest): Promise<ResearchFindings> {
    console.log('🔬 Research Coordinator: Starting comprehensive research')
    const startTime = Date.now()
    
    try {
      // 1. Analyze requirements and create research plan
      const researchPlan = this.createResearchPlan(request)
      
      // 2. Execute research tasks in parallel
      const [webResults, docResults, techResults] = await Promise.all([
        this.executeWebSearchTasks(researchPlan.webSearchQueries),
        this.executeDocumentationTasks(researchPlan.documentationQueries),
        this.executeTechnologyTasks(researchPlan.technologyQueries)
      ])
      
      // 3. Synthesize findings
      const synthesizedInsights = await this.synthesizeFindings(
        webResults,
        docResults,
        techResults,
        request
      )
      
      // 4. Calculate metadata
      const totalSources = 
        webResults.reduce((acc, r) => acc + r.results.length, 0) +
        docResults.reduce((acc, r) => acc + r.documents.length, 0) +
        techResults.reduce((acc, r) => acc + r.technologies.length, 0)
      
      const confidenceScore = this.calculateConfidenceScore(
        webResults,
        docResults,
        techResults
      )
      
      return {
        webSearchResults: webResults,
        documentationFindings: docResults,
        technologyAnalysis: techResults,
        synthesizedInsights,
        metadata: {
          totalSourcesAnalyzed: totalSources,
          confidenceScore,
          timestamp: new Date(),
          researchDuration: Date.now() - startTime
        }
      }
    } catch (error) {
      console.error('Research coordination failed:', error)
      throw error
    }
  }

  /**
   * Create a research plan based on project requirements
   */
  private createResearchPlan(request: ResearchRequest): {
    webSearchQueries: WebSearchQuery[]
    documentationQueries: DocumentationQuery[]
    technologyQueries: TechnologyQuery[]
  } {
    const { projectDescription, projectType, technologies, industry } = request
    
    // Generate web search queries
    const webSearchQueries: WebSearchQuery[] = [
      {
        query: `${projectType} ${industry || ''} best practices 2024`,
        intent: 'best_practices',
        maxResults: 5
      },
      {
        query: `${projectDescription} implementation examples`,
        intent: 'examples',
        maxResults: 5
      }
    ]
    
    // Add technology-specific searches
    if (technologies && technologies.length > 0) {
      technologies.forEach(tech => {
        webSearchQueries.push({
          query: `${tech} ${projectType} architecture patterns`,
          intent: 'technical_details',
          maxResults: 3
        })
      })
    }
    
    // Generate documentation queries
    const documentationQueries: DocumentationQuery[] = technologies?.map(tech => ({
      technology: tech,
      type: 'official',
      sections: ['getting-started', 'best-practices', 'api-reference']
    })) || []
    
    // Generate technology analysis queries
    const technologyQueries: TechnologyQuery[] = [{
      projectType,
      requirements: projectDescription,
      existingStack: technologies,
      evaluationCriteria: ['performance', 'scalability', 'maintainability', 'cost']
    }]
    
    return {
      webSearchQueries,
      documentationQueries,
      technologyQueries
    }
  }

  /**
   * Execute web search tasks
   */
  private async executeWebSearchTasks(queries: WebSearchQuery[]): Promise<WebSearchResponse[]> {
    if (queries.length === 0) return []
    
    console.log(`🔍 Executing ${queries.length} web search tasks`)
    return this.webSearchAgent.searchBatch(queries)
  }

  /**
   * Execute documentation tasks
   */
  private async executeDocumentationTasks(queries: DocumentationQuery[]): Promise<DocumentationResponse[]> {
    if (queries.length === 0) return []
    
    console.log(`📚 Executing ${queries.length} documentation tasks`)
    const tasks = queries.map(query => this.documentationAgent.fetchDocumentation(query))
    return Promise.all(tasks)
  }

  /**
   * Execute technology analysis tasks
   */
  private async executeTechnologyTasks(queries: TechnologyQuery[]): Promise<TechnologyResponse[]> {
    if (queries.length === 0) return []
    
    console.log(`⚙️ Executing ${queries.length} technology analysis tasks`)
    const tasks = queries.map(query => this.technologyAgent.analyzeTechnology(query))
    return Promise.all(tasks)
  }

  /**
   * Synthesize all research findings into actionable insights
   */
  private async synthesizeFindings(
    webResults: WebSearchResponse[],
    docResults: DocumentationResponse[],
    techResults: TechnologyResponse[],
    request: ResearchRequest
  ): Promise<{
    bestPractices: string[]
    commonPatterns: string[]
    potentialChallenges: string[]
    recommendations: string[]
  }> {
    console.log('🧪 Synthesizing research findings...')
    
    // Extract best practices from all sources
    const bestPractices: string[] = []
    
    // From web search results
    webResults.forEach(result => {
      if (result.summary) {
        bestPractices.push(result.summary.substring(0, 200))
      }
    })
    
    // From documentation
    docResults.forEach(result => {
      result.documents.forEach(doc => {
        if (doc.summary) {
          bestPractices.push(doc.summary)
        }
      })
    })
    
    // Extract common patterns
    const commonPatterns: string[] = []
    techResults.forEach(result => {
      result.recommendations.forEach(rec => {
        commonPatterns.push(rec)
      })
    })
    
    // Identify potential challenges
    const potentialChallenges: string[] = this.identifyChallenges(
      request,
      webResults,
      techResults
    )
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      request,
      bestPractices,
      commonPatterns,
      potentialChallenges
    )
    
    return {
      bestPractices: bestPractices.slice(0, 5),
      commonPatterns: commonPatterns.slice(0, 5),
      potentialChallenges: potentialChallenges.slice(0, 5),
      recommendations: recommendations.slice(0, 5)
    }
  }

  /**
   * Identify potential challenges based on research
   */
  private identifyChallenges(
    request: ResearchRequest,
    webResults: WebSearchResponse[],
    techResults: TechnologyResponse[]
  ): string[] {
    const challenges: string[] = []
    
    // Check for scalability concerns
    if (request.projectType === 'enterprise' || request.projectType === 'microservice') {
      challenges.push('Scalability and distributed system complexity')
    }
    
    // Check for technology compatibility
    if (request.technologies && request.technologies.length > 3) {
      challenges.push('Integration complexity with multiple technologies')
    }
    
    // Add technology-specific challenges
    techResults.forEach(result => {
      result.technologies.forEach(tech => {
        if (tech.limitations) {
          challenges.push(...tech.limitations)
        }
      })
    })
    
    return [...new Set(challenges)] // Remove duplicates
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    request: ResearchRequest,
    bestPractices: string[],
    patterns: string[],
    challenges: string[]
  ): string[] {
    const recommendations: string[] = []
    
    // Technology stack recommendations
    if (request.technologies && request.technologies.length > 0) {
      recommendations.push(`Use ${request.technologies[0]} as the primary framework based on industry adoption`)
    }
    
    // Architecture recommendations based on project type
    switch (request.projectType) {
      case 'microservice':
        recommendations.push('Implement service mesh for inter-service communication')
        recommendations.push('Use event-driven architecture for loose coupling')
        break
      case 'web_app':
        recommendations.push('Implement Progressive Web App (PWA) features for better user experience')
        recommendations.push('Use server-side rendering (SSR) for improved SEO and performance')
        break
      case 'mobile_app':
        recommendations.push('Consider cross-platform framework to reduce development time')
        recommendations.push('Implement offline-first architecture for better reliability')
        break
    }
    
    // Add recommendations to address challenges
    challenges.forEach(challenge => {
      if (challenge.includes('scalability')) {
        recommendations.push('Implement horizontal scaling with load balancing')
      }
      if (challenge.includes('integration')) {
        recommendations.push('Use API gateway pattern for unified interface')
      }
    })
    
    return recommendations
  }

  /**
   * Calculate confidence score for research findings
   */
  private calculateConfidenceScore(
    webResults: WebSearchResponse[],
    docResults: DocumentationResponse[],
    techResults: TechnologyResponse[]
  ): number {
    let score = 0
    let factors = 0
    
    // Web search contribution
    if (webResults.length > 0) {
      const avgRelevance = webResults.reduce((acc, r) => {
        const avg = r.results.reduce((a, res) => a + res.relevanceScore, 0) / r.results.length
        return acc + avg
      }, 0) / webResults.length
      score += avgRelevance * 0.3
      factors++
    }
    
    // Documentation contribution
    if (docResults.length > 0) {
      score += 0.4 // Documentation is highly reliable
      factors++
    }
    
    // Technology analysis contribution
    if (techResults.length > 0) {
      score += 0.3
      factors++
    }
    
    return factors > 0 ? Math.min(score / factors, 1) : 0.5
  }

  /**
   * Get research task status
   */
  getTaskStatus(taskId: string): ResearchTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ResearchTask[] {
    return Array.from(this.tasks.values())
  }
}