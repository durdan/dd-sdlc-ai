import { createClient } from '@/lib/supabase/client'
import { Database } from '@/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type SDLCProject = Tables['sdlc_projects']['Row']
type SDLCProjectInsert = Tables['sdlc_projects']['Insert']
type Document = Tables['documents']['Row']
type DocumentInsert = Tables['documents']['Insert']
type UserConfiguration = Tables['user_configurations']['Row']
type UserConfigurationInsert = Tables['user_configurations']['Insert']
type UserConfigurationUpdate = Tables['user_configurations']['Update']

export class DatabaseService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  // SDLC Projects
  async createProject(projectData: SDLCProjectInsert): Promise<SDLCProject | null> {
    const { data, error } = await this.supabase
      .from('sdlc_projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return null
    }
    return data
  }

  async getProjectsByUser(userId: string): Promise<SDLCProject[]> {
    const { data, error } = await this.supabase
      .from('sdlc_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }
    return data || []
  }

  async getProjectById(projectId: string): Promise<SDLCProject | null> {
    const { data, error } = await this.supabase
      .from('sdlc_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }
    return data
  }

  async updateProject(projectId: string, updates: Partial<SDLCProject>): Promise<SDLCProject | null> {
    const { data, error } = await this.supabase
      .from('sdlc_projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }
    return data
  }

  // Documents
  async createDocument(documentData: DocumentInsert): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      return null
    }
    return data
  }

  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }
    return data || []
  }

  async getDocumentByProjectAndType(projectId: string, documentType: string): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('document_type', documentType)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      return null
    }
    return data
  }

  // User Configuration
  async getUserConfiguration(userId: string): Promise<UserConfiguration | null> {
    const { data, error } = await this.supabase
      .from('user_configurations')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no configuration exists, return null without logging error
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching user configuration:', error)
      return null
    }
    return data
  }

  // NEW: Load AI configurations from the new table
  async getUserAIConfigurations(userId: string): Promise<{ openaiKey?: string; claudeKey?: string } | null> {
    try {
      const { data, error } = await this.supabase
        .from('sdlc_user_ai_configurations')
        .select('provider_id, encrypted_api_key, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching AI configurations:', error)
        return null
      }

      const configs = data || []
      const result: { openaiKey?: string; claudeKey?: string } = {}

      // Provider IDs (from database)
      const OPENAI_PROVIDER_ID = '1fdbbf27-6411-476a-bc4d-517c54f68f1d'
      const CLAUDE_PROVIDER_ID = 'a346dae4-1425-45ad-9eab-9e4a1cb53122'

      for (const config of configs) {
        if (config.provider_id === OPENAI_PROVIDER_ID) {
          result.openaiKey = config.encrypted_api_key
        } else if (config.provider_id === CLAUDE_PROVIDER_ID) {
          result.claudeKey = config.encrypted_api_key
        }
      }

      return result
    } catch (error) {
      console.error('Error in getUserAIConfigurations:', error)
      return null
    }
  }

  // Enhanced getUserConfiguration that merges old and new systems
  async getEnhancedUserConfiguration(userId: string): Promise<UserConfiguration | null> {
    try {
      // Load from old system
      const oldConfig = await this.getUserConfiguration(userId)
      
      // Load from new AI system
      const aiConfigs = await this.getUserAIConfigurations(userId)
      
      // Merge configurations
      const mergedConfig: UserConfiguration = {
        id: oldConfig?.id || '',
        user_id: userId,
        openai_api_key: aiConfigs?.openaiKey || oldConfig?.openai_api_key || null,
        jira_base_url: oldConfig?.jira_base_url || null,
        jira_email: oldConfig?.jira_email || null,
        jira_api_token: oldConfig?.jira_api_token || null,
        confluence_base_url: oldConfig?.confluence_base_url || null,
        confluence_email: oldConfig?.confluence_email || null,
        confluence_api_token: oldConfig?.confluence_api_token || null,
        created_at: oldConfig?.created_at || new Date().toISOString(),
        updated_at: oldConfig?.updated_at || new Date().toISOString(),
        slack_workspace_id: oldConfig?.slack_workspace_id || null,
        slack_workspace_name: oldConfig?.slack_workspace_name || null,
        slack_access_token: oldConfig?.slack_access_token || null,
        slack_bot_user_id: oldConfig?.slack_bot_user_id || null,
        slack_default_channel: oldConfig?.slack_default_channel || null,
      }

      return mergedConfig
    } catch (error) {
      console.error('Error in getEnhancedUserConfiguration:', error)
      return null
    }
  }

  async createUserConfiguration(configData: UserConfigurationInsert): Promise<UserConfiguration | null> {
    const { data, error } = await this.supabase
      .from('user_configurations')
      .insert(configData)
      .select()
      .single()

    if (error) {
      console.error('Error creating user configuration:', error)
      return null
    }
    return data
  }

  async updateUserConfiguration(userId: string, updates: UserConfigurationUpdate): Promise<UserConfiguration | null> {
    const { data, error } = await this.supabase
      .from('user_configurations')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user configuration:', error)
      return null
    }
    return data
  }

  async upsertUserConfiguration(userId: string, configData: UserConfigurationUpdate): Promise<UserConfiguration | null> {
    const { data, error } = await this.supabase
      .from('user_configurations')
      .upsert({ user_id: userId, ...configData })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user configuration:', error)
      return null
    }
    return data
  }

  // Progress Logs
  async createProgressLog(projectId: string, step: string, status: string, progress: number, message?: string) {
    const { error } = await this.supabase
      .from('progress_logs')
      .insert({
        project_id: projectId,
        step,
        status,
        progress_percentage: progress,
        message
      })

    if (error) {
      console.error('Error creating progress log:', error)
    }
  }

  // Integrations
  async createIntegration(projectId: string, integrationType: string, externalId: string, externalUrl?: string, metadata?: any) {
    const { data, error } = await this.supabase
      .from('integrations')
      .insert({
        project_id: projectId,
        integration_type: integrationType,
        external_id: externalId,
        external_url: externalUrl,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating integration:', error)
      return null
    }
    return data
  }

  async getIntegrationsByProject(projectId: string) {
    const { data, error } = await this.supabase
      .from('integrations')
      .select('*')
      .eq('project_id', projectId)

    if (error) {
      console.error('Error fetching integrations:', error)
      return []
    }
    return data || []
  }

  // Utility methods for complex operations
  async getProjectWithDocuments(projectId: string): Promise<{
    project: SDLCProject | null,
    documents: Document[]
  }> {
    const [project, documents] = await Promise.all([
      this.getProjectById(projectId),
      this.getDocumentsByProject(projectId)
    ])

    return { project, documents }
  }

  async searchProjectsByInput(userId: string, inputText: string): Promise<SDLCProject[]> {
    const { data, error } = await this.supabase
      .from('sdlc_projects')
      .select('*')
      .eq('user_id', userId)
      .ilike('input_text', `%${inputText}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching projects:', error)
      return []
    }
    return data || []
  }

  // Batch operations for saving complete SDLC results
  async saveCompleteSDLCResult(
    userId: string,
    input: string,
    title: string,
    documents: {
      businessAnalysis: string
      functionalSpec: string
      technicalSpec: string
      uxSpec: string
      architecture: string
    }
  ): Promise<{ project: SDLCProject | null, success: boolean }> {
    try {
      // Create project
      const project = await this.createProject({
        user_id: userId,
        title,
        input_text: input,
        status: 'completed'
      })

      if (!project) {
        return { project: null, success: false }
      }

      // Create all documents
      const documentPromises = Object.entries(documents).map(([type, content]) =>
        this.createDocument({
          project_id: project.id,
          document_type: type,
          content
        })
      )

      await Promise.all(documentPromises)

      return { project, success: true }
    } catch (error) {
      console.error('Error saving complete SDLC result:', error)
      return { project: null, success: false }
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService() 