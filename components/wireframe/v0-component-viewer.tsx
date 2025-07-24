'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Code,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
  Sparkles
} from 'lucide-react'
import type { V0ComponentData } from '@/lib/types/wireframe.types'
import { V0ComponentRenderer } from './v0-component-renderer'

interface V0ComponentViewerProps {
  component: V0ComponentData
  title: string
  description: string
}

export function V0ComponentViewer({ component, title, description }: V0ComponentViewerProps) {
  const [showCode, setShowCode] = useState(false)
  const [iframeHeight, setIframeHeight] = useState(600)
  const { toast } = useToast()

  // Create a preview by rendering the component in an iframe
  const createPreviewHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.componentName}</title>
  ${component.styling === 'tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f9fafb;
    }
    ${component.styling === 'css' ? `
    /* Add any custom CSS here */
    ` : ''}
  </style>
</head>
<body>
  <div id="root"></div>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    ${component.code}
    
    // Render the component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(${component.componentName}));
  </script>
</body>
</html>`
    return html
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(component.code)
    toast({
      title: 'Code copied',
      description: 'Component code has been copied to clipboard',
    })
  }

  const handleDownloadCode = () => {
    const blob = new Blob([component.code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${component.componentName}.${component.framework === 'vue' ? 'vue' : 'tsx'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenInV0 = () => {
    // Open in v0.dev for further editing
    window.open('https://v0.dev/new', '_blank')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">
                  {component.framework || 'React'}
                </Badge>
                <Badge variant="secondary">
                  {component.styling || 'Tailwind CSS'}
                </Badge>
                <Badge variant="secondary">
                  Generated with v0.dev
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {showCode ? 'Hide' : 'Show'} Code
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenInV0}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Edit in v0</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold">v0.dev Component Generated</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This is a fully functional React component generated by v0.dev. 
                    Copy the code and use it in your React application.
                  </p>
                  <div className="flex justify-center gap-3 pt-4">
                    <Button onClick={handleCopyCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button variant="outline" onClick={handleOpenInV0}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in v0.dev
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How to use this component:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Copy the code using the button above</li>
                  <li>Create a new file in your React project (e.g., {component.componentName}.tsx)</li>
                  <li>Paste the code and save the file</li>
                  <li>Import and use the component: <code className="bg-blue-100 px-1 rounded">{'<'}{component.componentName} /{'>'}</code></li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="code" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Component Code</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadCode}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[600px] w-full rounded-md border bg-gray-50">
                <pre className="p-4">
                  <code className="text-sm">{component.code}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>To use this component in your project:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Copy the component code above</li>
            <li>Create a new file: <code className="bg-gray-100 px-1 rounded">{component.componentName}.tsx</code></li>
            <li>Paste the code and save the file</li>
            <li>Import and use: <code className="bg-gray-100 px-1 rounded">{`import { ${component.componentName} } from './${component.componentName}'`}</code></li>
          </ol>
          {component.styling === 'tailwind' && (
            <p className="text-xs text-muted-foreground mt-2">
              Note: Ensure Tailwind CSS is configured in your project
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}