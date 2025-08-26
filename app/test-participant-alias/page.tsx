'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'

export default function TestParticipantAliasPage() {
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const [renderResults, setRenderResults] = useState<Record<string, any>>({})
  const [fromStorage, setFromStorage] = useState<string | null>(null)

  // Test cases with different participant alias formats
  const testCases = {
    'simple-alias': `sequenceDiagram
    participant U as User
    participant S as System
    U->>S: Login
    S-->>U: Welcome`,

    'complex-alias': `sequenceDiagram
    participant U as User Interface
    participant API as REST API Gateway
    participant DB as PostgreSQL Database
    U->>API: HTTP Request
    API->>DB: SQL Query
    DB-->>API: Result Set
    API-->>U: JSON Response`,

    'mixed-format': `sequenceDiagram
    participant Client
    participant S as Server
    participant DB as Database
    Client->>S: Request
    S->>DB: Query
    DB-->>S: Data
    S-->>Client: Response`,

    'with-spaces': `sequenceDiagram
    participant UI as User Interface Module
    participant BL as Business Logic Layer
    participant DAL as Data Access Layer
    UI->>BL: Process Request
    BL->>DAL: Fetch Data
    DAL-->>BL: Return Data
    BL-->>UI: Formatted Response`
  }

  useEffect(() => {
    // Load and test mermaid
    import('mermaid').then(({ default: mermaid }) => {
      setMermaidLoaded(true)
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      })

      // Test each case
      Object.entries(testCases).forEach(async ([key, content]) => {
        try {
          const { svg } = await mermaid.render(`test-${key}-${Date.now()}`, content)
          setRenderResults(prev => ({
            ...prev,
            [key]: { success: true, svg: svg.substring(0, 100) + '...' }
          }))
        } catch (error: any) {
          setRenderResults(prev => ({
            ...prev,
            [key]: { success: false, error: error.message }
          }))
        }
      })
    }).catch(error => {
      console.error('Failed to load mermaid:', error)
      setMermaidLoaded(false)
    })
  }, [])

  const loadFromStorage = () => {
    const history = localStorage.getItem('sdlc_document_history')
    if (history) {
      const docs = JSON.parse(history)
      for (const doc of docs) {
        if (doc.content && doc.content.includes('participant') && doc.content.includes(' as ')) {
          // Extract a sequence diagram with participant aliases
          const match = doc.content.match(/sequenceDiagram[\s\S]*?(?=(?:sequenceDiagram|erDiagram|classDiagram|graph|$))/m)
          if (match) {
            setFromStorage(match[0])
            break
          }
        }
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Participant Alias Syntax</h1>
      
      <div className="mb-4">
        <p className="text-lg">
          Mermaid Status: {' '}
          <span className={mermaidLoaded ? 'text-green-600' : 'text-red-600'}>
            {mermaidLoaded ? '✓ Loaded' : '✗ Not Loaded'}
          </span>
        </p>
      </div>

      {/* Test Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Direct Rendering Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(renderResults).map(([key, result]) => (
              <div key={key} className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">{key}</span>
                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✓ Success' : `✗ ${result.error}`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test with MermaidViewerEnhanced */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>MermaidViewerEnhanced Test</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidViewerEnhanced 
            diagrams={testCases}
            title="Participant Alias Test Cases"
          />
        </CardContent>
      </Card>

      {/* Storage Test */}
      <Card>
        <CardHeader>
          <CardTitle>From Storage Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={loadFromStorage} className="mb-4">
            Load from Storage
          </Button>
          
          {fromStorage && (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Raw Content:</h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {fromStorage}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Rendered:</h3>
                <MermaidViewerEnhanced 
                  content={fromStorage}
                  title="Storage Diagram with Aliases"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}