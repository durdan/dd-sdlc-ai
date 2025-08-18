/**
 * Documentation Agent
 * Fetches and analyzes official documentation, standards, and best practices
 */

export interface DocumentationQuery {
  technology: string
  type: 'official' | 'community' | 'tutorial' | 'api_reference'
  sections?: string[] // Specific sections to focus on
  version?: string // Specific version of documentation
}

export interface DocumentationItem {
  title: string
  url: string
  type: 'guide' | 'reference' | 'tutorial' | 'api' | 'example'
  content: string
  summary: string
  relevantSections: {
    title: string
    content: string
    importance: 'critical' | 'important' | 'useful'
  }[]
  metadata: {
    source: string
    version?: string
    lastUpdated?: string
  }
}

export interface DocumentationResponse {
  query: DocumentationQuery
  documents: DocumentationItem[]
  keyInsights: string[]
  codeExamples: {
    description: string
    code: string
    language: string
  }[]
  timestamp: Date
}

interface DocSource {
  name: string
  baseUrl: string
  searchUrl?: string
  apiKey?: string
}

export class DocumentationAgent {
  private docSources: Map<string, DocSource>
  
  constructor() {
    // Initialize documentation sources
    this.docSources = new Map([
      ['react', {
        name: 'React',
        baseUrl: 'https://react.dev',
        searchUrl: 'https://react.dev/search'
      }],
      ['vue', {
        name: 'Vue.js',
        baseUrl: 'https://vuejs.org',
        searchUrl: 'https://vuejs.org/search'
      }],
      ['angular', {
        name: 'Angular',
        baseUrl: 'https://angular.io',
        searchUrl: 'https://angular.io/api'
      }],
      ['nextjs', {
        name: 'Next.js',
        baseUrl: 'https://nextjs.org',
        searchUrl: 'https://nextjs.org/docs'
      }],
      ['nodejs', {
        name: 'Node.js',
        baseUrl: 'https://nodejs.org',
        searchUrl: 'https://nodejs.org/docs'
      }],
      ['python', {
        name: 'Python',
        baseUrl: 'https://docs.python.org',
        searchUrl: 'https://docs.python.org/3/search.html'
      }],
      ['django', {
        name: 'Django',
        baseUrl: 'https://docs.djangoproject.com',
        searchUrl: 'https://docs.djangoproject.com/search/'
      }],
      ['aws', {
        name: 'AWS',
        baseUrl: 'https://docs.aws.amazon.com',
        searchUrl: 'https://docs.aws.amazon.com/search'
      }],
      ['azure', {
        name: 'Azure',
        baseUrl: 'https://docs.microsoft.com/azure',
        searchUrl: 'https://docs.microsoft.com/search'
      }],
      ['typescript', {
        name: 'TypeScript',
        baseUrl: 'https://www.typescriptlang.org',
        searchUrl: 'https://www.typescriptlang.org/docs'
      }]
    ])
  }

