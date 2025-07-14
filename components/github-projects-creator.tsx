"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GitHubProjectsVisualProgress } from './github-projects-visual-progress'
import { AlertCircle, Github, Check, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Import the document parser
const sdlcDocumentParser = require('@/lib/sdlc-document-parser');
const { parseSDLCDocument, ensureDefaultSubsections } = sdlcDocumentParser;

interface GitHubProjectsCreatorProps {
  documents?: any
  projectTitle?: string
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export function GitHubProjectsCreator({ 
  documents = {}, 
  projectTitle = '',
  onSuccess,
  onError
}: GitHubProjectsCreatorProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [repositories, setRepositories] = useState<any[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [stepProgress, setStepProgress] = useState<Record<string, number>>({})
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'in_progress' | 'complete' | 'failed'>>({})
  const [createdProjectUrl, setCreatedProjectUrl] = useState<string>('')
  
  const [config, setConfig] = useState({
    projectName: projectTitle || `SDLC Project - ${new Date().toLocaleDateString()}`,
    repositoryOwner: '',
    repositoryName: '',
    includeIssues: true,
    includeCustomFields: true,
    createPhaseBasedMilestones: true,
    generateLabels: true
  })

  // Load repositories when component mounts
  React.useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    setIsLoadingRepos(true)
    try {
      const response = await fetch('/api/integrations/github-projects?action=repositories', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.repositories) {
          setRepositories(data.repositories)
          
          // Auto-select first repository if available
          if (data.repositories.length > 0) {
            const firstRepo = data.repositories[0]
            setConfig(prev => ({
              ...prev,
              repositoryOwner: firstRepo.owner.login,
              repositoryName: firstRepo.name
            }))
          }
        } else {
          console.warn('Failed to load GitHub repositories:', data.error)
          setErrorMessage('Failed to load repositories. Please check your GitHub connection.')
        }
      } else {
        throw new Error(`HTTP error ${response.status}`)
      }
    } catch (error) {
      console.error('Error loading GitHub repositories:', error)
      setErrorMessage('Error loading repositories. Please try reconnecting to GitHub.')
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const handleCreateProject = async () => {
    if (!config.repositoryOwner || !config.repositoryName || !config.projectName) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    setErrorMessage('')
    setSuccessMessage('')
    setCreatedProjectUrl('')
    
    // Reset all progress
    setStepProgress({
      analyzing: 0,
      structure: 0,
      issues: 0,
      workflows: 0,
      sync: 0
    })
    setStepStatus({
      analyzing: 'pending',
      structure: 'pending',
      issues: 'pending',
      workflows: 'pending',
      sync: 'pending'
    })

    try {
      // Start with document analysis
      setCurrentStep('analyzing')
      setStepStatus(prev => ({ ...prev, analyzing: 'in_progress' }))
      updateProgress('analyzing', 10)
      
      // Parse the SDLC document into the required structure
      const parsedDocument = parseSDLCDocument({
        businessAnalysis: documents.businessAnalysis || '',
        functionalSpec: documents.functionalSpec || '',
        technicalSpec: documents.technicalSpec || '',
        uxSpec: documents.uxSpec || '',
        comprehensive: documents.comprehensive || '',
        mermaidDiagrams: documents.mermaidDiagrams || '',
        architecture: documents.architecture || ''
      })
      
      // Ensure we have default subsections if parsing didn't find any
      const sdlcDocument = ensureDefaultSubsections(parsedDocument)
      
      // Log the document structure for debugging
      console.log('Parsed document structure:', 
        Object.keys(sdlcDocument).map(section => 
          `${section}: ${Object.keys(sdlcDocument[section] || {}).length} subsections`
        )
      )
      
      updateProgress('analyzing', 50)
      
      // Complete analyzing step
      updateProgress('analyzing', 100)
      setStepStatus(prev => ({ ...prev, analyzing: 'complete' }))
      
      // Start structure creation
      setCurrentStep('structure')
      setStepStatus(prev => ({ ...prev, structure: 'in_progress' }))
      updateProgress('structure', 10)

      // Make API call to create project
      const response = await fetch('/api/integrations/github-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create-sdlc-project',
          ownerId: config.repositoryOwner,
          projectTitle: config.projectName.trim(),
          sdlcDocument,
          repositoryOwner: config.repositoryOwner,
          repositoryName: config.repositoryName,
          includeIssues: config.includeIssues,
          includeCustomFields: config.includeCustomFields,
          options: {
            createPhaseBasedMilestones: config.createPhaseBasedMilestones,
            generateLabels: config.generateLabels
          }
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Use actual backend progress from API response
        if (result.steps) {
          // Map backend steps to frontend steps
          const stepMapping = {
            'projectCreation': 'structure',
            'repositoryResolution': 'structure', 
            'customFields': 'workflows',
            'milestones': 'workflows',
            'issues': 'issues'
          }

          // Update progress based on backend steps
          Object.entries(result.steps).forEach(([backendStep, stepData]: [string, any]) => {
            const frontendStep = stepMapping[backendStep as keyof typeof stepMapping]
            if (frontendStep && stepData) {
              // Use backend progress if available, otherwise calculate based on status
              const progress = stepData.progress || (
                stepData.status === 'complete' ? 100 :
                stepData.status === 'in_progress' ? 50 :
                stepData.status === 'failed' ? 100 : 0
              )
              
              updateProgress(frontendStep, progress)
              
              if (stepData.status === 'complete') {
                setStepStatus(prev => ({ ...prev, [frontendStep]: 'complete' }))
              } else if (stepData.status === 'failed') {
                setStepStatus(prev => ({ ...prev, [frontendStep]: 'failed' }))
              }
            }
          })

          // Ensure sync step is completed
          setCurrentStep('sync')
          setStepStatus(prev => ({ ...prev, sync: 'in_progress' }))
          updateProgress('sync', 50)
          setTimeout(() => {
            updateProgress('sync', 100)
            setStepStatus(prev => ({ ...prev, sync: 'complete' }))
          }, 500)
        } else {
          // Fallback to complete all steps if no detailed progress
          setStepStatus(prev => ({ 
            ...prev, 
            structure: 'complete',
            issues: 'complete',
            workflows: 'complete',
            sync: 'complete'
          }))
          updateProgress('structure', 100)
          updateProgress('issues', 100)
          updateProgress('workflows', 100)
          updateProgress('sync', 100)
        }
        
        // Extract project URL and issue count from backend response
        const projectUrl = result.project?.url || ''
        const issuesCreated = result.statistics?.totalIssuesCreated || 0
        const milestonesCreated = result.statistics?.totalMilestonesCreated || 0
        
        setCreatedProjectUrl(projectUrl)
        setSuccessMessage(
          `GitHub project "${config.projectName}" created successfully! ` +
          `${issuesCreated} issues and ${milestonesCreated} milestones created.`
        )
        
        // Include backend warnings in success message if any
        if (result.warnings && result.warnings.length > 0) {
          setSuccessMessage(prev => prev + '\n\nNotes:\n' + result.warnings.join('\n'))
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess({
            ...result,
            repositoryOwner: config.repositoryOwner,
            repositoryName: config.repositoryName
          })
        }
      } else {
        throw new Error(result.error || 'GitHub project creation failed')
      }
    } catch (error) {
      console.error('GitHub project creation error:', error)
      setErrorMessage(`Failed to create GitHub project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Mark current step as failed
      if (currentStep) {
        setStepStatus(prev => ({ ...prev, [currentStep]: 'failed' }))
      }
      
      // Call error callback if provided
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'))
      }
    } finally {
      setIsCreating(false)
    }
  }
  
  // Helper function to get GitHub token
  const getGitHubToken = async () => {
    // This would need to be implemented to get the token from cookies or API
    // For now, we'll rely on the backend to handle repository association
    return ''
  }
  
  // Helper functions for progress tracking
  const updateProgress = (step: string, progress: number) => {
    setStepProgress(prev => ({
      ...prev,
      [step]: progress
    }))
  }
  
  // Check if we have any documents to work with
  const hasDocuments = documents && typeof documents === 'object' && 
    (documents.businessAnalysis || documents.functionalSpec || 
     documents.technicalSpec || documents.uxSpec || 
     documents.comprehensive || documents.architecture)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          Create GitHub Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasDocuments && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Documents Available</AlertTitle>
            <AlertDescription>
              No SDLC documents found. Please generate some documentation first before creating a GitHub project.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {successMessage}
              {createdProjectUrl && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(createdProjectUrl, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View GitHub Project
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={config.projectName}
              onChange={(e) => setConfig(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <Label htmlFor="repository">Repository (Issues will be created here)</Label>
            <Select 
              value={`${config.repositoryOwner}/${config.repositoryName}`} 
              onValueChange={(value) => {
                const [owner, name] = value.split('/')
                setConfig(prev => ({ ...prev, repositoryOwner: owner, repositoryName: name }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRepos ? "Loading repositories..." : "Select repository for issues"} />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.full_name}>
                    <div className="flex items-center gap-2">
                      <span>{repo.full_name}</span>
                      {repo.private && <Badge variant="secondary" className="text-xs">Private</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Issues and milestones will be created in this repository and linked to your project
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-blue-800">📋 How GitHub Projects v2 Works:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Project Board:</strong> Created in your global GitHub workspace</li>
              <li>• <strong>Issues & Milestones:</strong> Created in the selected repository ({config.repositoryOwner && config.repositoryName ? `${config.repositoryOwner}/${config.repositoryName}` : 'selected repo'})</li>
              <li>• <strong>Linking:</strong> Repository issues are automatically linked to the global project</li>
              <li>• <strong>Management:</strong> View and manage everything from the project board</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-issues">Include Issues</Label>
            <Switch
              id="include-issues"
              checked={config.includeIssues}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeIssues: checked }))}
              disabled={isCreating || !hasDocuments}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="include-custom-fields">Include Custom Fields</Label>
            <Switch
              id="include-custom-fields"
              checked={config.includeCustomFields}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCustomFields: checked }))}
              disabled={isCreating || !hasDocuments}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="create-milestones">Create Phase-Based Milestones</Label>
            <Switch
              id="create-milestones"
              checked={config.createPhaseBasedMilestones}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, createPhaseBasedMilestones: checked }))}
              disabled={isCreating || !hasDocuments}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="generate-labels">Generate Labels</Label>
            <Switch
              id="generate-labels"
              checked={config.generateLabels}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, generateLabels: checked }))}
              disabled={isCreating || !hasDocuments}
            />
          </div>
        </div>
        
        {/* Document Summary */}
        {hasDocuments && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Available Documents</h4>
            <div className="text-xs text-blue-700 space-y-1">
              {documents.businessAnalysis && <div>✓ Business Analysis</div>}
              {documents.functionalSpec && <div>✓ Functional Specification</div>}
              {documents.technicalSpec && <div>✓ Technical Specification</div>}
              {documents.uxSpec && <div>✓ UX Specification</div>}
              {documents.comprehensive && <div>✓ Comprehensive Document</div>}
              {documents.architecture && <div>✓ Architecture/Diagrams</div>}
            </div>
          </div>
        )}
        
        {/* Visual Progress Indicator */}
        {isCreating && (
          <GitHubProjectsVisualProgress
            steps={{
              analyzing: {
                label: 'Analyzing SDLC documents',
                status: stepStatus.analyzing || 'pending',
                progress: stepProgress.analyzing || 0
              },
              structure: {
                label: 'Creating GitHub project structure',
                status: stepStatus.structure || 'pending',
                progress: stepProgress.structure || 0
              },
              issues: {
                label: 'Generating GitHub issues',
                status: stepStatus.issues || 'pending',
                progress: stepProgress.issues || 0
              },
              workflows: {
                label: 'Setting up project workflows',
                status: stepStatus.workflows || 'pending',
                progress: stepProgress.workflows || 0
              },
              sync: {
                label: 'Syncing with SDLC phases',
                status: stepStatus.sync || 'pending',
                progress: stepProgress.sync || 0
              }
            }}
            currentStep={currentStep}
          />
        )}
        
        <Button 
          onClick={handleCreateProject} 
          disabled={isCreating || !config.projectName || !config.repositoryOwner || !config.repositoryName || !hasDocuments}
          className="w-full"
        >
          {isCreating ? 'Creating GitHub Project...' : 
           createdProjectUrl ? 'Update/Recreate GitHub Project' : 
           'Create GitHub Project'}
        </Button>
        
        {createdProjectUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Project Created Successfully</span>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Your GitHub project has been created in your global workspace, with all issues and milestones created in the selected repository ({config.repositoryOwner}/{config.repositoryName}) and linked to the project.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => window.open(createdProjectUrl, '_blank')}
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Project
              </Button>
              <Button
                onClick={handleCreateProject}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isCreating}
              >
                Update Project
              </Button>
            </div>
            <p className="text-xs text-green-600 mt-2">
              <strong>About GitHub Projects v2:</strong> The project board is created in your global GitHub workspace, while all issues and milestones are created in the selected repository and automatically linked to the project. This allows you to manage repository-specific work through a centralized project view.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 