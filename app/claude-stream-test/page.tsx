'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClaudeStreamTest() {
  const [description, setDescription] = useState('Create a simple React button component with TypeScript')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamOutput, setStreamOutput] = useState<string[]>([])
  const [error, setError] = useState('')

  const startStream = async () => {
    if (!description.trim()) return

    setIsStreaming(true)
    setStreamOutput([])
    setError('')

    try {
      const response = await fetch('/api/claude-stream-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Stream failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data)
                if (parsed.type === 'chunk') {
                  setStreamOutput(prev => [...prev, `[${parsed.count}] ${parsed.content}`])
                } else if (parsed.type === 'complete') {
                  setStreamOutput(prev => [...prev, `✅ Stream completed! Total chunks: ${parsed.totalChunks}`])
                } else if (parsed.type === 'error') {
                  setStreamOutput(prev => [...prev, `❌ Error: ${parsed.error}`])
                }
              } catch {
                // If not JSON, it's a plain message
                setStreamOutput(prev => [...prev, data])
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🌊 Claude Streaming Test</CardTitle>
          <CardDescription>
            Test Claude API streaming to debug real-time responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Description for Claude:
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter what you want Claude to create..."
              rows={3}
              disabled={isStreaming}
            />
          </div>
          
          <Button 
            onClick={startStream} 
            disabled={isStreaming || !description.trim()}
            className="w-full"
          >
            {isStreaming ? '🌊 Streaming...' : '🚀 Start Claude Stream Test'}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              ❌ Error: {error}
            </div>
          )}

          {streamOutput.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">🌊 Stream Output:</h3>
              <div className="bg-gray-50 p-4 rounded border h-96 overflow-y-auto font-mono text-sm">
                {streamOutput.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
                {isStreaming && (
                  <div className="text-blue-600">
                    🔄 Streaming in progress...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 