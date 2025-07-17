'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, TestTube, Star, StarOff, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserPrompt {
  id: string
  name: string
  description: string
  document_type: string
  prompt_content: string
  variables: any
  ai_model: string
  is_active: boolean
  is_personal_default: boolean
  version: number
  created_at: string
  updated_at: string
  usage_count?: number
  avg_response_time?: number
  success_rate?: number
  last_used?: string
}

const DOCUMENT_TYPES = [
  { value: 'business', label: 'Business Analysis' },
  { value: 'functional', label: 'Functional Specification' },
  { value: 'technical', label: 'Technical Specification' },
  { value: 'ux', label: 'UX Specification' },
  { value: 'mermaid', label: 'Mermaid Diagrams' },
  { value: 'sdlc', label: 'SDLC Composite' }
]

export default function UserPromptsPage() {
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        router.push('/signin')
        return
      }

      if (!user) {
        router.push('/signin')
        return
      }

      setUser(user)
      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error initializing user:', error)
      toast.error('Failed to initialize user session')
    }
  }

  const loadUserPrompts = async (userId: string) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // First, try to load user prompts directly from prompt_templates
      console.log('Loading prompts for user:', userId)
      
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('prompt_scope', 'user')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading user prompts:', error)
        toast.error('Failed to load your prompts')
        return
      }

      console.log('Loaded prompts:', data)
      setPrompts(data || [])
    } catch (error) {
      console.error('Error loading user prompts:', error)
      toast.error('Failed to load your prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrompt = () => {
    router.push('/prompts/new')
  }

  const handleEditPrompt = (promptId: string) => {
    router.push(`/prompts/${promptId}/edit`)
  }

  const handleTestPrompt = (promptId: string) => {
    router.push(`/prompts/${promptId}/test`)
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting prompt:', error)
        toast.error('Failed to delete prompt')
        return
      }

      toast.success('Prompt deleted successfully')
      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  const handleToggleDefault = async (promptId: string, isDefault: boolean) => {
    try {
      const supabase = createClient()
      
      if (isDefault) {
        // Remove as default
        const { error } = await supabase
          .from('prompt_templates')
          .update({ is_personal_default: false })
          .eq('id', promptId)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Removed as personal default')
      } else {
        // Set as default - this will be handled by the database function
        const { error } = await supabase.rpc('set_personal_default_prompt', {
          prompt_id: promptId,
          p_user_id: user.id
        })

        if (error) throw error
        toast.success('Set as personal default')
      }

      await loadUserPrompts(user.id)
    } catch (error) {
      console.error('Error toggling default:', error)
      toast.error('Failed to update default setting')
    }
  }

  const filteredPrompts = selectedType === 'all' 
    ? prompts 
    : prompts.filter(p => p.document_type === selectedType)

  const getTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      functional: 'bg-green-100 text-green-800',
      technical: 'bg-purple-100 text-purple-800',
      ux: 'bg-pink-100 text-pink-800',
      mermaid: 'bg-orange-100 text-orange-800',
      sdlc: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your prompts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Prompts</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your personal AI prompts
          </p>
        </div>
        <Button onClick={handleCreatePrompt} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus size={16} />
          <span className="hidden sm:inline">Create New Prompt</span>
          <span className="sm:hidden">New Prompt</span>
        </Button>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <div className="tabs-mobile-container tabs-scroll-container mb-4">
          <TabsList className="tabs-mobile-list">
            <TabsTrigger value="all" className="tab-trigger-mobile">
              <span className="hidden sm:inline">All ({prompts.length})</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            {DOCUMENT_TYPES.map(type => (
              <TabsTrigger key={type.value} value={type.value} className="tab-trigger-mobile">
                <span className="hidden sm:inline">{type.label.split(' ')[0]} ({prompts.filter(p => p.document_type === type.value).length})</span>
                <span className="sm:hidden">{type.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedType} className="mt-6">
          {filteredPrompts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedType === 'all' ? 'No prompts yet' : `No ${getTypeLabel(selectedType).toLowerCase()} prompts yet`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first prompt to get started with personalized AI responses.
                  </p>
                  <Button onClick={handleCreatePrompt} className="flex items-center gap-2">
                    <Plus size={16} />
                    Create Your First Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="truncate">{prompt.name}</span>
                          {prompt.is_personal_default && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {prompt.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={getTypeColor(prompt.document_type)}>
                        <span className="hidden sm:inline">{getTypeLabel(prompt.document_type)}</span>
                        <span className="sm:hidden">{getTypeLabel(prompt.document_type).split(' ')[0]}</span>
                      </Badge>
                      <Badge variant="outline">
                        v{prompt.version}
                      </Badge>
                      {!prompt.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Usage Statistics */}
                      {prompt.usage_count !== undefined && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Uses:</span>
                            <span className="ml-1 font-medium">{prompt.usage_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Success:</span>
                            <span className="ml-1 font-medium">{prompt.success_rate?.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPrompt(prompt.id)}
                          className="flex items-center gap-1 flex-1 sm:flex-none"
                        >
                          <Edit size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestPrompt(prompt.id)}
                          className="flex items-center gap-1 flex-1 sm:flex-none"
                        >
                          <TestTube size={14} />
                          <span className="hidden sm:inline">Test</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleDefault(prompt.id, prompt.is_personal_default)}
                          className="flex items-center gap-1 flex-1 sm:flex-none"
                        >
                          {prompt.is_personal_default ? (
                            <StarOff size={14} />
                          ) : (
                            <Star size={14} />
                          )}
                          <span className="hidden sm:inline">{prompt.is_personal_default ? 'Unset' : 'Default'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 