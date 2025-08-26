import { createClient } from '@/lib/supabase/client'

export interface AnonymousProject {
  project_id: string
  title: string
  input_text: string
  status: string
  created_at: string
  documents: Record<string, string>
}

export interface AnonymousSession {
  session_id: string
  user_agent?: string
  ip_address?: string
  referrer?: string
  created_at: string
  last_activity: string
  project_count: number
}

export class AnonymousProjectService {
  private supabase = createClient()

  /**
   * Generate a unique session ID for anonymous users
   */
  generateSessionId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get or create a session ID from localStorage
   */
  getSessionId(): string {
    if (typeof window === 'undefined') {
      return this.generateSessionId()
    }

    let sessionId = localStorage.getItem('sdlc_anonymous_session_id')
    if (!sessionId) {
      sessionId = this.generateSessionId()
      localStorage.setItem('sdlc_anonymous_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * Save an anonymous SDLC project
   */
  async saveAnonymousProject(
    title: string,
    inputText: string,
    documents: Record<string, string>,
    userAgent?: string,
    ipAddress?: string,
    referrer?: string,
    selectedSections?: Record<string, string[]>,
    generationMetadata?: any
  ): Promise<string | null> {
    try {
      const sessionId = this.getSessionId()
      
      console.log('💾 Saving anonymous project:', { title, sessionId })

      const projectData = {
        title,
        input_text: inputText,
        documents,
        user_agent: userAgent || navigator?.userAgent,
        ip_address: ipAddress,
        referrer: referrer || document?.referrer,
        created_at: new Date().toISOString(),
        selected_sections: selectedSections || {},
        generation_metadata: generationMetadata || {}
      }

      const { data, error } = await this.supabase
        .rpc('save_anonymous_sdlc_project', {
          p_session_id: sessionId,
          p_project_data: projectData
        })

      if (error) {
        console.error('Error saving anonymous project:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return null
      }

      console.log('✅ Anonymous project saved successfully:', data)
      return data
    } catch (error) {
      console.error('Error in saveAnonymousProject:', error)
      return null
    }
  }

  /**
   * Get all projects for the current anonymous session
   */
  async getAnonymousProjects(): Promise<AnonymousProject[]> {
    try {
      const sessionId = this.getSessionId()
      
      console.log('📋 Fetching anonymous projects for session:', sessionId)

      const { data, error } = await this.supabase
        .rpc('get_anonymous_projects', {
          p_session_id: sessionId
        })

      if (error) {
        console.error('Error fetching anonymous projects:', error)
        return []
      }

      console.log('✅ Fetched anonymous projects:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error in getAnonymousProjects:', error)
      return []
    }
  }

  /**
   * Get anonymous session information
   */
  async getAnonymousSession(): Promise<AnonymousSession | null> {
    try {
      const sessionId = this.getSessionId()

      const { data, error } = await this.supabase
        .from('anonymous_project_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error) {
        console.error('Error fetching anonymous session:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getAnonymousSession:', error)
      return null
    }
  }

  /**
   * Convert anonymous project to ProjectResult format for dashboard
   */
  convertToProjectResult(project: AnonymousProject): any {
    return {
      id: project.project_id,
      title: project.title,
      status: project.status,
      createdAt: project.created_at,
      projectType: 'sdlc' as const,
      documents: {
        businessAnalysis: project.documents.business_analysis || '',
        functionalSpec: project.documents.functional_spec || '',
        technicalSpec: project.documents.technical_spec || '',
        uxSpec: project.documents.ux_spec || '',
        architecture: project.documents.architecture || '',
        comprehensive: project.documents.comprehensive_sdlc || ''
      },
      hasComprehensiveContent: !!(project.documents.comprehensive_sdlc),
      totalDocuments: Object.keys(project.documents).filter(key => 
        project.documents[key] && project.documents[key].length > 0
      ).length
    }
  }

  /**
   * Check if user is anonymous (no authenticated user)
   */
  isAnonymous(): boolean {
    // This should be called from the client side
    // For server-side, we'd need to check the auth context
    return typeof window !== 'undefined' && !localStorage.getItem('supabase.auth.token')
  }
}

// Create singleton instance
export const anonymousProjectService = new AnonymousProjectService() 