import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { DOCUMENT_OPTIMIZATION_CONFIG } from './config/document-optimization.config'

export interface ContextExtractionRules {
  business: {
    forFunctional: string[]
    forTechnical: string[]
    forUX: string[]
  }
  functional: {
    forTechnical: string[]
    forUX: string[]
  }
  technical: {
    forUX: string[]
  }
}

// Define what information each document type needs from previous documents
const CONTEXT_EXTRACTION_RULES: ContextExtractionRules = {
  business: {
    forFunctional: [
      'business objectives and goals',
      'key stakeholders and their roles',
      'functional requirements overview',
      'success criteria and KPIs',
      'constraints and limitations',
      'integration points mentioned'
    ],
    forTechnical: [
      'technical constraints mentioned',
      'performance requirements',
      'security requirements',
      'integration systems',
      'scalability needs',
      'data volume estimates'
    ],
    forUX: [
      'user types and personas mentioned',
      'user goals and pain points',
      'accessibility requirements',
      'usability requirements',
      'brand guidelines mentioned',
      'device/platform requirements'
    ]
  },
  functional: {
    forTechnical: [
      'detailed functional requirements',
      'data models and relationships',
      'API requirements',
      'integration specifications',
      'performance criteria',
      'security specifications'
    ],
    forUX: [
      'user stories and scenarios',
      'user workflows and processes',
      'interaction requirements',
      'data input/output needs',
      'error handling requirements',
      'notification requirements'
    ]
  },
  technical: {
    forUX: [
      'technical constraints affecting UI',
      'performance limitations',
      'platform-specific requirements',
      'API response times',
      'data validation rules',
      'security constraints affecting UX'
    ]
  }
}

// Intelligent summarization prompts for each context type
const SUMMARIZATION_PROMPTS = {
  businessForFunctional: `Extract and summarize the following key information from this business analysis for functional specification creation:
- Business objectives and goals
- Key stakeholders and their roles  
- High-level functional requirements
- Success criteria and KPIs
- Constraints and limitations
- Integration points

Business Analysis:
{{content}}

Provide a concise summary (max 1000 words) focusing only on information relevant for creating functional specifications.`,

  businessForTechnical: `Extract and summarize the following key information from this business analysis for technical specification creation:
- Technical constraints and requirements
- Performance requirements
- Security and compliance requirements
- Integration systems mentioned
- Scalability and growth projections
- Data volume and complexity estimates

Business Analysis:
{{content}}

Provide a concise summary (max 800 words) focusing only on technical implications and requirements.`,

  businessForUX: `Extract and summarize the following key information from this business analysis for UX specification creation:
- User types, personas, and demographics
- User goals, needs, and pain points
- Accessibility and inclusivity requirements
- Usability goals and requirements
- Brand guidelines and visual requirements
- Device and platform requirements

Business Analysis:
{{content}}

Provide a concise summary (max 800 words) focusing only on user experience relevant information.`,

  functionalForTechnical: `Extract and summarize the following key information from this functional specification for technical specification creation:
- Detailed functional requirements list
- Data models and entity relationships
- API and integration requirements
- Performance and scalability criteria
- Security and validation rules
- System behavior specifications

Functional Specification:
{{content}}

Provide a concise summary (max 1000 words) focusing on technical implementation requirements.`,

  functionalForUX: `Extract and summarize the following key information from this functional specification for UX specification creation:
- User stories and use cases
- User workflows and task flows
- Interaction and behavior requirements
- Data input/output requirements
- Error states and handling
- Notification and feedback requirements

Functional Specification:
{{content}}

Provide a concise summary (max 1000 words) focusing on user interaction and experience requirements.`,

  technicalForUX: `Extract and summarize the following key information from this technical specification for UX specification creation:
- Technical constraints affecting user interface
- Performance limitations and loading times
- Platform-specific technical requirements
- API response times and data availability
- Validation rules and constraints
- Security requirements affecting user experience

Technical Specification:
{{content}}

Provide a concise summary (max 600 words) focusing on technical constraints that impact UX design.`
}

export class DocumentContextOptimizer {
  private openaiClient: any
  private maxContextLength: number
  private enableSmartSummarization: boolean

  constructor(options?: {
    apiKey?: string
    maxContextLength?: number
    enableSmartSummarization?: boolean
  }) {
    this.openaiClient = createOpenAI({ 
      apiKey: options?.apiKey || process.env.OPENAI_API_KEY || '' 
    })
    this.maxContextLength = options?.maxContextLength || DOCUMENT_OPTIMIZATION_CONFIG.maxContextLength.functional
    this.enableSmartSummarization = options?.enableSmartSummarization ?? DOCUMENT_OPTIMIZATION_CONFIG.enableSmartSummarization
  }

