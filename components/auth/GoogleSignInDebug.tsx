'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export function GoogleSignInDebug() {
  const { user, session, loading, handleGoogleSignIn } = useAuth()
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isTestingSignIn, setIsTestingSignIn] = useState(false)

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testGoogleSignIn = async () => {
    setIsTestingSignIn(true)
    addDebugInfo('Testing Google sign-in...')
    
    try {
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl) {
        addDebugInfo('❌ NEXT_PUBLIC_SUPABASE_URL is not set')
      } else {
        addDebugInfo(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
      }
      
      if (!supabaseAnonKey) {
        addDebugInfo('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
      } else {
        addDebugInfo(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`)
      }
      
      if (!supabaseUrl || !supabaseAnonKey) {
        addDebugInfo('❌ Missing required environment variables')
        return
      }
      
      addDebugInfo('🔄 Calling handleGoogleSignIn...')
      await handleGoogleSignIn()
      addDebugInfo('✅ Google sign-in initiated successfully')
      
    } catch (error: any) {
      addDebugInfo(`❌ Error: ${error.message}`)
      console.error('Google sign-in test error:', error)
    } finally {
      setIsTestingSignIn(false)
    }
  }

  const clearDebugInfo = () => {
    setDebugInfo([])
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.google className="h-5 w-5" />
          Google Sign-In Debug Tool
        </CardTitle>
        <CardDescription>
          Test and debug Google authentication functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth State */}
        <div className="space-y-2">
          <h3 className="font-semibold">Current Authentication State</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={loading ? "secondary" : "outline"}>
              Loading: {loading ? "Yes" : "No"}
            </Badge>
            <Badge variant={user ? "default" : "secondary"}>
              User: {user ? "Authenticated" : "Not authenticated"}
            </Badge>
            <Badge variant={session ? "default" : "secondary"}>
              Session: {session ? "Active" : "None"}
            </Badge>
          </div>
          {user && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Signed in as: {user.email}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Test Button */}
        <div className="space-y-2">
          <Button 
            onClick={testGoogleSignIn}
            disabled={isTestingSignIn || loading}
            className="w-full"
          >
            {isTestingSignIn ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Icons.google className="mr-2 h-4 w-4" />
                Test Google Sign-In
              </>
            )}
          </Button>
        </div>

        {/* Debug Log */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Debug Log</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearDebugInfo}
              disabled={debugInfo.length === 0}
            >
              Clear
            </Button>
          </div>
          
          {debugInfo.length > 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {debugInfo.join('\n')}
              </pre>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Click "Test Google Sign-In" to see debug information
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Environment Check */}
        <div className="space-y-2">
          <h3 className="font-semibold">Environment Check</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>NEXT_PUBLIC_SUPABASE_URL</span>
            </div>
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}