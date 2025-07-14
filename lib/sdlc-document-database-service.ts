import { createClient } from '@/lib/supabase/client'
import { Database } from '@/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type SDLCProject = Tables['sdlc_projects']['Row']
type Document = Tables['documents']['Row']

export interface SDLCDocumentData {
  id: string
  title: string
  content: string
  document_type: string
  created_at: string
  updated_at: string
  description?: string
  linked_projects?: {
    github?: Array<{
      url: string
      name: string
      created_at: string
    }>
    clickup?: Array<{
      url: string
      name: string
      created_at: string
    }>
    trello?: Array<{
      url: string
      name: string
      created_at: string
    }>
  }
}

export interface CreateSDLCDocumentData {
  title: string
  content: string
  description?: string
  document_type?: string
}

export interface UpdateSDLCDocumentData {
  title?: string
  content?: string
  description?: string
  linked_projects?: SDLCDocumentData['linked_projects']
}

export class SDLCDocumentDatabaseService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  /**
   * Get current user from session
   */
  private async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) {
      throw new Error('User not authenticated')
    }
    return user
  }

  /**
   * Get all SDLC documents for the current user
   */
  async getUserSDLCDocuments(): Promise<SDLCDocumentData[]> {
    try {
      const user = await this.getCurrentUser()
      
      // Use the custom function to get documents with project info
      const { data, error } = await this.supabase
        .rpc('get_user_sdlc_documents', { user_uuid: user.id })

      if (error) {
        console.error('Error fetching user SDLC documents:', error)
        return []
      }

      return (data || []).map((item: any) => ({
        id: item.project_id,
        title: item.title,
        content: item.content,
        document_type: item.document_type,
        created_at: item.created_at,
        updated_at: item.updated_at,
        description: item.description,
        linked_projects: item.linked_projects || {}
      }))
    } catch (error) {
      console.error('Error in getUserSDLCDocuments:', error)
      return []
    }
  }

  /**
   * Get a specific SDLC document by ID
   */
  async getSDLCDocumentById(documentId: string): Promise<SDLCDocumentData | null> {
    try {
      const user = await this.getCurrentUser()
      
      // Get project with associated document
      const { data: project, error: projectError } = await this.supabase
        .from('sdlc_projects')
        .select(`
          *,
          documents (*)
        `)
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (projectError || !project) {
        console.error('Error fetching SDLC document:', projectError)
        return null
      }

      // Get the primary document (comprehensive_sdlc type preferred)
      const documents = project.documents as Document[]
      const primaryDoc = documents.find(d => d.document_type === 'comprehensive_sdlc') || documents[0]

      if (!primaryDoc) {
        return null
      }

      return {
        id: project.id,
        title: project.title,
        content: primaryDoc.content,
        document_type: primaryDoc.document_type,
        created_at: primaryDoc.created_at,
        updated_at: project.updated_at,
        description: project.description || undefined,
        linked_projects: (project as any).linked_projects || {}
      }
    } catch (error) {
      console.error('Error in getSDLCDocumentById:', error)
      return null
    }
  }

  /**
   * Create a new SDLC document
   */
  async createSDLCDocument(documentData: CreateSDLCDocumentData): Promise<SDLCDocumentData | null> {
    try {
      const user = await this.getCurrentUser()
      
      // Use the custom function to save comprehensive SDLC document
      const { data: projectId, error } = await this.supabase
        .rpc('save_comprehensive_sdlc_document', {
          user_uuid: user.id,
          doc_title: documentData.title,
          doc_description: documentData.description || '',
          doc_content: documentData.content,
          doc_metadata: {
            document_type: documentData.document_type || 'comprehensive_sdlc',
            created_via: 'sdlc_document_manager'
          }
        })

      if (error || !projectId) {
        console.error('Error creating SDLC document:', error)
        return null
      }

      // Return the created document
      return await this.getSDLCDocumentById(projectId)
    } catch (error) {
      console.error('Error in createSDLCDocument:', error)
      return null
    }
  }

  /**
   * Update an existing SDLC document
   */
  async updateSDLCDocument(documentId: string, updates: UpdateSDLCDocumentData): Promise<SDLCDocumentData | null> {
    try {
      const user = await this.getCurrentUser()
      
      // Update project information
      const projectUpdates: any = {}
      if (updates.title !== undefined) projectUpdates.title = updates.title
      if (updates.description !== undefined) projectUpdates.description = updates.description
      if (updates.linked_projects !== undefined) projectUpdates.linked_projects = updates.linked_projects
      
      if (Object.keys(projectUpdates).length > 0) {
        projectUpdates.updated_at = new Date().toISOString()
        
        const { error: projectError } = await this.supabase
          .from('sdlc_projects')
          .update(projectUpdates)
          .eq('id', documentId)
          .eq('user_id', user.id)

        if (projectError) {
          console.error('Error updating project:', projectError)
          return null
        }
      }

      // Update document content if provided
      if (updates.content !== undefined) {
        // Get the primary document to update
        const { data: documents, error: docsError } = await this.supabase
          .from('documents')
          .select('*')
          .eq('project_id', documentId)
          .eq('document_type', 'comprehensive_sdlc')

        if (docsError) {
          console.error('Error fetching document to update:', docsError)
          return null
        }

        if (documents && documents.length > 0) {
          const { error: updateError } = await this.supabase
            .from('documents')
            .update({ content: updates.content })
            .eq('id', documents[0].id)

          if (updateError) {
            console.error('Error updating document content:', updateError)
            return null
          }
        }
      }

      // Return the updated document
      return await this.getSDLCDocumentById(documentId)
    } catch (error) {
      console.error('Error in updateSDLCDocument:', error)
      return null
    }
  }

  /**
   * Delete an SDLC document
   */
  async deleteSDLCDocument(documentId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      
      // Delete the project (cascades to documents and integrations)
      const { error } = await this.supabase
        .from('sdlc_projects')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting SDLC document:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteSDLCDocument:', error)
      return false
    }
  }

  /**
   * Update linked projects for a document
   */
  async updateLinkedProjects(documentId: string, linkedProjects: SDLCDocumentData['linked_projects']): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      
      // Use the custom function to update linked projects
      const { data, error } = await this.supabase
        .rpc('update_project_linked_projects', {
          project_uuid: documentId,
          user_uuid: user.id,
          linked_data: linkedProjects || {}
        })

      if (error) {
        console.error('Error updating linked projects:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Error in updateLinkedProjects:', error)
      return false
    }
  }

  /**
   * Search SDLC documents by title or content
   */
  async searchSDLCDocuments(query: string): Promise<SDLCDocumentData[]> {
    try {
      const user = await this.getCurrentUser()
      
      // Search in both title and content
      const { data, error } = await this.supabase
        .from('sdlc_projects')
        .select(`
          *,
          documents (*)
        `)
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error searching SDLC documents:', error)
        return []
      }

      return (data || []).map(project => {
        const documents = (project as any).documents as Document[]
        const primaryDoc = documents.find(d => d.document_type === 'comprehensive_sdlc') || documents[0]
        
        if (!primaryDoc) return null

        return {
          id: project.id,
          title: project.title,
          content: primaryDoc.content,
          document_type: primaryDoc.document_type,
          created_at: primaryDoc.created_at,
          updated_at: project.updated_at,
          description: project.description || undefined,
          linked_projects: (project as any).linked_projects || {}
        }
      }).filter(Boolean) as SDLCDocumentData[]
    } catch (error) {
      console.error('Error in searchSDLCDocuments:', error)
      return []
    }
  }
} 