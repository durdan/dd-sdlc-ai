/**
 * Web Search Agent
 * Performs intelligent web searches to gather current information,
 * best practices, and relevant examples for SDLC document generation
 */

export interface WebSearchQuery {
  query: string
  intent: 'best_practices' | 'examples' | 'documentation' | 'current_trends' | 'technical_details'
  domain?: string // Optional domain filtering
  maxResults?: number
}

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  content?: string // Full content if fetched
  relevanceScore: number
  source: 'google' | 'bing' | 'perplexity' | 'tavily'
  metadata?: {
    publishDate?: string
    author?: string
    domain: string
  }
}

export interface WebSearchResponse {
  query: WebSearchQuery
  results: WebSearchResult[]
  summary?: string // AI-generated summary of findings
  timestamp: Date
}

export class WebSearchAgent {
  private apiKey: string
  private provider: 'tavily' | 'serper' | 'perplexity'
  
  constructor(config: {
    apiKey: string
    provider?: 'tavily' | 'serper' | 'perplexity'
  }) {
    this.apiKey = config.apiKey
    this.provider = config.provider || 'tavily'
  }

  /**
   * Execute web search with intelligent query expansion
   */
  async search(query: WebSearchQuery): Promise<WebSearchResponse> {
    console.log(`🔍 Web Search Agent: Searching for "${query.query}"`)
    
    // Expand query based on intent
    const expandedQuery = this.expandQuery(query)
    
    try {
      let results: WebSearchResult[]
      
      switch (this.provider) {
        case 'tavily':
          results = await this.searchWithTavily(expandedQuery)
          break
        case 'serper':
          results = await this.searchWithSerper(expandedQuery)
          break
        case 'perplexity':
          results = await this.searchWithPerplexity(expandedQuery)
          break
        default:
          throw new Error(`Unsupported search provider: ${this.provider}`)
      }
      
      // Rank results by relevance
      const rankedResults = this.rankResults(results, query)
      
      // Generate summary if we have results
      const summary = rankedResults.length > 0 
        ? await this.generateSummary(rankedResults, query)
        : undefined
      
      return {
        query,
        results: rankedResults,
        summary,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Web search failed:', error)
      throw error
    }
  }

  /**
   * Search multiple queries in parallel
   */
  async searchBatch(queries: WebSearchQuery[]): Promise<WebSearchResponse[]> {
    console.log(`🔍 Web Search Agent: Batch searching ${queries.length} queries`)
    
    const searchPromises = queries.map(query => this.search(query))
    return Promise.all(searchPromises)
  }

  /**
   * Expand query based on intent for better results
   */
  private expandQuery(query: WebSearchQuery): string {
    const { query: originalQuery, intent } = query
    
    switch (intent) {
      case 'best_practices':
        return `${originalQuery} best practices guidelines standards 2024`
      
      case 'examples':
        return `${originalQuery} examples implementation tutorial code`
      
      case 'documentation':
        return `${originalQuery} documentation official docs API reference`
      
      case 'current_trends':
        return `${originalQuery} trends 2024 latest developments innovations`
      
      case 'technical_details':
        return `${originalQuery} technical architecture implementation details specifications`
      
      default:
        return originalQuery
    }
  }

  /**
   * Search using Tavily API
   */
  private async searchWithTavily(query: string): Promise<WebSearchResult[]> {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 10
      })
    })
    
    if (!response.ok) {
      throw new Error(`Tavily search failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.content,
      relevanceScore: result.score || 0.5,
      source: 'tavily' as const,
      metadata: {
        domain: new URL(result.url).hostname
      }
    }))
  }

  /**
   * Search using Serper API (Google Search)
   */
  private async searchWithSerper(query: string): Promise<WebSearchResult[]> {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 10
      })
    })
    
    if (!response.ok) {
      throw new Error(`Serper search failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return data.organic.map((result: any, index: number) => ({
      title: result.title,
      url: result.link,
      snippet: result.snippet,
      relevanceScore: 1 - (index * 0.1), // Rank-based scoring
      source: 'google' as const,
      metadata: {
        domain: new URL(result.link).hostname
      }
    }))
  }

  /**
   * Search using Perplexity API
   */
  private async searchWithPerplexity(query: string): Promise<WebSearchResult[]> {
    // Note: Perplexity API implementation would go here
    // For now, returning mock data
    console.warn('Perplexity search not yet implemented, using mock data')
    
    return [
      {
        title: 'Mock Result',
        url: 'https://example.com',
        snippet: 'This is a mock search result',
        relevanceScore: 0.8,
        source: 'perplexity' as const,
        metadata: {
          domain: 'example.com'
        }
      }
    ]
  }

  /**
   * Rank results by relevance to original query
   */
  private rankResults(results: WebSearchResult[], query: WebSearchQuery): WebSearchResult[] {
    // Simple keyword-based ranking
    const keywords = query.query.toLowerCase().split(' ')
    
    return results
      .map(result => {
        let score = result.relevanceScore
        
        // Boost score based on keyword matches
        keywords.forEach(keyword => {
          if (result.title.toLowerCase().includes(keyword)) score += 0.1
          if (result.snippet.toLowerCase().includes(keyword)) score += 0.05
        })
        
        // Boost trusted domains
        const trustedDomains = ['github.com', 'stackoverflow.com', 'microsoft.com', 'google.com', 'aws.amazon.com']
        if (result.metadata?.domain && trustedDomains.some(d => result.metadata!.domain.includes(d))) {
          score += 0.2
        }
        
        return { ...result, relevanceScore: Math.min(score, 1) }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, query.maxResults || 5)
  }

  /**
   * Generate AI summary of search results
   */
  private async generateSummary(results: WebSearchResult[], query: WebSearchQuery): Promise<string> {
    // This would integrate with your AI service
    // For now, returning a simple concatenation
    const topResults = results.slice(0, 3)
    const summary = `Based on search for "${query.query}": ${topResults.map(r => r.snippet).join(' ')}`
    
    return summary.substring(0, 500) + '...'
  }

  /**
   * Fetch full content from a URL (for detailed analysis)
   */
  async fetchContent(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`)
      }
      
      const html = await response.text()
      // Basic HTML stripping (in production, use a proper parser)
      return html.replace(/<[^>]*>/g, '').substring(0, 5000)
    } catch (error) {
      console.error(`Failed to fetch content from ${url}:`, error)
      return ''
    }
  }
}