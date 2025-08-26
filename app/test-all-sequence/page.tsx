'use client'

import { useState } from 'react'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fixLocalStorageSequenceDiagram } from '@/lib/fix-localStorage-sequence'
import { Badge } from '@/components/ui/badge'

export default function TestAllSequencePage() {
  const [fixedLocalStorage, setFixedLocalStorage] = useState('')

  // Working diagrams that should NOT be changed
  const workingDiagrams = {
    simple: `sequenceDiagram
    participant Client
    participant API
    participant Database
    
    Client->>API: Request data
    API->>Database: Query
    Database-->>API: Results
    API-->>Client: Response`,
    
    withNotes: `sequenceDiagram
    participant User
    participant Frontend
    participant API
    
    User->>Frontend: Open page
    Note over User,Frontend: Initial load
    
    loop Every 5 seconds
        Frontend->>API: Check for updates
        API-->>Frontend: Response
    end
    
    Note right of API: Processing complete`,
    
    withAliases: `sequenceDiagram
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

  // The problematic localStorage diagram
  const localStorageDiagram = `sequenceDiagram participant USER as User participant APP as Application participant API as "API Service" participant DB as Database participant LOG as "Logging Service" participant MONITOR as Monitoring USER->>APP: "Submit request APP->>API: API call" API->>DB: "Query data" alt Success Path DB-->>API: Data returned API-->>APP: "Success response APP-->>USER: Display result" else Database Error DB--xAPI: "Connection error API->>LOG: Log error" API->>MONITOR: "Alert: DB error API-->>APP: Error response" APP-->>USER: "Show error message" Note over API,MONITOR: "Retry logic" loop Retry 3 times API->>DB: Retry query alt Retry Success DB-->>API: "Data returned API-->>APP: Success response" APP-->>USER: "Display result" else Retry Failed DB--xAPI: Still failing end API->>MONITOR: "Critical alert API-->>APP: Service unavailable" APP-->>USER: "Maintenance message" end`

  // Apply fix to localStorage diagram
  useState(() => {
    setFixedLocalStorage(fixLocalStorageSequenceDiagram(localStorageDiagram))
  })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Comprehensive Sequence Diagram Test</h1>
      <p className="text-gray-600 mb-6">
        Testing that existing diagrams still work while fixing the localStorage issue
      </p>

      <Tabs defaultValue="working" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="working">Working Diagrams</TabsTrigger>
          <TabsTrigger value="localStorage">LocalStorage Fix</TabsTrigger>
        </TabsList>

        <TabsContent value="working" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simple Diagram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Simple Sequence</span>
                  <Badge className="bg-green-100 text-green-800">Should Work</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidViewerEnhanced 
                  diagrams={{ simple: workingDiagrams.simple }}
                  title="Simple"
                  height="300px"
                />
              </CardContent>
            </Card>

            {/* With Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>With Notes & Loops</span>
                  <Badge className="bg-green-100 text-green-800">Should Work</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidViewerEnhanced 
                  diagrams={{ notes: workingDiagrams.withNotes }}
                  title="With Notes"
                  height="300px"
                />
              </CardContent>
            </Card>

            {/* With Aliases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>With Participant Aliases</span>
                  <Badge className="bg-green-100 text-green-800">Should Work</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidViewerEnhanced 
                  diagrams={{ aliases: workingDiagrams.withAliases }}
                  title="With Aliases"
                  height="300px"
                />
              </CardContent>
            </Card>

            {/* All Together */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Working Diagrams</span>
                  <Badge className="bg-green-100 text-green-800">Should All Render</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidViewerEnhanced 
                  diagrams={workingDiagrams}
                  title="All Working"
                  height="300px"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="localStorage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Problem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Original (Broken)</span>
                  <Badge className="bg-red-100 text-red-800">Has Issues</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    View Raw (single line)
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                    {localStorageDiagram}
                  </pre>
                </details>
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    This will fail with parsing errors due to:
                  </p>
                  <ul className="text-xs text-red-600 mt-2 list-disc list-inside">
                    <li>Concatenated messages in quotes</li>
                    <li>Missing line breaks</li>
                    <li>Improper end keyword placement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Fixed Version */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>After Fix</span>
                  <Badge className="bg-green-100 text-green-800">Fixed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    View Fixed Code
                  </summary>
                  <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-auto max-h-40">
                    {fixedLocalStorage}
                  </pre>
                </details>
                <MermaidViewerEnhanced 
                  diagrams={{ fixed: fixedLocalStorage }}
                  title="Fixed localStorage Diagram"
                  height="400px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Fix Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Badge className="bg-blue-100 text-blue-800 mt-1">Approach</Badge>
                  <p className="text-sm text-gray-700">
                    The fix uses a minimal approach that ONLY targets the specific localStorage issue 
                    without breaking existing working diagrams.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-100 text-purple-800 mt-1">Pattern</Badge>
                  <p className="text-sm text-gray-700">
                    Detects patterns like <code className="bg-gray-100 px-1">"Message1 ACTOR->>ACTOR: Message2"</code> 
                    and splits them into separate lines.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-100 text-green-800 mt-1">Safety</Badge>
                  <p className="text-sm text-gray-700">
                    Only applies fix to diagrams that match the localStorage pattern (single line, concatenated messages).
                    Well-formatted diagrams are left untouched.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}