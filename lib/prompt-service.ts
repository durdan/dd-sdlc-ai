import { createClient } from '@/lib/supabase/client'

// Global cache invalidation mechanism
class GlobalCacheInvalidator {
  private static instance: GlobalCacheInvalidator;
  private invalidationTimestamps: Map<string, number> = new Map();

  static getInstance(): GlobalCacheInvalidator {
    if (!GlobalCacheInvalidator.instance) {
      GlobalCacheInvalidator.instance = new GlobalCacheInvalidator();
    }
    return GlobalCacheInvalidator.instance;
  }

  invalidateDocumentType(documentType: DocumentType): void {
    const key = `system-${documentType}`;
    this.invalidationTimestamps.set(key, Date.now());
    console.log(`🗑️ Global cache invalidated for document type: ${documentType}`);
  }

  isInvalidated(documentType: DocumentType, cacheTime: number): boolean {
    const key = `system-${documentType}`;
    const invalidationTime = this.invalidationTimestamps.get(key) || 0;
    return cacheTime < invalidationTime;
  }

  clearAll(): void {
    this.invalidationTimestamps.clear();
    console.log('🗑️ All global cache invalidation timestamps cleared');
  }
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  document_type: DocumentType;
  prompt_content: string;
  variables: Record<string, string>;
  ai_model: string;
  is_active: boolean;
  is_system_default?: boolean;
  is_personal_default?: boolean;
  version: number;
  prompt_scope: 'system' | 'user';
  user_id?: string;
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

export type DocumentType = 'business' | 'functional' | 'technical' | 'ux' | 'mermaid' | 'wireframe';

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
  is_system_default?: boolean;
}

export interface CreateUserPromptRequest {
  name: string;
  description?: string;
  document_type: DocumentType;
  prompt_content: string;
  variables?: Record<string, string>;
  ai_model?: string;
  is_active?: boolean;
  is_personal_default?: boolean;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
  prompt_content?: string;
  variables?: Record<string, string>;
  ai_model?: string;
  is_active?: boolean;
  is_system_default?: boolean;
  is_personal_default?: boolean;
}

export interface PromptExecutionResult {
  content: string;
  promptSource: 'custom' | 'user' | 'system' | 'fallback';
  promptId?: string;
  promptName?: string;
  responseTime: number;
  usageLogId?: string;
  fallbackReason?: string;
}

