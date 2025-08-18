/**
 * Enhanced Document Generator with Research Integration
 * Generates SDLC documents with deep research backing for improved quality
 */

import { ResearchCoordinator, ResearchRequest, ResearchFindings } from './research/research-coordinator'
import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

export interface EnhancedGenerationRequest {
  projectDescription: string
  documentType: 'business' | 'functional' | 'technical' | 'ux' | 'all'
  projectType?: 'web_app' | 'mobile_app' | 'api' | 'desktop_app' | 'microservice' | 'enterprise'
  technologies?: string[]
  industry?: string
  targetAudience?: string
  includeResearch?: boolean
  researchDepth?: 'basic' | 'standard' | 'comprehensive'
  streamResponse?: boolean
  generateSubsections?: boolean
}

export interface EnhancedDocument {
  type: string
  title: string
  content: string
  sections?: {
    id: string
    title: string
    content: string
    research?: string[]
  }[]
  research?: ResearchFindings
  metadata: {
    generatedAt: Date
    wordCount: number
    researchSources: number
    confidenceScore: number
  }
}

export interface EnhancedGenerationResponse {
  documents: EnhancedDocument[]
  research?: ResearchFindings
  totalGenerationTime: number
  metadata: {
    researchTime?: number
    generationTime: number
    totalSources?: number
  }
}

export class EnhancedDocumentGenerator {
  private researchCoordinator: ResearchCoordinator
  private openai: any
  private anthropic: any
  
  constructor(config?: {
    openaiApiKey?: string
    anthropicApiKey?: string
    webSearchApiKey?: string
    webSearchProvider?: 'tavily' | 'serper' | 'perplexity'
  }) {
    // Initialize AI providers
    if (config?.openaiApiKey) {
      this.openai = createOpenAI({
        apiKey: config.openaiApiKey
      })
    }
    
    if (config?.anthropicApiKey) {
      this.anthropic = createAnthropic({
        apiKey: config.anthropicApiKey
      })
    }
    
    // Initialize research coordinator
    this.researchCoordinator = new ResearchCoordinator({
      webSearchApiKey: config?.webSearchApiKey,
      webSearchProvider: config?.webSearchProvider
    })
  }

  /**
   * Generate enhanced documents with research backing
   */
  async generateDocuments(request: EnhancedGenerationRequest): Promise<EnhancedGenerationResponse> {
    console.log('🚀 Starting enhanced document generation with research')
    const startTime = Date.now()
    
    let research: ResearchFindings | undefined
    let researchTime = 0
    
    // 1. Conduct research if requested
    if (request.includeResearch !== false) {
      const researchStart = Date.now()
      research = await this.conductResearch(request)
      researchTime = Date.now() - researchStart
      console.log(`✅ Research completed in ${researchTime}ms`)
    }
    
    // 2. Generate documents with research context
    const generationStart = Date.now()
    const documents = await this.generateWithResearch(request, research)
    const generationTime = Date.now() - generationStart
    
    // 3. Add subsections if requested
    if (request.generateSubsections) {
      await this.generateSubsections(documents, research)
    }
    
    return {
      documents,
      research,
      totalGenerationTime: Date.now() - startTime,
      metadata: {
        researchTime,
        generationTime,
        totalSources: research?.metadata.totalSourcesAnalyzed
      }
    }
  }

  /**
   * Conduct research phase
   */
  private async conductResearch(request: EnhancedGenerationRequest): Promise<ResearchFindings> {
    const researchRequest: ResearchRequest = {
      projectDescription: request.projectDescription,
      projectType: request.projectType || 'web_app',
      technologies: request.technologies,
      industry: request.industry,
      targetAudience: request.targetAudience,
      researchDepth: request.researchDepth || 'standard'
    }
    
    return this.researchCoordinator.conductResearch(researchRequest)
  }

  /**
   * Generate documents with research context
   */
  private async generateWithResearch(
    request: EnhancedGenerationRequest,
    research?: ResearchFindings
  ): Promise<EnhancedDocument[]> {
    const documents: EnhancedDocument[] = []
    const documentTypes = this.getDocumentTypes(request.documentType)
    
    for (const docType of documentTypes) {
      const document = await this.generateSingleDocument(docType, request, research)
      documents.push(document)
    }
    
    return documents
  }

