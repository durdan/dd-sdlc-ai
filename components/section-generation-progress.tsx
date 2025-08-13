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
  isGenerating
}: SectionGenerationProgressProps) {
  const [sectionStatuses, setSectionStatuses] = useState<SectionInfo[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  
  const DocIcon = documentTypeIcons[documentType as keyof typeof documentTypeIcons] || FileText

  useEffect(() => {
    // Initialize section statuses
    const initialStatuses = sections.map(sectionId => ({
      id: sectionId,
      name: sectionDetails[sectionId]?.name || sectionId,
      icon: sectionDetails[sectionId]?.icon || '📄',
      status: 'pending' as const,
      content: undefined,
      error: undefined
    }))
    setSectionStatuses(initialStatuses)
  }, [sections, sectionDetails])

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
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'generating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <Circle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'generating':
        return 'bg-blue-50 border-blue-200 animate-pulse'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
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
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DocIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">
              Generating {sections.length} Section{sections.length > 1 ? 's' : ''}
            </h3>
          </div>
          <Badge variant={isGenerating ? 'default' : 'secondary'}>
            {completedCount} / {totalCount} Complete
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        {isGenerating && (
          <p className="text-sm text-gray-500 mt-2">
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
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      {section.status === 'generating' && (
                        <p className="text-xs text-blue-600 mt-0.5">Generating content...</p>
                      )}
                      {section.status === 'completed' && section.content && (
                        <p className="text-xs text-green-600 mt-0.5">
                          {section.content.length} characters generated
                        </p>
                      )}
                      {section.status === 'error' && (
                        <p className="text-xs text-red-600 mt-0.5">{section.error}</p>
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
                <div className="mt-3 pt-3 border-t">
                  <div className="bg-white rounded-md p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {section.content.substring(0, 500)}
                      {section.content.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {!isGenerating && completedCount === totalCount && totalCount > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Generation Complete!</h4>
              <p className="text-sm text-green-700 mt-0.5">
                All {totalCount} sections have been generated successfully.
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