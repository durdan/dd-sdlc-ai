import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { Database } from '@/database.types'

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
  userId?: string
}

export interface UpdateSDLCDocumentData {
  title?: string
  content?: string
  description?: string
  linked_projects?: SDLCDocumentData['linked_projects']
}

export class SDLCDocumentDatabaseService {
  private supabase: any

  constructor() {
    this.supabase = createServiceClient()
  }

  /**
   * Get the current authenticated user
   */
  private async getCurrentUser() {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.log('No authenticated user found')
        return null
      }
      return user
    } catch (error) {
      console.log('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get all SDLC documents for the current user
   */
  async getUserSDLCDocuments(): Promise<SDLCDocumentData[]> {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        console.log('No authenticated user, returning empty documents list')
        return []
      }
      
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
      
      if (!user) {
        console.log('No authenticated user, cannot fetch document')
        return null
      }
      
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
      let userId = documentData.userId
      if (!userId) {
        try {
          userId = (await this.getCurrentUser())?.id
        } catch (error) {
          console.error('No user ID provided and no authenticated user found:', error)
          return null
        }
      }
      
      console.log('🔍 Creating SDLC document with userId:', userId)
      
      // Use the custom function to save comprehensive SDLC document
      const { data: projectId, error } = await this.supabase
        .rpc('save_comprehensive_sdlc_document', {
          user_uuid: userId,
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
      
      if (!user) {
        console.log('No authenticated user, cannot update document')
        return null
      }
      
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

      return await this.getSDLCDocumentById(documentId)
    } catch (error) {
      console.error('Error in updateSDLCDocument:', error)
      return null
    }
  }

  /**
   * Add or update individual document for a project
   */
  async addOrUpdateIndividualDocument(projectId: string, documentType: string, content: string, selectedSections?: string[], generationType?: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        console.log('No authenticated user, cannot update individual document')
        return false
      }
      
      // Check if document already exists
      const { data: existingDoc, error: fetchError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('document_type', documentType)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing document:', fetchError)
        return false
      }

      if (existingDoc) {
        // Update existing document
        const { error: updateError } = await this.supabase
          .from('documents')
          .update({ content })
          .eq('id', existingDoc.id)

        if (updateError) {
          console.error('Error updating individual document:', updateError)
          return false
        }
      } else {
        // Create new document
        const insertData: any = {
          project_id: projectId,
          document_type: documentType,
          content,
          version: 1
        }
        if (selectedSections !== undefined) {
          insertData.selected_sections = selectedSections
        }
        if (generationType !== undefined) {
          insertData.generation_type = generationType
        }
        
        const { error: insertError } = await this.supabase
          .from('documents')
          .insert(insertData)

        if (insertError) {
          console.error('Error creating individual document:', insertError)
          return false
        }
      }

      // Update project timestamp
      await this.supabase
        .from('sdlc_projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId)

      console.log(`✅ Individual document ${documentType} ${existingDoc ? 'updated' : 'created'} for project ${projectId}`)
      return true
    } catch (error) {
      console.error('Error in addOrUpdateIndividualDocument:', error)
      return false
    }
  }

  /**
   * Get all documents for a project
   */
  async getProjectDocuments(projectId: string): Promise<{ [key: string]: string }> {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        console.log('No authenticated user, cannot fetch project documents')
        return {}
      }
      
      const { data: documents, error } = await this.supabase
        .from('documents')
        .select('document_type, content')
        .eq('project_id', projectId)

      if (error) {
        console.error('Error fetching project documents:', error)
        return {}
      }

      const result: { [key: string]: string } = {}
      documents?.forEach((doc: any) => {
        result[doc.document_type] = doc.content
      })

      return result
    } catch (error) {
      console.error('Error in getProjectDocuments:', error)
      return {}
    }
  }

  /**
   * Delete an SDLC document
   */
  async deleteSDLCDocument(documentId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        console.log('No authenticated user, cannot delete document')
        return false
      }
      
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
      
      if (!user) {
        console.log('No authenticated user, cannot update linked projects')
        return false
      }
      
      const { error } = await this.supabase
        .rpc('update_project_linked_projects', {
          project_uuid: documentId,
          user_uuid: user.id,
          linked_data: linkedProjects || {}
        })

      if (error) {
        console.error('Error updating linked projects:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateLinkedProjects:', error)
      return false
    }
  }

  /**
   * Search SDLC documents by title or description
   */
  async searchSDLCDocuments(query: string): Promise<SDLCDocumentData[]> {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        console.log('No authenticated user, cannot search documents')
        return []
      }
      
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

      return (data || []).map((project: any) => {
        const documents = project.documents as Document[]
        const primaryDoc = documents.find(d => d.document_type === 'comprehensive_sdlc') || documents[0]

        return {
          id: project.id,
          title: project.title,
          content: primaryDoc?.content || '',
          document_type: primaryDoc?.document_type || 'comprehensive_sdlc',
          created_at: primaryDoc?.created_at || project.created_at,
          updated_at: project.updated_at,
          description: project.description || undefined,
          linked_projects: project.linked_projects || {}
        }
      })
    } catch (error) {
      console.error('Error in searchSDLCDocuments:', error)
      return []
    }
  }
} 