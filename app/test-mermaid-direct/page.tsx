'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestMermaidDirectPage() {
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const [renderStatus, setRenderStatus] = useState<Record<string, string>>({})
  const diagramRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    // Dynamically import mermaid
    import('mermaid').then(({ default: mermaid }) => {
      setMermaidLoaded(true)
      
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      })

      // Test diagrams
      const diagrams = {
        sequence: `sequenceDiagram
    participant Client
    participant Server
    Client->>Server: Request
    Server-->>Client: Response`,
        
        erDiagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string name
        string custNumber
    }`,
        
        flowchart: `graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Do this]
    B -->|No| D[Do that]`
      }

      // Render each diagram
      Object.entries(diagrams).forEach(async ([key, content]) => {
        const element = diagramRefs.current[key]
        if (!element) return

        try {
          const { svg } = await mermaid.render(`mermaid-${key}-${Date.now()}`, content)
          element.innerHTML = svg
          setRenderStatus(prev => ({ ...prev, [key]: 'success' }))
        } catch (error: any) {
          console.error(`Failed to render ${key}:`, error)
          element.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`
          setRenderStatus(prev => ({ ...prev, [key]: 'error' }))
        }
      })
    }).catch(error => {
      console.error('Failed to load mermaid:', error)
      setMermaidLoaded(false)
    })
  }, [])

  // Also test with localStorage data
  const [storageSequence, setStorageSequence] = useState<string | null>(null)
  
  const loadFromStorage = () => {
    const history = localStorage.getItem('sdlc_document_history')
    if (history) {
      const docs = JSON.parse(history)
      
      // Find a document with sequence diagram
      for (const doc of docs) {
        if (doc.content && doc.content.includes('sequenceDiagram')) {
          // Extract first sequence diagram
          const match = doc.content.match(/sequenceDiagram[\s\S]*?(?=(?:sequenceDiagram|erDiagram|classDiagram|graph|$))/m)
          if (match) {
            setStorageSequence(match[0])
            
            // Try to render it
            import('mermaid').then(({ default: mermaid }) => {
              const element = diagramRefs.current['storage']
              if (element) {
                mermaid.render(`storage-${Date.now()}`, match[0]).then(({ svg }) => {
                  element.innerHTML = svg
                  setRenderStatus(prev => ({ ...prev, storage: 'success' }))
                }).catch(error => {
                  element.innerHTML = `<div style="color: red;">Error: ${error.message}</div>`
                  setRenderStatus(prev => ({ ...prev, storage: 'error' }))
                })
              }
            })
            break
          }
        }
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Direct Mermaid Test</h1>
      
      <div className="mb-4">
        <p className="text-lg">
          Mermaid Status: {' '}
          <span className={mermaidLoaded ? 'text-green-600' : 'text-red-600'}>
            {mermaidLoaded ? '✓ Loaded' : '✗ Not Loaded'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sequence Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>
              Sequence Diagram
              {renderStatus.sequence && (
                <span className={`ml-2 text-sm ${renderStatus.sequence === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  ({renderStatus.sequence})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={el => diagramRefs.current['sequence'] = el}
              className="border rounded p-4 min-h-[200px] bg-white"
            >
              Loading...
            </div>
          </CardContent>
        </Card>

        {/* ER Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>
              ER Diagram
              {renderStatus.erDiagram && (
                <span className={`ml-2 text-sm ${renderStatus.erDiagram === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  ({renderStatus.erDiagram})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={el => diagramRefs.current['erDiagram'] = el}
              className="border rounded p-4 min-h-[200px] bg-white"
            >
              Loading...
            </div>
          </CardContent>
        </Card>

        {/* Flowchart */}
        <Card>
          <CardHeader>
            <CardTitle>
              Flowchart
              {renderStatus.flowchart && (
                <span className={`ml-2 text-sm ${renderStatus.flowchart === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  ({renderStatus.flowchart})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={el => diagramRefs.current['flowchart'] = el}
              className="border rounded p-4 min-h-[200px] bg-white"
            >
              Loading...
            </div>
          </CardContent>
        </Card>

        {/* From Storage */}
        <Card>
          <CardHeader>
            <CardTitle>
              From Storage
              {renderStatus.storage && (
                <span className={`ml-2 text-sm ${renderStatus.storage === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  ({renderStatus.storage})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button 
              onClick={loadFromStorage}
              className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load from Storage
            </button>
            <div 
              ref={el => diagramRefs.current['storage'] = el}
              className="border rounded p-4 min-h-[200px] bg-white"
            >
              Click button to load
            </div>
            {storageSequence && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">View Source</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-1 overflow-auto">
                  {storageSequence}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}