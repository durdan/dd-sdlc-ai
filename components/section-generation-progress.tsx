'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Circle, 
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Code,
  Palette,
  Database,
  Brain,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SectionInfo {
  id: string
  name: string
  icon: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  content?: string
  error?: string
}

interface SectionGenerationProgressProps {
  documentType: string
  sections: string[]
  sectionDetails?: Record<string, any>
  onSectionComplete?: (sectionId: string, content: string) => void
  isGenerating: boolean
  currentSectionIndex?: number
  sectionProgress?: Record<string, {
    status: 'pending' | 'generating' | 'completed' | 'error'
    content?: string
    error?: string
  }>
}

const documentTypeIcons = {
  business: Brain,
  technical: Code,
  ux: Palette,
  mermaid: Database,
  functional: FileText
}

export function SectionGenerationProgress({
  documentType,
  sections,
  sectionDetails = {},
  onSectionComplete,
  isGenerating,
  currentSectionIndex = 0,
  sectionProgress = {}
}: SectionGenerationProgressProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  const DocIcon = documentTypeIcons[documentType as keyof typeof documentTypeIcons] || FileText

  // Convert sectionProgress to SectionInfo array
  const sectionStatuses: SectionInfo[] = sections.map(sectionId => ({
    id: sectionId,
    name: sectionDetails[sectionId]?.name || sectionId,
    icon: sectionDetails[sectionId]?.icon || '📄',
    status: sectionProgress[sectionId]?.status || 'pending',
    content: sectionProgress[sectionId]?.content,
    error: sectionProgress[sectionId]?.error
  }))

  // Calculate overall progress
  const completedCount = sectionStatuses.filter(s => s.status === 'completed').length
  const totalCount = sectionStatuses.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      case 'generating':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse" />
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin relative" />
          </div>
        )
      case 'error':
        return <Circle className="h-5 w-5 text-red-400" />
      default:
        return <Circle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-800/50 border-emerald-500/30'
      case 'generating':
        return 'bg-gray-800/70 border-blue-500/50 shadow-lg shadow-blue-500/10'
      case 'error':
        return 'bg-gray-800/50 border-red-500/30'
      default:
        return 'bg-gray-800/30 border-gray-700/50'
    }
  }

  if (sections.length === 0) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-amber-900">Using Default Prompt</h4>
            <p className="text-sm text-amber-700 mt-1">
              No specific sections selected. Using the comprehensive default {documentType} prompt for generation.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="p-4 bg-gray-900/50 border-gray-700/50 backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DocIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-medium text-gray-200">
              Generating {sections.length} Section{sections.length > 1 ? 's' : ''}
            </h3>
          </div>
          <Badge 
            variant={isGenerating ? 'default' : 'secondary'}
            className={isGenerating ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}
          >
            {completedCount} / {totalCount} Complete
          </Badge>
        </div>
        <div className="relative">
          <Progress value={progressPercentage} className="h-2 bg-gray-800" />
          {isGenerating && (
            <div className="absolute inset-0 h-2">
              <div className="h-full bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-shimmer" />
            </div>
          )}
        </div>
        {isGenerating && (
          <p className="text-sm text-gray-400 mt-2 font-mono">
            Processing section {currentSectionIndex + 1} of {totalCount}...
          </p>
        )}
      </Card>

      {/* Section List */}
      <div className="space-y-2">
        {sectionStatuses.map((section, index) => (
          <Card 
            key={section.id} 
            className={`transition-all ${getStatusColor(section.status)}`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(section.status)}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-200">{section.name}</h4>
                      {section.status === 'generating' && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-blue-400 font-mono">Generating</span>
                          <span className="text-blue-400 animate-pulse">...</span>
                        </div>
                      )}
                      {section.status === 'completed' && section.content && (
                        <p className="text-xs text-emerald-400 mt-0.5 font-mono">
                          ✓ {(section.content.length / 1000).toFixed(1)}k chars
                        </p>
                      )}
                      {section.status === 'error' && (
                        <p className="text-xs text-red-400 mt-0.5 font-mono">✗ {section.error}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {section.status === 'completed' && section.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.id)}
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {/* Expanded Content Preview */}
              {expandedSections.has(section.id) && section.content && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="bg-gray-950/50 rounded-md p-3 max-h-40 overflow-y-auto border border-gray-800">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {section.content.substring(0, 500)}
                      {section.content.length > 500 && (
                        <span className="text-gray-500">\n\n[... {((section.content.length - 500) / 1000).toFixed(1)}k more chars]</span>
                      )}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Live streaming preview for generating sections */}
              {section.status === 'generating' && section.content && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="bg-gray-950/50 rounded-md p-3 max-h-32 overflow-hidden border border-gray-800 relative">
                    <pre className="text-xs text-emerald-400/90 whitespace-pre-wrap font-mono leading-relaxed animate-fadeIn">
                      {section.content.substring(Math.max(0, section.content.length - 300))}
                      <span className="inline-block w-2 h-3 bg-emerald-400 animate-blink ml-0.5" />
                    </pre>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950/90 to-transparent" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {!isGenerating && completedCount === totalCount && totalCount > 0 && (
        <Card className="p-4 bg-emerald-950/30 border-emerald-500/30 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-30" />
              <CheckCircle2 className="h-5 w-5 text-emerald-400 relative" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-400">Generation Complete!</h4>
              <p className="text-sm text-emerald-400/70 mt-0.5 font-mono">
                All {totalCount} sections generated successfully
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Hook to manage section generation progress
export function useSectionProgress(sections: string[], sectionDetails?: Record<string, any>) {
  const [sectionStatuses, setSectionStatuses] = useState<Record<string, SectionInfo>>({})
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const startGeneration = () => {
    setIsGenerating(true)
    // Initialize all sections as pending
    const initialStatuses: Record<string, SectionInfo> = {}
    sections.forEach(sectionId => {
      initialStatuses[sectionId] = {
        id: sectionId,
        name: sectionDetails?.[sectionId]?.name || sectionId,
        icon: sectionDetails?.[sectionId]?.icon || '📄',
        status: 'pending'
      }
    })
    setSectionStatuses(initialStatuses)
  }

  const updateSectionStatus = (
    sectionId: string, 
    status: 'pending' | 'generating' | 'completed' | 'error',
    content?: string,
    error?: string
  ) => {
    setSectionStatuses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        status,
        content,
        error
      }
    }))
    
    if (status === 'generating') {
      setCurrentSection(sectionId)
    } else if (status === 'completed' || status === 'error') {
      setCurrentSection(null)
    }
  }

  const completeGeneration = () => {
    setIsGenerating(false)
    setCurrentSection(null)
  }

  return {
    sectionStatuses,
    currentSection,
    isGenerating,
    startGeneration,
    updateSectionStatus,
    completeGeneration
  }
}