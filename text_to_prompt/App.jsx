import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Loader2, Wand2, Download, Eye, Code, FileText, Sparkles } from 'lucide-react'
import './App.css'

const API_BASE = 'http://localhost:5000/api'

function App() {
  const [prompt, setPrompt] = useState('')
  const [wireframe, setWireframe] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('input')
  const [renderedContent, setRenderedContent] = useState({ svg: '', html: '' })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/wireframe/templates`)
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    }
  }

  const generateWireframe = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your wireframe')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE}/wireframe/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      
      if (data.success) {
        setWireframe(data.wireframe)
        setActiveTab('wireframe')
        // Auto-render SVG
        renderSVG(data.wireframe)
      } else {
        setError(data.error || 'Failed to generate wireframe')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderSVG = async (wireframeData) => {
    try {
      const response = await fetch(`${API_BASE}/wireframe/render/svg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wireframe: wireframeData }),
      })

      const data = await response.json()
      if (data.success) {
        setRenderedContent(prev => ({ ...prev, svg: data.svg }))
      }
    } catch (err) {
      console.error('Failed to render SVG:', err)
    }
  }

  const renderHTML = async () => {
    if (!wireframe) return

    try {
      const response = await fetch(`${API_BASE}/wireframe/render/html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wireframe }),
      })

      const data = await response.json()
      if (data.success) {
        setRenderedContent(prev => ({ ...prev, html: data.html }))
        setActiveTab('html')
      }
    } catch (err) {
      console.error('Failed to render HTML:', err)
    }
  }

  const enhanceWireframe = async (enhancementType = 'full') => {
    if (!wireframe) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/wireframe/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          wireframe, 
          enhancement_type: enhancementType 
        }),
      })

      const data = await response.json()
      if (data.success) {
        setWireframe(data.wireframe)
        renderSVG(data.wireframe)
      } else {
        setError(data.error || 'Failed to enhance wireframe')
      }
    } catch (err) {
      setError('Enhancement failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = (template) => {
    setPrompt(template.prompt)
  }

  const downloadWireframe = (format) => {
    if (!wireframe) return

    const filename = `wireframe-${wireframe.title?.replace(/\s+/g, '-').toLowerCase() || 'untitled'}`
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(wireframe, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'svg' && renderedContent.svg) {
      const blob = new Blob([renderedContent.svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'html' && renderedContent.html) {
      const blob = new Blob([renderedContent.html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <Wand2 className="inline-block w-8 h-8 mr-2 text-blue-600" />
            Wireframe Generator
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered UX Design Tool - Create Professional Wireframes from Natural Language
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="wireframe" disabled={!wireframe}>Wireframe</TabsTrigger>
            <TabsTrigger value="visual" disabled={!renderedContent.svg}>Visual</TabsTrigger>
            <TabsTrigger value="html" disabled={!renderedContent.html}>HTML</TabsTrigger>
            <TabsTrigger value="specs" disabled={!wireframe}>Specs</TabsTrigger>
          </TabsList>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Input */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Describe Your Wireframe</CardTitle>
                    <CardDescription>
                      Describe the interface you want to create in natural language
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Example: Create a dashboard for a project management app with sidebar navigation, project cards, task list, and user profile section..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={generateWireframe} 
                        disabled={loading || !prompt.trim()}
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Wireframe
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Templates */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Templates</CardTitle>
                    <CardDescription>
                      Start with a pre-built template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {templates.map((template) => (
                          <Card 
                            key={template.id} 
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => useTemplate(template)}
                          >
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {template.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Wireframe Tab */}
          <TabsContent value="wireframe" className="space-y-6">
            {wireframe && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wireframe Details */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{wireframe.title}</CardTitle>
                          <CardDescription>{wireframe.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => enhanceWireframe('full')}
                            disabled={loading}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Enhance
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={renderHTML}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Components ({wireframe.components?.length || 0})</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {wireframe.components?.map((component, index) => (
                              <Badge key={index} variant="secondary" className="justify-start">
                                {component.type}: {component.content?.substring(0, 20)}...
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {wireframe.userFlow && wireframe.userFlow.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">User Flow</h4>
                            <div className="space-y-2">
                              {wireframe.userFlow.map((step, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <Badge variant="outline" className="min-w-fit">
                                    {step.step}
                                  </Badge>
                                  <div>
                                    <div className="font-medium">{step.action}</div>
                                    <div className="text-gray-600">{step.result}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Annotations */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Design Annotations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {wireframe.annotations?.map((annotation, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {annotation.componentId}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {annotation.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">{annotation.note}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Visual Tab */}
          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Visual Wireframe</CardTitle>
                    <CardDescription>SVG representation of your wireframe</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadWireframe('svg')}
                    disabled={!renderedContent.svg}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderedContent.svg ? (
                  <div 
                    className="border rounded-lg p-4 bg-white overflow-auto"
                    dangerouslySetInnerHTML={{ __html: renderedContent.svg }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No visual representation available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HTML Tab */}
          <TabsContent value="html" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>HTML Preview</CardTitle>
                    <CardDescription>Interactive HTML representation</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadWireframe('html')}
                    disabled={!renderedContent.html}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download HTML
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderedContent.html ? (
                  <iframe
                    srcDoc={renderedContent.html}
                    className="w-full h-96 border rounded-lg"
                    title="Wireframe HTML Preview"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Click "Preview" to generate HTML representation
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Design Specifications</CardTitle>
                    <CardDescription>Detailed specifications for development</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => downloadWireframe('json')}
                    disabled={!wireframe}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {wireframe && (
                  <ScrollArea className="h-96">
                    <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                      {JSON.stringify(wireframe, null, 2)}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

