'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Check, X, Copy, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

interface SlackConfig {
  botToken: string;
  appToken: string;
  signingSecret: string;
  clientId: string;
  clientSecret: string;
  defaultChannel: string;
}

interface SlackSetupWizardProps {
  onComplete?: (config: SlackConfig) => void;
  onCancel?: () => void;
}

export default function SlackSetupWizard({ onComplete, onCancel }: SlackSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<SlackConfig>({
    botToken: '',
    appToken: '',
    signingSecret: '',
    clientId: '',
    clientSecret: '',
    defaultChannel: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [existingConfig, setExistingConfig] = useState<any>(null);

  // Load existing configuration
  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const response = await fetch('/api/user-integrations/slack');
      const data = await response.json();
      
      if (data.connected) {
        setExistingConfig(data);
      }
    } catch (error) {
      console.error('Error loading existing config:', error);
    }
  };

  const steps = [
    {
      title: 'Create Slack App',
      description: 'Create a new Slack app in your workspace',
      component: CreateAppStep
    },
    {
      title: 'Configure Permissions',
      description: 'Set up OAuth scopes and permissions',
      component: ConfigurePermissionsStep
    },
    {
      title: 'Get API Keys',
      description: 'Copy your app tokens and secrets',
      component: GetAPIKeysStep
    },
    {
      title: 'Test Connection',
      description: 'Validate your configuration',
      component: TestConnectionStep
    },
    {
      title: 'Complete Setup',
      description: 'Save and activate your integration',
      component: CompleteSetupStep
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfigChange = (field: keyof SlackConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const validateConfiguration = async () => {
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/user-integrations/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slackConfig: config })
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
        setCurrentStep(4); // Move to complete step
      } else {
        setValidationErrors(data.details || [data.error || 'Validation failed']);
      }
    } catch (error) {
      setValidationErrors(['Network error - please try again']);
    } finally {
      setIsValidating(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/user-integrations/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slackConfig: config })
      });

      const data = await response.json();

      if (response.ok) {
        onComplete?.(config);
      } else {
        setValidationErrors([data.error || 'Failed to save configuration']);
      }
    } catch (error) {
      setValidationErrors(['Network error - please try again']);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Slack Integration Setup</h1>
        <p className="text-gray-600">Connect your Slack workspace to use SDLC.dev AI assistant</p>
        
        {existingConfig && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You already have a Slack integration configured for workspace "{existingConfig.workspaceName}". 
              This setup will update your existing configuration.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <CreateAppStep onNext={handleNext} />
          )}
          {currentStep === 1 && (
            <ConfigurePermissionsStep onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <GetAPIKeysStep 
              config={config} 
              onConfigChange={handleConfigChange} 
              onNext={handleNext}
            />
          )}
          {currentStep === 3 && (
            <TestConnectionStep 
              config={config}
              onValidate={validateConfiguration}
              isValidating={isValidating}
              validationErrors={validationErrors}
              validationResult={validationResult}
              onNext={handleNext}
            />
          )}
          {currentStep === 4 && (
            <CompleteSetupStep 
              config={config}
              onConfigChange={handleConfigChange}
              onComplete={saveConfiguration}
              isSaving={isSaving}
              validationResult={validationResult}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          disabled={isValidating || isSaving}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex space-x-2">
          {currentStep < steps.length - 1 && currentStep !== 3 && (
            <Button onClick={handleNext} disabled={isValidating || isSaving}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Create App
function CreateAppStep({ onNext }: { onNext: () => void }) {
  const slackAppUrl = 'https://api.slack.com/apps';
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Create a New Slack App</h3>
        <p className="text-sm text-gray-700 mb-4">
          You'll need to create a new Slack app in your workspace to use the SDLC.dev AI assistant.
        </p>
        <Button 
          onClick={() => window.open(slackAppUrl, '_blank')}
          className="mr-2"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Create Slack App
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Create New App" in the Slack API dashboard</li>
            <li>Choose "From scratch"</li>
            <li>Enter "SDLC.dev Assistant" as the app name</li>
            <li>Select your workspace</li>
            <li>Click "Create App"</li>
          </ol>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Make sure you're signed into the correct Slack workspace where you want to install the bot.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>I've Created the App</Button>
      </div>
    </div>
  );
}

// Step 2: Configure Permissions
function ConfigurePermissionsStep({ onNext }: { onNext: () => void }) {
  const requiredScopes = [
    'chat:write',
    'chat:write.public',
    'commands',
    'im:read',
    'im:write',
    'channels:read',
    'groups:read',
    'mpim:read',
    'team:read',
    'users:read'
  ];

  const eventSubscriptions = [
    'app_mention',
    'message.im'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Configure OAuth Scopes</h3>
        <p className="text-sm text-gray-700 mb-4">
          Set up the necessary permissions for your Slack app to function properly.
        </p>
      </div>

      <Tabs defaultValue="oauth" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="oauth">OAuth Scopes</TabsTrigger>
          <TabsTrigger value="events">Event Subscriptions</TabsTrigger>
          <TabsTrigger value="commands">Slash Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="oauth" className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Bot Token Scopes</h4>
            <p className="text-sm text-gray-600 mb-3">
              Go to OAuth & Permissions → Scopes → Bot Token Scopes and add these scopes:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {requiredScopes.map(scope => (
                <div key={scope} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="text-sm">{scope}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(scope)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Event Subscriptions</h4>
            <p className="text-sm text-gray-600 mb-3">
              Go to Event Subscriptions → Enable Events and add these bot events:
            </p>
            <div className="space-y-2">
              {eventSubscriptions.map(event => (
                <div key={event} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code className="text-sm">{event}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(event)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Set the Request URL to: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_APP_URL}/api/slack/events</code>
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Slash Commands</h4>
            <p className="text-sm text-gray-600 mb-3">
              Go to Slash Commands → Create New Command and add:
            </p>
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Command:</strong> <code>/sdlc</code>
                </div>
                <div>
                  <strong>Request URL:</strong> <code>{process.env.NEXT_PUBLIC_APP_URL}/api/slack/events</code>
                </div>
                <div>
                  <strong>Short Description:</strong> SDLC.dev AI Assistant
                </div>
                <div>
                  <strong>Usage Hint:</strong> create [task description]
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onNext}>I've Configured the Permissions</Button>
      </div>
    </div>
  );
}

// Step 3: Get API Keys
function GetAPIKeysStep({ 
  config, 
  onConfigChange, 
  onNext 
}: { 
  config: SlackConfig; 
  onConfigChange: (field: keyof SlackConfig, value: string) => void; 
  onNext: () => void;
}) {
  const isFormValid = config.botToken && config.clientId && config.clientSecret && config.signingSecret;

  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Get Your API Keys</h3>
        <p className="text-sm text-gray-700">
          Copy the following tokens and secrets from your Slack app settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="botToken">Bot User OAuth Token</Label>
          <div className="mt-1">
            <Input
              id="botToken"
              type="password"
              placeholder="xoxb-..."
              value={config.botToken}
              onChange={(e) => onConfigChange('botToken', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              From: OAuth & Permissions → OAuth Tokens
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <div className="mt-1">
            <Input
              id="clientId"
              placeholder="1234567890.1234567890"
              value={config.clientId}
              onChange={(e) => onConfigChange('clientId', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              From: Basic Information → App Credentials
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <div className="mt-1">
            <Input
              id="clientSecret"
              type="password"
              placeholder="abcdef1234567890"
              value={config.clientSecret}
              onChange={(e) => onConfigChange('clientSecret', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              From: Basic Information → App Credentials
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="signingSecret">Signing Secret</Label>
          <div className="mt-1">
            <Input
              id="signingSecret"
              type="password"
              placeholder="abcdef1234567890abcdef1234567890"
              value={config.signingSecret}
              onChange={(e) => onConfigChange('signingSecret', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              From: Basic Information → App Credentials
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="appToken">App-Level Token (Optional)</Label>
          <div className="mt-1">
            <Input
              id="appToken"
              type="password"
              placeholder="xapp-..."
              value={config.appToken}
              onChange={(e) => onConfigChange('appToken', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              From: Basic Information → App-Level Tokens (for Socket Mode)
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="defaultChannel">Default Channel (Optional)</Label>
          <div className="mt-1">
            <Input
              id="defaultChannel"
              placeholder="#general"
              value={config.defaultChannel}
              onChange={(e) => onConfigChange('defaultChannel', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Default channel for notifications
            </p>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your API keys are encrypted and stored securely. They are never shared or exposed.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isFormValid}>
          Continue to Testing
        </Button>
      </div>
    </div>
  );
}

// Step 4: Test Connection
function TestConnectionStep({ 
  config, 
  onValidate, 
  isValidating, 
  validationErrors, 
  validationResult, 
  onNext 
}: { 
  config: SlackConfig;
  onValidate: () => void;
  isValidating: boolean;
  validationErrors: string[];
  validationResult: any;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Your Configuration</h3>
        <p className="text-sm text-gray-700">
          Let's verify that your Slack app is configured correctly.
        </p>
      </div>

      <div className="text-center">
        <Button 
          onClick={onValidate} 
          disabled={isValidating}
          size="lg"
          className="min-w-48"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Slack Connection'
          )}
        </Button>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration Error:</strong>
            <ul className="list-disc list-inside mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationResult && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Connection Successful!</strong>
            <div className="mt-2 space-y-1">
              <p>✅ Bot token validated</p>
              <p>✅ Workspace: {validationResult.workspaceName}</p>
              <p>✅ Workspace ID: {validationResult.workspaceId}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validationResult && (
        <div className="flex justify-end">
          <Button onClick={onNext}>Continue to Setup</Button>
        </div>
      )}
    </div>
  );
}

// Step 5: Complete Setup
function CompleteSetupStep({ 
  config, 
  onConfigChange, 
  onComplete, 
  isSaving, 
  validationResult 
}: { 
  config: SlackConfig;
  onConfigChange: (field: keyof SlackConfig, value: string) => void;
  onComplete: () => void;
  isSaving: boolean;
  validationResult: any;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Complete Your Setup</h3>
        <p className="text-sm text-gray-700">
          Your Slack integration is ready! Review the settings and activate it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Workspace Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Workspace:</span>
              <span className="text-sm font-medium">{validationResult?.workspaceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Workspace ID:</span>
              <span className="text-sm font-mono">{validationResult?.workspaceId}</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="finalDefaultChannel">Default Channel</Label>
          <div className="mt-1">
            <Input
              id="finalDefaultChannel"
              placeholder="#general"
              value={config.defaultChannel}
              onChange={(e) => onConfigChange('defaultChannel', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Next Steps</h4>
        <ul className="text-sm space-y-1">
          <li>• Install the app in your Slack workspace</li>
          <li>• Use <code>/sdlc help</code> to see available commands</li>
          <li>• Try <code>/sdlc create Fix login bug</code> to create your first task</li>
        </ul>
      </div>

      <div className="text-center">
        <Button 
          onClick={onComplete} 
          disabled={isSaving}
          size="lg"
          className="min-w-48"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Activating Integration...
            </>
          ) : (
            'Activate Slack Integration'
          )}
        </Button>
      </div>
    </div>
  );
} 