  /**
   * Fetch documentation for a specific technology
   */
  async fetchDocumentation(query: DocumentationQuery): Promise<DocumentationResponse> {
    console.log(`📚 Documentation Agent: Fetching docs for ${query.technology}`)
    
    try {
      // Normalize technology name
      const techKey = query.technology.toLowerCase().replace(/\s+/g, '')
      const docSource = this.docSources.get(techKey)
      
      if (!docSource) {
        // Fallback to generic documentation search
        return this.fetchGenericDocumentation(query)
      }
      
      // Fetch documentation based on query type
      const documents = await this.fetchFromSource(docSource, query)
      
      // Extract key insights
      const keyInsights = this.extractKeyInsights(documents, query)
      
      // Extract code examples
      const codeExamples = this.extractCodeExamples(documents)
      
      return {
        query,
        documents,
        keyInsights,
        codeExamples,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Documentation fetch failed:', error)
      throw error
    }
  }

  /**
   * Fetch documentation from a specific source
   */
  private async fetchFromSource(source: DocSource, query: DocumentationQuery): Promise<DocumentationItem[]> {
    // In a real implementation, this would fetch from actual documentation APIs
    // For now, returning structured mock data
    
    const documents: DocumentationItem[] = []
    
    // Add getting started guide
    if (!query.sections || query.sections.includes('getting-started')) {
      documents.push({
        title: `${source.name} Getting Started Guide`,
        url: `${source.baseUrl}/docs/getting-started`,
        type: 'guide',
        content: `Complete guide for getting started with ${source.name}`,
        summary: `Essential setup and configuration steps for ${source.name}`,
        relevantSections: [
          {
            title: 'Installation',
            content: `npm install ${query.technology.toLowerCase()}`,
            importance: 'critical'
          },
          {
            title: 'Basic Setup',
            content: `Configuration and initialization steps`,
            importance: 'critical'
          }
        ],
        metadata: {
          source: source.name,
          version: 'latest'
        }
      })
    }
    
    // Add best practices
    if (!query.sections || query.sections.includes('best-practices')) {
      documents.push({
        title: `${source.name} Best Practices`,
        url: `${source.baseUrl}/docs/best-practices`,
        type: 'guide',
        content: `Recommended patterns and practices for ${source.name}`,
        summary: `Industry-standard patterns for building with ${source.name}`,
        relevantSections: [
          {
            title: 'Project Structure',
            content: `Recommended folder structure and organization`,
            importance: 'important'
          },
          {
            title: 'Performance Optimization',
            content: `Tips for optimizing ${source.name} applications`,
            importance: 'important'
          }
        ],
        metadata: {
          source: source.name,
          version: 'latest'
        }
      })
    }
    
    // Add API reference
    if (query.type === 'api_reference' || (!query.sections || query.sections.includes('api-reference'))) {
      documents.push({
        title: `${source.name} API Reference`,
        url: `${source.baseUrl}/api`,
        type: 'api',
        content: `Complete API documentation for ${source.name}`,
        summary: `Detailed API methods and properties`,
        relevantSections: [
          {
            title: 'Core APIs',
            content: `Main API methods and their usage`,
            importance: 'critical'
          },
          {
            title: 'Advanced APIs',
            content: `Advanced features and APIs`,
            importance: 'useful'
          }
        ],
        metadata: {
          source: source.name,
          version: query.version || 'latest'
        }
      })
    }
    
    return documents
  }

  /**
   * Fetch generic documentation when specific source is not available
   */
  private async fetchGenericDocumentation(query: DocumentationQuery): Promise<DocumentationResponse> {
    console.log(`📚 Using generic documentation search for ${query.technology}`)
    
    // This would typically use a documentation aggregator API
    // For now, returning basic structure
    return {
      query,
      documents: [
        {
          title: `${query.technology} Documentation`,
          url: `https://devdocs.io/${query.technology}`,
          type: 'guide',
          content: `General documentation for ${query.technology}`,
          summary: `Overview and usage guide for ${query.technology}`,
          relevantSections: [
            {
              title: 'Overview',
              content: `Introduction to ${query.technology}`,
              importance: 'important'
            }
          ],
          metadata: {
            source: 'DevDocs',
            version: 'latest'
          }
        }
      ],
      keyInsights: [
        `${query.technology} is widely used in the industry`,
        `Check official documentation for latest updates`
      ],
      codeExamples: [],
      timestamp: new Date()
    }
  }

  /**
   * Extract key insights from documentation
   */
  private extractKeyInsights(documents: DocumentationItem[], query: DocumentationQuery): string[] {
    const insights: string[] = []
    
    documents.forEach(doc => {
      // Extract insights from critical sections
      doc.relevantSections
        .filter(section => section.importance === 'critical')
        .forEach(section => {
          insights.push(`${section.title}: ${section.content.substring(0, 100)}`)
        })
    })
    
    // Add technology-specific insights
    if (query.technology.toLowerCase().includes('react')) {
      insights.push('Use functional components with hooks for modern React development')
      insights.push('Implement proper state management (Context API or Redux)')
    }
    
    if (query.technology.toLowerCase().includes('node')) {
      insights.push('Use async/await for handling asynchronous operations')
      insights.push('Implement proper error handling and logging')
    }
    
    return insights.slice(0, 5)
  }

  /**
   * Extract code examples from documentation
   */
  private extractCodeExamples(documents: DocumentationItem[]): {
    description: string
    code: string
    language: string
  }[] {
    const examples: { description: string; code: string; language: string }[] = []
    
    documents.forEach(doc => {
      if (doc.type === 'tutorial' || doc.type === 'example') {
        // Extract code examples from content
        // In real implementation, this would parse actual documentation
        
        if (doc.title.includes('React')) {
          examples.push({
            description: 'Basic React Component',
            code: `import React from 'react';

function MyComponent() {
  return <div>Hello World</div>;
}

export default MyComponent;`,
            language: 'javascript'
          })
        }
        
        if (doc.title.includes('Node')) {
          examples.push({
            description: 'Basic Express Server',
            code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);`,
            language: 'javascript'
          })
        }
      }
    })
    
    return examples.slice(0, 3)
  }

  /**
   * Search documentation across multiple technologies
   */
  async searchAcrossDocs(technologies: string[], searchTerm: string): Promise<DocumentationResponse[]> {
    console.log(`📚 Searching for "${searchTerm}" across ${technologies.length} technologies`)
    
    const searchPromises = technologies.map(tech => 
      this.fetchDocumentation({
        technology: tech,
        type: 'official',
        sections: ['api-reference', 'guides']
      })
    )
    
    return Promise.all(searchPromises)
  }

  /**
   * Get available documentation sources
   */
  getAvailableSources(): string[] {
    return Array.from(this.docSources.keys())
  }
}