  /**
   * Optimize context for a specific document type by intelligently summarizing previous documents
   */
  async optimizeContext(
    targetDocType: 'functional' | 'technical' | 'ux',
    context: {
      businessAnalysis?: string
      functionalSpec?: string
      technicalSpec?: string
    }
  ): Promise<{
    businessAnalysis?: string
    functionalSpec?: string
    technicalSpec?: string
  }> {
    const optimizedContext: any = {}
    
    // Get document-specific max context length
    const docMaxLength = DOCUMENT_OPTIMIZATION_CONFIG.maxContextLength[targetDocType] || this.maxContextLength

    try {
      // Optimize business analysis if provided
      if (context.businessAnalysis && context.businessAnalysis.length > docMaxLength) {
        console.log(`📊 Optimizing business analysis for ${targetDocType} (${context.businessAnalysis.length} → ~${docMaxLength} chars)`)
        
        if (this.enableSmartSummarization) {
          optimizedContext.businessAnalysis = await this.smartSummarize(
            context.businessAnalysis,
            `businessFor${targetDocType.charAt(0).toUpperCase() + targetDocType.slice(1)}` as keyof typeof SUMMARIZATION_PROMPTS
          )
        } else {
          optimizedContext.businessAnalysis = this.truncateIntelligently(context.businessAnalysis)
        }
      } else {
        optimizedContext.businessAnalysis = context.businessAnalysis
      }

      // Optimize functional spec if provided and needed
      if (targetDocType !== 'functional' && context.functionalSpec && context.functionalSpec.length > docMaxLength) {
        console.log(`📊 Optimizing functional spec for ${targetDocType} (${context.functionalSpec.length} → ~${docMaxLength} chars)`)
        
        if (this.enableSmartSummarization) {
          optimizedContext.functionalSpec = await this.smartSummarize(
            context.functionalSpec,
            `functionalFor${targetDocType.charAt(0).toUpperCase() + targetDocType.slice(1)}` as keyof typeof SUMMARIZATION_PROMPTS
          )
        } else {
          optimizedContext.functionalSpec = this.truncateIntelligently(context.functionalSpec)
        }
      } else {
        optimizedContext.functionalSpec = context.functionalSpec
      }

      // Optimize technical spec if provided and needed (only for UX)
      if (targetDocType === 'ux' && context.technicalSpec && context.technicalSpec.length > docMaxLength) {
        console.log(`📊 Optimizing technical spec for UX (${context.technicalSpec.length} → ~${docMaxLength} chars)`)
        
        if (this.enableSmartSummarization) {
          optimizedContext.technicalSpec = await this.smartSummarize(
            context.technicalSpec,
            'technicalForUX'
          )
        } else {
          optimizedContext.technicalSpec = this.truncateIntelligently(context.technicalSpec)
        }
      } else {
        optimizedContext.technicalSpec = context.technicalSpec
      }

      return optimizedContext
    } catch (error) {
      console.error('Error optimizing context:', error)
      // Fallback to simple truncation if summarization fails
      return {
        businessAnalysis: this.truncateIntelligently(context.businessAnalysis),
        functionalSpec: this.truncateIntelligently(context.functionalSpec),
        technicalSpec: this.truncateIntelligently(context.technicalSpec)
      }
    }
  }

  /**
   * Use LLM to intelligently summarize content based on the target use case
   */
  private async smartSummarize(
    content: string,
    promptKey: keyof typeof SUMMARIZATION_PROMPTS
  ): Promise<string> {
    try {
      const prompt = SUMMARIZATION_PROMPTS[promptKey].replace('{{content}}', content)
      
      const result = await generateText({
        model: this.openaiClient(DOCUMENT_OPTIMIZATION_CONFIG.summarizationModel),
        prompt,
        temperature: 0.3, // Lower temperature for more focused summaries
        maxTokens: 1500
      })

      // Ensure the summary isn't longer than our max length
      if (result.text.length > this.maxContextLength) {
        return this.truncateIntelligently(result.text)
      }

      return result.text
    } catch (error) {
      console.error('Smart summarization failed, falling back to truncation:', error)
      return this.truncateIntelligently(content)
    }
  }

  /**
   * Intelligently truncate content by finding natural break points
   */
  private truncateIntelligently(content?: string): string {
    if (!content || content.length <= this.maxContextLength) {
      return content || ''
    }

    // Try to truncate at a natural break point (paragraph, sentence, etc.)
    const truncated = content.substring(0, this.maxContextLength)
    
    // Find the last complete sentence
    const lastPeriod = truncated.lastIndexOf('.')
    const lastNewline = truncated.lastIndexOf('\n')
    const breakPoint = Math.max(lastPeriod, lastNewline)
    
    if (breakPoint > this.maxContextLength * 0.8) {
      return truncated.substring(0, breakPoint + 1) + '\n\n[Content truncated for context optimization]'
    }
    
    return truncated + '...\n\n[Content truncated for context optimization]'
  }

  /**
   * Get extraction rules for a specific context combination
   */
  getExtractionRules(sourceDoc: string, targetDoc: string): string[] {
    if (sourceDoc === 'business') {
      return CONTEXT_EXTRACTION_RULES.business[`for${targetDoc.charAt(0).toUpperCase() + targetDoc.slice(1)}` as keyof typeof CONTEXT_EXTRACTION_RULES.business] || []
    }
    
    if (sourceDoc === 'functional' && (targetDoc === 'technical' || targetDoc === 'ux')) {
      return CONTEXT_EXTRACTION_RULES.functional[`for${targetDoc.charAt(0).toUpperCase() + targetDoc.slice(1)}` as keyof typeof CONTEXT_EXTRACTION_RULES.functional] || []
    }
    
    if (sourceDoc === 'technical' && targetDoc === 'ux') {
      return CONTEXT_EXTRACTION_RULES.technical.forUX || []
    }
    
    return []
  }
}

// Singleton instance for easy reuse
let optimizerInstance: DocumentContextOptimizer | null = null

export function getDocumentContextOptimizer(options?: {
  apiKey?: string
  maxContextLength?: number
  enableSmartSummarization?: boolean
}): DocumentContextOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new DocumentContextOptimizer(options)
  }
  return optimizerInstance
}