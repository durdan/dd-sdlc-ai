'use client'

import { useState, useEffect } from 'react'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { MermaidViewerLocalStorageFix } from '@/components/mermaid-viewer-localStorage-fix'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestSequencePage() {
  const [testDiagrams, setTestDiagrams] = useState<Record<string, string>>({})
  const [storageContent, setStorageContent] = useState<string>('')

  // Simple test sequence diagram
  const simpleSequence = `sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: Request data
    API->>Database: Query
    Database-->>API: Results
    API-->>Client: Response`

  // Complex test sequence diagram
  const complexSequence = `sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Auth
    participant Database
    
    User->>Frontend: Click login
    Frontend->>API: POST /auth/login
    API->>Auth: Validate token
    Auth->>Database: Check user
    Database-->>Auth: User data
    Auth-->>API: Valid
    API-->>Frontend: JWT token
    Frontend-->>User: Show dashboard
    
    Note over User,Frontend: Login successful
    
    loop Every 5 minutes
        Frontend->>API: Refresh token
        API-->>Frontend: New token
    end`

  useEffect(() => {
    // Load sequence diagrams from localStorage
    const history = localStorage.getItem('sdlc_document_history')
    if (history) {
      try {
        const docs = JSON.parse(history)
        const sequenceDiagrams: Record<string, string> = {}
        
        docs.forEach((doc: any, index: number) => {
          if (doc.content && doc.content.includes('sequenceDiagram')) {
            // Extract sequence diagrams
            const matches = doc.content.match(/sequenceDiagram[\s\S]*?(?=(?:sequenceDiagram|erDiagram|classDiagram|$))/g)
            if (matches) {
              matches.forEach((diagram: string, i: number) => {
                sequenceDiagrams[`stored_${index}_${i}`] = diagram.trim()
              })
            }
          }
        })
        
        setStorageContent(JSON.stringify(sequenceDiagrams, null, 2))
      } catch (error) {
        console.error('Failed to parse storage:', error)
      }
    }
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Sequence Diagrams</h1>
      
      <div className="space-y-6">
        {/* Test Simple Sequence */}
        <Card>
          <CardHeader>
            <CardTitle>Simple Test Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidViewerEnhanced 
              diagrams={{ sequence1: simpleSequence }}
              title="Simple Sequence Test"
            />
          </CardContent>
        </Card>

        {/* Test Complex Sequence */}
        <Card>
          <CardHeader>
            <CardTitle>Complex Test Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidViewerEnhanced 
              diagrams={{ sequence1: complexSequence }}
              title="Complex Sequence Test"
            />
          </CardContent>
        </Card>

        {/* Raw Content Display */}
        <Card>
          <CardHeader>
            <CardTitle>Sequence Diagrams from Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {storageContent || 'No sequence diagrams found in storage'}
            </pre>
            <Button 
              onClick={() => {
                const history = localStorage.getItem('sdlc_document_history')
                if (history) {
                  const docs = JSON.parse(history)
                  const diagrams: Record<string, string> = {}
                  
                  docs.forEach((doc: any) => {
                    if (doc.content && doc.content.includes('sequenceDiagram')) {
                      // Try to extract and display
                      const match = doc.content.match(/sequenceDiagram[\s\S]*?(?=(?:erDiagram|classDiagram|graph|flowchart|$))/m)
                      if (match) {
                        diagrams[`doc_${doc.type || 'unknown'}`] = match[0]
                      }
                    }
                  })
                  
                  if (Object.keys(diagrams).length > 0) {
                    setTestDiagrams(diagrams)
                  }
                }
              }}
              className="mt-4"
            >
              Load and Test Storage Diagrams
            </Button>
          </CardContent>
        </Card>

        {/* Display loaded diagrams */}
        {Object.keys(testDiagrams).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Loaded Diagrams from Storage (with localStorage fix)</CardTitle>
            </CardHeader>
            <CardContent>
              <MermaidViewerLocalStorageFix 
                diagrams={testDiagrams}
                title="Storage Diagrams"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}