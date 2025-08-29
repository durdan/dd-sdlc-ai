'use client'

import { useState } from 'react'
import { DocumentSelectionImproved } from '@/components/document-selection-improved'
import { DocumentButtonWithSections } from '@/components/document-button-with-sections'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Code, Palette, Brain } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestImprovedSelectionPage() {
  const [lastSelection, setLastSelection] = useState<{ type: string; sections?: string[] } | null>(null)

  const handleSelection = (type: string, sections?: string[]) => {
    setLastSelection({ type, sections })
    console.log('Selected:', { type, sections })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-2">Improved Document Selection UX Test</h1>
      <p className="text-gray-600 mb-8">
        Compare the original and improved document selection interfaces
      </p>

      <Alert className="mb-8">
        <AlertDescription>
          <strong>Key improvements:</strong>
          <ul className="list-disc list-inside mt-2 text-sm space-y-1">
            <li>Clear choice between "Quick draft" and "Custom build" modes</li>
            <li>Mode persisted in localStorage</li>
            <li>Presets for quick section selection</li>
            <li>Review step before generation</li>
            <li>Better accessibility with proper ARIA labels and keyboard navigation</li>
            <li>Clearer copy and visual hierarchy</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Version */}
        <Card>
          <CardHeader>
            <CardTitle>Original Version</CardTitle>
            <CardDescription>
              Current implementation with dropdown menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentButtonWithSections
              icon={FileText}
              label="Business Analysis"
              color="text-blue-600"
              documentType="business"
              onSelect={handleSelection}
            />
            <DocumentButtonWithSections
              icon={Code}
              label="Technical Specification"
              color="text-green-600"
              documentType="technical"
              onSelect={handleSelection}
            />
            <div className="text-sm text-gray-500 mt-4">
              Issues:
              <ul className="list-disc list-inside mt-1">
                <li>Confusing "Full Document" vs "Selected" options</li>
                <li>No clear indication of what each option does</li>
                <li>Presets mixed with generation buttons</li>
                <li>No review before generation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Improved Version */}
        <Card>
          <CardHeader>
            <CardTitle>Improved Version</CardTitle>
            <CardDescription>
              Clearer two-path approach with better UX
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentSelectionImproved
              icon={FileText}
              label="Business Analysis"
              color="text-blue-600"
              documentType="business"
              onSelect={handleSelection}
            />
            <DocumentSelectionImproved
              icon={Code}
              label="Technical Specification"
              color="text-green-600"
              documentType="technical"
              onSelect={handleSelection}
            />
            <div className="text-sm text-gray-500 mt-4">
              Improvements:
              <ul className="list-disc list-inside mt-1">
                <li>Clear mode selection at the top</li>
                <li>Descriptive helper text for each mode</li>
                <li>Presets separate from actions</li>
                <li>Review modal before generation</li>
                <li>Better visual hierarchy</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Selection Display */}
      {lastSelection && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Last Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(lastSelection, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>How to test:</strong>
        </p>
        <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
          <li>Click either button to open the selection modal</li>
          <li>Try switching between "Quick draft" and "Custom build" modes</li>
          <li>In Custom build mode, try the presets and section selection</li>
          <li>Notice the review step before generation</li>
          <li>Check that mode persists after refresh (localStorage)</li>
        </ol>
      </div>
    </div>
  )
}