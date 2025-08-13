'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ChevronRight, 
  Edit2, 
  Save, 
  X, 
  Plus,
  Search,
  FileText,
  Code,
  Palette,
  Database,
  Brain,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface SubsectionData {
  id: string
  document_type: string
  section_id: string
  section_name: string
  icon: string
  description: string
  detailed_description: string
  best_for: string[]
  output_sections: string[]
  sort_order: number
  is_active: boolean
  prompt_content?: string
  has_custom_prompt?: boolean
}

interface SubsectionPromptManagerProps {
  isAdmin: boolean
}

const documentTypeConfig = {
  business: { 
    label: 'Business Analysis', 
    icon: Brain, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  technical: { 
    label: 'Technical Specs', 
    icon: Code, 
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  ux: { 
    label: 'UX Design', 
    icon: Palette, 
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  mermaid: { 
    label: 'Architecture', 
    icon: Database, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  functional: { 
    label: 'Functional Specs', 
    icon: FileText, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
}

export function SubsectionPromptManager({ isAdmin }: SubsectionPromptManagerProps) {
  const [selectedDocType, setSelectedDocType] = useState<string>('business')
  const [subsections, setSubsections] = useState<SubsectionData[]>([])
  const [selectedSubsection, setSelectedSubsection] = useState<SubsectionData | null>(null)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [promptContent, setPromptContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load subsections for selected document type
  useEffect(() => {
    loadSubsections()
  }, [selectedDocType])

  const loadSubsections = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/subsections?documentType=${selectedDocType}`)
      if (response.ok) {
        const data = await response.json()
        setSubsections(data.subsections || [])
      }
    } catch (error) {
      console.error('Error loading subsections:', error)
      toast.error('Failed to load subsections')
    } finally {
      setLoading(false)
    }
  }

  const loadSubsectionPrompt = async (subsection: SubsectionData) => {
    try {
      const response = await fetch(`/api/admin/subsections/${subsection.id}/prompt`)
      if (response.ok) {
        const data = await response.json()
        setPromptContent(data.prompt_content || '')
        setEditingPrompt(true)
      }
    } catch (error) {
      console.error('Error loading prompt:', error)
      toast.error('Failed to load prompt')
    }
  }

  const savePrompt = async () => {
    if (!selectedSubsection) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/subsections/${selectedSubsection.id}/prompt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt_content: promptContent,
          document_type: selectedSubsection.document_type,
          section_id: selectedSubsection.section_id
        })
      })
      
      if (response.ok) {
        toast.success('Prompt saved successfully')
        setEditingPrompt(false)
        loadSubsections()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const toggleSubsectionActive = async (subsection: SubsectionData) => {
    try {
      const response = await fetch(`/api/admin/subsections/${subsection.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !subsection.is_active })
      })
      
      if (response.ok) {
        toast.success(`Subsection ${!subsection.is_active ? 'activated' : 'deactivated'}`)
        loadSubsections()
      }
    } catch (error) {
      console.error('Error toggling subsection:', error)
      toast.error('Failed to update subsection')
    }
  }

  const filteredSubsections = subsections.filter(s => 
    s.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const config = documentTypeConfig[selectedDocType as keyof typeof documentTypeConfig]
  const Icon = config?.icon || FileText

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Subsection Prompts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage prompts for document subsections
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Sparkles className="h-3 w-3 mr-1" />
          {subsections.filter(s => s.has_custom_prompt).length} Custom Prompts
        </Badge>
      </div>

      {/* Document Type Tabs */}
      <Tabs value={selectedDocType} onValueChange={setSelectedDocType}>
        <TabsList className="grid grid-cols-5 w-full">
          {Object.entries(documentTypeConfig).map(([key, conf]) => {
            const TabIcon = conf.icon
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <TabIcon className={`h-4 w-4 ${conf.color}`} />
                <span className="hidden lg:inline">{conf.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedDocType} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subsection List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subsections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Subsection Cards */}
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : filteredSubsections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No subsections found</div>
                ) : (
                  filteredSubsections.map((subsection) => (
                    <Card
                      key={subsection.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedSubsection?.id === subsection.id 
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/50' 
                          : ''
                      } ${!subsection.is_active ? 'opacity-60' : ''}`}
                      onClick={() => setSelectedSubsection(subsection)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{subsection.icon}</span>
                            <h4 className="font-medium text-gray-900">
                              {subsection.section_name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {subsection.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {subsection.has_custom_prompt && (
                              <Badge variant="secondary" className="text-xs">
                                Custom Prompt
                              </Badge>
                            )}
                            {!subsection.is_active && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Subsection Details */}
            <div className="lg:col-span-2">
              {selectedSubsection ? (
                <Card className="p-6">
                  {!editingPrompt ? (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {selectedSubsection.section_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              ID: {selectedSubsection.section_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedSubsection.is_active}
                            onCheckedChange={() => toggleSubsectionActive(selectedSubsection)}
                          />
                          <Button
                            size="sm"
                            onClick={() => loadSubsectionPrompt(selectedSubsection)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit Prompt
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="mt-1 text-sm text-gray-600">
                          {selectedSubsection.detailed_description}
                        </p>
                      </div>

                      {/* Best For */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Best For</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedSubsection.best_for.map((item, index) => (
                            <Badge key={index} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Output Sections */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Output Sections</Label>
                        <div className="mt-2 space-y-1">
                          {selectedSubsection.output_sections.map((section, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="h-3 w-3 text-green-500" />
                              {section}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {selectedSubsection.has_custom_prompt ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-green-700">Custom prompt configured</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="text-amber-700">Using default prompt</span>
                              </>
                            )}
                          </div>
                          <span className="text-gray-500">
                            Sort Order: {selectedSubsection.sort_order}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Prompt Editor Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Edit Prompt: {selectedSubsection.section_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPrompt(false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={savePrompt}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            {saving ? 'Saving...' : 'Save Prompt'}
                          </Button>
                        </div>
                      </div>

                      {/* Variables Info */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Available Variables:</strong> {`{{input}}`}, {`{{business_analysis}}`}, 
                          {`{{functional_spec}}`}, {`{{technical_spec}}`}
                        </p>
                      </div>

                      {/* Prompt Editor */}
                      <div>
                        <Label htmlFor="prompt">Prompt Content</Label>
                        <Textarea
                          id="prompt"
                          value={promptContent}
                          onChange={(e) => setPromptContent(e.target.value)}
                          className="mt-2 font-mono text-sm"
                          rows={20}
                          placeholder="Enter the prompt template for this subsection..."
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-12">
                  <div className="text-center text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a subsection</p>
                    <p className="text-sm mt-1">Choose a subsection from the list to view details and edit prompts</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}