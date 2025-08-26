'use client'

import { useState, useEffect } from 'react'
import { parseMermaidDiagrams, hasDiagramContent } from '@/lib/mermaid-parser-simple-fix'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugParserPage() {
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    // Test cases
    const testCases = [
      {
        name: 'Simple Sequence',
        content: `sequenceDiagram
    participant Client
    participant Server
    Client->>Server: Request
    Server-->>Client: Response`
      },
      {
        name: 'API Spec (should NOT be diagram)',
        content: `## Part 1: API Specifications
### 1. API Overview
**API Style**: REST
**Version Strategy**: URL`
      },
      {
        name: 'Sequence with text before',
        content: `Here is a sequence diagram:
sequenceDiagram
    participant User
    User->>System: Login`
      },
      {
        name: 'Multiple diagrams',
        content: `sequenceDiagram
    participant A
    A->>B: Test
    
erDiagram
    CUSTOMER ||--o{ ORDER : places`
      }
    ]

    const results = testCases.map(test => {
      const hasDiagram = hasDiagramContent(test.content)
      const parsed = parseMermaidDiagrams(test.content)
      const diagramCount = Object.keys(parsed).length
      
      return {
        name: test.name,
        content: test.content,
        hasDiagram,
        diagramCount,
        parsedKeys: Object.keys(parsed),
        parsedContent: parsed
      }
    })

    setTestResults(results)
  }, [])

  // Test localStorage content
  const [storageTest, setStorageTest] = useState<any>(null)
  
  const testStorage = () => {
    const history = localStorage.getItem('sdlc_document_history')
    if (history) {
      const docs = JSON.parse(history)
      const results: any[] = []
      
      docs.forEach((doc: any, index: number) => {
        if (doc.content) {
          const hasDiagram = hasDiagramContent(doc.content)
          const parsed = parseMermaidDiagrams(doc.content)
          
          results.push({
            docIndex: index,
            type: doc.type,
            hasDiagram,
            diagramCount: Object.keys(parsed).length,
            parsedKeys: Object.keys(parsed),
            contentLength: doc.content.length,
            firstChars: doc.content.substring(0, 100)
          })
        }
      })
      
      setStorageTest(results)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Debug Parser</h1>
      
      {/* Test Cases */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Parser Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-bold">{result.name}</h3>
                <div className="text-sm space-y-1">
                  <p>Has Diagram: <span className={result.hasDiagram ? 'text-green-600' : 'text-red-600'}>
                    {result.hasDiagram ? 'YES' : 'NO'}
                  </span></p>
                  <p>Diagrams Found: {result.diagramCount}</p>
                  <p>Keys: {result.parsedKeys.join(', ') || 'none'}</p>
                  <details>
                    <summary>Content Preview</summary>
                    <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto">
                      {result.content.substring(0, 200)}
                    </pre>
                  </details>
                  {result.diagramCount > 0 && (
                    <details>
                      <summary>Parsed Diagrams</summary>
                      <pre className="bg-gray-100 p-2 text-xs mt-2 overflow-auto">
                        {JSON.stringify(result.parsedContent, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Test */}
      <Card>
        <CardHeader>
          <CardTitle>LocalStorage Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testStorage} className="mb-4">
            Test Storage Documents
          </Button>
          
          {storageTest && (
            <div className="space-y-2">
              {storageTest.map((doc: any, index: number) => (
                <div key={index} className="border p-3 rounded text-sm">
                  <p className="font-semibold">Doc {doc.docIndex} - Type: {doc.type}</p>
                  <p>Has Diagram: <span className={doc.hasDiagram ? 'text-green-600' : 'text-red-600'}>
                    {doc.hasDiagram ? 'YES' : 'NO'}
                  </span></p>
                  <p>Diagrams: {doc.diagramCount}</p>
                  <p>Keys: {doc.parsedKeys.join(', ') || 'none'}</p>
                  <p>Content Length: {doc.contentLength}</p>
                  <details>
                    <summary>First 100 chars</summary>
                    <pre className="bg-gray-100 p-2 text-xs mt-1 overflow-auto">
                      {doc.firstChars}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}