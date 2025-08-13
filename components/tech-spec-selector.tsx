'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { techSpecSections, getAllTechSpecSections, type TechSpecSection } from '@/lib/tech-spec-sections'
import { Info, Settings, Sparkles, ChevronRight, Check, X } from 'lucide-react'

interface TechSpecSelectorProps {
  onSelectionChange?: (selectedSections: string[]) => void
  defaultSelected?: string[]
  mode?: 'simple' | 'detailed'
}

export function TechSpecSelector({ 
  onSelectionChange, 
  defaultSelected = ['system-architecture'],
  mode = 'simple' 
}: TechSpecSelectorProps) {
  const [selectedSections, setSelectedSections] = useState<string[]>(defaultSelected)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const allSections = getAllTechSpecSections()

  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedSections, sectionId]
      : selectedSections.filter(id => id !== sectionId)
    
    setSelectedSections(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectAll = () => {
    const allIds = allSections.map(s => s.id)
    setSelectedSections(allIds)
    onSelectionChange?.(allIds)
  }

  const handleClearAll = () => {
    setSelectedSections([])
    onSelectionChange?.([])
  }

  const handleQuickPreset = (preset: string) => {
    let presetSections: string[] = []
    
    switch(preset) {
      case 'full-stack':
        presetSections = ['system-architecture', 'data-design', 'api-specifications', 'infrastructure-devops']
        break
      case 'api-first':
        presetSections = ['api-specifications', 'data-design', 'security-architecture']
        break
      case 'enterprise':
        presetSections = ['system-architecture', 'security-architecture', 'infrastructure-devops', 'performance-scale']
        break
      case 'startup-mvp':
        presetSections = ['system-architecture', 'api-specifications']
        break
    }
    
    setSelectedSections(presetSections)
    onSelectionChange?.(presetSections)
  }

  if (mode === 'simple') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Technical Specification Focus
          </CardTitle>
          <CardDescription>
            Select the technical areas you want to include in your specification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickPreset('full-stack')}
            >
              Full Stack
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickPreset('api-first')}
            >
              API First
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickPreset('enterprise')}
            >
              Enterprise
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickPreset('startup-mvp')}
            >
              Startup MVP
            </Button>
          </div>

          <div className="grid gap-3">
            {allSections.map((section) => (
              <div key={section.id} className="flex items-start space-x-3">
                <Checkbox
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={section.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.name}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(section.id)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {selectedSections.length} of {allSections.length} selected
            </div>
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
            </div>
          </div>
        </CardContent>

        {showDetails && (
          <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {techSpecSections[showDetails]?.icon}
                  {techSpecSections[showDetails]?.name}
                </DialogTitle>
                <DialogDescription>
                  {techSpecSections[showDetails]?.detailedDescription}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Best For:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {techSpecSections[showDetails]?.bestFor.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Output Sections:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {techSpecSections[showDetails]?.outputSections.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Required Context:</h4>
                    <div className="flex gap-2">
                      {techSpecSections[showDetails]?.requiredContext.map((ctx) => (
                        <Badge key={ctx} variant="secondary">{ctx}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button 
                  variant="default"
                  onClick={() => {
                    if (!selectedSections.includes(showDetails)) {
                      handleSectionToggle(showDetails, true)
                    }
                    setShowDetails(null)
                  }}
                >
                  {selectedSections.includes(showDetails) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Already Selected
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Add to Specification
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Card>
    )
  }

  // Detailed mode with tabs
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced Technical Specification Builder
        </CardTitle>
        <CardDescription>
          Build a comprehensive technical specification by selecting focus areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">Select Areas</TabsTrigger>
            <TabsTrigger value="presets">Quick Presets</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="select" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {allSections.map((section) => (
                <Card 
                  key={section.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSections.includes(section.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleSectionToggle(section.id, !selectedSections.includes(section.id))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{section.icon}</span>
                        <CardTitle className="text-base">{section.name}</CardTitle>
                      </div>
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {section.requiredContext.map((ctx) => (
                        <Badge key={ctx} variant="outline" className="text-xs">
                          Needs: {ctx}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-4">
            <div className="grid gap-4">
              <Card 
                className="cursor-pointer hover:border-primary/50"
                onClick={() => handleQuickPreset('full-stack')}
              >
                <CardHeader>
                  <CardTitle className="text-base">Full Stack Application</CardTitle>
                  <CardDescription>
                    Complete architecture for a full-stack web application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['System Architecture', 'Data Design', 'API Specifications', 'Infrastructure & DevOps']
                      .map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary/50"
                onClick={() => handleQuickPreset('api-first')}
              >
                <CardHeader>
                  <CardTitle className="text-base">API-First Platform</CardTitle>
                  <CardDescription>
                    Focus on API design and data architecture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['API Specifications', 'Data Design', 'Security Architecture']
                      .map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary/50"
                onClick={() => handleQuickPreset('enterprise')}
              >
                <CardHeader>
                  <CardTitle className="text-base">Enterprise System</CardTitle>
                  <CardDescription>
                    Enterprise-grade architecture with security and scale
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['System Architecture', 'Security Architecture', 'Infrastructure & DevOps', 'Performance & Scale']
                      .map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary/50"
                onClick={() => handleQuickPreset('startup-mvp')}
              >
                <CardHeader>
                  <CardTitle className="text-base">Startup MVP</CardTitle>
                  <CardDescription>
                    Lean technical specification for rapid development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['System Architecture', 'API Specifications']
                      .map(name => (
                        <Badge key={name} variant="secondary">{name}</Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Technical Focus Areas</CardTitle>
                <CardDescription>
                  Your technical specification will include the following sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sections selected. Please select at least one focus area.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedSections.map((sectionId, index) => {
                      const section = techSpecSections[sectionId]
                      return (
                        <div key={sectionId} className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span>{section.icon}</span>
                              <h4 className="font-semibold text-sm">{section.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {section.description}
                            </p>
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground">Key outputs:</div>
                              <ul className="mt-1 text-xs text-muted-foreground list-disc pl-4">
                                {section.outputSections.slice(0, 3).map((output, i) => (
                                  <li key={i}>{output}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSectionToggle(sectionId, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}