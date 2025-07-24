"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Loader2, Wand2, Layout, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { V0AvailabilityBadge } from './v0-availability-badge';
import type { WireframeData, WireframeTemplate } from '@/lib/types/wireframe.types';

interface WireframeGeneratorProps {
  projectId?: string;
  onGenerated?: (wireframe: WireframeData) => void;
  className?: string;
}

type AIModel = 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet' | 'v0-dev';
type LayoutType = 'web' | 'mobile' | 'tablet';

export function WireframeGenerator({ 
  projectId, 
  onGenerated,
  className 
}: WireframeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<AIModel>('gpt-4');
  const [layoutType, setLayoutType] = useState<LayoutType>('web');
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeUserFlow, setIncludeUserFlow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WireframeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/wireframe/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedTemplate) {
      setError('Please enter a description or select a template');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wireframe/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          projectId,
          templateId: selectedTemplate,
          layoutType,
          includeAnnotations,
          includeUserFlow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate wireframe');
      }

      if (data.success && data.wireframe) {
        toast({
          title: 'Wireframe generated successfully',
          description: `Generated in ${data.metadata.generationTime}ms using ${data.metadata.model}`,
        });
        
        if (onGenerated) {
          onGenerated(data.wireframe);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate wireframe';
      setError(errorMessage);
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setPrompt(template.promptTemplate);
      setSelectedTemplate(templateId);
    }
  };

  const modelInfo = {
    'gpt-4': {
      name: 'OpenAI GPT-4',
      description: 'Best for detailed and structured wireframes',
      icon: '🤖',
    },
    'claude-3-opus': {
      name: 'Claude 3 Opus',
      description: 'Excellent for creative and complex layouts',
      icon: '🎨',
    },
    'claude-3-sonnet': {
      name: 'Claude 3 Sonnet',
      description: 'Fast and efficient for simple wireframes',
      icon: '⚡',
    },
    'v0-dev': {
      name: 'v0.dev',
      description: 'Generate production-ready React components',
      icon: '🚀',
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Generate Wireframe
        </CardTitle>
        <CardDescription>
          Create professional wireframes from natural language descriptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe your wireframe</Label>
              <Textarea
                id="prompt"
                placeholder="Example: Create a modern e-commerce product page with image gallery on the left, product details on the right, customer reviews section below, and a sticky add-to-cart button..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Be specific about layout, components, and functionality you need
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <ScrollArea className="h-64 rounded-md border p-4">
              <div className="space-y-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedTemplate === template.id ? 'border-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <Badge className="ml-2">Selected</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select value={model} onValueChange={(value: AIModel) => setModel(value)}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modelInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{info.name}</span>
                          {key === 'v0-dev' && <V0AvailabilityBadge />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {info.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout Type</Label>
            <Select value={layoutType} onValueChange={(value: LayoutType) => setLayoutType(value)}>
              <SelectTrigger id="layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">
                  <div className="flex items-center gap-2">
                    <span>🖥️</span>
                    <span>Desktop Web (1440x900)</span>
                  </div>
                </SelectItem>
                <SelectItem value="mobile">
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Mobile (375x812)</span>
                  </div>
                </SelectItem>
                <SelectItem value="tablet">
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>Tablet (768x1024)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="annotations">Include Annotations</Label>
              <p className="text-sm text-muted-foreground">
                Add design notes and explanations
              </p>
            </div>
            <Switch
              id="annotations"
              checked={includeAnnotations}
              onCheckedChange={setIncludeAnnotations}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="userflow">Include User Flow</Label>
              <p className="text-sm text-muted-foreground">
                Document user interaction steps
              </p>
            </div>
            <Switch
              id="userflow"
              checked={includeUserFlow}
              onCheckedChange={setIncludeUserFlow}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading || (!prompt.trim() && !selectedTemplate)}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Wireframe
              </>
            )}
          </Button>
          
          {onGenerated && (
            <Button
              variant="outline"
              onClick={() => {
                setPrompt('');
                setSelectedTemplate(null);
                setError(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}