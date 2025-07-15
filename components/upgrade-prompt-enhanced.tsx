'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Crown, 
  Rocket, 
  CheckCircle, 
  Star, 
  Users, 
  Zap, 
  Gift, 
  ArrowRight, 
  Clock,
  Target,
  TrendingUp,
  Shield,
  Key,
  X
} from 'lucide-react'

interface UpgradePromptEnhancedProps {
  onUpgrade?: () => void
  onConfigureKeys?: () => void
  onDismiss?: () => void
  usage?: {
    projectsToday: number
    dailyLimit: number
    remainingProjects: number
  }
  variant?: 'card' | 'modal' | 'inline' | 'floating'
  showDismiss?: boolean
}

export default function UpgradePromptEnhanced({
  onUpgrade,
  onConfigureKeys,
  onDismiss,
  usage,
  variant = 'card',
  showDismiss = true
}: UpgradePromptEnhancedProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [timeUntilReset, setTimeUntilReset] = useState('')

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Unlimited Projects',
      description: 'Generate as many SDLC documents as you need',
      color: 'text-blue-600'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Advanced AI Features',
      description: 'Access premium AI models and capabilities',
      color: 'text-purple-600'
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: 'Premium Templates',
      description: 'Enterprise-grade templates and customization',
      color: 'text-yellow-600'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Priority Support',
      description: 'Get help when you need it most',
      color: 'text-green-600'
    }
  ]

  const benefits = [
    'Unlimited daily projects',
    'Priority processing queue',
    'Advanced AI integrations',
    'Premium SDLC templates',
    'Custom workflow automation',
    'Enterprise-grade security',
    'Direct developer feedback',
    'Beta features access',
    'Custom integrations',
    'Advanced analytics'
  ]

  // Calculate time until reset
  useEffect(() => {
    const updateResetTime = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCDate(now.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateResetTime()
    const interval = setInterval(updateResetTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const getUrgencyMessage = () => {
    if (!usage) return null
    
    const percentage = (usage.projectsToday / usage.dailyLimit) * 100
    
    if (usage.remainingProjects === 0) {
      return {
        text: 'You\'ve reached your daily limit',
        subtext: `Next reset in ${timeUntilReset}`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    } else if (usage.remainingProjects === 1) {
      return {
        text: 'Only 1 project remaining today',
        subtext: `Don't run out during important work`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    } else if (percentage >= 60) {
      return {
        text: `${Math.round(percentage)}% of daily limit used`,
        subtext: 'Consider upgrading to avoid interruptions',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    }
    
    return null
  }

  const urgencyMessage = getUrgencyMessage()

  const baseContent = (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full">
            <Rocket className="h-4 w-4" />
            <span className="font-medium">Early Access Program</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Unlock Unlimited SDLC Generation
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Join 1,000+ developers who've upgraded to Early Access for unlimited projects and exclusive features.
        </p>
      </div>

      {/* Urgency Message */}
      {urgencyMessage && (
        <div className={`p-4 rounded-lg border ${urgencyMessage.bgColor} ${urgencyMessage.borderColor}`}>
          <div className="flex items-center space-x-2">
            <Clock className={`h-4 w-4 ${urgencyMessage.color}`} />
            <div>
              <p className={`font-medium ${urgencyMessage.color}`}>
                {urgencyMessage.text}
              </p>
              <p className="text-sm text-gray-600">
                {urgencyMessage.subtext}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animated Feature Showcase */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-white ${features[currentFeature].color}`}>
            {features[currentFeature].icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {features[currentFeature].title}
            </h4>
            <p className="text-sm text-gray-600">
              {features[currentFeature].description}
            </p>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index === currentFeature ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {benefits.slice(0, 6).map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{benefit}</span>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">1,247 developers</p>
              <p className="text-sm text-gray-600">joined this month</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
            <span className="text-sm font-medium text-gray-700 ml-1">4.9/5</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onUpgrade}
          className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Gift className="h-5 w-5 mr-2" />
          Join Early Access Program
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onConfigureKeys}
            className="flex-1"
          >
            <Key className="h-4 w-4 mr-2" />
            Use Own API Key
          </Button>
          {showDismiss && (
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="flex-1"
            >
              Maybe Later
            </Button>
          )}
        </div>
      </div>

      {/* Additional Benefits */}
      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 text-center">
          Early Access includes exclusive beta features, priority support, and direct feedback to our development team.
        </p>
      </div>
    </div>
  )

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upgrade Available</CardTitle>
              {showDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Unlimited Projects</span>
              </div>
              <Button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Upgrade to Early Access</p>
              <p className="text-sm text-blue-700">Unlimited projects and premium features</p>
            </div>
          </div>
          <Button
            onClick={onUpgrade}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Upgrade
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Upgrade to Early Access</CardTitle>
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {baseContent}
      </CardContent>
    </Card>
  )
} 