'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Download, Share2, ExternalLink, AlertTriangle, Code } from 'lucide-react';
import { GeneratedSpec } from '@/types/analyzer';

// Mermaid component with error handling
function MermaidDiagram({ chart, isStreaming }: { chart: string; isStreaming?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    // Don't render while streaming - wait until complete
    if (isStreaming) {
      return;
    }

    // Only render once after streaming completes
    if (hasRendered) {
      return;
    }

    const renderDiagram = async () => {
      if (!chart) return;

      try {
        // Clean up the chart content
        const cleanChart = chart.trim();

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Try to render the diagram
        const { svg } = await mermaid.render(id, cleanChart);
        setSvgContent(svg);
        setError(null);
        setHasRendered(true);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        setSvgContent(null);
        setHasRendered(true);
      }
    };

    renderDiagram();
  }, [chart, isStreaming, hasRendered]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Diagram Syntax Error
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="h-7 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"
            >
              <Code className="w-3 h-3 mr-1" />
              {showCode ? 'Hide' : 'Show'} Code
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyCode}
              className="h-7 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        {showCode && (
          <pre className="p-4 text-sm font-mono text-amber-900 dark:text-amber-100 overflow-x-auto bg-amber-50 dark:bg-amber-950/20">
            {chart}
          </pre>
        )}
        <div className="px-4 py-2 text-xs text-amber-600 dark:text-amber-400">
          The AI-generated diagram has a syntax error. You can copy the code and fix it manually.
        </div>
      </div>
    );
  }

  if (svgContent) {
    return (
      <div
        ref={containerRef}
        className="my-6 flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // Loading/streaming state
  return (
    <div ref={containerRef} className="my-6 flex flex-col justify-center items-center py-8 gap-3">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      {isStreaming && (
        <span className="text-sm text-muted-foreground">Diagram will render after loading completes...</span>
      )}
    </div>
  );
}

interface SpecViewerProps {
  spec: GeneratedSpec | null;
  markdown: string;
  shareUrl?: string;
  isStreaming?: boolean;
}

export function SpecViewer({ spec, markdown, shareUrl, isStreaming }: SpecViewerProps) {
  const [copied, setCopied] = useState<'markdown' | 'link' | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string, type: 'markdown' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${spec?.metadata?.repoName || 'spec'}-specification.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!markdown) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-2 mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(markdown, 'markdown')}
          className="flex items-center gap-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
        >
          {copied === 'markdown' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          Copy Markdown
        </Button>

        {shareUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(shareUrl, 'link')}
            className="flex items-center gap-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
          >
            {copied === 'link' ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            Copy Share Link
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={downloadMarkdown}
          className="flex items-center gap-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>

        {spec?.metadata?.repoUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2 ml-auto bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
          >
            <a href={spec.metadata.repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Repository
            </a>
          </Button>
        )}
      </div>

      {/* Spec Content */}
      <Card className="p-6 md:p-8 overflow-hidden bg-white dark:bg-slate-900">
        <div ref={mermaidRef} className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom code block renderer for mermaid
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';

                if (language === 'mermaid') {
                  const chartContent = String(children).replace(/\n$/, '');
                  return <MermaidDiagram chart={chartContent} isStreaming={isStreaming} />;
                }

                // Regular code block
                return (
                  <code
                    className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Custom pre for code blocks
              pre({ children, ...props }) {
                return (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto" {...props}>
                    {children}
                  </pre>
                );
              },
              // Custom table styling
              table({ children, ...props }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse" {...props}>
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }) {
                return (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
                    {children}
                  </th>
                );
              },
              td({ children, ...props }) {
                return (
                  <td className="border border-border px-4 py-2" {...props}>
                    {children}
                  </td>
                );
              },
              // Custom heading styling
              h1({ children, ...props }) {
                return (
                  <h1 className="text-3xl font-bold mb-4 mt-8 first:mt-0" {...props}>
                    {children}
                  </h1>
                );
              },
              h2({ children, ...props }) {
                return (
                  <h2 className="text-2xl font-bold mb-3 mt-8 pb-2 border-b" {...props}>
                    {children}
                  </h2>
                );
              },
              h3({ children, ...props }) {
                return (
                  <h3 className="text-xl font-semibold mb-2 mt-6" {...props}>
                    {children}
                  </h3>
                );
              },
              // Custom blockquote for the header
              blockquote({ children, ...props }) {
                return (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props}>
                    {children}
                  </blockquote>
                );
              },
              // Custom link styling
              a({ children, href, ...props }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              // Custom list styling
              ul({ children, ...props }) {
                return (
                  <ul className="list-disc pl-6 my-2 space-y-1" {...props}>
                    {children}
                  </ul>
                );
              },
              ol({ children, ...props }) {
                return (
                  <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>
                    {children}
                  </ol>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 mt-4 text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm">Generating...</span>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Generated by{' '}
          <a href="https://sdlc.dev" className="text-primary hover:underline">
            SDLC.dev
          </a>{' '}
          |{' '}
          <a href="/analyze" className="text-primary hover:underline">
            Analyze another repo
          </a>
        </p>
      </div>
    </div>
  );
}
