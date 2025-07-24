"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Eye,
  Code,
  FileText,
  Sparkles,
  Share2,
  Maximize2,
  Grid3X3,
  MessageSquare,
  Loader2,
  Layout,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import type { 
  WireframeData, 
  WireframeComponent, 
  WireframeAnnotation,
  EnhancementType 
} from '@/lib/types/wireframe.types';
import { WireframeCanvasViewer } from './wireframe-canvas-viewer';
import { V0ComponentViewer } from './v0-component-viewer';

interface WireframeViewerProps {
  wireframe: WireframeData;
  onEnhance?: (wireframe: WireframeData) => void;
  onExport?: (format: 'svg' | 'html' | 'json') => void;
  projectId?: string;
  className?: string;
}

export function WireframeViewer({
  wireframe,
  onEnhance,
  onExport,
  projectId,
  className
}: WireframeViewerProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const [enhancing, setEnhancing] = useState(false);
  const { toast } = useToast();

  const handleEnhance = async (enhancementType: EnhancementType, model: string) => {
    setEnhancing(true);
    try {
      const response = await fetch('/api/wireframe/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wireframe,
          enhancementType,
          model,
        }),
      });

      const data = await response.json();

      if (data.success && data.wireframe) {
        toast({
          title: 'Wireframe enhanced',
          description: `Enhanced with ${enhancementType} improvements`,
        });
        
        if (onEnhance) {
          onEnhance(data.wireframe);
        }
      } else {
        throw new Error(data.error || 'Enhancement failed');
      }
    } catch (error) {
      toast({
        title: 'Enhancement failed',
        description: error instanceof Error ? error.message : 'Failed to enhance wireframe',
        variant: 'destructive',
      });
    } finally {
      setEnhancing(false);
    }
  };

  const handleExport = async (format: 'svg' | 'html' | 'json') => {
    if (format === 'json') {
      // Download JSON directly
      const blob = new Blob([JSON.stringify(wireframe, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${wireframe.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Use the render endpoint for SVG/HTML export
      const params = new URLSearchParams({
        format,
        data: encodeURIComponent(JSON.stringify(wireframe)),
      });
      
      window.open(`/api/wireframe/render?${params}`, '_blank');
    }
    
    if (onExport) {
      onExport(format);
    }
  };


  const renderComponentTree = (components: WireframeComponent[], level = 0): JSX.Element[] => {
    return components.map((component) => (
      <div key={component.id} style={{ marginLeft: `${level * 20}px` }} className="py-1">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="text-xs">
            {component.type}
          </Badge>
          <span className="text-muted-foreground">{component.id}</span>
          {component.content && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              "{component.content}"
            </span>
          )}
        </div>
        {component.children && component.children.length > 0 && (
          <div className="mt-1">
            {renderComponentTree(component.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getLayoutIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              {wireframe.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {wireframe.description}
              <Badge variant="secondary" className="ml-2">
                {getLayoutIcon(wireframe.layout.type)}
                {wireframe.layout.type}
              </Badge>
              <Badge variant="secondary">
                {wireframe.layout.dimensions.width} × {wireframe.layout.dimensions.height}
              </Badge>
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={enhancing}>
                  {enhancing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Enhance</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enhance Wireframe</DialogTitle>
                  <DialogDescription>
                    Choose how you'd like to enhance your wireframe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Enhancement Type</Label>
                    <RadioGroup defaultValue="full">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full" />
                        <Label htmlFor="full" className="cursor-pointer">
                          Full Enhancement - Improve all aspects
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="accessibility" id="accessibility" />
                        <Label htmlFor="accessibility" className="cursor-pointer">
                          Accessibility - Add ARIA labels and keyboard navigation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile" className="cursor-pointer">
                          Mobile Optimization - Touch-friendly design
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="interactions" id="interactions" />
                        <Label htmlFor="interactions" className="cursor-pointer">
                          Interactions - Add hover states and animations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="content" id="content" />
                        <Label htmlFor="content" className="cursor-pointer">
                          Content - Improve information architecture
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <RadioGroup defaultValue="gpt-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gpt-4" id="gpt-4" />
                        <Label htmlFor="gpt-4" className="cursor-pointer">GPT-4</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="claude-3-opus" id="claude-3-opus" />
                        <Label htmlFor="claude-3-opus" className="cursor-pointer">Claude 3 Opus</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button
                    onClick={() => {
                      const form = document.querySelector('form');
                      const enhancementType = form?.querySelector('input[name="enhancement"]:checked')?.id as EnhancementType;
                      const model = form?.querySelector('input[name="model"]:checked')?.id;
                      if (enhancementType && model) {
                        handleEnhance(enhancementType, model);
                      }
                    }}
                    className="w-full"
                  >
                    Enhance Wireframe
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('svg')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  <Code className="mr-2 h-4 w-4" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="annotations">
                Annotations
                {wireframe.annotations && wireframe.annotations.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0">
                    {wireframe.annotations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="flow">User Flow</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visual" className="space-y-4">
            {wireframe.v0Component ? (
              <V0ComponentViewer 
                component={wireframe.v0Component}
                title={wireframe.title}
                description={wireframe.description}
              />
            ) : (
              <WireframeCanvasViewer wireframe={wireframe} scale={0.7} />
            )}
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Component Hierarchy</CardTitle>
                <CardDescription>
                  Visual structure of your wireframe components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {renderComponentTree(wireframe.components)}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="annotations" className="space-y-4">
            {wireframe.annotations && wireframe.annotations.length > 0 ? (
              <div className="space-y-4">
                {wireframe.annotations.map((annotation: WireframeAnnotation, index) => (
                  <Card key={annotation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Badge>{index + 1}</Badge>
                            {annotation.title}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {annotation.type}
                            </Badge>
                            {annotation.componentId && (
                              <Badge variant="outline" className="text-xs">
                                {annotation.componentId}
                              </Badge>
                            )}
                            {annotation.priority && (
                              <Badge 
                                variant={
                                  annotation.priority === 'high' ? 'destructive' :
                                  annotation.priority === 'medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {annotation.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{annotation.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No annotations available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="flow" className="space-y-4">
            {wireframe.userFlow && wireframe.userFlow.length > 0 ? (
              <div className="space-y-4">
                {wireframe.userFlow.map((step, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="rounded-full">{step.step}</Badge>
                        {step.action}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium">Result:</span>
                        <span className="text-sm text-muted-foreground">{step.result}</span>
                      </div>
                      {step.componentId && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">Component:</span>
                          <Badge variant="outline" className="text-xs">
                            {step.componentId}
                          </Badge>
                        </div>
                      )}
                      {step.alternativePaths && Array.isArray(step.alternativePaths) && step.alternativePaths.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-sm font-medium">Alternative paths:</span>
                          <ul className="list-disc list-inside text-sm text-muted-foreground ml-4">
                            {step.alternativePaths.map((path, i) => (
                              <li key={i}>{path}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Layout className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No user flow defined</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Wireframe JSON</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(wireframe, null, 2));
                      toast({
                        title: 'Copied to clipboard',
                        description: 'Wireframe JSON has been copied',
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                  <pre className="text-xs">
                    <code>{JSON.stringify(wireframe, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}