  /**
   * Generate a single document
   */
  private async generateSingleDocument(
    documentType: string,
    request: EnhancedGenerationRequest,
    research?: ResearchFindings
  ): Promise<EnhancedDocument> {
    console.log(`📝 Generating ${documentType} document`)
    
    const prompt = this.buildEnhancedPrompt(documentType, request, research)
    
    // Use streaming if requested
    if (request.streamResponse) {
      return this.generateStreamingDocument(documentType, prompt, research)
    }
    
    // Standard generation
    const model = this.getModel()
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 4000,
      temperature: 0.7
    })
    
    return {
      type: documentType,
      title: this.getDocumentTitle(documentType),
      content: text,
      research: research,
      metadata: {
        generatedAt: new Date(),
        wordCount: text.split(' ').length,
        researchSources: research?.metadata.totalSourcesAnalyzed || 0,
        confidenceScore: research?.metadata.confidenceScore || 0.7
      }
    }
  }

  /**
   * Build enhanced prompt with research context
   */
  private buildEnhancedPrompt(
    documentType: string,
    request: EnhancedGenerationRequest,
    research?: ResearchFindings
  ): string {
    let prompt = `Generate a comprehensive ${documentType} document for the following project:\n\n`
    prompt += `Project Description: ${request.projectDescription}\n`
    
    if (request.projectType) {
      prompt += `Project Type: ${request.projectType}\n`
    }
    
    if (request.technologies && request.technologies.length > 0) {
      prompt += `Technologies: ${request.technologies.join(', ')}\n`
    }
    
    if (request.industry) {
      prompt += `Industry: ${request.industry}\n`
    }
    
    if (request.targetAudience) {
      prompt += `Target Audience: ${request.targetAudience}\n`
    }
    
    // Add research insights
    if (research) {
      prompt += '\n## Research Insights:\n\n'
      
      if (research.synthesizedInsights.bestPractices.length > 0) {
        prompt += '### Best Practices:\n'
        research.synthesizedInsights.bestPractices.forEach(practice => {
          prompt += `- ${practice}\n`
        })
      }
      
      if (research.synthesizedInsights.recommendations.length > 0) {
        prompt += '\n### Recommendations:\n'
        research.synthesizedInsights.recommendations.forEach(rec => {
          prompt += `- ${rec}\n`
        })
      }
      
      if (research.synthesizedInsights.potentialChallenges.length > 0) {
        prompt += '\n### Potential Challenges:\n'
        research.synthesizedInsights.potentialChallenges.forEach(challenge => {
          prompt += `- ${challenge}\n`
        })
      }
      
      // Add relevant web search findings
      if (research.webSearchResults.length > 0) {
        prompt += '\n### Relevant Information:\n'
        research.webSearchResults.slice(0, 3).forEach(result => {
          if (result.summary) {
            prompt += `- ${result.summary.substring(0, 200)}\n`
          }
        })
      }
    }
    
    // Add document-specific instructions
    prompt += `\n## Document Requirements:\n`
    prompt += this.getDocumentRequirements(documentType)
    
    return prompt
  }

  /**
   * Generate streaming document
   */
  private async generateStreamingDocument(
    documentType: string,
    prompt: string,
    research?: ResearchFindings
  ): Promise<EnhancedDocument> {
    const model = this.getModel()
    const { textStream } = await streamText({
      model,
      prompt,
      maxTokens: 4000,
      temperature: 0.7
    })
    
    let content = ''
    for await (const chunk of textStream) {
      content += chunk
    }
    
    return {
      type: documentType,
      title: this.getDocumentTitle(documentType),
      content,
      research: research,
      metadata: {
        generatedAt: new Date(),
        wordCount: content.split(' ').length,
        researchSources: research?.metadata.totalSourcesAnalyzed || 0,
        confidenceScore: research?.metadata.confidenceScore || 0.7
      }
    }
  }

  /**
   * Generate subsections for documents
   */
  private async generateSubsections(documents: EnhancedDocument[], research?: ResearchFindings) {
    console.log('📑 Generating subsections for documents')
    
    for (const document of documents) {
      const sections = await this.generateDocumentSections(document, research)
      document.sections = sections
    }
  }

  /**
   * Generate sections for a single document
   */
  private async generateDocumentSections(
    document: EnhancedDocument,
    research?: ResearchFindings
  ): Promise<EnhancedDocument['sections']> {
    const sectionTitles = this.getSectionTitles(document.type)
    const sections: EnhancedDocument['sections'] = []
    
    for (const title of sectionTitles) {
      const sectionPrompt = this.buildSectionPrompt(document, title, research)
      const model = this.getModel()
      
      const { text } = await generateText({
        model,
        prompt: sectionPrompt,
        maxTokens: 2000,
        temperature: 0.7
      })
      
      sections.push({
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        content: text,
        research: this.extractRelevantResearch(title, research)
      })
    }
    
    return sections
  }

  /**
   * Build prompt for section generation
   */
  private buildSectionPrompt(
    document: EnhancedDocument,
    sectionTitle: string,
    research?: ResearchFindings
  ): string {
    let prompt = `Generate the "${sectionTitle}" section for a ${document.type} document.\n\n`
    prompt += `Context from main document:\n${document.content.substring(0, 500)}\n\n`
    
    if (research) {
      const relevantResearch = this.extractRelevantResearch(sectionTitle, research)
      if (relevantResearch.length > 0) {
        prompt += `Relevant research findings:\n`
        relevantResearch.forEach(finding => {
          prompt += `- ${finding}\n`
        })
      }
    }
    
    prompt += `\nGenerate detailed content for this section with specific examples and actionable insights.`
    
    return prompt
  }

  /**
   * Extract research relevant to a specific section
   */
  private extractRelevantResearch(sectionTitle: string, research?: ResearchFindings): string[] {
    if (!research) return []
    
    const relevant: string[] = []
    const titleLower = sectionTitle.toLowerCase()
    
    // Extract relevant best practices
    research.synthesizedInsights.bestPractices.forEach(practice => {
      if (practice.toLowerCase().includes(titleLower.split(' ')[0])) {
        relevant.push(practice)
      }
    })
    
    // Extract relevant recommendations
    research.synthesizedInsights.recommendations.forEach(rec => {
      if (rec.toLowerCase().includes(titleLower.split(' ')[0])) {
        relevant.push(rec)
      }
    })
    
    return relevant.slice(0, 3)
  }

  /**
   * Get document types to generate
   */
  private getDocumentTypes(documentType: string): string[] {
    if (documentType === 'all') {
      return ['business', 'functional', 'technical', 'ux']
    }
    return [documentType]
  }

  /**
   * Get document title
   */
  private getDocumentTitle(documentType: string): string {
    const titles: Record<string, string> = {
      business: 'Business Requirements Document',
      functional: 'Functional Specification',
      technical: 'Technical Specification',
      ux: 'UX Design Specification'
    }
    return titles[documentType] || 'Document'
  }

  /**
   * Get document requirements
   */
  private getDocumentRequirements(documentType: string): string {
    const requirements: Record<string, string> = {
      business: `
- Executive Summary
- Business Objectives and Goals
- Stakeholder Analysis
- Success Criteria and KPIs
- Risk Assessment and Mitigation
- Timeline and Milestones
- Budget Considerations
- Strategic Recommendations`,
      functional: `
- Functional Requirements (detailed)
- User Stories with Acceptance Criteria
- Use Cases and Scenarios
- Data Requirements and Models
- Business Rules and Logic
- Integration Requirements
- Performance Requirements
- User Workflows`,
      technical: `
- System Architecture Overview
- Technology Stack Details
- Database Design and Schema
- API Specifications
- Security Implementation
- Scalability Considerations
- Deployment Strategy
- Monitoring and Maintenance`,
      ux: `
- User Personas and Journey Maps
- Information Architecture
- Wireframes and Mockups Description
- Interaction Patterns
- Visual Design Guidelines
- Accessibility Requirements
- Usability Testing Plan
- Component Library Specifications`
    }
    return requirements[documentType] || ''
  }

  /**
   * Get section titles for a document type
   */
  private getSectionTitles(documentType: string): string[] {
    const sections: Record<string, string[]> = {
      business: [
        'Executive Summary',
        'Business Objectives',
        'Stakeholder Analysis',
        'Risk Assessment',
        'Implementation Timeline'
      ],
      functional: [
        'Functional Requirements',
        'User Stories',
        'Use Cases',
        'Data Requirements',
        'Integration Points'
      ],
      technical: [
        'System Architecture',
        'Technology Stack',
        'Database Design',
        'API Specifications',
        'Security Measures'
      ],
      ux: [
        'User Personas',
        'User Journey Maps',
        'Information Architecture',
        'Interaction Design',
        'Visual Design'
      ]
    }
    return sections[documentType] || []
  }

  /**
   * Get AI model based on availability
   */
  private getModel() {
    if (this.openai) {
      return this.openai('gpt-4-turbo-preview')
    }
    if (this.anthropic) {
      return this.anthropic('claude-3-opus-20240229')
    }
    throw new Error('No AI model configured')
  }
}