"use client"

import React from 'react'
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react'

interface ProgressStep {
  label: string
  status: 'pending' | 'in_progress' | 'complete' | 'failed'
  progress: number
}

interface GitHubProjectsVisualProgressProps {
  steps: Record<string, ProgressStep>
  currentStep: string | null
}

export function GitHubProjectsVisualProgress({ 
  steps,
  currentStep 
}: GitHubProjectsVisualProgressProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <div className="space-y-6 my-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700">GitHub Projects Creation Progress</h3>
      
      <div className="space-y-4">
        {Object.entries(steps).map(([key, step], index) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-3">
              {getStatusIcon(step.status)}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      step.status === 'complete' 
                        ? 'text-green-700' 
                        : step.status === 'in_progress' 
                          ? 'text-blue-700' 
                          : step.status === 'failed'
                            ? 'text-red-700'
                            : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  
                  {step.status === 'in_progress' && (
                    <span className="text-xs text-blue-600 font-medium">In progress...</span>
                  )}
                  
                  {step.status === 'complete' && (
                    <span className="text-xs text-green-600 font-medium">Complete</span>
                  )}
                  
                  {step.status === 'failed' && (
                    <span className="text-xs text-red-600 font-medium">Failed</span>
                  )}
                </div>
                
                <Progress 
                  value={step.progress} 
                  className={`h-1.5 mt-1 ${
                    step.status === 'pending' ? 'bg-gray-200' : ''
                  }`}
                  indicatorClassName={getProgressColor(step.status)}
                />
              </div>
              
              {index < Object.entries(steps).length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Overall status message */}
      <div className="text-xs text-center text-gray-500">
        {Object.values(steps).every(step => step.status === 'complete') ? (
          <span className="text-green-600">All steps completed successfully!</span>
        ) : Object.values(steps).some(step => step.status === 'failed') ? (
          <span className="text-red-600">Some steps failed. Please check the error message above.</span>
        ) : (
          <span>Creating GitHub project structure and issues...</span>
        )}
      </div>
    </div>
  )
} 