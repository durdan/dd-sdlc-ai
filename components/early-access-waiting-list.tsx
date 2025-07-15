'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Mail,
  MessageSquare,
  Loader2,
  Star,
  Rocket,
  Gift,
  Bell
} from 'lucide-react'

interface EarlyAccessWaitingListProps {
  user: any
  onSuccess?: (position: number) => void
}

export default function EarlyAccessWaitingList({ user, onSuccess }: EarlyAccessWaitingListProps) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    useCase: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    referral: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [queuePosition, setQueuePosition] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/early-access/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email?.split('@')[0]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to join waiting list')
      }

      const result = await response.json()
      setQueuePosition(result.position)
      setIsSubmitted(true)
      
      if (onSuccess) {
        onSuccess(result.position)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waiting list')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Welcome to the Waiting List!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-green-700">
              #{queuePosition}
            </div>
            <p className="text-sm text-green-600">
              Your position in the early access queue
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>We'll email you when your access is ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>You'll receive updates on new features and progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Help us prioritize by sharing feedback</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Want to move up in the queue?</strong> Share your feedback or refer colleagues 
              to help us improve the platform!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-500" />
          Join Early Access Waiting List
        </CardTitle>
        <p className="text-sm text-gray-600">
          Get priority access to beta features and help shape the future of SDLC.dev
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Your company name"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Your job title"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="useCase">How will you use SDLC.dev?</Label>
            <Textarea
              id="useCase"
              value={formData.useCase}
              onChange={(e) => setFormData(prev => ({ ...prev, useCase: e.target.value }))}
              placeholder="Tell us about your use case, team size, and what features you're most excited about..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low - Just curious</option>
              <option value="medium">Medium - Interested for future use</option>
              <option value="high">High - Need this for current project</option>
            </select>
          </div>

          <div>
            <Label htmlFor="referral">Referral Code (Optional)</Label>
            <Input
              id="referral"
              value={formData.referral}
              onChange={(e) => setFormData(prev => ({ ...prev, referral: e.target.value }))}
              placeholder="Got a referral code?"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining Waiting List...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Join Early Access Waiting List
              </>
            )}
          </Button>
        </form>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Priority access to beta features</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span>Direct feedback channel</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-500" />
              <span>Exclusive early access perks</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-500" />
              <span>Feature updates and progress</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 