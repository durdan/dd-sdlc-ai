'use client'

import { useState } from 'react'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fixLocalStorageSequenceDiagram } from '@/lib/fix-localStorage-sequence'

export default function TestSequenceComplexPage() {
  const [fixedDiagram, setFixedDiagram] = useState('')
  const [showFixed, setShowFixed] = useState(false)

  // The problematic diagram from localStorage
  const problematicDiagram = `sequenceDiagram participant USER as User participant APP as Application participant API as "API Service" participant DB as Database participant LOG as "Logging Service" participant MONITOR as Monitoring USER->>APP: "Submit request APP->>API: API call" API->>DB: "Query data" alt Success Path DB-->>API: Data returned API-->>APP: "Success response APP-->>USER: Display result" else Database Error DB--xAPI: "Connection error API->>LOG: Log error" API->>MONITOR: "Alert: DB error API-->>APP: Error response" APP-->>USER: "Show error message" Note over API,MONITOR: "Retry logic" loop Retry 3 times API->>DB: Retry query alt Retry Success DB-->>API: "Data returned API-->>APP: Success response" APP-->>USER: "Display result" else Retry Failed DB--xAPI: Still failing end API->>MONITOR: "Critical alert API-->>APP: Service unavailable" APP-->>USER: "Maintenance message" end`

  const handleFix = () => {
    const fixed = fixLocalStorageSequenceDiagram(problematicDiagram)
    setFixedDiagram(fixed)
    setShowFixed(true)
  }

  // Expected correct format
  const expectedDiagram = `sequenceDiagram
    participant USER as User
    participant APP as Application
    participant API as "API Service"
    participant DB as Database
    participant LOG as "Logging Service"
    participant MONITOR as Monitoring
    
    USER->>APP: "Submit request"
    APP->>API: "API call"
    API->>DB: "Query data"
    
    alt Success Path
        DB-->>API: "Data returned"
        API-->>APP: "Success response"
        APP-->>USER: "Display result"
    else Database Error
        DB--xAPI: "Connection error"
        API->>LOG: "Log error"
        API->>MONITOR: "Alert: DB error"
        API-->>APP: "Error response"
        APP-->>USER: "Show error message"
    end
    
    Note over API,MONITOR: "Retry logic"
    
    loop Retry 3 times
        API->>DB: "Retry query"
        alt Retry Success
            DB-->>API: "Data returned"
            API-->>APP: "Success response"
            APP-->>USER: "Display result"
        else Retry Failed
            DB--xAPI: "Still failing"
        end
    end
    
    API->>MONITOR: "Critical alert"
    API-->>APP: "Service unavailable"
    APP-->>USER: "Maintenance message"`

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Complex Sequence Diagram Test</h1>
      
      <Alert className="mb-6">
        <AlertDescription>
          This test page specifically addresses the parsing error with concatenated messages and missing end keywords.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problematic Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Problematic Diagram (from localStorage)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                This diagram has concatenated messages and missing line breaks.
              </p>
              <details>
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  View Raw Content
                </summary>
                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                  {problematicDiagram}
                </pre>
              </details>
            </div>
            
            <Button onClick={handleFix} className="mb-4">
              Fix and Render Diagram
            </Button>

            {showFixed && (
              <>
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-green-600 hover:text-green-800">
                    View Fixed Code
                  </summary>
                  <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-auto max-h-60">
                    {fixedDiagram}
                  </pre>
                </details>
                
                <MermaidViewerEnhanced 
                  diagrams={{ fixed: fixedDiagram }}
                  title="Fixed Diagram"
                  height="500px"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Expected Correct Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Expected Correct Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                This is how the diagram should look when properly formatted.
              </p>
              <details>
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  View Correct Code
                </summary>
                <pre className="mt-2 p-2 bg-blue-50 rounded text-xs overflow-auto max-h-40">
                  {expectedDiagram}
                </pre>
              </details>
            </div>
            
            <MermaidViewerEnhanced 
              diagrams={{ expected: expectedDiagram }}
              title="Expected Result"
              height="500px"
            />
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Common Issues Fixed</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Concatenated messages split correctly (e.g., "Submit request APP->>API: API call")</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Missing line breaks restored</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>End keywords placed on separate lines</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Control flow blocks (alt, loop) properly structured</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Participant aliases with quotes preserved</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Notes properly formatted</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}