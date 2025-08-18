"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface MobileTooltipProps {
  children: React.ReactNode
  content: string
  description?: string
  side?: "top" | "bottom" | "left" | "right"
  delayDuration?: number
  className?: string
}

export function MobileTooltip({
  children,
  content,
  description,
  side = "top",
  delayDuration = 200,
  className = ""
}: MobileTooltipProps) {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    // Detect touch device
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // For mobile, we'll rely on the native title attribute and CSS tooltips
  // For desktop, use the Radix tooltip
  if (isTouch) {
    return (
      <div 
        className={`relative inline-flex items-center ${className}`}
        title={`${content}${description ? ` - ${description}` : ''}`}
      >
        {children}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative inline-flex items-center ${className}`}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs sm:max-w-sm bg-gray-900 text-white border-gray-700"
        >
          <div className="space-y-1">
            <p className="font-semibold text-sm">{content}</p>
            {description && (
              <p className="text-xs text-gray-300">{description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Simplified version for inline text tooltips
export function SimpleTooltip({
  children,
  content,
  side = "top",
}: {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help underline-offset-2 hover:underline decoration-dotted">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="bg-gray-900 text-white border-gray-700">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}