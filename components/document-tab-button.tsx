'use client'

import React, { useState, useRef, useEffect } from 'react'
import { TabsTrigger } from '@/components/ui/tabs'
import { Check, ChevronDown, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DocumentTabButtonProps {
  documentType: string
  documentName: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
  selectedSections: string[]
  onSectionsChange: (sections: string[]) => void
  hasPreviousDocument: boolean
  sections: Record<string, { id: string; name: string; description: string; icon?: string }>
}

export function DocumentTabButton({
  documentType,
  documentName,
  icon: Icon,
  color,
  isSelected,
  isDisabled,
  onClick,
  selectedSections,
  onSectionsChange,
  hasPreviousDocument,
  sections
}: DocumentTabButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMainClick = () => {
    if (!isDisabled) {
      onClick()
    }
  }

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDisabled) {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const toggleSection = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionsChange(selectedSections.filter(id => id !== sectionId))
    } else {
      onSectionsChange([...selectedSections, sectionId])
    }
    
    // Save to localStorage
    const storageKey = `${documentType}Sections`
    localStorage.setItem(storageKey, JSON.stringify(
      selectedSections.includes(sectionId) 
        ? selectedSections.filter(id => id !== sectionId)
        : [...selectedSections, sectionId]
    ))
  }

  const selectAll = () => {
    const allSectionIds = Object.keys(sections)
    onSectionsChange(allSectionIds)
    localStorage.setItem(`${documentType}Sections`, JSON.stringify(allSectionIds))
  }

  const selectNone = () => {
    onSectionsChange([])
    localStorage.setItem(`${documentType}Sections`, JSON.stringify([]))
  }

  const sectionsList = Object.values(sections)

  return (
    <div className="relative">
      <div className={`flex items-center ${isDisabled ? 'opacity-50' : ''}`}>
        <TabsTrigger
          value={documentType}
          disabled={isDisabled}
          onClick={handleMainClick}
          className={`flex items-center gap-1.5 h-auto py-2 px-3 rounded-r-none border-r-0 ${
            isSelected ? 'bg-white' : ''
          }`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm">{documentName}</span>
          {hasPreviousDocument && (
            <Check className="h-3 w-3 text-green-600 ml-1" />
          )}
          {selectedSections.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1 py-0 text-[10px] h-4">
              {selectedSections.length}
            </Badge>
          )}
        </TabsTrigger>
        
        <button
          onClick={handleDropdownClick}
          disabled={isDisabled}
          className={`h-full px-1.5 border-l border-gray-200 rounded-l-none rounded-r-md hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-white' : 'bg-gray-50'
          } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
        </button>
      </div>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                Select {documentName} Sections
              </h3>
              <Settings className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">
              Choose which sections to generate. Each section will be generated with focused detail.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {sectionsList.map((section) => (
              <div
                key={section.id}
                className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-center w-5 h-5 mt-0.5">
                  {selectedSections.includes(section.id) ? (
                    <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    {section.icon && <span className="text-sm">{section.icon}</span>}
                    <span className="text-sm font-medium text-gray-900">
                      {section.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {section.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={selectAll}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={selectNone}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            <div className="text-xs text-gray-500 self-center">
              {selectedSections.length} of {sectionsList.length} selected
            </div>
          </div>
        </div>
      )}
    </div>
  )
}