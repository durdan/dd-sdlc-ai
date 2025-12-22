'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Check,
  Code,
  Eye,
  Maximize2,
  Minimize2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Network,
  GitBranch,
  Server,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArchitectureDiagrams } from '@/data/tech-stacks/types';
import { fixMermaidSyntax, validateMermaidDiagram } from '@/lib/mermaid-parser';

interface TechStackMermaidViewerProps {
  diagrams: ArchitectureDiagrams;
  companyName: string;
  className?: string;
}

type DiagramType = 'overview' | 'dataFlow' | 'deployment' | 'serviceInteraction';

interface DiagramTab {
  key: DiagramType;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const DIAGRAM_TABS: DiagramTab[] = [
  {
    key: 'overview',
    label: 'System Overview',
    description: 'High-level architecture view',
    icon: Network,
  },
  {
    key: 'dataFlow',
    label: 'Data Flow',
    description: 'How data moves through the system',
    icon: Workflow,
  },
  {
    key: 'deployment',
    label: 'Deployment',
    description: 'Infrastructure topology',
    icon: Server,
  },
  {
    key: 'serviceInteraction',
    label: 'Services',
    description: 'Service communication patterns',
    icon: GitBranch,
  },
];

// Singleton mermaid instance
let mermaidInstance: any = null;
let mermaidInitialized = false;

export function TechStackMermaidViewer({
  diagrams,
  companyName,
  className,
}: TechStackMermaidViewerProps) {
  const [activeTab, setActiveTab] = useState<DiagramType>('overview');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(0.75); // Start at 75% for better initial view
  const [renderStatus, setRenderStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get available tabs (only those with content)
  const availableTabs = DIAGRAM_TABS.filter((tab) => diagrams[tab.key]?.trim());

  // Fix diagrams on load
  const fixedDiagrams = React.useMemo(() => {
    const fixed: Record<DiagramType, string> = {
      overview: '',
      dataFlow: '',
      deployment: '',
      serviceInteraction: '',
    };

    (Object.keys(diagrams) as DiagramType[]).forEach((key) => {
      if (diagrams[key]) {
        fixed[key] = fixMermaidSyntax(diagrams[key]);
      }
    });

    return fixed;
  }, [diagrams]);

  // Render Mermaid diagram
  const renderDiagram = useCallback(async (diagramKey: DiagramType) => {
    const diagramContent = fixedDiagrams[diagramKey];
    const diagramRef = diagramRefs.current[diagramKey];

    if (!diagramRef || !diagramContent) return;

    setRenderStatus((prev) => ({ ...prev, [diagramKey]: 'loading' }));

    try {
      // Initialize mermaid singleton
      if (!mermaidInstance) {
        mermaidInstance = (await import('mermaid')).default;
      }

      if (!mermaidInitialized) {
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          deterministicIds: true,
          fontFamily: 'Inter, system-ui, sans-serif',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            useMaxWidth: true,
            padding: 20,
          },
          sequence: {
            useMaxWidth: true,
            showSequenceNumbers: true,
            actorMargin: 80,
            messageMargin: 40,
          },
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#2563eb',
            lineColor: '#64748b',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#e2e8f0',
          },
        });
        mermaidInitialized = true;
      }

      // Clear previous content
      diagramRef.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Rendering diagram...</div>';

      // Generate unique ID
      const diagramId = `techstack-${diagramKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Clean existing SVGs with same prefix
      document.querySelectorAll(`[id^="techstack-${diagramKey}"]`).forEach((el) => el.remove());

      // Render
      const { svg } = await mermaidInstance.render(diagramId, diagramContent);

      if (diagramRef) {
        diagramRef.innerHTML = svg;

        // Make SVG responsive and properly sized
        const svgElement = diagramRef.querySelector('svg');
        if (svgElement) {
          // Remove fixed width/height, let it scale naturally
          svgElement.removeAttribute('width');
          svgElement.removeAttribute('height');
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.maxWidth = '800px'; // Constrain max width
          svgElement.style.display = 'block';
          svgElement.style.margin = '0 auto';
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }

        setRenderStatus((prev) => ({ ...prev, [diagramKey]: 'success' }));
        setErrorMessages((prev) => ({ ...prev, [diagramKey]: '' }));
      }
    } catch (error: any) {
      console.error(`Failed to render ${diagramKey} diagram:`, error);
      setRenderStatus((prev) => ({ ...prev, [diagramKey]: 'error' }));
      setErrorMessages((prev) => ({
        ...prev,
        [diagramKey]: error.message || 'Unknown rendering error',
      }));

      if (diagramRef) {
        diagramRef.innerHTML = `
          <div class="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-6">
            <svg class="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-red-600 text-sm font-medium mb-1">Diagram Render Error</p>
            <p class="text-red-500 text-xs text-center">${error.message || 'Failed to render'}</p>
          </div>
        `;
      }
    }
  }, [fixedDiagrams]);

  // Render on tab change or view mode change
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    if (viewMode === 'preview' && fixedDiagrams[activeTab]) {
      renderTimeoutRef.current = setTimeout(() => {
        renderDiagram(activeTab);
      }, 100);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [activeTab, viewMode, renderDiagram, fixedDiagrams]);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleZoomReset = () => setZoom(0.75); // Reset to default 75%

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fixedDiagrams[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const diagramRef = diagramRefs.current[activeTab];
    const svg = diagramRef?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, '-')}-${activeTab}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download PNG
  const handleDownloadPNG = async () => {
    const diagramRef = diagramRefs.current[activeTab];
    const svg = diagramRef?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${companyName.toLowerCase().replace(/\s+/g, '-')}-${activeTab}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (availableTabs.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Architecture Diagrams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No Mermaid diagrams available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-white rounded-lg border shadow-sm',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-gray-900">{companyName} Architecture</h3>
          <p className="text-sm text-gray-500">Interactive technical diagrams</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border bg-white p-1">
            <Button
              size="sm"
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              onClick={() => setViewMode('preview')}
              className="h-7 px-2.5"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'code' ? 'default' : 'ghost'}
              onClick={() => setViewMode('code')}
              className="h-7 px-2.5"
            >
              <Code className="h-3.5 w-3.5 mr-1" />
              Code
            </Button>
          </div>

          {/* Zoom Controls (only in preview mode) */}
          {viewMode === 'preview' && (
            <div className="flex items-center rounded-lg border bg-white p-1 gap-0.5">
              <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-7 w-7 p-0">
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-gray-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-7 w-7 p-0">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleZoomReset} className="h-7 w-7 p-0">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Download Button */}
          {viewMode === 'preview' && (
            <div className="flex items-center rounded-lg border bg-white">
              <Button size="sm" variant="ghost" onClick={handleDownloadSVG} className="h-8 px-2.5">
                <Download className="h-3.5 w-3.5 mr-1" />
                SVG
              </Button>
              <div className="w-px h-4 bg-gray-200" />
              <Button size="sm" variant="ghost" onClick={handleDownloadPNG} className="h-8 px-2.5">
                PNG
              </Button>
            </div>
          )}

          {/* Copy Button (code mode) */}
          {viewMode === 'code' && (
            <Button size="sm" variant="outline" onClick={handleCopy} className="h-8">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}

          {/* Fullscreen Toggle */}
          <Button size="sm" variant="outline" onClick={toggleFullscreen} className="h-8 w-8 p-0">
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DiagramType)} className="w-full">
        <div className="border-b px-4">
          <TabsList className="h-auto p-0 bg-transparent gap-0">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const status = renderStatus[tab.key];

              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {status === 'error' && (
                    <Badge variant="destructive" className="ml-2 h-4 px-1 text-[10px]">
                      Error
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Content */}
        {availableTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-0">
            <div className="p-4">
              {/* Description */}
              <p className="text-sm text-gray-500 mb-4">{tab.description}</p>

              {viewMode === 'preview' ? (
                <div
                  className={cn(
                    'bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border overflow-auto',
                    isFullscreen ? 'h-[calc(100vh-180px)]' : 'min-h-[350px] max-h-[600px]'
                  )}
                >
                  <div className="flex items-center justify-center p-6 min-h-[350px]">
                    <div
                      ref={(el: HTMLDivElement | null) => {
                        diagramRefs.current[tab.key] = el;
                      }}
                      className="mermaid-diagram-container inline-block"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                    <span className="text-xs text-gray-400">mermaid</span>
                    {validateMermaidDiagram(fixedDiagrams[tab.key]).isValid ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/30">
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                        Warning
                      </Badge>
                    )}
                  </div>
                  <pre
                    className={cn(
                      'p-4 overflow-auto text-sm text-gray-300 font-mono',
                      isFullscreen ? 'max-h-[calc(100vh-220px)]' : 'max-h-[500px]'
                    )}
                  >
                    <code>{fixedDiagrams[tab.key]}</code>
                  </pre>
                </div>
              )}

              {/* Error Message */}
              {errorMessages[tab.key] && viewMode === 'preview' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Rendering Error</p>
                      <p className="text-xs text-red-600 mt-0.5">{errorMessages[tab.key]}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewMode('code')}
                        className="mt-2 h-6 text-xs text-red-600 hover:text-red-700"
                      >
                        View source code
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
