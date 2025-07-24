import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type WireframePrompt = Database['public']['Tables']['wireframe_prompts']['Row'];
type WireframePromptInsert = Database['public']['Tables']['wireframe_prompts']['Insert'];
type WireframePromptUpdate = Database['public']['Tables']['wireframe_prompts']['Update'];

export interface WireframePromptTemplate {
  id: string;
  name: string;
  description: string | null;
  prompt_template: string;
  category: string | null;
  layout_type: string | null;
  variables: any[];
  is_active: boolean;
  is_default: boolean;
}

export class WireframePromptService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get all active wireframe prompts
   */
  async getActivePrompts(): Promise<WireframePromptTemplate[]> {
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching wireframe prompts:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get prompts by category
   */
  async getPromptsByCategory(category: string): Promise<WireframePromptTemplate[]> {
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching prompts by category:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get the default prompt for a category
   */
  async getDefaultPrompt(category: string = 'general'): Promise<WireframePromptTemplate | null> {
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .select('*')
      .eq('category', category)
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching default prompt:', error);
      return null;
    }

    return data;
  }

  /**
   * Get prompt by ID
   */
  async getPromptById(id: string): Promise<WireframePromptTemplate | null> {
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching prompt by ID:', error);
      return null;
    }

    return data;
  }

  /**
   * Create a new wireframe prompt
   */
  async createPrompt(prompt: Omit<WireframePromptInsert, 'id' | 'created_at' | 'updated_at'>): Promise<WireframePromptTemplate | null> {
    const { data: userData } = await this.supabase.auth.getUser();
    
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .insert({
        ...prompt,
        created_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wireframe prompt:', error);
      return null;
    }

    return data;
  }

  /**
   * Update an existing wireframe prompt
   */
  async updatePrompt(id: string, updates: WireframePromptUpdate): Promise<WireframePromptTemplate | null> {
    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wireframe prompt:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete a wireframe prompt
   */
  async deletePrompt(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('wireframe_prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wireframe prompt:', error);
      return false;
    }

    return true;
  }

  /**
   * Get template prompts (for UI selection)
   */
  async getTemplatePrompts(): Promise<WireframePromptTemplate[]> {
    return this.getPromptsByCategory('templates');
  }

  /**
   * Get enhancement prompts
   */
  async getEnhancementPrompts(): Promise<WireframePromptTemplate[]> {
    return this.getPromptsByCategory('enhancement');
  }

  /**
   * Process prompt template with variables
   */
  processPromptTemplate(template: string, variables: Record<string, any>): string {
    let processedPrompt = template;

    // Simple variable replacement
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedPrompt = processedPrompt.replace(regex, String(value));
    });

    // Handle conditional sections (simple implementation)
    // {{#if variable}}content{{else}}alternative{{/if}}
    const conditionalRegex = /{{#if\s+(\w+)}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;
    processedPrompt = processedPrompt.replace(conditionalRegex, (match, variable, ifContent, elseContent = '') => {
      return variables[variable] ? ifContent : elseContent;
    });

    return processedPrompt;
  }

  /**
   * Get user's custom prompts
   */
  async getUserPrompts(): Promise<WireframePromptTemplate[]> {
    const { data: userData } = await this.supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('wireframe_prompts')
      .select('*')
      .eq('created_by', userData.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }

    return data || [];
  }
}

// Export singleton instance
export const wireframePromptService = new WireframePromptService();