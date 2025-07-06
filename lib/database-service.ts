import { createClient } from '@/lib/supabase/client'
import { Database } from '@/database.types'

type Tables = Database['public']['Tables']
type SDLCProject = Tables['sdlc_projects']['Row']
type SDLCProjectInsert = Tables['sdlc_projects']['Insert']
type Document = Tables['documents']['Row']
type DocumentInsert = Tables['documents']['Insert']
type UserConfiguration = Tables['user_configurations']['Row']
type UserConfigurationInsert = Tables['user_configurations']['Insert']
type UserConfigurationUpdate = Tables['user_configurations']['Update']

export class DatabaseService {
  private supabase = createClient()

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