'use client';

import { SpecViewer } from '@/components/analyzer';
import { SpecMetadata, GeneratedSpec } from '@/types/analyzer';
import { Sparkles, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SpecViewerPageProps {
  markdown: string;
  metadata: SpecMetadata;
  shareUrl: string;
  viewCount: number;
}

export function SpecViewerPage({ markdown, metadata, shareUrl, viewCount }: SpecViewerPageProps) {
  const spec: GeneratedSpec = {
    markdown,
    sections: {} as GeneratedSpec['sections'],
    metadata,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            SDLC.dev
          </a>
          <nav className="flex items-center gap-4">
            <a href="/analyze" className="text-sm text-muted-foreground hover:text-primary">
              Analyze a Repo
            </a>
            <a href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Spec Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {viewCount} views
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Generated {formatDistanceToNow(new Date(metadata.generatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Spec Viewer */}
        <div className="max-w-4xl mx-auto">
          <SpecViewer spec={spec} markdown={markdown} shareUrl={shareUrl} isStreaming={false} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Built by{' '}
            <a href="https://sdlc.dev" className="text-primary hover:underline">
              SDLC.dev
            </a>{' '}
            | Powered by Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
}
