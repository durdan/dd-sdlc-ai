"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  Brain, 
  Code, 
  Palette, 
  GitBranch,
  Sparkles,
  X
} from "lucide-react"

interface DocumentType {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const documentTypes: DocumentType[] = [
  { id: "analysis", name: "Business Analysis", icon: Brain },
  { id: "functional", name: "Functional Spec", icon: FileText },
  { id: "technical", name: "Technical Spec", icon: Code },
  { id: "ux", name: "UX Specification", icon: Palette },
  { id: "mermaid", name: "Mermaid Diagrams", icon: GitBranch },
]

interface DocumentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (selectedDocuments: string[]) => void
  input: string
  isLoading?: boolean
}

export function DocumentSelectionModal({
  isOpen,
  onClose,
  onGenerate,
  input,
  isLoading = false
}: DocumentSelectionModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([
    "analysis", "functional", "technical", "ux", "mermaid"
  ])

  const handleToggleDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleSelectAll = () => {
    setSelectedDocuments(documentTypes.map(doc => doc.id))
  }

  const handleSelectNone = () => {
    setSelectedDocuments([])
  }

  const handleGenerate = () => {
    if (selectedDocuments.length > 0) {
      onGenerate(selectedDocuments)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-blue-400" />
              Select Documents
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-gray-400 text-sm">
            Choose which documents to generate for your project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Actions - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 h-10 text-xs sm:text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="flex-1 h-10 text-xs sm:text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Select None
            </Button>
          </div>

          {/* Document List - Mobile Optimized */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {documentTypes.map((doc) => {
              const Icon = doc.icon
              const isSelected = selectedDocuments.includes(doc.id)
              
              return (
                <div
                  key={doc.id}
                  className={`flex items-center p-3 rounded-lg border transition-all duration-200 cursor-pointer touch-manipulation ${
                    isSelected 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleToggleDocument(doc.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggleDocument(doc.id)}
                    className="mr-3 h-5 w-5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Icon className={`h-5 w-5 mr-3 ${
                    isSelected ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  <Label className={`flex-1 text-sm sm:text-base cursor-pointer ${
                    isSelected ? 'text-blue-300' : 'text-gray-300'
                  }`}>
                    {doc.name}
                  </Label>
                </div>
              )
            })}
          </div>

          {/* Selection Summary - Mobile Optimized */}
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Selected:</span>
              <span className="text-white font-medium">
                {selectedDocuments.length} of {documentTypes.length}
              </span>
            </div>
            {selectedDocuments.length === 0 && (
              <p className="text-red-400 text-xs mt-1">
                Please select at least one document
              </p>
            )}
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 sm:h-10 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={selectedDocuments.length === 0 || isLoading}
              className="flex-1 h-12 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate ({selectedDocuments.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 