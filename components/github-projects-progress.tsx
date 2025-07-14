"use client"

import React from 'react'
import { CheckCircle, Circle, Loader2, AlertCircle, XCircle } from 'lucide-react'

interface ProgressStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  icon?: React.ReactNode
}

interface GitHubProjectsProgressProps {
  steps: ProgressStep[]
  currentStepId?: string
}

export function GitHubProjectsProgress({ steps, currentStepId }: GitHubProjectsProgressProps) {
  return (
    <div className="space-y-3 my-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId
        const isCompleted = step.status === 'completed'
        const isFailed = step.status === 'failed'
        const isInProgress = step.status === 'in_progress'
        
        return (
          <div 
            key={step.id}
            className={`
              relative flex items-center p-3 rounded-md border transition-all
              ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}
              ${isCompleted ? 'bg-green-50 border-green-100' : ''}
              ${isFailed ? 'bg-red-50 border-red-100' : ''}
            `}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mr-3">
              {isCompleted ? (
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ) : isInProgress ? (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              ) : isFailed ? (
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {step.icon || <Circle className="h-5 w-5 text-gray-400" />}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-grow">
              <h3 className={`font-medium text-sm ${isCompleted ? 'text-green-700' : isFailed ? 'text-red-700' : isInProgress ? 'text-blue-700' : 'text-gray-700'}`}>
                {step.title}
              </h3>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            
            {/* Status Badge */}
            <div className="ml-3">
              {isCompleted && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              )}
              {isInProgress && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  In Progress
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Failed
                </span>
              )}
              {step.status === 'pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Pending
                </span>
              )}
            </div>
            
            {/* Connector Line (except for last item) */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-11 h-3 w-0.5 bg-gray-200"></div>
            )}
          </div>
        )
      })}
    </div>
  )
} 