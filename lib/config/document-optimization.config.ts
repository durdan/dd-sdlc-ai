/**
 * Configuration for document context optimization
 * Adjust these settings to fine-tune how context is summarized for each document type
 */

export const DOCUMENT_OPTIMIZATION_CONFIG = {
  // Enable/disable smart summarization globally
  enableSmartSummarization: true,
  
  // Maximum context length for each document type (in characters)
  maxContextLength: {
    functional: 3000,  // How much context functional specs should receive
    technical: 3000,   // How much context technical specs should receive
    ux: 2500,         // How much context UX specs should receive (less is often better for focused UX)
    mermaid: 2000,    // How much context diagram generation should receive
    meeting: 50000    // Much larger context for meeting transcripts
  },
  
  // Model to use for summarization (gpt-4o-mini is faster and cheaper)
  summarizationModel: 'gpt-4o-mini',
  
  // Temperature for summarization (lower = more focused)
  summarizationTemperature: 0.3,
  
  // Maximum tokens for summaries
  maxSummaryTokens: 1500,
  
  // Context preservation rules - what % of original to keep if smart summarization fails
  fallbackTruncationRatio: 0.3,
  
  // Enable detailed logging of optimization process
  enableDebugLogging: true,
  
  // Specific optimization strategies per document type
  optimizationStrategies: {
    functional: {
      prioritize: ['requirements', 'user stories', 'data models'],
      exclude: ['implementation details', 'technical jargon']
    },
    technical: {
      prioritize: ['architecture', 'data models', 'integrations', 'performance'],
      exclude: ['user interface details', 'business justification']
    },
    ux: {
      prioritize: ['user types', 'user goals', 'workflows', 'pain points'],
      exclude: ['technical implementation', 'database schemas']
    },
    meeting: {
      prioritize: ['decisions', 'action items', 'requirements', 'features', 'technical discussions'],
      exclude: ['off-topic conversations', 'greetings', 'small talk']
    }
  }
}

// Export type for type safety
export type DocumentOptimizationConfig = typeof DOCUMENT_OPTIMIZATION_CONFIG