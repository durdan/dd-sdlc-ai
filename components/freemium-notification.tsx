'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  X, 
  AlertTriangle, 
  Clock, 
  Key, 
  Zap,
  Gift,
  Bell
} from 'lucide-react'
import { useFreemiumUsage } from '@/hooks/use-freemium-usage'

interface FreemiumNotificationProps {
  onConfigureKeys?: () => void
  onUpgrade?: () => void
  onDismiss?: () => void
}

export default function FreemiumNotification({ 
  onConfigureKeys, 
  onUpgrade, 
  onDismiss 
}: FreemiumNotificationProps) {
  const { usage, loading } = useFreemiumUsage()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (loading || !usage || dismissed) return

    // Show notification when user has 1 project left or 0 projects left
    if (usage.remainingProjects <= 1) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [usage, loading, dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
    onDismiss?.()
  }

  if (!show || loading || !usage) return null

  const isLimitReached = usage.remainingProjects === 0
  const isLastProject = usage.remainingProjects === 1

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <Card className="shadow-lg border-l-4 border-l-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isLimitReached ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {isLimitReached ? 'Daily Limit Reached' : 'Almost at Daily Limit'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {isLimitReached 
                  ? "You've used all your free projects for today."
                  : `You have ${usage.remainingProjects} project left today.`
                }
              </p>
              
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onConfigureKeys}
                  className="flex-1"
                >
                  <Key className="h-3 w-3 mr-1" />
                  Use Own Key
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onUpgrade}
                  className="flex-1"
                >
                  <Gift className="h-3 w-3 mr-1" />
                  Early Access
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add to your global CSS or tailwind config
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
` 