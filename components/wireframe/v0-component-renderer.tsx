'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

interface V0ComponentRendererProps {
  code: string
  componentName: string
}

export function V0ComponentRenderer({ code, componentName }: V0ComponentRendererProps) {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create a more sophisticated preview
    const createPreview = async () => {
      try {
        setLoading(true)
        setError(null)

        // Transform the TypeScript/JSX code to vanilla JavaScript
        // Remove TypeScript types and interfaces
        let transformedCode = code
          .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
          .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type declarations
          .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
          .replace(/<(\w+)>/g, '') // Remove generic types
          .replace(/React\.FC/g, '') // Remove React.FC
          .replace(/export\s+default\s+/g, '') // Remove export default
          .replace(/export\s+/g, '') // Remove exports
          .replace(/'use client'/g, '') // Remove use client directive

        // Create the HTML with the component
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/lucide.min.css" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f9fafb;
    }
    .error {
      color: red;
      padding: 20px;
      border: 1px solid red;
      border-radius: 4px;
      background: #fee;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // Lucide React icons mock
    const LucideIcons = {
      Search: () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
        React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
        React.createElement('path', { d: 'm21 21-4.35-4.35' })
      ),
      MapPin: () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
        React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
        React.createElement('circle', { cx: 12, cy: 10, r: 3 })
      ),
      Menu: () => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
        React.createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
        React.createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
        React.createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
      ),
      X: () => React.createElement('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
        React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
        React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
      ),
      ChevronRight: () => React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
        React.createElement('polyline', { points: '9 18 15 12 9 6' })
      ),
      Clock: () => React.createElement('span', {}, '🕐'),
      Shield: () => React.createElement('span', {}, '🛡️'),
      Star: () => React.createElement('span', {}, '⭐'),
      Phone: () => React.createElement('span', {}, '📞'),
      Mail: () => React.createElement('span', {}, '✉️'),
      Truck: () => React.createElement('span', {}, '🚚'),
      CreditCard: () => React.createElement('span', {}, '💳'),
      CheckCircle: () => React.createElement('span', {}, '✅'),
    };

    // Make icons available globally
    Object.keys(LucideIcons).forEach(key => {
      window[key] = LucideIcons[key];
    });

    // Component code
    ${transformedCode}

    // Error boundary
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      render() {
        if (this.state.hasError) {
          return React.createElement('div', { className: 'error' }, 
            'Error rendering component: ' + (this.state.error?.message || 'Unknown error')
          );
        }
        return this.props.children;
      }
    }

    // Render the component
    try {
      const App = () => React.createElement(ErrorBoundary, {},
        React.createElement(${componentName}, {})
      );
      
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    } catch (error) {
      document.getElementById('root').innerHTML = '<div class="error">Failed to render: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;

        // Create blob URL
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        setIframeUrl(url)
        setLoading(false)
      } catch (err) {
        console.error('Error creating preview:', err)
        setError(err instanceof Error ? err.message : 'Failed to create preview')
        setLoading(false)
      }
    }

    createPreview()

    // Cleanup
    return () => {
      if (iframeUrl) {
        URL.revokeObjectURL(iframeUrl)
      }
    }
  }, [code, componentName])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to render preview: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          className="w-full h-[600px]"
          title="Component Preview"
          sandbox="allow-scripts"
        />
      )}
    </div>
  )
}