export class PromptService {
  private supabase;
  private cache: Map<string, PromptTemplate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private globalInvalidator = GlobalCacheInvalidator.getInstance();

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get the active system prompt for a specific document type
   * @deprecated Use getPromptForExecution for 4-tier hierarchy
   */
  async getActivePrompt(documentType: DocumentType): Promise<PromptTemplate | null> {
    const cacheKey = `active-system-${documentType}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      console.log(`📋 Using cached prompt for ${documentType}`);
      return this.cache.get(cacheKey) || null;
    }

    console.log(`🔍 Fetching fresh prompt from database for ${documentType}`);
    
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('prompt_scope', 'system')
        .eq('is_active', true)
        .eq('is_system_default', true)
        .single();

      if (error) {
        console.error('Error fetching active system prompt:', error);
        console.log('🔍 Query details:', {
          document_type: documentType,
          prompt_scope: 'system', 
          is_active: true,
          is_system_default: true
        });
        return null;
      }

      console.log(`✅ Found active system prompt: ${data.name} (ID: ${data.id})`);
      
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
   * Get prompt for execution with 4-tier hierarchy:
   * 1. Custom prompt (handled by caller)
   * 2. User's personal default prompt
   * 3. System default prompt
   * 4. Hardcoded fallback (handled by caller)
   */
  async getPromptForExecution(
    documentType: DocumentType, 
    userId: string,
    includeUserPrompts = true
  ): Promise<PromptTemplate | null> {
    try {
      // Check for active experiments first
      const experiment = await this.getActiveExperiment(documentType);
      
      if (experiment) {
        // Determine which prompt to use based on user ID and traffic split
        const userHash = this.hashUserId(userId);
        const useVariant = userHash < experiment.traffic_split;
        
        const promptId = useVariant ? experiment.variant_prompt_id : experiment.control_prompt_id;
        return await this.getPromptById(promptId);
      }

      // Priority 2: User's personal default prompt
      if (includeUserPrompts && userId && userId !== 'anonymous') {
        const userPrompt = await this.getUserDefaultPrompt(documentType, userId);
        if (userPrompt) {
          console.log(`Using user default prompt: ${userPrompt.name} for user ${userId}`);
          return userPrompt;
        }
      }

      // Priority 3: System default prompt
      const systemPrompt = await this.getActivePrompt(documentType);
      if (systemPrompt) {
        console.log(`Using system default prompt: ${systemPrompt.name}`);
        return systemPrompt;
      }

      return null;
    } catch (error) {
      console.error('Error in getPromptForExecution:', error);
      // Fallback to system prompt
      return await this.getActivePrompt(documentType);
    }
  }

  /**
   * Get user's default prompt for a document type
   */
  async getUserDefaultPrompt(documentType: DocumentType, userId: string): Promise<PromptTemplate | null> {
    const cacheKey = `user-default-${documentType}-${userId}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey) || null;
    }

    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('prompt_scope', 'user')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_personal_default', true)
        .single();

      if (error) {
        // No user default found - this is normal
        return null;
      }

      // Cache the result
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return data;
    } catch (error) {
      console.error('Error in getUserDefaultPrompt:', error);
      return null;
    }
  }

  /**
   * Get all user prompts for a specific user and document type
   */
  async getUserPrompts(userId: string, documentType?: DocumentType): Promise<PromptTemplate[]> {
    try {
      let query = this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('prompt_scope', 'user')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user prompts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserPrompts:', error);
      return [];
    }
  }

  /**
   * Create a new user prompt
   */
  async createUserPrompt(prompt: CreateUserPromptRequest, userId: string): Promise<PromptTemplate> {
    try {
      // If this is set as personal default, clear existing defaults
      if (prompt.is_personal_default) {
        await this.clearUserDefaultPrompt(prompt.document_type, userId);
      }

      const newPrompt = {
        name: prompt.name,
        description: prompt.description,
        document_type: prompt.document_type,
        prompt_content: prompt.prompt_content,
        variables: prompt.variables || {},
        ai_model: prompt.ai_model || 'gpt-4',
        prompt_scope: 'user' as const,
        user_id: userId,
        is_active: prompt.is_active !== false, // Default to true
        is_personal_default: prompt.is_personal_default || false,
        version: 1,
        created_by: userId
      };

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert(newPrompt)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create user prompt: ${error.message}`);
      }

      // Clear cache for this user and document type
      this.clearCacheForUser(userId, prompt.document_type);

      return data;
    } catch (error) {
      console.error('Error creating user prompt:', error);
      throw error;
    }
  }

  /**
   * Update a user prompt (only if user owns it)
   */
  async updateUserPrompt(id: string, updates: UpdatePromptRequest, userId: string): Promise<PromptTemplate> {
    try {
      // First verify the user owns this prompt
      const existingPrompt = await this.getUserPromptById(id, userId);
      if (!existingPrompt) {
        throw new Error('Prompt not found or access denied');
      }

      // If setting as personal default, clear existing defaults
      if (updates.is_personal_default) {
        await this.clearUserDefaultPrompt(existingPrompt.document_type, userId);
      }

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only update their own prompts
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user prompt: ${error.message}`);
      }

      // Clear cache
      this.clearCacheForUser(userId, data.document_type);

      return data;
    } catch (error) {
      console.error('Error updating user prompt:', error);
      throw error;
    }
  }

  /**
   * Delete a user prompt (only if user owns it)
   */
  async deleteUserPrompt(id: string, userId: string): Promise<void> {
    try {
      // First verify the user owns this prompt
      const existingPrompt = await this.getUserPromptById(id, userId);
      if (!existingPrompt) {
        throw new Error('Prompt not found or access denied');
      }

      const { error } = await this.supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only delete their own prompts

      if (error) {
        throw new Error(`Failed to delete user prompt: ${error.message}`);
      }

      // Clear cache
      this.clearCacheForUser(userId, existingPrompt.document_type);
    } catch (error) {
      console.error('Error deleting user prompt:', error);
      throw error;
    }
  }

  /**
   * Set a user prompt as personal default
   */
  async setPersonalDefaultPrompt(id: string, userId: string): Promise<void> {
    try {
      // First verify the user owns this prompt
      const prompt = await this.getUserPromptById(id, userId);
      if (!prompt) {
        throw new Error('Prompt not found or access denied');
      }

      // Clear existing default for this document type
      await this.clearUserDefaultPrompt(prompt.document_type, userId);

      // Set this prompt as default
      const { error } = await this.supabase
        .from('prompt_templates')
        .update({ is_personal_default: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to set personal default: ${error.message}`);
      }

      // Clear cache
      this.clearCacheForUser(userId, prompt.document_type);
    } catch (error) {
      console.error('Error setting personal default prompt:', error);
      throw error;
    }
  }

  /**
   * Get user's personal analytics
   */
  async getUserPromptAnalytics(userId: string, days = 30): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_prompts_with_stats')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user prompt analytics:', error);
        return { prompts: [], totalUsage: 0, averageResponseTime: 0 };
      }

      const totalUsage = data.reduce((sum, prompt) => sum + (prompt.usage_count || 0), 0);
      const averageResponseTime = data.length > 0 
        ? data.reduce((sum, prompt) => sum + (prompt.avg_response_time || 0), 0) / data.length 
        : 0;

      return {
        prompts: data,
        totalUsage,
        averageResponseTime,
        promptCount: data.length
      };
    } catch (error) {
      console.error('Error in getUserPromptAnalytics:', error);
      return { prompts: [], totalUsage: 0, averageResponseTime: 0 };
    }
  }

  /**
   * Get a user prompt by ID (only if user owns it)
   */
  private async getUserPromptById(id: string, userId: string): Promise<PromptTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('id', id)
        .eq('prompt_scope', 'user')
        .eq('user_id', userId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user prompt by ID:', error);
      return null;
    }
  }

  /**
   * Clear user's default prompt for a document type
   */
  private async clearUserDefaultPrompt(documentType: DocumentType, userId: string): Promise<void> {
    try {
      await this.supabase
        .from('prompt_templates')
        .update({ is_personal_default: false })
        .eq('document_type', documentType)
        .eq('prompt_scope', 'user')
        .eq('user_id', userId)
        .eq('is_personal_default', true);
    } catch (error) {
      console.error('Error clearing user default prompt:', error);
    }
  }

  /**
   * Clear cache for a specific user and document type
   */
  private clearCacheForUser(userId: string, documentType: DocumentType): void {
    const userCacheKey = `user-default-${documentType}-${userId}`;
    this.cache.delete(userCacheKey);
    this.cacheExpiry.delete(userCacheKey);
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
      
      // Log the failed usage
      const usageLogId = await this.logPromptUsage({
        prompt_template_id: promptId,
        user_id: userId,
        project_id: projectId,
        input_text: JSON.stringify(variables),
        generated_content: '',
        response_time_ms: responseTime,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Create a system prompt (admin only)
   */
  async createPrompt(prompt: CreatePromptRequest, userId: string): Promise<PromptTemplate> {
    try {
      // If this is set as default, clear existing defaults
      if (prompt.is_system_default) {
        await this.clearDefaultPrompt(prompt.document_type);
      }

      const newPrompt = {
        name: prompt.name,
        description: prompt.description,
        document_type: prompt.document_type,
        prompt_content: prompt.prompt_content,
        variables: prompt.variables || {},
        ai_model: prompt.ai_model || 'gpt-4',
        prompt_scope: 'system' as const,
        user_id: null, // System prompts have no user_id
        is_active: prompt.is_active !== false, // Default to true
        is_system_default: prompt.is_system_default || false,
        version: 1,
        created_by: userId
      };

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert(newPrompt)
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
   * Update a system prompt (admin only)
   */
  async updatePrompt(id: string, updates: UpdatePromptRequest): Promise<PromptTemplate> {
    try {
      // Get the existing prompt to check document type
      const existingPrompt = await this.getPromptById(id);
      if (!existingPrompt) {
        throw new Error('Prompt not found');
      }

      // If setting as default, clear existing defaults
      if (updates.is_system_default) {
        await this.clearDefaultPrompt(existingPrompt.document_type);
      }

      // Map is_default to is_system_default for backward compatibility
      const updateData = { ...updates };
      if ('is_default' in updates) {
        updateData.is_system_default = updates.is_default;
        delete updateData.is_default;
      }

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('prompt_scope', 'system') // Only allow updating system prompts
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update prompt: ${error.message}`);
      }

      // Clear cache
      this.clearCacheForDocumentType(data.document_type);

      return data;
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  /**
   * Activate a prompt
   */
  async activatePrompt(id: string, setAsDefault = false): Promise<void> {
    try {
      const prompt = await this.getPromptById(id);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      if (setAsDefault) {
        if (prompt.prompt_scope === 'system') {
          await this.clearDefaultPrompt(prompt.document_type);
        } else if (prompt.prompt_scope === 'user' && prompt.user_id) {
          await this.clearUserDefaultPrompt(prompt.document_type, prompt.user_id);
        }
      }

      const updateData: any = { is_active: true };
      if (setAsDefault) {
        if (prompt.prompt_scope === 'system') {
          updateData.is_system_default = true;
        } else {
          updateData.is_personal_default = true;
        }
      }

      const { error } = await this.supabase
        .from('prompt_templates')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to activate prompt: ${error.message}`);
      }

      // Clear cache
      if (prompt.prompt_scope === 'system') {
        this.clearCacheForDocumentType(prompt.document_type);
      } else if (prompt.user_id) {
        this.clearCacheForUser(prompt.user_id, prompt.document_type);
      }
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
      const prompt = await this.getPromptById(id);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      const updateData: any = { is_active: false };
      
      // If this was a default prompt, also remove default status
      if (prompt.prompt_scope === 'system' && prompt.is_system_default) {
        updateData.is_system_default = false;
      } else if (prompt.prompt_scope === 'user' && prompt.is_personal_default) {
        updateData.is_personal_default = false;
      }

      const { error } = await this.supabase
        .from('prompt_templates')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to deactivate prompt: ${error.message}`);
      }

      // Clear cache
      if (prompt.prompt_scope === 'system') {
        this.clearCacheForDocumentType(prompt.document_type);
      } else if (prompt.user_id) {
        this.clearCacheForUser(prompt.user_id, prompt.document_type);
      }
    } catch (error) {
      console.error('Error deactivating prompt:', error);
      throw error;
    }
  }

  /**
   * Set a system prompt as default (admin only)
   */
  async setDefaultPrompt(id: string): Promise<void> {
    try {
      const prompt = await this.getPromptById(id);
      if (!prompt) {
        throw new Error('Prompt not found');
      }

      if (prompt.prompt_scope !== 'system') {
        throw new Error('Only system prompts can be set as system default');
      }

      // Clear existing default
      await this.clearDefaultPrompt(prompt.document_type);

      // Set new default
      const { error } = await this.supabase
        .from('prompt_templates')
        .update({ 
          is_system_default: true,
          is_active: true // Ensure it's also active
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to set default prompt: ${error.message}`);
      }

      // Clear cache
      this.clearCacheForDocumentType(prompt.document_type);
    } catch (error) {
      console.error('Error setting default prompt:', error);
      throw error;
    }
  }

  /**
   * Get all prompts for a document type (system prompts only for backward compatibility)
   */
  async getPromptsForDocumentType(documentType: DocumentType): Promise<PromptTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('prompt_scope', 'system')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts for document type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPromptsForDocumentType:', error);
      return [];
    }
  }

  /**
   * Get prompt analytics with optional filtering
   */
  async getPromptAnalytics(promptId?: string, days = 30): Promise<any> {
    try {
      let query = this.supabase
        .from('prompt_analytics')
        .select('*');

      if (promptId) {
        query = query.eq('id', promptId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching prompt analytics:', error);
        return [];
      }

      return this.processAnalyticsData(data || []);
    } catch (error) {
      console.error('Error in getPromptAnalytics:', error);
      return [];
    }
  }

  /**
   * Prepare a prompt for execution with variable substitution
   */
  async preparePrompt(
    promptId: string,
    variables: Record<string, string>
  ): Promise<{
    processedContent: string;
    promptTemplate: PromptTemplate;
  }> {
    try {
      const promptTemplate = await this.getPromptById(promptId);
      if (!promptTemplate) {
        throw new Error(`Prompt not found: ${promptId}`);
      }

      const processedContent = this.substituteVariables(promptTemplate.prompt_content, variables);

      return {
        processedContent,
        promptTemplate
      };
    } catch (error) {
      console.error('Error preparing prompt:', error);
      throw error;
    }
  }

  /**
   * Log prompt usage for analytics
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
    try {
      const usageLog = {
        prompt_template_id: promptId,
        user_id: userId,
        project_id: projectId,
        input_text: JSON.stringify(variables),
        generated_content: aiResponse.content,
        input_tokens: aiResponse.input_tokens,
        output_tokens: aiResponse.output_tokens,
        response_time_ms: responseTime,
        success,
        error_message: errorMessage,
        ai_model_used: aiModel
      };

      return await this.logPromptUsage(usageLog);
    } catch (error) {
      console.error('Error logging usage:', error);
      throw error;
    }
  }

  // Private methods remain mostly the same but with updated logic for user prompts

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
        .single();

      if (error) {
        return null;
      }

      return data;
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
    return Math.abs(hash) % 100;
  }

  private substituteVariables(content: string, variables: Record<string, string>): string {
    let processedContent = content;
    
    for (const [key, value] of Object.entries(variables)) {
      // Handle {{variable}} syntax (double curly braces)
      const doubleBraceRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(doubleBraceRegex, value);
      
      // Handle {variable} syntax (single curly braces)
      const singleBraceRegex = new RegExp(`\\{${key}\\}`, 'g');
      processedContent = processedContent.replace(singleBraceRegex, value);
    }
    
    return processedContent;
  }

  private async callAIService(content: string, model: string): Promise<{
    content: string;
    input_tokens?: number;
    output_tokens?: number;
  }> {
    // This is a mock implementation
    // In practice, this would call your AI service (OpenAI, Claude, etc.)
    return {
      content: `Mock AI response for: ${content.substring(0, 50)}...`,
      input_tokens: Math.floor(content.length / 4),
      output_tokens: 100
    };
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
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error in logPromptUsage:', error);
      throw error;
    }
  }

  private async clearDefaultPrompt(documentType: DocumentType): Promise<void> {
    try {
      await this.supabase
        .from('prompt_templates')
        .update({ is_system_default: false })
        .eq('document_type', documentType)
        .eq('prompt_scope', 'system')
        .eq('is_system_default', true);
    } catch (error) {
      console.error('Error clearing default prompt:', error);
    }
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() >= expiry) {
      return false;
    }

    // Check for global invalidation for system prompts
    if (key.startsWith('active-system-')) {
      const documentType = key.replace('active-system-', '') as DocumentType;
      if (this.globalInvalidator.isInvalidated(documentType, expiry)) {
        console.log(`🗑️ Cache invalidated globally for ${documentType}, forcing refresh`);
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        return false;
      }
    }

    return true;
  }

  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  private clearCacheForDocumentType(documentType: DocumentType): void {
    // Clear system prompt cache
    const systemCacheKey = `active-system-${documentType}`;
    this.cache.delete(systemCacheKey);
    this.cacheExpiry.delete(systemCacheKey);
    
    // Clear legacy cache key
    const legacyCacheKey = `active-${documentType}`;
    this.cache.delete(legacyCacheKey);
    this.cacheExpiry.delete(legacyCacheKey);

    // Trigger global cache invalidation for all PromptService instances
    this.globalInvalidator.invalidateDocumentType(documentType);
  }

  private processAnalyticsData(data: any[]): any {
    if (!data || data.length === 0) {
      return {
        totalUsage: 0,
        averageResponseTime: 0,
        successRate: 0,
        prompts: []
      };
    }

    const totalUsage = data.reduce((sum, item) => sum + (item.usage_count || 0), 0);
    const averageResponseTime = data.reduce((sum, item) => sum + (item.avg_response_time || 0), 0) / data.length;
    const averageSuccessRate = data.reduce((sum, item) => sum + (item.success_rate || 0), 0) / data.length;

    return {
      totalUsage,
      averageResponseTime,
      successRate: averageSuccessRate,
      prompts: data
    };
  }
}

export const createPromptService = () => new PromptService(); 