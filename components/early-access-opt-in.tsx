'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Rocket, 
  Loader2, 
  Star,
  Users,
  Bell,
  Sparkles,
  Gift,
  Clock,
  Crown
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EarlyAccessOptInProps {
  user: any
  onSuccess?: (position: number) => void
  showFullFeatures?: boolean
}

export default function EarlyAccessOptIn({ user, onSuccess, showFullFeatures = true }: EarlyAccessOptInProps) {
  const [isOptingIn, setIsOptingIn] = useState(false)
  const [hasOptedIn, setHasOptedIn] = useState(false)
  const [hasEnrollment, setHasEnrollment] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already enrolled or on waitlist
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return
      
      try {
        // Check for existing enrollment
        const enrollmentResponse = await fetch(`/api/early-access/enrollment`)
        if (enrollmentResponse.ok) {
          const enrollment = await enrollmentResponse.json()
          if (enrollment.hasEnrollment) {
            setHasEnrollment(true)
            setEnrollmentStatus(enrollment.status)
            return
          }
        }
        
        // Check waitlist status
        const waitlistResponse = await fetch('/api/early-access/waitlist')
        if (waitlistResponse.ok) {
          const status = await waitlistResponse.json()
          if (status.onWaitlist) {
            setHasOptedIn(true)
            setQueuePosition(status.position)
          }
        }
      } catch (error) {
        console.error('Error checking status:', error)
      }
    }
    
    checkStatus()
  }, [user])

  const handleOptIn = async () => {
    setIsOptingIn(true)
    setError('')

    try {
      const response = await fetch('/api/early-access/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email?.split('@')[0],
          useCase: 'One-click early access opt-in from landing page',
          priority: 'medium'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to join waiting list')
      }

      const result = await response.json()
      setQueuePosition(result.position)
      setHasOptedIn(true)
      setShowConfirmation(true)
      
      if (onSuccess) {
        onSuccess(result.position)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waiting list')
    } finally {
      setIsOptingIn(false)
    }
  }

  // If user already has enrollment, show different message
  if (hasEnrollment) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <Crown className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">Early Access Enrolled!</h3>
              <p className="text-sm text-purple-600">
                Status: {enrollmentStatus} • Access beta features now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If user is on waitlist, show status
  if (hasOptedIn && !showConfirmation) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">You're on the waitlist!</h3>
              <p className="text-sm text-blue-600">
                Position #{queuePosition} • We'll notify you when ready
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
            <Rocket className="h-6 w-6" />
            Join Early Access Waitlist
          </CardTitle>
          <p className="text-sm text-blue-600">
            Get priority access to advanced features and help shape the future of SDLC.dev
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFullFeatures && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Advanced Claude Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-blue-500" />
                <span>Premium SDLC Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span>Team Collaboration Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <span>Priority Support</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleOptIn}
            disabled={isOptingIn}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            {isOptingIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining waitlist...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Join Early Access Waitlist
              </>
            )}
          </Button>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500">
            One-click signup • Already logged in • Free forever
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Welcome to the Waitlist!
            </DialogTitle>
            <DialogDescription>
              You've successfully joined our early access waitlist.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">
                #{queuePosition}
              </div>
              <p className="text-sm text-gray-600">
                Your position in the queue
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Bell className="h-4 w-4" />
                <span>We'll email you when your access is ready</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <Star className="h-4 w-4" />
                <span>You'll get early access to premium features</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Users className="h-4 w-4" />
                <span>Join our exclusive beta community</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>What's next?</strong> Continue using SDLC.dev with your free credits. 
                We'll notify you when advanced features are ready!
              </p>
            </div>
            
            <Button 
              onClick={() => setShowConfirmation(false)}
              className="w-full"
            >
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 