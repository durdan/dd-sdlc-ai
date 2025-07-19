'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TestTube, Clock, CheckCircle, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
}

interface TestResult {
  content: string
  responseTime: number
  success: boolean
  error?: string
  timestamp: string
}

export default function TestPromptPage() {
  const [prompt, setPrompt] = useState<PromptData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testInput, setTestInput] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
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

      setPrompt(data)
    } catch (error) {
      console.error('Error loading prompt:', error)
      toast.error('Failed to load prompt')
      router.push('/prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter test input')
      return
    }

    if (!prompt) return

    try {
      setTesting(true)
      const startTime = Date.now()

      // Call the appropriate API endpoint based on document type
      const apiEndpoint = getApiEndpoint(prompt.document_type)
      
      const requestBody: any = {
        input: testInput,
        userId: user.id,
        customPrompt: prompt.prompt_content // Use the prompt as custom prompt for testing
      }

      // Add documentType for the new consolidated endpoint
      if (apiEndpoint === '/api/generate-document') {
        requestBody.documentType = prompt.document_type
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API call failed')
      }

      const result: TestResult = {
        content: getContentFromResponse(data, prompt.document_type),
        responseTime,
        success: true,
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [result, ...prev])
      toast.success(`Test completed in ${responseTime}ms`)
    } catch (error) {
      const responseTime = Date.now() - Date.now()
      const result: TestResult = {
        content: '',
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }

      setTestResults(prev => [result, ...prev])
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setTesting(false)
    }
  }

  const getApiEndpoint = (documentType: string) => {
    const endpoints = {
      business: '/api/generate-document',
      functional: '/api/generate-document',
      technical: '/api/generate-document',
      ux: '/api/generate-document',
      mermaid: '/api/generate-document',
      sdlc: '/api/generate-sdlc'
    }
    return endpoints[documentType as keyof typeof endpoints] || endpoints.business
  }

  const getContentFromResponse = (data: any, documentType: string) => {
    const contentFields = {
      business: 'businessAnalysis',
      functional: 'functionalSpec',
      technical: 'technicalSpec',
      ux: 'uxSpec',
      mermaid: 'mermaidDiagrams',
      sdlc: 'sdlc'
    }
    const field = contentFields[documentType as keyof typeof contentFields]
    return data[field] || data.content || 'No content returned'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
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

  if (!prompt) {
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
          <h1 className="text-3xl font-bold text-gray-900">Test Prompt</h1>
          <p className="text-gray-600 mt-1">
            Test your prompt with real AI calls
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline">
            {prompt.name}
          </Badge>
          {prompt.is_personal_default && (
            <Badge className="bg-yellow-100 text-yellow-800">
              Default
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Input */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Configure your test parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test_input">Test Input</Label>
                <Textarea
                  id="test_input"
                  placeholder="Enter your test input here..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={6}
                />
              </div>

              <Button
                onClick={handleTest}
                disabled={testing || !testInput.trim()}
                className="w-full flex items-center gap-2"
              >
                <TestTube size={16} />
                {testing ? 'Testing...' : 'Run Test'}
              </Button>
            </CardContent>
          </Card>

          {/* Prompt Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt Preview</CardTitle>
              <CardDescription>
                How your prompt will be processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm font-mono">
                <div className="text-gray-600 mb-2">Processed prompt:</div>
                <div className="whitespace-pre-wrap">
                  {prompt.prompt_content.replace(/\{input\}/g, testInput || '[YOUR_INPUT_HERE]')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from your prompt tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No test results yet</p>
                  <p className="text-sm text-gray-400">Run a test to see results here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            result.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {result.responseTime}ms
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        {formatTimestamp(result.timestamp)}
                      </div>

                      {result.success ? (
                        <div className="bg-green-50 p-3 rounded border text-sm">
                          <div className="font-medium text-green-800 mb-1">Response:</div>
                          <div className="whitespace-pre-wrap text-green-700">
                            {result.content.length > 300 
                              ? result.content.substring(0, 300) + '...' 
                              : result.content
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-3 rounded border text-sm">
                          <div className="font-medium text-red-800 mb-1">Error:</div>
                          <div className="text-red-700">{result.error}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 