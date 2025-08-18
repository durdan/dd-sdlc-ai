"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { V0AvailabilityBadge } from "@/components/wireframe/v0-availability-badge"
import { 
  FileText, 
  Brain, 
  Code, 
  Palette, 
  GitBranch,
  Sparkles,
  X,
  Layout,
  Settings,
  FlaskConical,
  Users
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
  { id: "wireframe", name: "Wireframe", icon: Layout },
  { id: "mermaid", name: "Architecture", icon: GitBranch },
  { id: "coding", name: "AI Coding Prompt", icon: Sparkles },
  { id: "test", name: "Test Spec (TDD/BDD)", icon: FlaskConical }
]

interface DocumentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (selectedDocuments: string[], wireframeModel?: string) => void
  input: string
  isLoading?: boolean
  userId?: string
}

export function DocumentSelectionModal({
  isOpen,
  onClose,
  onGenerate,
  input,
  isLoading = false,
  userId
}: DocumentSelectionModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([
    "analysis", "functional", "technical", "ux", "mermaid"
  ])
  const [wireframeModel, setWireframeModel] = useState<string>("gpt-4")
  const [showWireframeSettings, setShowWireframeSettings] = useState(false)

  useEffect(() => {
    setShowWireframeSettings(selectedDocuments.includes("wireframe"))
  }, [selectedDocuments])

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
      onGenerate(selectedDocuments, wireframeModel)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white p-0 max-w-sm w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-white">
              Choose what to generate
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
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="flex-1 h-8 text-xs bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700"
            >
              None
            </Button>
          </div>

          {/* Document List */}
          <div className="space-y-2">
            {documentTypes.map((doc) => {
              const Icon = doc.icon
              const isSelected = selectedDocuments.includes(doc.id)
              
              return (
                <div
                  key={doc.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500/50' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => handleToggleDocument(doc.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleToggleDocument(doc.id)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                  <Label className={`text-sm font-medium cursor-pointer ${
                    isSelected ? 'text-blue-300' : 'text-gray-300'
                  }`}>
                    {doc.name}
                  </Label>
                </div>
              )
            })}
          </div>

          {/* Wireframe Settings */}
          {showWireframeSettings && (
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">
                  Wireframe Model
                </Label>
                {userId && (
                  <V0AvailabilityBadge userId={userId} />
                )}
              </div>
              <Select value={wireframeModel} onValueChange={setWireframeModel}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="gpt-4" className="text-white hover:bg-gray-700">
                    GPT-4 (Traditional Wireframe)
                  </SelectItem>
                  <SelectItem value="claude-3-opus" className="text-white hover:bg-gray-700">
                    Claude 3 Opus
                  </SelectItem>
                  <SelectItem value="claude-3-sonnet" className="text-white hover:bg-gray-700">
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value="v0-dev" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      v0.dev (React Components)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {wireframeModel === 'v0-dev' && (
                <p className="text-xs text-gray-400">
                  v0.dev generates real React components instead of wireframe mockups
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Selected: <span className="text-white font-medium">{selectedDocuments.length}</span> of {documentTypes.length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 border-t border-gray-700 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 bg-gray-800 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedDocuments.length === 0 || isLoading}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white border-0 font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 