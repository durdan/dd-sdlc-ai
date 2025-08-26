'use client'

import { useState } from 'react'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { fixMermaidSyntax } from '@/lib/mermaid-parser-simple-fix'
import { parseAndFixSequenceDiagram } from '@/lib/mermaid-sequence-fixer'

export default function TestSequenceFixedPage() {
  const [customDiagram, setCustomDiagram] = useState('')
  const [fixedDiagram, setFixedDiagram] = useState('')

  // Test cases
  const testCases = [
    {
      name: 'Basic Sequence',
      diagram: `sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: Request data
    API->>Database: Query
    Database-->>API: Results
    API-->>Client: Response`
    },
    {
      name: 'With Numbered Lists (should be fixed)',
      diagram: `sequenceDiagram
1. participant Client
2. participant API
3. participant Database

Client->>API: Request data
API->>Database: Query
Database-->>API: Results
API-->>Client: Response`
    },
    {
      name: 'Complex Messages',
      diagram: `sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Database
    
    User->>Frontend: Click login button
    Frontend->>API: POST /auth/login
    API->>Database: SELECT * FROM users WHERE email = ?
    Database-->>API: User data (id: 123)
    API-->>Frontend: JWT token {exp: 3600}
    Frontend-->>User: Show dashboard`
    },
    {
      name: 'With Notes and Loops',
      diagram: `sequenceDiagram
    participant User
    participant Frontend
    participant API
    
    User->>Frontend: Open page
    Note over User,Frontend: Initial load
    
    loop Every 5 seconds
        Frontend->>API: Check for updates
        API-->>Frontend: Response
    end
    
    Note right of API: Processing complete`
    },
    {
      name: 'Participant Aliases',
      diagram: `sequenceDiagram
    participant U as User
    participant FE as Frontend Application
    participant API as Backend API Service
    participant DB as PostgreSQL Database
    
    U->>FE: Click submit
    FE->>API: POST request
    API->>DB: INSERT query
    DB-->>API: Success
    API-->>FE: 200 OK
    FE-->>U: Show success message`
    }
  ]

  const handleFixCustom = () => {
    // Use the specialized sequence diagram fixer for better results
    const fixed = customDiagram.includes('sequenceDiagram') 
      ? parseAndFixSequenceDiagram(customDiagram)
      : fixMermaidSyntax(customDiagram)
    setFixedDiagram(fixed)
  }

  const loadFromStorage = () => {
    const history = localStorage.getItem('sdlc_document_history')
    if (history) {
      try {
        const docs = JSON.parse(history)
        // Find first document with sequence diagram
        for (const doc of docs) {
          if (doc.content && doc.content.includes('sequenceDiagram')) {
            const match = doc.content.match(/sequenceDiagram[\s\S]*?(?=(?:erDiagram|classDiagram|graph|flowchart|$))/m)
            if (match) {
              setCustomDiagram(match[0])
              break
            }
          }
        }
      } catch (error) {
        console.error('Failed to load from storage:', error)
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sequence Diagram Fix Test</h1>
        <p className="text-gray-600">Testing the improved sequence diagram parser</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Cases */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Cases</h2>
          {testCases.map((testCase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{testCase.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <details>
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                      View Raw Diagram
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {testCase.diagram}
                    </pre>
                  </details>
                </div>
                <MermaidViewerEnhanced 
                  diagrams={{ [`test${index}`]: testCase.diagram }}
                  title={testCase.name}
                  height="300px"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Test */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Custom Test</h2>
          <Card>
            <CardHeader>
              <CardTitle>Test Your Own Diagram</CardTitle>
              <CardDescription>
                Paste a sequence diagram to test the fix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customDiagram}
                onChange={(e) => setCustomDiagram(e.target.value)}
                placeholder="Paste your sequence diagram here..."
                className="font-mono text-sm"
                rows={10}
              />
              <div className="flex gap-2">
                <Button onClick={handleFixCustom}>
                  Fix & Render
                </Button>
                <Button onClick={loadFromStorage} variant="outline">
                  Load from Storage
                </Button>
              </div>
              
              {fixedDiagram && (
                <>
                  <details>
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                      View Fixed Diagram Code
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {fixedDiagram}
                    </pre>
                  </details>
                  
                  <MermaidViewerEnhanced 
                    diagrams={{ custom: fixedDiagram }}
                    title="Custom Diagram (Fixed)"
                    height="400px"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}