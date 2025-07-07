import { createClient } from '@/lib/supabase/client'

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  document_type: DocumentType;
  prompt_content: string;
  variables: Record<string, string>;
  ai_model: string;
  is_active: boolean;
  is_default: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromptUsageLog {
  id: string;
  prompt_template_id: string;
  user_id: string;
  project_id?: string;
  input_text?: string;
  generated_content?: string;
  input_tokens?: number;
  output_tokens?: number;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  ai_model_used?: string;
  created_at: string;
}

export interface PromptExperiment {
  id: string;
  name: string;
  description?: string;
  document_type: DocumentType;
  control_prompt_id: string;
  variant_prompt_id: string;
  traffic_split: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'business' | 'functional' | 'technical' | 'ux' | 'mermaid';

export interface PromptResult {
  content: string;
  prompt_template_id: string;
  usage_log_id: string;
  input_tokens?: number;
  output_tokens?: number;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
  document_type: DocumentType;
  prompt_content: string;
  variables?: Record<string, string>;
  ai_model?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
  prompt_content?: string;
  variables?: Record<string, string>;
  ai_model?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export class PromptService {
  private supabase;
  private cache: Map<string, PromptTemplate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use the existing client from our client.ts file
    this.supabase = createClient();
  }

  /**
   * Get the active prompt for a specific document type
   */
  async getActivePrompt(documentType: DocumentType): Promise<PromptTemplate | null> {
    const cacheKey = `active-${documentType}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error('Error fetching active prompt:', error);
        return null;
      }

      // Cache the result
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return data;
    } catch (error) {
      console.error('Error in getActivePrompt:', error);
      return null;
    }
  }

  /**
   * Get prompt for execution with A/B testing support
   */
  async getPromptForExecution(
    documentType: DocumentType, 
    userId: string
  ): Promise<PromptTemplate | null> {
    try {
      // Check for active experiments
      const experiment = await this.getActiveExperiment(documentType);
      
      if (experiment) {
        // Determine which prompt to use based on user ID and traffic split
        const userHash = this.hashUserId(userId);
        const useVariant = userHash < experiment.traffic_split;
        
        const promptId = useVariant ? experiment.variant_prompt_id : experiment.control_prompt_id;
        return await this.getPromptById(promptId);
      }

      // No experiment, use default active prompt
      return await this.getActivePrompt(documentType);
    } catch (error) {
      console.error('Error in getPromptForExecution:', error);
      return await this.getActivePrompt(documentType);
    }
  }

  /**
   * Execute a prompt with variable substitution and logging
   */
  async executePrompt(
    promptId: string,
    variables: Record<string, string>,
    userId: string,
    projectId?: string
  ): Promise<PromptResult> {
    const startTime = Date.now();
    
    try {
      // Get the prompt template
      const prompt = await this.getPromptById(promptId);
      if (!prompt) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      // Substitute variables in the prompt content
      const processedContent = this.substituteVariables(prompt.prompt_content, variables);

      // Execute the AI request (this would integrate with your AI service)
      const aiResult = await this.callAIService(processedContent, prompt.ai_model);
      
      const responseTime = Date.now() - startTime;

      // Log the usage
      const usageLogId = await this.logPromptUsage({
        prompt_template_id: promptId,
        user_id: userId,
        project_id: projectId,
        input_text: JSON.stringify(variables),
        generated_content: aiResult.content,
        input_tokens: aiResult.input_tokens,
        output_tokens: aiResult.output_tokens,
        response_time_ms: responseTime,
        success: true,
        ai_model_used: prompt.ai_model
      });

      return {
        content: aiResult.content,
        prompt_template_id: promptId,
        usage_log_id: usageLogId,
        input_tokens: aiResult.input_tokens,
        output_tokens: aiResult.output_tokens,
        response_time_ms: responseTime,
        success: true
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log the failed usage
      const usageLogId = await this.logPromptUsage({
        prompt_template_id: promptId,
        user_id: userId,
        project_id: projectId,
        input_text: JSON.stringify(variables),
        response_time_ms: responseTime,
        success: false,
        error_message: errorMessage
      });

      return {
        content: '',
        prompt_template_id: promptId,
        usage_log_id: usageLogId,
        response_time_ms: responseTime,
        success: false,
        error_message: errorMessage
      };
    }
  }

  /**
   * Create a new prompt template
   */
  async createPrompt(prompt: CreatePromptRequest, userId: string): Promise<PromptTemplate> {
    try {
      // If setting as default, deactivate current default
      if (prompt.is_default) {
        await this.clearDefaultPrompt(prompt.document_type);
      }

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert({
          ...prompt,
          variables: prompt.variables || {},
          ai_model: prompt.ai_model || 'gpt-4',
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create prompt: ${error.message}`);
      }

      // Clear cache for this document type
      this.clearCacheForDocumentType(prompt.document_type);

