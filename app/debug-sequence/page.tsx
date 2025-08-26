'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { debugFixSequenceDiagram } from '@/lib/debug-sequence-fix'
import { fixLocalStorageSequenceDiagram } from '@/lib/fix-localStorage-sequence'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'

export default function DebugSequencePage() {
  const [debugOutput, setDebugOutput] = useState<any>(null)
  const [fixedOutput, setFixedOutput] = useState('')

  // The problematic diagrams
  const diagram1 = `sequenceDiagram
    participant CLIENT as Client
    participant GATEWAY as "API Gateway"
    participant USER_SVC as "User Service"
    participant PRODUCT_SVC as "Product Service"
    participant CART_SVC as "Cart Service"
    participant ORDER_SVC as "Order Service"
    participant EVENT_BUS as "Event Bus"
    CLIENT->>GATEWAY: "GET /checkout"
    GATEWAY->>USER_SVC: "Get user info"
    USER_SVC-->>GATEWAY: "User data"
    GATEWAY->>CART_SVC: "Get cart items"
    CART_SVC->>PRODUCT_SVC: "Get product details"
    PRODUCT_SVC-->>CART_SVC: "Product info"
    CART_SVC-->>GATEWAY: "Cart with details"
    GATEWAY-->>CLIENT: "Checkout page data"
    CLIENT->>GATEWAY: "POST /orders"
    GATEWAY->>ORDER_SVC: "Create order"
    ORDER_SVC->>EVENT_BUS: "Publish: OrderCreated  par Event Processing"
    EVENT_BUS->>CART_SVC: "Clear cart"
    CART_SVC-->>EVENT_BUS: "Cart cleared  and"
    EVENT_BUS->>USER_SVC: "Update user history"
    USER_SVC-->>EVENT_BUS: "History updated  and"
    EVENT_BUS->>PRODUCT_SVC: "Update inventory"
    PRODUCT_SVC-->>EVENT_BUS: "Inventory updated"
    end
    ORDER_SVC-->>GATEWAY: "Order created"
    GATEWAY-->>CLIENT: "Order confirmation"`

  const runDebug = () => {
    const debug = debugFixSequenceDiagram(diagram1)
    setDebugOutput(debug)
    
    // Also run the actual fix
    const fixed = fixLocalStorageSequenceDiagram(diagram1)
    setFixedOutput(fixed)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Debug Sequence Diagram Fix</h1>
      
      <Button onClick={runDebug} className="mb-6">
        Run Debug Analysis
      </Button>

      {debugOutput && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Debug Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-96 bg-gray-50 p-4 rounded">
                {debugOutput.steps.join('\n')}
              </pre>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Final Fixed Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-green-50 p-4 rounded mb-4">
                {fixedOutput}
              </pre>
              <MermaidViewerEnhanced
                diagrams={{ fixed: fixedOutput }}
                title="Fixed Diagram"
                height="400px"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}