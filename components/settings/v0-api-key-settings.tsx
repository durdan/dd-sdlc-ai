'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
// v0 usage will be fetched via API
import {
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  BarChart3,
  Key,
  Loader2
} from 'lucide-react'

interface V0ApiKeySettingsProps {
  userId: string
}

export function V0ApiKeySettings({ userId }: V0ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasOwnKey, setHasOwnKey] = useState(false)
  const [usageStats, setUsageStats] = useState<{
    todayUsage: number
    remainingToday: number
    totalUsage: number
  }>({
    todayUsage: 0,
    remainingToday: 2,
    totalUsage: 0,
  })
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [userId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Load user's API key
      const { data: userConfig } = await supabase
        .from('user_configurations')
        .select('v0_api_key')
        .eq('user_id', userId)
        .single()
      
      if (userConfig?.v0_api_key) {
        setApiKey(userConfig.v0_api_key)
        setHasOwnKey(true)
      }
      
      // Load usage stats via API
      const response = await fetch('/api/v0/usage')
      if (!response.ok) {
        throw new Error('Failed to load usage stats')
      }
      
      const usageData = await response.json()
      const usageCheck = usageData
      const stats = usageData.stats || { totalUsage: 0 }
      
      const todayUsage = usageCheck.hasOwnKey ? -1 : (2 - usageCheck.remainingUsage)
      
      setUsageStats({
        todayUsage,
        remainingToday: usageCheck.remainingUsage,
        totalUsage: stats.totalUsage,
      })
    } catch (error) {
      console.error('Error loading v0 settings:', error)
      toast({
        title: 'Error loading settings',
        description: 'Failed to load v0.dev settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveApiKey = async () => {
    try {
      setSaving(true)
      
      // Update or insert user configuration
      const { error } = await supabase
        .from('user_configurations')
        .upsert({
          user_id: userId,
          v0_api_key: apiKey.trim() || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
      
      if (error) throw error
      
      setHasOwnKey(!!apiKey.trim())
      
      toast({
        title: 'Settings saved',
        description: apiKey.trim() 
          ? 'Your v0.dev API key has been saved successfully'
          : 'v0.dev API key removed. You can use the system key (2 generations/day)',
      })
      
      // Reload stats
      await loadSettings()
    } catch (error) {
      console.error('Error saving v0 API key:', error)
      toast({
        title: 'Error saving settings',
        description: 'Failed to save your v0.dev API key',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                v0.dev Integration
              </CardTitle>
              <CardDescription>
                Configure your v0.dev API key to generate real React components
              </CardDescription>
            </div>
            <Badge variant={hasOwnKey ? 'default' : 'secondary'}>
              {hasOwnKey ? 'Own Key' : 'System Key'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>You have two options for using v0.dev:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>System Key:</strong> Free 2 generations per day (no API key needed)</li>
                <li><strong>Your Own Key:</strong> Unlimited generations with your v0.dev API key</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* API Key Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="v0-api-key">v0.dev API Key (Optional)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="v0-api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="v0_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={saveApiKey}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="ml-2">Save</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://v0.dev/settings" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  v0.dev settings
                </a>
              </p>
            </div>
          </div>

          <Separator />

          {/* Usage Statistics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Usage Statistics
            </h4>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {hasOwnKey ? '∞' : `${usageStats.remainingToday}/2`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remaining Today
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {hasOwnKey ? 'N/A' : usageStats.todayUsage}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used Today
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {usageStats.totalUsage}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Generated
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Status Messages */}
          {hasOwnKey ? (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Unlimited Access</AlertTitle>
              <AlertDescription>
                You're using your own v0.dev API key with unlimited generations.
              </AlertDescription>
            </Alert>
          ) : usageStats.remainingToday > 0 ? (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertTitle>System Key Active</AlertTitle>
              <AlertDescription>
                You have {usageStats.remainingToday} free generation{usageStats.remainingToday !== 1 ? 's' : ''} remaining today.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Daily Limit Reached</AlertTitle>
              <AlertDescription>
                You've used all 2 free generations today. Add your own API key for unlimited access or try again tomorrow.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}