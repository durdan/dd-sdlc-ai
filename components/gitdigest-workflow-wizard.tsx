'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Github,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap,
  Clock,
  GitBranch,
  GitPullRequest,
  Calendar,
  Settings,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Shield,
  Code,
  Key,
  FileText,
  Terminal,
  Loader2,
  Check,
  X,
  Info,
  ArrowRight,
  Rocket,
} from 'lucide-react'

interface WorkflowWizardProps {
  isOpen: boolean
  onClose: () => void
  repository: {
    fullName: string
    name: string
    owner: string
    url: string
    private: boolean
  }
  onComplete?: () => void
  onSkip?: () => void
}

export function GitDigestWorkflowWizard({
  isOpen,
  onClose,
  repository,
  onComplete,
  onSkip,
}: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [workflowContent, setWorkflowContent] = useState('')
  const [userToken, setUserToken] = useState('')
  const [copied, setCopied] = useState({ workflow: false, token: false })
  const [settings, setSettings] = useState({
    triggers: {
      push: true,
      pullRequest: true,
      schedule: 'daily' as 'daily' | 'weekly' | 'none',
    },
    branches: ['main', 'master'],
  })

  const generateWorkflow = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/gitdigest/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repository: repository.fullName,
          settings 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWorkflowContent(data.workflow)
        setUserToken(data.tokenValue)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Failed to generate workflow:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'workflow' | 'token') => {
    await navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [type]: true }))
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [type]: false }))
    }, 2000)
  }

  const handleComplete = () => {
    if (onComplete) onComplete()
    onClose()
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
    onClose()
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Rocket className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Enable Automated Insights</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Set up GitDigest to automatically analyze {repository.name} and generate insights when changes occur
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Automatic Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Generate digests when code is pushed or PRs are merged
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Daily Reports</p>
                <p className="text-xs text-muted-foreground">
                  Get daily summaries of repository activity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Secure & Private</p>
                <p className="text-xs text-muted-foreground">
                  Uses GitHub Actions - your code never leaves GitHub
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Configure Triggers</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="push" className="text-sm font-normal">
                On Push to Main Branch
              </Label>
            </div>
            <Switch
              id="push"
              checked={settings.triggers.push}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  triggers: { ...prev.triggers, push: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="pr" className="text-sm font-normal">
                On Pull Request Merge
              </Label>
            </div>
            <Switch
              id="pr"
              checked={settings.triggers.pullRequest}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  triggers: { ...prev.triggers, pullRequest: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="schedule" className="text-sm font-normal">
                Daily Summary (9 AM UTC)
              </Label>
            </div>
            <Switch
              id="schedule"
              checked={settings.triggers.schedule === 'daily'}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  triggers: { ...prev.triggers, schedule: checked ? 'daily' : 'none' },
                }))
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for Now
        </Button>
        <Button onClick={generateWorkflow} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold">Setup Instructions</h3>
        <p className="text-sm text-muted-foreground">
          Follow these steps to enable automation for {repository.name}
        </p>
      </div>

      <Tabs defaultValue="guided" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guided">Guided Setup</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="guided" className="space-y-4 mt-4">
          <div className="space-y-4">
            {/* Step 1: Copy Workflow */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <CardTitle className="text-sm">Copy Workflow File</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(workflowContent, 'workflow')}
                  >
                    {copied.workflow ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full rounded-md border bg-muted/50 p-3">
                  <pre className="text-xs font-mono">{workflowContent}</pre>
                </ScrollArea>
                <p className="text-xs text-muted-foreground mt-2">
                  This workflow will be saved as <code className="text-xs bg-muted px-1 py-0.5 rounded">.github/workflows/gitdigest.yml</code>
                </p>
              </CardContent>
            </Card>

            {/* Step 2: Copy Token */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <CardTitle className="text-sm">Copy Access Token</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(userToken, 'token')}
                  >
                    {copied.token ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <code className="text-xs font-mono flex-1 truncate">{userToken}</code>
                </div>
                <Alert className="mt-3">
                  <Shield className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Save this token as a GitHub secret named <strong>SDLC_USER_TOKEN</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Step 3: Add to GitHub */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <CardTitle className="text-sm">Add to GitHub Repository</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Quick Links:</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => window.open(`${repository.url}/settings/secrets/actions/new`, '_blank')}
                    >
                      <Key className="w-3 h-3 mr-2" />
                      Add Secret to Repository
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => window.open(`${repository.url}/new/main?filename=.github/workflows/gitdigest.yml`, '_blank')}
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      Create Workflow File
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Command Line Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full rounded-md border bg-muted/50 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap">
{`# Navigate to your repository
cd ${repository.name}

# Create workflow directory
mkdir -p .github/workflows

# Create workflow file
cat > .github/workflows/gitdigest.yml << 'EOF'
${workflowContent}
EOF

# Add and commit the workflow
git add .github/workflows/gitdigest.yml
git commit -m "Add GitDigest automation workflow"
git push

# Add the secret using GitHub CLI
gh secret set SDLC_USER_TOKEN --body="${userToken}"

# Or manually add the secret:
# 1. Go to Settings → Secrets → Actions
# 2. Click "New repository secret"
# 3. Name: SDLC_USER_TOKEN
# 4. Value: ${userToken}
`}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip}>
            I'll Do This Later
          </Button>
          <Button onClick={handleComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Done
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Enable Automated GitDigest</DialogTitle>
              <DialogDescription>
                Set up automatic repository analysis for {repository.fullName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>
      </DialogContent>
    </Dialog>
  )
}