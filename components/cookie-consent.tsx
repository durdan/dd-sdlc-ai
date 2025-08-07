"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Cookie, 
  Settings, 
  Shield, 
  BarChart3, 
  Zap, 
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  performance: boolean
  marketing: boolean
  functional: boolean
}

const defaultPreferences: CookiePreferences = {
  essential: true, // Always required
  analytics: false,
  performance: false,
  marketing: false,
  functional: false
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)
  const [hasResponded, setHasResponded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user has already responded to cookie consent
  useEffect(() => {
    const storedConsent = localStorage.getItem('sdlc-cookie-consent')
    const storedPreferences = localStorage.getItem('sdlc-cookie-preferences')
    
    if (storedConsent) {
      setHasResponded(true)
      if (storedPreferences) {
        try {
          const parsedPreferences = JSON.parse(storedPreferences)
          setPreferences(parsedPreferences)
        } catch (error) {
          console.warn('Failed to parse stored cookie preferences')
        }
      }
    } else {
      // Show banner after a short delay to avoid flickering
      setTimeout(() => {
        setShowBanner(true)
      }, 1000)
    }
    
    setIsLoading(false)
  }, [])

  // Listen for cookie settings events from footer
  useEffect(() => {
    const handleShowCookieSettings = () => {
      setShowSettings(true)
    }

    window.addEventListener('show-cookie-settings', handleShowCookieSettings)
    
    return () => {
      window.removeEventListener('show-cookie-settings', handleShowCookieSettings)
    }
  }, [])

  // Save preferences to localStorage and apply them
  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem('sdlc-cookie-consent', 'true')
    localStorage.setItem('sdlc-cookie-preferences', JSON.stringify(newPreferences))
    localStorage.setItem('sdlc-cookie-consent-date', new Date().toISOString())
    
    setPreferences(newPreferences)
    setHasResponded(true)
    setShowBanner(false)
    setShowSettings(false)
    
    // Apply cookie preferences
    applyCookiePreferences(newPreferences)
  }

  // Apply cookie preferences (enable/disable tracking)
  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Analytics cookies
    if (prefs.analytics) {
      // Enable analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    } else {
      // Disable analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        })
      }
    }

    // Performance cookies
    if (prefs.performance) {
      // Enable performance monitoring
      console.log('Performance cookies enabled')
    } else {
      // Disable performance monitoring
      console.log('Performance cookies disabled')
    }

    // Marketing cookies
    if (prefs.marketing) {
      // Enable marketing tracking
      console.log('Marketing cookies enabled')
    } else {
      // Disable marketing tracking
      console.log('Marketing cookies disabled')
    }

    // Functional cookies
    if (prefs.functional) {
      // Enable functional cookies
      console.log('Functional cookies enabled')
    } else {
      // Disable functional cookies
      console.log('Functional cookies disabled')
    }
  }

  // Accept all cookies
  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      performance: true,
      marketing: true,
      functional: true
    }
    savePreferences(allAccepted)
  }

  // Accept only essential cookies
  const acceptEssential = () => {
    savePreferences(defaultPreferences)
  }

  // Handle custom preferences
  const handleCustomPreferences = () => {
    savePreferences(preferences)
  }

  // Reset cookie preferences (for testing/debugging)
  const resetPreferences = () => {
    localStorage.removeItem('sdlc-cookie-consent')
    localStorage.removeItem('sdlc-cookie-preferences')
    localStorage.removeItem('sdlc-cookie-consent-date')
    setHasResponded(false)
    setPreferences(defaultPreferences)
    setShowBanner(true)
  }

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-gray-800/50 p-3 sm:p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3 flex-1">
                <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white text-base sm:text-lg mb-1 sm:mb-2">Cookie Consent</h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    We use cookies to enhance your experience. Essential cookies are required for basic functionality.
                    <span className="hidden sm:inline"> You can customize your preferences or accept all cookies.</span>
                  </p>
                  <div className="hidden sm:flex items-center gap-4 mt-3 text-xs">
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                      Privacy Policy
                    </a>
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row gap-2 w-full lg:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={acceptEssential}
                  className="border-gray-600 hover:bg-gray-800 text-gray-300 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Essential Only</span>
                  <span className="sm:hidden">Essential</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSettings(true)}
                  className="border-gray-600 hover:bg-gray-800 text-gray-300 hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button 
                  size="sm" 
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <CheckCircle className="h-4 w-4 mr-1 sm:mr-2" />
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-blue-400" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Choose which cookies you want to allow. Essential cookies are required for basic functionality and cannot be disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span>Essential Cookies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-400 border-green-400">Required</Badge>
                    <Switch checked={true} disabled />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies are necessary for the website to function and cannot be disabled. 
                  They are usually only set in response to actions made by you which amount to a request for services.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Authentication and security</p>
                  <p>• Basic functionality and navigation</p>
                  <p>• Form submissions and user preferences</p>
                  <p>• Error handling and system stability</p>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Cookies */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <span>Analytics Cookies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">Optional</Badge>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(checked) => setPreferences({...preferences, analytics: checked})}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies help us understand how visitors interact with our experimental platform. 
                  All information is aggregated and anonymous.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Page views and user journeys</p>
                  <p>• Feature usage statistics</p>
                  <p>• Performance monitoring</p>
                  <p>• Error tracking and debugging</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Cookies */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Performance Cookies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">Optional</Badge>
                    <Switch 
                      checked={preferences.performance} 
                      onCheckedChange={(checked) => setPreferences({...preferences, performance: checked})}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies allow us to optimize the platform's performance and provide you with a better experience.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Load time optimization</p>
                  <p>• Resource caching</p>
                  <p>• Network performance monitoring</p>
                  <p>• System resource usage</p>
                </div>
              </CardContent>
            </Card>

            {/* Functional Cookies */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-400" />
                    <span>Functional Cookies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">Optional</Badge>
                    <Switch 
                      checked={preferences.functional} 
                      onCheckedChange={(checked) => setPreferences({...preferences, functional: checked})}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies enhance functionality and personalization, such as remembering your preferences and settings.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Theme and display preferences</p>
                  <p>• Language and region settings</p>
                  <p>• Personalized content</p>
                  <p>• Third-party integrations</p>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Cookies */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-pink-400" />
                    <span>Marketing Cookies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-pink-400 border-pink-400">Optional</Badge>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(checked) => setPreferences({...preferences, marketing: checked})}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-3">
                  These cookies may be used to build a profile of your interests and show you relevant content on our platform.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Relevant feature suggestions</p>
                  <p>• User behavior analysis</p>
                  <p>• Platform improvement insights</p>
                  <p>• Research and development data</p>
                </div>
              </CardContent>
            </Card>

            {/* GDPR Notice */}
            <Card className="bg-blue-900/20 border-blue-800/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-2">GDPR Compliance</p>
                    <p className="text-blue-200 text-xs leading-relaxed">
                      As an experimental platform, we are committed to data protection and privacy. 
                      You can change your preferences at any time. Your data will be processed according to our Privacy Policy, 
                      and you have the right to access, rectify, or delete your personal information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => setShowSettings(false)}
              className="border-gray-600 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={acceptEssential}
              className="border-gray-600 hover:bg-gray-800 text-gray-300"
            >
              Essential Only
            </Button>
            <Button 
              onClick={handleCustomPreferences}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cookie Preferences Button (always visible after consent) */}
      {hasResponded && (
        <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="bg-gray-900/90 border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            <Cookie className="h-4 w-4 mr-2" />
            Cookies
          </Button>
        </div>
      )}
    </>
  )
}

// Helper function to check if a specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false
  
  const storedPreferences = localStorage.getItem('sdlc-cookie-preferences')
  if (!storedPreferences) return false
  
  try {
    const preferences = JSON.parse(storedPreferences)
    return preferences[type] === true
  } catch {
    return false
  }
}

// Helper function to get all cookie preferences
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  const storedPreferences = localStorage.getItem('sdlc-cookie-preferences')
  if (!storedPreferences) return null
  
  try {
    return JSON.parse(storedPreferences)
  } catch {
    return null
  }
} 