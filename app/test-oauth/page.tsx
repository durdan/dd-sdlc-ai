'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestOAuthPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`])
  }

  const testDirectOAuth = async () => {
    try {
      addLog('Starting direct OAuth test...')
      const supabase = createClient()
      
      // Device detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      addLog(`Device: Mobile=${isMobile}, Touch=${isTouchDevice}`)
      addLog(`User Agent: ${navigator.userAgent.substring(0, 100)}`)
      
      // Test with minimal options
      addLog('Calling signInWithOAuth with minimal options...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        return
      }
      
      addLog(`Success! URL: ${data?.url ? 'Received' : 'Not received'}`)
      
      if (data?.url) {
        addLog(`Redirecting to: ${data.url.substring(0, 50)}...`)
        // Simple direct redirect
        window.location.href = data.url
      }
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  const testWithSkipRedirect = async () => {
    try {
      addLog('Testing with skipBrowserRedirect=true...')
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        return
      }
      
      addLog(`Success! URL: ${data?.url ? 'Received' : 'Not received'}`)
      
      if (data?.url) {
        addLog(`Manual redirect to: ${data.url.substring(0, 50)}...`)
        window.location.assign(data.url)
      }
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  const testWithAnchorClick = async () => {
    try {
      addLog('Testing with anchor element click...')
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        return
      }
      
      if (data?.url) {
        addLog(`Creating anchor element...`)
        const link = document.createElement('a')
        link.href = data.url
        link.target = '_self'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        addLog(`Anchor clicked`)
      }
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  const clearLogs = () => setLogs([])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">OAuth Mobile Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-semibold mb-2">Device Info</h2>
          <p className="text-sm text-gray-600">
            User Agent: {navigator.userAgent}
          </p>
          <p className="text-sm text-gray-600">
            Touch: {'ontouchstart' in window ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600">
            Max Touch Points: {navigator.maxTouchPoints}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <Button 
            onClick={testDirectOAuth}
            className="w-full"
            variant="default"
          >
            Test 1: Direct OAuth (Default)
          </Button>
          
          <Button 
            onClick={testWithSkipRedirect}
            className="w-full"
            variant="secondary"
          >
            Test 2: Skip Browser Redirect + Manual
          </Button>
          
          <Button 
            onClick={testWithAnchorClick}
            className="w-full"
            variant="outline"
          >
            Test 3: Anchor Element Click
          </Button>
          
          <Button 
            onClick={clearLogs}
            className="w-full"
            variant="destructive"
          >
            Clear Logs
          </Button>
        </div>

        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs">
          <h3 className="text-white font-bold mb-2">Console Logs:</h3>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}