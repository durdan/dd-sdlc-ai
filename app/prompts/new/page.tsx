'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Save, 
  TestTube, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Lightbulb,
  Code,
  Eye,
  Wand2,
  Upload,
  Download,
  BookOpen,
  Star,
  Users,
  FileText,
  Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { promptValidationService, type ValidationResult, type PromptVariable } from '@/lib/prompt-validation'
import { promptTemplateManager, type TemplateLibraryItem, type TemplateBundle } from '@/lib/prompt-template-manager'

interface PromptData {
  name: string
  description: string
  document_type: string
  prompt_content: string
  ai_model: string
  is_active: boolean
  is_personal_default: boolean
}

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

export default function NewPromptPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showTemplateUpload, setShowTemplateUpload] = useState(false)
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateLibraryItem | null>(null)
  const [templateGuidance, setTemplateGuidance] = useState<any>(null)
  const [availableTemplates, setAvailableTemplates] = useState<TemplateLibraryItem[]>([])
  const router = useRouter()

  const [formData, setFormData] = useState<PromptData>({
    name: '',
    description: '',
    document_type: '',
    prompt_content: '',
    ai_model: 'gpt-4o',
    is_active: true,
    is_personal_default: false
  })

  useEffect(() => {
    initializeUser()
  }, [])

  useEffect(() => {
    // Validate prompt whenever content or document type changes
    if (formData.prompt_content && formData.document_type) {
      const result = promptValidationService.validatePrompt(
        formData.prompt_content,
        formData.document_type,
        { strictMode: false, allowCustomVariables: true }
      )
      setValidationResult(result)
    } else {
      setValidationResult(null)
    }
  }, [formData.prompt_content, formData.document_type])

  useEffect(() => {
    // Load template guidance when document type changes
    if (formData.document_type) {
      const guidance = promptTemplateManager.getTemplateGuidance(formData.document_type)
      setTemplateGuidance(guidance)
      
      // Load available templates
      const templates = promptTemplateManager.getTemplatesByDocumentType(formData.document_type)
      console.log(`Loading templates for ${formData.document_type}:`, templates)
      setAvailableTemplates(templates)
    }
  }, [formData.document_type])

  const initializeUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/signin')
        return
      }

      setUser(user)
    } catch (error) {
      console.error('Error initializing user:', error)
      router.push('/signin')
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDocumentTypeChange = (documentType: string) => {
    setFormData(prev => ({
      ...prev,
      document_type: documentType,
      // Don't auto-load template, let user choose
    }))
  }

  const viewTemplate = (template: TemplateLibraryItem) => {
    setSelectedTemplate(template)
    setShowTemplatePreview(true)
  }

  const loadTemplate = (templateId?: string) => {
    if (!formData.document_type) {
      toast.error('Please select a document type first')
      return
    }

    try {
      let template: { content: string; variables: PromptVariable[]; validation: ValidationResult }
      
      if (templateId) {
        // Load specific template from library
        template = promptTemplateManager.loadTemplate(templateId)
      } else {
        // Load default template
        const content = promptValidationService.generateTemplate(formData.document_type)
        const variables = promptValidationService.getVariableSuggestions(formData.document_type)
        const validation = promptValidationService.validatePrompt(
          content,
          formData.document_type,
          { strictMode: false, allowCustomVariables: true }
        )
        template = { content, variables, validation }
      }

      setFormData(prev => ({
        ...prev,
        prompt_content: template.content
      }))
      
      toast.success('Template loaded! You can now customize it.')
      setShowTemplateLibrary(false)
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    }
  }

  const handleTemplateUpload = async (file: File) => {
    try {
      const templateBundle = await promptTemplateManager.importTemplate(file)
      
      if (!templateBundle.validationResult.isValid) {
        toast.error('Uploaded template has validation errors. Please fix them before using.')
      }
      
      setFormData(prev => ({
        ...prev,
        name: templateBundle.metadata.name,
        description: templateBundle.metadata.description,
        document_type: templateBundle.metadata.documentType,
        prompt_content: templateBundle.content
      }))
      
      toast.success('Template uploaded successfully!')
      setShowTemplateUpload(false)
    } catch (error) {
      console.error('Error uploading template:', error)
      toast.error('Failed to upload template')
    }
  }

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    const textarea = document.querySelector('textarea[name="prompt_content"]') as HTMLTextAreaElement
    
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentContent = formData.prompt_content
      const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end)
      
      setFormData(prev => ({
        ...prev,
        prompt_content: newContent
      }))
      
      // Reset cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const handleTestPrompt = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter test input')
      return
    }

    if (!validationResult?.isValid) {
      toast.error('Please fix validation errors before testing')
      return
    }

    try {
      setTestLoading(true)
      
      // Replace variables in prompt with test input
      let testPrompt = formData.prompt_content
      const variables = validationResult.extractedVariables
      
      // For testing, we'll replace all variables with the test input
      // In a real scenario, you'd want to collect values for each variable
      variables.forEach(variable => {
        testPrompt = testPrompt.replace(new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g'), testInput)
      })

      // Simulate AI response (in real implementation, call your AI service)
      setTestResult(`Test successful! Your prompt would generate:\n\n[Simulated AI Response]\n\nBased on the input: "${testInput}"\n\nThe prompt structure looks good and should produce coherent results.`)
      
    } catch (error) {
      console.error('Error testing prompt:', error)
      toast.error('Failed to test prompt')
    } finally {
      setTestLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a prompt name')
      return
    }
    if (!formData.document_type) {
      toast.error('Please select a document type')
      return
    }
    if (!formData.prompt_content.trim()) {
      toast.error('Please enter prompt content')
      return
    }

    // Enhanced validation with required variables check
    const finalValidation = promptTemplateManager.validateTemplateForSaving(
      formData.prompt_content,
      formData.document_type
    )

    if (!finalValidation.isValid) {
      toast.error('Please fix validation errors before saving')
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      const promptData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        document_type: formData.document_type,
        prompt_content: formData.prompt_content.trim(),
        ai_model: formData.ai_model,
        prompt_scope: 'user',
        user_id: user.id,
        is_active: formData.is_active,
        is_personal_default: formData.is_personal_default,
        version: 1,
        created_by: user.id,
        variables: Object.fromEntries(
          finalValidation.extractedVariables.map(v => [v.name, v.type])
        )
      }

      const { error } = await supabase
        .from('prompt_templates')
        .insert(promptData)

      if (error) {
        console.error('Error creating prompt:', error)
        toast.error('Failed to create prompt')
        return
      }

      toast.success('Prompt created successfully!')
      router.push('/prompts')
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Failed to create prompt')
    } finally {
      setLoading(false)
    }
  }

  const getVariableSuggestions = (): PromptVariable[] => {
    if (!formData.document_type) return []
    return promptValidationService.getVariableSuggestions(formData.document_type)
  }

  const renderValidationStatus = () => {
    if (!validationResult) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validationResult.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <div key={index}>• {suggestion}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Extracted Variables */}
          {validationResult.extractedVariables.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Detected Variables:</h4>
              <div className="flex flex-wrap gap-2">
                {validationResult.extractedVariables.map((variable) => (
                  <Badge key={variable.name} variant="outline">
                    {`{{${variable.name}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {validationResult.isValid && validationResult.errors.length === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Prompt validation passed!</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderTemplateLibrary = () => (
    <Dialog open={showTemplateLibrary} onOpenChange={setShowTemplateLibrary}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Library</DialogTitle>
          <DialogDescription>
            Choose from our collection of professionally crafted templates
            {formData.document_type && (
              <span className="block mt-1 text-sm text-blue-600">
                Found {availableTemplates.length} templates for {DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.label}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          {!formData.document_type ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Select Document Type First</h3>
                <p className="text-sm">Please select a document type to see available templates</p>
              </div>
            </div>
          ) : availableTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Templates Available</h3>
                <p className="text-sm">No templates found for {DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.label}</p>
              </div>
            </div>
          ) : (
            availableTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {template.name}
                        {template.isOfficial && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Official
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {template.downloads}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="mb-2">
                        <span className="font-medium">Required Variables:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.requiredVariables.map((variable) => (
                            <code key={variable} className="text-xs bg-red-100 px-2 py-1 rounded">
                              {`{{${variable}}}`}
                            </code>
                          ))}
                        </div>
                      </div>
                      
                      {template.optionalVariables.length > 0 && (
                        <div>
                          <span className="font-medium">Optional Variables:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.optionalVariables.map((variable) => (
                              <code key={variable} className="text-xs bg-blue-100 px-2 py-1 rounded">
                                {`{{${variable}}}`}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        by {template.author}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button onClick={() => loadTemplate(template.id)} size="sm">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderTemplateUpload = () => (
    <Dialog open={showTemplateUpload} onOpenChange={setShowTemplateUpload}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Template</DialogTitle>
          <DialogDescription>
            Upload a template file (JSON or plain text)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-file">Template File</Label>
            <Input
              id="template-file"
              type="file"
              accept=".json,.txt,.md"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleTemplateUpload(file)
                }
              }}
            />
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Supported formats:</strong></p>
                <ul className="text-sm space-y-1">
                  <li>• JSON: Structured template with metadata</li>
                  <li>• TXT/MD: Plain text template content</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderTemplateGuidance = () => {
    if (!templateGuidance) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Template Guidance
          </CardTitle>
          <CardDescription>
            Guidelines for creating effective {DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.label} prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Variables */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              Required Variables
            </h4>
            <div className="space-y-2">
              {templateGuidance.requiredVariables.map((variable: PromptVariable, index: number) => (
                <div key={`required-${variable.name}-${index}`} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex-1">
                    <code className="text-sm font-mono bg-red-100 px-2 py-1 rounded">
                      {`{{${variable.name}}}`}
                    </code>
                    <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.name)}
                  >
                    Insert
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Structure */}
          <div>
            <h4 className="font-medium mb-3">Recommended Structure</h4>
            <div className="space-y-2">
              {templateGuidance.recommendedStructure.map((section: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  {section}
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Best Practices
            </h4>
            <ul className="space-y-2">
              {templateGuidance.bestPractices.map((practice: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {practice}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Common Mistakes to Avoid
            </h4>
            <ul className="space-y-2">
              {templateGuidance.commonMistakes.map((mistake: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    const templateBundle = promptTemplateManager.getTemplate(selectedTemplate.id)
    
    return (
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedTemplate.name}
              {selectedTemplate.isOfficial && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Official
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Metadata */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm text-gray-700">Author</h4>
                <p className="text-sm">{selectedTemplate.author}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Category</h4>
                <p className="text-sm">{selectedTemplate.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Document Type</h4>
                <p className="text-sm">{DOCUMENT_TYPES.find(t => t.value === selectedTemplate.documentType)?.label}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-700">Downloads</h4>
                <p className="text-sm flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedTemplate.downloads}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Variables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-red-600">Required Variables</h4>
                <div className="space-y-2">
                  {selectedTemplate.requiredVariables.map((variable) => (
                    <div key={variable} className="p-2 bg-red-50 rounded">
                      <code className="text-sm font-mono bg-red-100 px-2 py-1 rounded">
                        {`{{${variable}}}`}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedTemplate.optionalVariables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">Optional Variables</h4>
                  <div className="space-y-2">
                    {selectedTemplate.optionalVariables.map((variable) => (
                      <div key={variable} className="p-2 bg-blue-50 rounded">
                        <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                          {`{{${variable}}}`}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Template Content Preview */}
            <div>
              <h4 className="font-medium mb-2">Template Content</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap">
                  {templateBundle?.content || selectedTemplate.preview}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplatePreview(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  loadTemplate(selectedTemplate.id)
                  setShowTemplatePreview(false)
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/prompts')}>
          <ArrowLeft size={16} />
          Back to Prompts
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Prompt</h1>
          <p className="text-gray-600 mt-1">
            Design a custom AI prompt with professional templates and guidance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Set up the basic details for your prompt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Prompt Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="My Custom Business Analysis Prompt"
                      />
                    </div>
                    <div>
                      <Label htmlFor="document_type">Document Type *</Label>
                      <Select value={formData.document_type} onValueChange={handleDocumentTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of what this prompt does"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ai_model">AI Model</Label>
                      <Select value={formData.ai_model} onValueChange={(value) => handleInputChange('ai_model', value)}>
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
                    <div className="space-y-3">
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
                        <Label htmlFor="is_personal_default">Set as Personal Default</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Prompt Content
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowTemplateLibrary(true)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Template Library
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowTemplateUpload(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => loadTemplate()}>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Load Template
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Write your prompt using variables like {`{{input}}`} for dynamic content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    name="prompt_content"
                    value={formData.prompt_content}
                    onChange={(e) => handleInputChange('prompt_content', e.target.value)}
                    placeholder="Enter your prompt content here..."
                    className="min-h-[400px] font-mono"
                  />
                </CardContent>
              </Card>

              {renderValidationStatus()}
            </TabsContent>

            <TabsContent value="variables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Variable Management</CardTitle>
                  <CardDescription>
                    Manage variables in your prompt for dynamic content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Variable Suggestions */}
                  {formData.document_type && (
                    <div>
                      <h4 className="font-medium mb-3">Recommended Variables for {DOCUMENT_TYPES.find(t => t.value === formData.document_type)?.label}</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {getVariableSuggestions().map((variable) => (
                          <div key={variable.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{`{{${variable.name}}}`}</code>
                                {variable.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              </div>
                              {variable.description && (
                                <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(variable.name)}
                            >
                              Insert
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Variables */}
                  {validationResult?.extractedVariables && validationResult.extractedVariables.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Variables in Your Prompt</h4>
                      <div className="space-y-2">
                        {validationResult.extractedVariables.map((variable) => (
                          <div key={variable.name} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Code className="h-4 w-4" />
                            <code className="text-sm">{`{{${variable.name}}}`}</code>
                            <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Your Prompt</CardTitle>
                  <CardDescription>
                    Test your prompt with sample input to see how it performs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test_input">Test Input</Label>
                    <Textarea
                      id="test_input"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="Enter test input that will replace your variables..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={handleTestPrompt} 
                    disabled={testLoading || !validationResult?.isValid}
                    className="w-full"
                  >
                    {testLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Prompt
                      </>
                    )}
                  </Button>

                  {testResult && (
                    <div>
                      <Label>Test Result</Label>
                      <Textarea
                        value={testResult}
                        readOnly
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {renderTemplateGuidance()}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/prompts')}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={loading || !validationResult?.isValid}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Save size={16} />
              Create Prompt
            </>
          )}
        </Button>
      </div>

      {/* Dialogs */}
      {renderTemplateLibrary()}
      {renderTemplateUpload()}
      {renderTemplatePreview()}
    </div>
  )
} 