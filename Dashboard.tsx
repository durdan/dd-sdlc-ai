'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Download, Upload, Save, FileText, Code, Layout, GitBranch, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface SDLCDocument {
  id: string
  title: string
  content: string
  type: 'business' | 'functional' | 'technical' | 'ux' | 'mermaid'
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('business')
  const [documents, setDocuments] = useState<SDLCDocument[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingToJira, setIsExportingToJira] = useState(false)
  const [isExportingToConfluence, setIsExportingToConfluence] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Load saved documents from localStorage on component mount
  useEffect(() => {
    const savedProject = localStorage.getItem('sdlcProject')
    if (savedProject) {
      const { name, description, documents } = JSON.parse(savedProject)
      setProjectName(name || '')
      setProjectDescription(description || '')
      setDocuments(documents || [])
    }
  }, [])

  // Save project to localStorage whenever it changes
  const saveProject = () => {
    try {
      setIsSaving(true)
      const projectData = {
        name: projectName,
        description: projectDescription,
        documents,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('sdlcProject', JSON.stringify(projectData))
      toast({
        title: 'Project saved',
        description: 'Your project has been saved successfully.',
      })
    } catch (error) {
      console.error('Error saving project:', error)
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Generate SDLC documents
  const generateDocuments = async () => {
    if (!projectName.trim() || !projectDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a project name and description.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Simulate API call to generate documents
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedDocs: SDLCDocument[] = [
        {
          id: 'business-1',
          title: 'Business Analysis',
          content: `# Business Analysis for ${projectName}\n\n## Project Overview\n${projectDescription}\n\n## Business Objectives\n- [Objective 1]\n- [Objective 2]\n- [Objective 3]\n\n## Success Metrics\n- [Metric 1]\n- [Metric 2]`,
          type: 'business',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // Add more document templates as needed
      ]

      setDocuments(generatedDocs)
      saveProject()
      setActiveTab('business')
      
      toast({
        title: 'Documents generated',
        description: 'Your SDLC documents have been generated successfully.',
      })
    } catch (error) {
      console.error('Error generating documents:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate documents. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Export to Jira
  const exportToJira = async () => {
    if (!documents.length) {
      toast({
        title: 'No documents',
        description: 'Please generate documents before exporting to Jira.',
        variant: 'destructive',
      })
      return
    }

    setIsExportingToJira(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Simulate API call to export to Jira
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Exported to Jira',
        description: 'Your documents have been exported to Jira successfully.',
      })
    } catch (error) {
      console.error('Error exporting to Jira:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export to Jira. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExportingToJira(false)
    }
  }

  // Export to Confluence
  const exportToConfluence = async () => {
    if (!documents.length) {
      toast({
        title: 'No documents',
        description: 'Please generate documents before exporting to Confluence.',
        variant: 'destructive',
      })
      return
    }

    setIsExportingToConfluence(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Simulate API call to export to Confluence
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Exported to Confluence',
        description: 'Your documents have been exported to Confluence successfully.',
      })
    } catch (error) {
      console.error('Error exporting to Confluence:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export to Confluence. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExportingToConfluence(false)
    }
  }

  // Export as Markdown
  const exportAsMarkdown = () => {
    if (!documents.length) {
      toast({
        title: 'No documents',
        description: 'Please generate documents before exporting.',
        variant: 'destructive',
      })
      return
    }

    try {
      const markdownContent = documents.map(doc => `# ${doc.title}\n\n${doc.content}`).join('\n\n---\n\n')
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-sdlc-documents.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Exported as Markdown',
        description: 'Your documents have been exported successfully.',
      })
    } catch (error) {
      console.error('Error exporting as Markdown:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export documents. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SDLC Document Generator</h1>
          <p className="text-muted-foreground">
            Generate comprehensive SDLC documentation for your project
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Enter your project details to generate SDLC documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                placeholder="A brief description of your project..."
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={saveProject}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Project
                  </>
                )}
              </Button>
              <Button 
                onClick={generateDocuments}
                disabled={isGenerating || !projectName.trim() || !projectDescription.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Documents
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {documents.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Documents</CardTitle>
                  <CardDescription>
                    Review and edit your generated SDLC documents
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportAsMarkdown}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export as Markdown
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportToJira}
                    disabled={isExportingToJira}
                  >
                    {isExportingToJira ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GitBranch className="mr-2 h-4 w-4" />
                    )}
                    Export to Jira
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportToConfluence}
                    disabled={isExportingToConfluence}
                  >
                    {isExportingToConfluence ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Layout className="mr-2 h-4 w-4" />
                    )}
                    Export to Confluence
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="business">
                    <FileText className="mr-2 h-4 w-4" />
                    Business
                  </TabsTrigger>
                  <TabsTrigger value="functional">
                    <FileText className="mr-2 h-4 w-4" />
                    Functional
                  </TabsTrigger>
                  <TabsTrigger value="technical">
                    <Code className="mr-2 h-4 w-4" />
                    Technical
                  </TabsTrigger>
                  <TabsTrigger value="ux">
                    <Layout className="mr-2 h-4 w-4" />
                    UX
                  </TabsTrigger>
                  <TabsTrigger value="mermaid">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Mermaid
                  </TabsTrigger>
                </TabsList>
                
                {documents.map((doc) => (
                  <TabsContent key={doc.id} value={doc.type} className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{doc.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          className="min-h-[400px] font-mono text-sm"
                          value={doc.content}
                          onChange={(e) => {
                            const updatedDocs = documents.map(d => 
                              d.id === doc.id ? { ...d, content: e.target.value } : d
                            )
                            setDocuments(updatedDocs)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
