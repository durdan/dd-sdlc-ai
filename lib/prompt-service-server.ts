// Server-side prompt service for API routes
import { createServiceClient } from '@/lib/supabase/service'
import { DocumentType, PromptTemplate } from './prompt-service'

// Global cache invalidation mechanism (reused from client service)
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

export class ServerPromptService {
  private serverSupabase: any = null;
  private cache: Map<string, PromptTemplate> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private globalInvalidator = GlobalCacheInvalidator.getInstance();

  private getServerClient() {
    if (!this.serverSupabase) {
      this.serverSupabase = createServiceClient();
    }
    return this.serverSupabase;
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

  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  async getActivePrompt(documentType: DocumentType): Promise<PromptTemplate | null> {
    const cacheKey = `active-system-${documentType}`;
    
    // Check cache first
    if (this.isValidCache(cacheKey)) {
      console.log(`📋 Using cached prompt for ${documentType}`);
      return this.cache.get(cacheKey) || null;
    }

    console.log(`🔍 Fetching fresh prompt from database for ${documentType} (server-side)`);
    
    try {
      const supabase = this.getServerClient();
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('prompt_scope', 'system')
        .eq('is_active', true)
        .eq('is_system_default', true)
        .single();

      if (error) {
        console.error('Error fetching active system prompt (server):', error);
        console.log('🔍 Query details:', {
          document_type: documentType,
          prompt_scope: 'system', 
          is_active: true,
          is_system_default: true
        });
        return null;
      }

      console.log(`✅ Found active system prompt (server): ${data.name} (ID: ${data.id})`);
      
      // Cache the result
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return data;
    } catch (error) {
      console.error('Error in getActivePrompt (server):', error);
      return null;
    }
  }

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

      // Priority 3: System default prompt (using server-side method)
      const systemPrompt = await this.getActivePrompt(documentType);
      if (systemPrompt) {
        console.log(`Using system default prompt: ${systemPrompt.name}`);
        return systemPrompt;
      }

      return null;
    } catch (error) {
      console.error('Error in getPromptForExecution (server):', error);
      // Fallback to system prompt
      return await this.getActivePrompt(documentType);
    }
  }

  async getUserDefaultPrompt(documentType: DocumentType, userId: string): Promise<PromptTemplate | null> {
    try {
      const supabase = this.getServerClient();
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('prompt_scope', 'user')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_personal_default', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user default prompt:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getUserDefaultPrompt (server):', error);
      return null;
    }
  }

  async preparePrompt(
    promptId: string,
    variables: Record<string, string>
  ): Promise<{
    processedContent: string;
    promptTemplate: PromptTemplate;
  }> {
    const promptTemplate = await this.getPromptById(promptId);
    if (!promptTemplate) {
      throw new Error('Prompt template not found');
    }

    let processedContent = promptTemplate.prompt_content;
    
    // Replace variables in the content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedContent = processedContent.replace(regex, value);
    }

    return {
      processedContent,
      promptTemplate
    };
  }

  private async getActiveExperiment(documentType: DocumentType): Promise<any> {
    try {
      const supabase = this.getServerClient();
      const { data, error } = await supabase
        .from('prompt_experiments')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active experiment:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getActiveExperiment (server):', error);
      return null;
    }
  }

  private async getPromptById(id: string): Promise<PromptTemplate | null> {
    try {
      const supabase = this.getServerClient();
      const { data, error } = await supabase
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
      console.error('Error in getPromptById (server):', error);
      return null;
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100; // Return percentage 0-99
  }

  // Public methods for cache management (for testing)
  public clearCacheForType(documentType: DocumentType): void {
    this.clearCacheForDocumentType(documentType);
  }

  public clearAllCache(): void {
    this.clearCache();
  }

  // Usage logging method
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
      const supabase = this.getServerClient();
      
      const { data, error } = await supabase
        .from('prompt_usage_logs')
        .insert({
          prompt_template_id: promptId,
          user_id: userId,
          project_id: projectId,
          input_text: JSON.stringify(variables),
          generated_content: aiResponse.content,
          input_tokens: aiResponse.input_tokens,
          output_tokens: aiResponse.output_tokens,
          response_time_ms: responseTime,
          success: success,
          error_message: errorMessage,
          ai_model_used: aiModel || 'gpt-4o',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error logging prompt usage:', error);
        return '';
      }

      return data.id;
    } catch (error) {
      console.error('Error in logUsage:', error);
      return '';
    }
  }
}

export const createServerPromptService = () => new ServerPromptService(); 