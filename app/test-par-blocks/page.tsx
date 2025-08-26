'use client'

import { useState } from 'react'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { fixSequenceMinimal } from '@/lib/fix-sequence-minimal'

export default function TestParBlocksPage() {
  const [fixed1, setFixed1] = useState('')
  const [fixed2, setFixed2] = useState('')
  const [showFixed, setShowFixed] = useState(false)

  // First problematic diagram - microservices with malformed par block
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

  // Second problematic diagram - order processing with nested par block
  const diagram2 = `sequenceDiagram
    participant C as Customer
    participant UI as "Web UI"
    participant API as "API Gateway"
    participant ORDER as "Order Service"
    participant INV as "Inventory Service"
    participant PAY as "Payment Service"
    participant SHIP as "Shipping Service"
    participant NOTIFY as "Notification Service"
    C->>UI: "Place order"
    UI->>API: "POST /orders"
    API->>ORDER: "Create order"
    ORDER->>ORDER: "Validate order  par Check Inventory"
    ORDER->>INV: "Check availability"
    INV-->>ORDER: "Items available  and Process Payment"
    ORDER->>PAY: "Process payment"
    PAY->>PAY: "Validate card"
    PAY->>PAY: "Charge amount"
    PAY-->>ORDER: "Payment success"
    end
    ORDER->>INV: "Reserve inventory"
    INV-->>ORDER: "Inventory reserved"
    ORDER->>SHIP: "Create shipment"
    SHIP-->>ORDER: "Shipment created"
    ORDER->>NOTIFY: "Send confirmation"
    NOTIFY->>C: "Email confirmation"
    ORDER-->>API: "Order complete"
    API-->>UI: "Order response"
    UI-->>C: "Order confirmed"`

  const handleFix = () => {
    setFixed1(fixSequenceMinimal(diagram1))
    setFixed2(fixSequenceMinimal(diagram2))
    setShowFixed(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Par Block Fix Test</h1>
      <p className="text-gray-600 mb-6">
        Testing fix for malformed par blocks and mismatched end keywords
      </p>

      <Alert className="mb-6">
        <AlertDescription>
          <strong>Issues being fixed:</strong>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Messages concatenated with "par" keyword: "OrderCreated par Event Processing"</li>
            <li>"and" keywords that should be part of par block structure</li>
            <li>Mismatched or missing "end" keywords</li>
            <li>Improper nesting of control flow blocks</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Button onClick={handleFix} size="lg">
          Fix Both Diagrams
        </Button>
      </div>

      {/* Diagram 1 - Microservices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Diagram 1: Microservices (Original)</span>
              <Badge className="bg-red-100 text-red-800">Has Issues</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View Raw Code
              </summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                {diagram1}
              </pre>
            </details>
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-semibold text-red-700">Parse Error:</p>
              <p className="text-xs text-red-600 mt-1">
                Line 26: Expecting 'SPACE', 'NEWLINE'... got 'end'
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Issue: "OrderCreated par Event Processing" is malformed
              </p>
            </div>
          </CardContent>
        </Card>

        {showFixed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Diagram 1: Fixed</span>
                <Badge className="bg-green-100 text-green-800">Fixed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  View Fixed Code
                </summary>
                <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-auto max-h-60">
                  {fixed1}
                </pre>
              </details>
              <MermaidViewerEnhanced 
                diagrams={{ fixed1 }}
                title="Fixed Microservices Diagram"
                height="400px"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagram 2 - Order Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Diagram 2: Order Processing (Original)</span>
              <Badge className="bg-red-100 text-red-800">Has Issues</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View Raw Code
              </summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-60">
                {diagram2}
              </pre>
            </details>
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-semibold text-red-700">Parse Error:</p>
              <p className="text-xs text-red-600 mt-1">
                Line 20: Expecting 'SPACE', 'NEWLINE'... got 'end'
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Issue: "Validate order par Check Inventory" and mismatched end
              </p>
            </div>
          </CardContent>
        </Card>

        {showFixed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Diagram 2: Fixed</span>
                <Badge className="bg-green-100 text-green-800">Fixed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  View Fixed Code
                </summary>
                <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-auto max-h-60">
                  {fixed2}
                </pre>
              </details>
              <MermaidViewerEnhanced 
                diagrams={{ fixed2 }}
                title="Fixed Order Processing Diagram"
                height="400px"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Fix Summary */}
      {showFixed && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What Was Fixed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-100 text-blue-800 mt-1">1</Badge>
              <div>
                <p className="font-semibold text-sm">Par Block Separation</p>
                <p className="text-sm text-gray-600">
                  "OrderCreated par Event Processing" → "OrderCreated" + new line + "par Event Processing"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-100 text-blue-800 mt-1">2</Badge>
              <div>
                <p className="font-semibold text-sm">And/End Keywords</p>
                <p className="text-sm text-gray-600">
                  "Cart cleared and" → "Cart cleared" + proper "and" keyword for parallel execution
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-blue-100 text-blue-800 mt-1">3</Badge>
              <div>
                <p className="font-semibold text-sm">Block Structure</p>
                <p className="text-sm text-gray-600">
                  Proper indentation and matching of par/end blocks
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className="bg-green-100 text-green-800 mt-1">✓</Badge>
              <div>
                <p className="font-semibold text-sm">Result</p>
                <p className="text-sm text-gray-600">
                  Both diagrams now render correctly with proper parallel execution blocks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}