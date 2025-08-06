"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Plug,
  Key,
  Info,
  Save,
  Eye,
  EyeOff,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SimplifiedSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: any) => void
}

export function SimplifiedSettingsDialog({
  isOpen,
  onClose,
  onSave,
}: SimplifiedSettingsDialogProps) {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [config, setConfig] = useState({
    openaiKey: "",
    anthropicKey: "",
    jiraUrl: "",
    jiraEmail: "",
    jiraToken: "",
    confluenceUrl: "",
    confluenceEmail: "",
    confluenceToken: "",
  })

  const handleSave = () => {
    if (onSave) {
      onSave(config)
    }
    onClose()
  }

  const ApiKeyInput = ({ 
    id, 
    label, 
    value, 
    onChange, 
    placeholder,
    helpText 
  }: { 
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    helpText?: string
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          type={showApiKey[id] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter your API key"}
          className="font-mono text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }))}
          className="flex-shrink-0"
        >
          {showApiKey[id] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(80vh-200px)] px-1">
            <TabsContent value="config" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">AI Configuration</span>
                </div>
                
                <ApiKeyInput
                  id="openaiKey"
                  label="OpenAI API Key"
                  value={config.openaiKey}
                  onChange={(value) => setConfig(prev => ({ ...prev, openaiKey: value }))}
                  placeholder="sk-..."
                  helpText="Required for GPT-4 document generation. Get your key from platform.openai.com"
                />

                <ApiKeyInput
                  id="anthropicKey"
                  label="Anthropic API Key"
                  value={config.anthropicKey}
                  onChange={(value) => setConfig(prev => ({ ...prev, anthropicKey: value }))}
                  placeholder="sk-ant-..."
                  helpText="Optional. For Claude-based generation. Get your key from console.anthropic.com"
                />
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Quick Tip</p>
                    <p className="text-blue-700">
                      API keys are stored securely and never shared. You only need one AI provider configured to start generating documents.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">JIRA Integration</h3>
                  <div className="pl-4 space-y-3">
                    <ApiKeyInput
                      id="jiraUrl"
                      label="JIRA URL"
                      value={config.jiraUrl}
                      onChange={(value) => setConfig(prev => ({ ...prev, jiraUrl: value }))}
                      placeholder="https://your-domain.atlassian.net"
                      helpText="Your Atlassian domain URL"
                    />
                    <ApiKeyInput
                      id="jiraEmail"
                      label="JIRA Email"
                      value={config.jiraEmail}
                      onChange={(value) => setConfig(prev => ({ ...prev, jiraEmail: value }))}
                      placeholder="your-email@company.com"
                      helpText="Email associated with your JIRA account"
                    />
                    <ApiKeyInput
                      id="jiraToken"
                      label="JIRA API Token"
                      value={config.jiraToken}
                      onChange={(value) => setConfig(prev => ({ ...prev, jiraToken: value }))}
                      helpText="Create token at id.atlassian.com/manage/api-tokens"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Confluence Integration</h3>
                  <div className="pl-4 space-y-3">
                    <ApiKeyInput
                      id="confluenceUrl"
                      label="Confluence URL"
                      value={config.confluenceUrl}
                      onChange={(value) => setConfig(prev => ({ ...prev, confluenceUrl: value }))}
                      placeholder="https://your-domain.atlassian.net/wiki"
                      helpText="Your Confluence workspace URL"
                    />
                    <ApiKeyInput
                      id="confluenceEmail"
                      label="Confluence Email"
                      value={config.confluenceEmail}
                      onChange={(value) => setConfig(prev => ({ ...prev, confluenceEmail: value }))}
                      placeholder="your-email@company.com"
                      helpText="Same as JIRA email for Atlassian products"
                    />
                    <ApiKeyInput
                      id="confluenceToken"
                      label="Confluence API Token"
                      value={config.confluenceToken}
                      onChange={(value) => setConfig(prev => ({ ...prev, confluenceToken: value }))}
                      helpText="Usually the same as your JIRA API token"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Note:</span> GitHub integration is managed through the Integration Hub with OAuth authentication.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}