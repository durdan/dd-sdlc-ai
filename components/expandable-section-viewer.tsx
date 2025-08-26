'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, Check, Loader2, FileText, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { MermaidViewerEnhanced } from '@/components/mermaid-viewer-enhanced'
import { parseMermaidDiagrams } from '@/lib/mermaid-parser-simple-fix'

interface SectionData {
  id: string
  name: string
  icon?: string
  description?: string
  content?: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  error?: string
}

interface ExpandableSectionViewerProps {
  sections: SectionData[]
  documentType: string
  isGenerating: boolean
  currentGeneratingSection?: string | null
  onSectionExpand?: (sectionId: string) => void
  streamedContent?: string
}

export function ExpandableSectionViewer({
  sections,
  documentType,
  isGenerating,
  currentGeneratingSection,
  onSectionExpand,
  streamedContent
}: ExpandableSectionViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [fullScreenSection, setFullScreenSection] = useState<string | null>(null)
  const [userCollapsedSections, setUserCollapsedSections] = useState<Set<string>>(new Set())
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const lastGeneratingSection = useRef<string | null>(null)

  // Smart expand/collapse logic
  useEffect(() => {
    if (isGenerating && currentGeneratingSection) {
      // When a new section starts generating
      if (currentGeneratingSection !== lastGeneratingSection.current) {
        // Collapse the previously generating section (if it completed and user didn't manually interact)
        if (lastGeneratingSection.current && 
            !userCollapsedSections.has(lastGeneratingSection.current)) {
          setExpandedSections(prev => {
            const newSet = new Set(prev)
            newSet.delete(lastGeneratingSection.current!)
            return newSet
          })
        }
        
        // Expand the currently generating section (unless user manually collapsed it)
        if (!userCollapsedSections.has(currentGeneratingSection)) {
          setExpandedSections(prev => new Set([...prev, currentGeneratingSection]))
        }
        
        lastGeneratingSection.current = currentGeneratingSection
        
        // Scroll to the currently generating section
        setTimeout(() => {
          const sectionElement = sectionRefs.current[currentGeneratingSection]
          if (sectionElement) {
            sectionElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            })
            
            // Add a brief highlight effect
            setHighlightedSection(currentGeneratingSection)
            setTimeout(() => setHighlightedSection(null), 2000)
          }
        }, 100)
      }
    } else if (!isGenerating) {
      // When generation completes, keep the last section expanded if it has content
      // Only collapse if user hasn't manually interacted with it
      lastGeneratingSection.current = null
    }
  }, [currentGeneratingSection, isGenerating])

  // Auto-scroll to latest content within the generating section
  useEffect(() => {
    if (currentGeneratingSection && streamedContent) {
      const contentElement = contentRefs.current[currentGeneratingSection]
      if (contentElement && expandedSections.has(currentGeneratingSection)) {
        // Scroll the content container to show the latest text
        contentElement.scrollTop = contentElement.scrollHeight
      }
    }
  }, [streamedContent, currentGeneratingSection, expandedSections])
  
  // When generation completes, ensure at least one section is expanded
  useEffect(() => {
    if (!isGenerating && sections.length > 0) {
      const hasExpandedSection = sections.some(s => expandedSections.has(s.id))
      const hasContentSections = sections.filter(s => s.status === 'completed' && s.content)
      
      // If no sections are expanded and we have completed sections with content
      if (!hasExpandedSection && hasContentSections.length > 0) {
        // Expand the first completed section with content
        const firstWithContent = hasContentSections[0]
        if (firstWithContent) {
          setExpandedSections(new Set([firstWithContent.id]))
        }
      }
    }
  }, [isGenerating, sections])

  const toggleSection = (sectionId: string) => {
    // Track user interaction
    setUserCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (expandedSections.has(sectionId)) {
        // User is collapsing
        newSet.add(sectionId)
      } else {
        // User is expanding
        newSet.delete(sectionId)
      }
      return newSet
    })
    
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
        onSectionExpand?.(sectionId)
      }
      return newSet
    })
  }

  const copySection = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedSection(sectionId)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleFullScreen = (sectionId: string) => {
    setFullScreenSection(fullScreenSection === sectionId ? null : sectionId)
  }

  const completedCount = sections.filter(s => s.status === 'completed').length
  const totalCount = sections.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate total content size
  const totalChars = sections.reduce((acc, section) => {
    return acc + (section.content?.length || 0)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Overall Progress Header */}
      {isGenerating && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">
                Generating {documentType} Subsections
              </h3>
            </div>
            <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">
              {completedCount} / {totalCount} Sections
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>
              {currentGeneratingSection ? (
                <span className="text-blue-300 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Section {sections.findIndex(s => s.id === currentGeneratingSection) + 1}/{totalCount}: {sections.find(s => s.id === currentGeneratingSection)?.name || currentGeneratingSection}
                </span>
              ) : completedCount === totalCount ? (
                <span className="text-green-400">✓ All sections generated successfully!</span>
              ) : (
                'Processing sections...'
              )}
            </span>
            <span className="text-white font-medium">{progressPercentage}%</span>
          </div>
        </div>
      )}

      {/* Completed Summary */}
      {!isGenerating && completedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Document generated successfully
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-green-700">
            <span>{completedCount} section{completedCount !== 1 ? 's' : ''}</span>
            {totalChars > 0 && (
              <>
                <span>•</span>
                <span>{totalChars.toLocaleString()} characters</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {sections.length > 1 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setExpandedSections(new Set(sections.map(s => s.id)))
              setUserCollapsedSections(new Set()) // Clear user collapse tracking
            }}
            className="text-xs"
          >
            Expand All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setExpandedSections(new Set())
              // Mark all as user-collapsed to prevent auto-expansion
              setUserCollapsedSections(new Set(sections.map(s => s.id)))
            }}
            className="text-xs"
          >
            Collapse All
          </Button>
        </div>
      )}

      {/* Expandable Sections */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id)
          const isCurrentlyGenerating = section.id === currentGeneratingSection
          const isFullScreen = fullScreenSection === section.id
          
          // Get content to display
          // For the currently generating section, use either streamed content or the section's partial content
          const displayContent = isCurrentlyGenerating 
            ? (streamedContent || section.content || '') 
            : section.content

          return (
            <div
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className={cn(
                "border rounded-lg transition-all duration-300",
                section.status === 'completed' ? 'border-gray-200 bg-white' :
                section.status === 'generating' ? 'border-blue-200 bg-blue-50 shadow-lg' :
                section.status === 'error' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50',
                isFullScreen && 'fixed inset-4 z-50 overflow-auto',
                highlightedSection === section.id && 'ring-2 ring-indigo-500 ring-offset-2'
              )}
            >
              {/* Section Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  isExpanded && "border-b border-gray-200"
                )}
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Expand/Collapse Icon */}
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex items-center justify-center w-5 h-5">
                    {section.status === 'completed' && <Check className="h-4 w-4 text-green-600" />}
                    {section.status === 'generating' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                    {section.status === 'error' && <span className="text-red-600 text-sm">✗</span>}
                    {section.status === 'pending' && <span className="text-gray-400 text-sm">○</span>}
                  </div>
                  
                  {/* Section Title */}
                  <div className="flex items-center gap-2">
                    {section.icon && <span className="text-lg">{section.icon}</span>}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {section.name}
                      </h4>
                      {section.description && !isExpanded && (
                        <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Section Metadata */}
                <div className="flex items-center gap-3">
                  {section.status === 'generating' && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Generating...
                    </Badge>
                  )}
                  
                  {section.status === 'completed' && section.content && (
                    <Badge variant="outline" className="text-xs">
                      {section.content.length.toLocaleString()} chars
                    </Badge>
                  )}
                  
                  {section.status === 'error' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Error
                    </Badge>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Description */}
                  {section.description && (
                    <p className="text-sm text-gray-600 pb-2 border-b border-gray-100">
                      {section.description}
                    </p>
                  )}
                  
                  {/* Content or Status Messages */}
                  {section.status === 'generating' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating content for this section...</span>
                      </div>
                      {displayContent && (() => {
                        // Check if content contains Mermaid diagrams (only once)
                        const mermaidDiagrams = parseMermaidDiagrams(displayContent)
                        const hasDiagrams = Object.keys(mermaidDiagrams).length > 0
                        
                        return (
                          <div 
                            ref={el => contentRefs.current[section.id] = el}
                            className={`rounded-lg border p-4 max-h-96 overflow-y-auto ${
                              hasDiagrams ? 'bg-gray-900 border-blue-600' : 'bg-white border-gray-200'
                            }`}
                          >
                            {hasDiagrams ? (
                              <MermaidViewerEnhanced 
                                diagrams={mermaidDiagrams}
                                title={section.name}
                              />
                            ) : (
                              // Render as markdown with light theme
                              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-code:bg-gray-100 prose-code:text-gray-800 prose-pre:bg-gray-100">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {displayContent}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  
                  {section.status === 'completed' && displayContent && (
                    <div className="space-y-3">
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            copySection(section.id, displayContent)
                          }}
                          className="text-xs"
                        >
                          {copiedSection === section.id ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFullScreen(section.id)
                          }}
                          className="text-xs"
                        >
                          {isFullScreen ? (
                            <>
                              <Minimize2 className="h-3 w-3 mr-1" />
                              Exit Fullscreen
                            </>
                          ) : (
                            <>
                              <Maximize2 className="h-3 w-3 mr-1" />
                              Fullscreen
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Content Display */}
                      {(() => {
                        // Check if content contains Mermaid diagrams (only once)
                        const mermaidDiagrams = parseMermaidDiagrams(displayContent)
                        const hasDiagrams = Object.keys(mermaidDiagrams).length > 0
                        
                        return (
                          <div 
                            ref={el => contentRefs.current[section.id] = el}
                            className={cn(
                              "rounded-lg border p-4 overflow-y-auto",
                              // Use dark theme only for diagrams, light theme for text content
                              hasDiagrams ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
                              isFullScreen ? "max-h-[calc(100vh-200px)]" : "max-h-96"
                            )}
                          >
                            {hasDiagrams ? (
                              <MermaidViewerEnhanced 
                                diagrams={mermaidDiagrams}
                                title={section.name}
                              />
                            ) : (
                              // Render as markdown with light theme
                              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-code:bg-gray-100 prose-code:text-gray-800 prose-pre:bg-gray-100">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {displayContent}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  
                  {section.status === 'pending' && (
                    <div className="text-sm text-gray-500 italic">
                      Waiting to generate...
                    </div>
                  )}
                  
                  {section.status === 'error' && (
                    <div className="text-sm text-red-600">
                      <span className="font-medium">Error:</span> {section.error || 'Failed to generate this section'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}