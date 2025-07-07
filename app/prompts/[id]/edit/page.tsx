'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, TestTube, Info, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const DOCUMENT_TYPES = [
  { value: 'business', label: 'Business Analysis' },
  { value: 'functional', label: 'Functional Specification' },
  { value: 'technical', label: 'Technical Specification' },
  { value: 'ux', label: 'UX Specification' },
  { value: 'mermaid', label: 'Mermaid Diagrams' },
  { value: 'sdlc', label: 'SDLC Composite' }
]

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
]

interface PromptData {
  id: string
  name: string
  description: string
  document_type: string
  prompt_content: string
  ai_model: string
  is_active: boolean
  is_personal_default: boolean
  version: number
  user_id: string
  created_at: string
  updated_at: string
}

export default function EditPromptPage() {
  const [formData, setFormData] = useState<PromptData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const promptId = params.id as string

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/signin')
        return
      }

      setUser(user)
      await loadPrompt(user.id)
    } catch (error) {
      console.error('Error initializing user:', error)
      router.push('/signin')
    }
  }

  const loadPrompt = async (userId: string) => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('id', promptId)
        .eq('user_id', userId)
        .eq('prompt_scope', 'user')
        .single()

      if (error) {
        console.error('Error loading prompt:', error)
        toast.error('Failed to load prompt')
        router.push('/prompts')
        return
      }

      if (!data) {
        toast.error('Prompt not found')
        router.push('/prompts')
        return
      }

      setFormData(data)
    } catch (error) {
      console.error('Error loading prompt:', error)
      toast.error('Failed to load prompt')
      router.push('/prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return
    
    setFormData(prev => ({
      ...prev!,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user || !formData) return

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a prompt name')
      return
    }
    if (!formData.prompt_content.trim()) {
      toast.error('Please enter prompt content')
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        prompt_content: formData.prompt_content.trim(),
        ai_model: formData.ai_model,
        is_active: formData.is_active,
        is_personal_default: formData.is_personal_default,
        updated_at: new Date().toISOString()
      }

      // If setting as personal default, use the database function
      if (formData.is_personal_default && !formData.is_personal_default) {
        const { error: rpcError } = await supabase.rpc('set_personal_default_prompt', {
          prompt_id: promptId,
          p_user_id: user.id
        })

        if (rpcError) {
          console.error('Error setting default:', rpcError)
          toast.error('Failed to set as default')
          return
        }
      } else {
        // Regular update
        const { error } = await supabase
          .from('prompt_templates')
          .update(updateData)
          .eq('id', promptId)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating prompt:', error)
          toast.error('Failed to update prompt')
          return
        }
      }

      toast.success('Prompt updated successfully!')
      router.push('/prompts')
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast.error('Failed to update prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testInput.trim() || !formData) {
      toast.error('Please enter test input')
      return
    }

    try {
      setTestLoading(true)
      const processedPrompt = formData.prompt_content.replace(/\{input\}/g, testInput)
      
      // Simulate AI response for testing
      setTestResult(`**Test Result Preview**

This is a simulated response showing how your prompt would work. The actual AI response would be generated here.

**Your prompt with test input:**
${processedPrompt.substring(0, 200)}...

**Note:** This is a preview. To test with real AI, save the prompt first and use the test feature from the prompts list.`)
      
      toast.success('Test preview generated')
    } catch (error) {
      console.error('Error testing prompt:', error)
      toast.error('Failed to test prompt')
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading prompt...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">Prompt not found</p>
          <Button onClick={() => router.push('/prompts')} className="mt-4">
            Back to Prompts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/prompts')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Prompts
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Prompt</h1>
          <p className="text-gray-600 mt-1">
            Modify your personalized AI prompt
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline">
            <History size={12} className="mr-1" />
            v{formData.version}
          </Badge>
          {formData.is_personal_default && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Personal Default
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Prompt Editor</TabsTrigger>
          <TabsTrigger value="test">Test & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the basic details for your prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Prompt Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., My Custom Business Analysis"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="document_type">Document Type</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value) => handleInputChange('document_type', value)}
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Document type cannot be changed after creation
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this prompt does..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ai_model">AI Model</Label>
                    <Select
                      value={formData.ai_model}
                      onValueChange={(value) => handleInputChange('ai_model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map(model => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_personal_default"
                        checked={formData.is_personal_default}
                        onCheckedChange={(checked) => handleInputChange('is_personal_default', checked)}
                      />
                      <Label htmlFor="is_personal_default">Set as Default</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Prompt Content
                  <Badge variant="outline">
                    <Info size={12} className="mr-1" />
                    Use {'{input}'} for user input
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Modify your prompt content. Use {'{input}'} where you want the user's input to be inserted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your prompt content here..."
                  value={formData.prompt_content}
                  onChange={(e) => handleInputChange('prompt_content', e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Prompt</CardTitle>
              <CardDescription>
                Test how your updated prompt works with sample input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test_input">Test Input</Label>
                <Textarea
                  id="test_input"
                  placeholder="Enter sample input to test your prompt..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleTest}
                disabled={testLoading || !formData.prompt_content.trim()}
                className="flex items-center gap-2"
              >
                <TestTube size={16} />
                {testLoading ? 'Testing...' : 'Test Prompt'}
              </Button>

              {testResult && (
                <div>
                  <Label>Test Result</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">
                      {testResult}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 