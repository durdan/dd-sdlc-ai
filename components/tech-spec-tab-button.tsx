'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Code } from 'lucide-react'
import { Check, ChevronDown } from 'lucide-react'
import { techSpecSections } from '@/lib/tech-spec-sections'

interface TechSpecTabButtonProps {
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
  selectedSections: string[]
  onSectionsChange: (sections: string[]) => void
  hasPreviousDocument?: boolean
}

export function TechSpecTabButton({
  isSelected,
  isDisabled,
  onClick,
  selectedSections,
  onSectionsChange,
  hasPreviousDocument = false
}: TechSpecTabButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const allSections = Object.values(techSpecSections)

  const presets = [
    {
      id: 'default',
      name: 'Default Architecture',
      sections: ['system-architecture']
    },
    {
      id: 'full-stack',
      name: 'Full Stack',
      sections: ['system-architecture', 'data-design', 'api-specifications', 'infrastructure-devops']
    },
    {
      id: 'api-first',
      name: 'API First',
      sections: ['api-specifications', 'data-design', 'security-architecture']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      sections: ['system-architecture', 'security-architecture', 'infrastructure-devops', 'performance-scale']
    },
    {
      id: 'all',
      name: 'All Sections',
      sections: allSections.map(s => s.id)
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleButtonClick = (e: React.MouseEvent) => {
    // If clicking on the dropdown icon area, show dropdown
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect && e.clientX > rect.right - 30) {
      e.preventDefault()
      e.stopPropagation()
      setShowDropdown(!showDropdown)
    } else {
      // Otherwise, select the tab
      onClick()
    }
  }

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionsChange(selectedSections.filter(id => id !== sectionId))
    } else {
      onSectionsChange([...selectedSections, sectionId])
    }
  }

  const applyPreset = (sections: string[]) => {
    onSectionsChange(sections)
    setShowDropdown(false)
  }

  const getSectionLabel = () => {
    if (selectedSections.length === 0 || 
        (selectedSections.length === 1 && selectedSections[0] === 'system-architecture')) {
      return null // Default
    }
    if (selectedSections.length === allSections.length) {
      return 'All'
    }
    return `${selectedSections.length}`
  }

  const sectionLabel = getSectionLabel()

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all
          ${isSelected 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${showDropdown ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}
        `}
      >
        <Code className="h-4 w-4 text-green-600" />
        <span>Technical Spec</span>
        {sectionLabel && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
            {sectionLabel}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        {hasPreviousDocument && (
          <Check className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
        )}
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">Technical Focus Areas</div>
            <div className="text-xs text-gray-500 mt-0.5">Select what to include in your specification</div>
          </div>

          {/* Quick Presets */}
          <div className="px-2 py-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 px-2 mb-1">Quick Presets</div>
            <div className="space-y-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.sections)}
                  className={`
                    w-full px-3 py-1.5 text-left text-sm rounded hover:bg-gray-50
                    ${JSON.stringify(selectedSections) === JSON.stringify(preset.sections) 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700'
                    }
                  `}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section List */}
          <div className="max-h-64 overflow-y-auto py-2">
            {allSections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-2 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  {selectedSections.includes(section.id) && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{section.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{section.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => onSectionsChange([])}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
            <button
              onClick={() => onSectionsChange(allSections.map(s => s.id))}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Select all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}