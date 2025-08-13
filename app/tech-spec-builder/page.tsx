'use client'

import { useState } from 'react'
import { TechSpecSelector } from '@/components/tech-spec-selector'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, FileText, Copy, Download, ChevronRight, Info } from 'lucide-react'
import { techSpecSections } from '@/lib/tech-spec-sections'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function TechSpecBuilderPage() {
  const [selectedSections, setSelectedSections] = useState<string[]>(['system-architecture'])
  const [businessAnalysis, setBusinessAnalysis] = useState('')
  const [functionalSpec, setFunctionalSpec] = useState('')
  const [previousTechSpec, setPreviousTechSpec] = useState('')
  const [generatedSpec, setGeneratedSpec] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('input')

  const handleGenerate = async () => {
    if (selectedSections.length === 0) {
      setError('Please select at least one technical focus area')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-tech-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessAnalysis,
          functionalSpec,
          technicalSpec: previousTechSpec,
          sections: selectedSections,
          provider: 'openai',
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'demo-key', // In production, get from user config
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate technical specification')
      }

      const data = await response.json()
      setGeneratedSpec(data.content)
      setActiveTab('output')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSpec)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedSpec], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'technical-specification.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSelectedSectionNames = () => {
    return selectedSections.map(id => techSpecSections[id]?.name).filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Technical Specification Builder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create comprehensive technical specifications tailored to your project's needs. 
              Select focus areas and provide context to generate detailed documentation.
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> Select the technical areas you need, provide any existing documentation 
              as context, and our AI will generate a comprehensive technical specification covering all selected areas.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Configuration</TabsTrigger>
              <TabsTrigger value="output" disabled={!generatedSpec}>
                Output {generatedSpec && <Badge className="ml-2" variant="secondary">Ready</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6 mt-6">
              {/* Section Selector */}
              <TechSpecSelector 
                onSelectionChange={setSelectedSections}
                defaultSelected={selectedSections}
                mode="detailed"
              />

              {/* Context Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Provide Context (Optional)</CardTitle>
                  <CardDescription>
                    Add existing documentation to generate more accurate and contextual specifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Business Analysis
                    </label>
                    <Textarea
                      placeholder="Paste your business requirements, stakeholder analysis, or project objectives..."
                      value={businessAnalysis}
                      onChange={(e) => setBusinessAnalysis(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Functional Specification
                    </label>
                    <Textarea
                      placeholder="Paste your functional requirements, user stories, or feature specifications..."
                      value={functionalSpec}
                      onChange={(e) => setFunctionalSpec(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Previous Technical Specification
                    </label>
                    <Textarea
                      placeholder="If you have an existing technical spec that needs updating or expansion..."
                      value={previousTechSpec}
                      onChange={(e) => setPreviousTechSpec(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Ready to Generate?</h3>
                      <p className="text-sm text-muted-foreground">
                        Selected areas: {getSelectedSectionNames().join(', ') || 'None'}
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || selectedSections.length === 0}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Specification
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="output" className="space-y-6 mt-6">
              {generatedSpec && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Generated Technical Specification</CardTitle>
                          <CardDescription>
                            Your custom technical specification is ready
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopy}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            }
                          }}
                        >
                          {generatedSpec}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setActiveTab('input')
                        setGeneratedSpec('')
                      }}
                    >
                      <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                      Generate Another
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}