      return data;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  }

  /**
   * Update an existing prompt template
   */
  async updatePrompt(id: string, updates: UpdatePromptRequest): Promise<PromptTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update prompt: ${error.message}`);
      }

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  /**
   * Activate a prompt (and optionally set as default)
   */
  async activatePrompt(id: string, setAsDefault = false): Promise<void> {
    try {
      const prompt = await this.getPromptById(id);
      if (!prompt) {
        throw new Error(`Prompt not found: ${id}`);
      }

      if (setAsDefault) {
        await this.clearDefaultPrompt(prompt.document_type);
      }

      const { error } = await this.supabase
        .from('prompt_templates')
        .update({ 
          is_active: true,
          is_default: setAsDefault
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to activate prompt: ${error.message}`);
      }

      this.clearCacheForDocumentType(prompt.document_type);
    } catch (error) {
      console.error('Error activating prompt:', error);
      throw error;
    }
  }

  /**
   * Deactivate a prompt
   */
  async deactivatePrompt(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prompt_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to deactivate prompt: ${error.message}`);
      }

      this.clearCache();
    } catch (error) {
      console.error('Error deactivating prompt:', error);
      throw error;
    }
  }

  /**
   * Set a prompt as the default for its document type
   */
  async setDefaultPrompt(id: string): Promise<void> {
    try {
      const prompt = await this.getPromptById(id);
      if (!prompt) {
        throw new Error(`Prompt not found: ${id}`);
      }

      // Clear current default
      await this.clearDefaultPrompt(prompt.document_type);

      // Set new default
      const { error } = await this.supabase
        .from('prompt_templates')
        .update({ is_default: true, is_active: true })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to set default prompt: ${error.message}`);
      }

      this.clearCacheForDocumentType(prompt.document_type);
    } catch (error) {
      console.error('Error setting default prompt:', error);
      throw error;
    }
  }

  /**
   * Get all prompts for a document type
   */
  async getPromptsForDocumentType(documentType: DocumentType): Promise<PromptTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get prompts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting prompts for document type:', error);
      throw error;
    }
  }

  /**
   * Get prompt analytics
   */
  async getPromptAnalytics(promptId?: string, days = 30): Promise<any> {
    try {
      let query = this.supabase
        .from('prompt_usage_logs')
        .select(`
          *,
          prompt_templates (
            name,
            document_type,
            version
          )
        `)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (promptId) {
        query = query.eq('prompt_template_id', promptId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }

      return this.processAnalyticsData(data || []);
    } catch (error) {
      console.error('Error getting prompt analytics:', error);
      throw error;
    }
  }

  /**
   * Prepare a prompt for execution by substituting variables
   * Returns the processed prompt content for external AI service calls
   */
  async preparePrompt(
    promptId: string,
    variables: Record<string, string>
  ): Promise<{
    processedContent: string;
    promptTemplate: PromptTemplate;
  }> {
    const prompt = await this.getPromptById(promptId);
    if (!prompt) {
      throw new Error(`Prompt not found: ${promptId}`);
    }

    const processedContent = this.substituteVariables(prompt.prompt_content, variables);
    
    return {
      processedContent,
      promptTemplate: prompt
    };
  }

  /**
   * Log prompt usage after external AI service call
   */
  async logUsage(
    promptId: string,
    userId: string,
    variables: Record<string, string>,
    aiResponse: {
      content: string;
      input_tokens?: number;
      output_tokens?: number;
    },
    responseTime: number,
    success: boolean,
    errorMessage?: string,
    projectId?: string,
    aiModel?: string
  ): Promise<string> {
    return await this.logPromptUsage({
      prompt_template_id: promptId,
      user_id: userId,
      project_id: projectId || null,
      input_text: JSON.stringify(variables),
      generated_content: success ? aiResponse.content : '',
      input_tokens: aiResponse.input_tokens,
      output_tokens: aiResponse.output_tokens,
      response_time_ms: responseTime,
      success,
      error_message: errorMessage,
      ai_model_used: aiModel
    });
  }

  // Private helper methods

  private async getPromptById(id: string): Promise<PromptTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching prompt by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPromptById:', error);
      return null;
    }
  }

  private async getActiveExperiment(documentType: DocumentType): Promise<PromptExperiment | null> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_experiments')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active experiment:', error);
      }

      return data || null;
    } catch (error) {
      console.error('Error in getActiveExperiment:', error);
      return null;
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private substituteVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value || '');
    }
    
    return result;
  }

  private async callAIService(content: string, model: string): Promise<{
    content: string;
    input_tokens?: number;
    output_tokens?: number;
  }> {
    // This method should be called with the OpenAI API key from the request
    // For now, we'll throw an error since this method shouldn't be used directly
    // The executePrompt method should handle AI calls externally
    throw new Error('callAIService should not be called directly. Use executePrompt with external AI integration.');
  }

  private async logPromptUsage(usage: Omit<PromptUsageLog, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_usage_logs')
        .insert(usage)
        .select('id')
        .single();

      if (error) {
        console.error('Error logging prompt usage:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('Error in logPromptUsage:', error);
      return '';
    }
  }

  private async clearDefaultPrompt(documentType: DocumentType): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_templates')
      .update({ is_default: false })
      .eq('document_type', documentType)
      .eq('is_default', true);

    if (error) {
      console.error('Error clearing default prompt:', error);
    }
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  private clearCacheForDocumentType(documentType: DocumentType): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(documentType)
    );
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  private processAnalyticsData(data: any[]): any {
    // Process and aggregate analytics data
    const totalUsage = data.length;
    const successRate = data.filter(log => log.success).length / totalUsage * 100;
    const avgResponseTime = data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalUsage;
    const totalTokens = data.reduce((sum, log) => sum + (log.input_tokens || 0) + (log.output_tokens || 0), 0);

    return {
      totalUsage,
      successRate,
      avgResponseTime,
      totalTokens,
      rawData: data
    };
  }
}

// Export a singleton instance for client-side usage
export const promptService = new PromptService();

// Export a server-side instance creator
export const createPromptService = () => new PromptService(); 