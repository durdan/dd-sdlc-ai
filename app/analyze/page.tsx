'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RepoUrlInput, ProgressIndicator, SpecViewer } from '@/components/analyzer';
import { AnalysisStep, GeneratedSpec, AnalyzeErrorCode, ERROR_MESSAGES } from '@/types/analyzer';
import { Sparkles, Github, Zap, FileText, Share2, ArrowRight, Loader2 } from 'lucide-react';

type AnalysisStatus = 'idle' | 'analyzing' | 'complete' | 'error';

// Glass Card Component
function GlassCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/[0.08] dark:bg-white/[0.05]
        backdrop-blur-2xl backdrop-saturate-200
        border border-white/[0.15] dark:border-white/[0.08]
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${hover ? 'transition-all duration-500 hover:bg-white/[0.12] dark:hover:bg-white/[0.08] hover:border-white/[0.25] hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Floating Orb Component for ambient lighting
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-60 animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

// Loading fallback component
function AnalyzePageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading analyzer...</p>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function AnalyzePage() {
  return (
    <Suspense fallback={<AnalyzePageLoading />}>
      <AnalyzePageContent />
    </Suspense>
  );
}

// Actual page content that uses useSearchParams
function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [currentStep, setCurrentStep] = useState<AnalysisStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<AnalysisStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<GeneratedSpec | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check for repo URL in search params and auto-fill
  useEffect(() => {
    const repoParam = searchParams.get('repo');
    if (repoParam && !autoStarted) {
      setRepoUrl(decodeURIComponent(repoParam));
      setAutoStarted(true);
    }
  }, [searchParams, autoStarted]);

  const resetState = useCallback(() => {
    setStatus('idle');
    setCurrentStep(null);
    setCompletedSteps([]);
    setError(null);
    setSpec(null);
    setMarkdown('');
    setShareUrl(null);
    setIsStreaming(false);
  }, []);

  const analyzeRepo = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    resetState();
    setStatus('analyzing');
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/analyze/repo/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to start analysis');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullMarkdown = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            const dataLine = lines[++i];
            if (dataLine?.startsWith('data: ')) {
              const data = JSON.parse(dataLine.slice(6));
              switch (eventType) {
                case 'progress':
                  setCurrentStep(data.step as AnalysisStep);
                  if (data.step !== 'complete') {
                    setCompletedSteps(() => {
                      const steps: AnalysisStep[] = ['fetching_metadata', 'analyzing_structure', 'reading_files', 'analyzing_architecture', 'generating_spec'];
                      return steps.slice(0, steps.indexOf(data.step));
                    });
                  }
                  break;
                case 'content':
                  fullMarkdown += data.text;
                  setMarkdown(fullMarkdown);
                  break;
                case 'complete':
                  setSpec({ markdown: data.markdown || fullMarkdown, sections: {} as GeneratedSpec['sections'], metadata: data.metadata, shareId: data.specId });
                  setShareUrl(data.shareUrl);
                  setStatus('complete');
                  setIsStreaming(false);
                  setCompletedSteps(['fetching_metadata', 'analyzing_structure', 'reading_files', 'analyzing_architecture', 'generating_spec']);
                  break;
                case 'error':
                  setError(data.error || ERROR_MESSAGES[data.errorCode as AnalyzeErrorCode] || 'Analysis failed');
                  setStatus('error');
                  setIsStreaming(false);
                  break;
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') { resetState(); return; }
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setStatus('error');
      setIsStreaming(false);
    }
  }, [repoUrl, resetState]);

  const cancelAnalysis = useCallback(() => {
    abortControllerRef.current?.abort();
    resetState();
  }, [resetState]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

        {/* Animated gradient orbs */}
        <FloatingOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-br from-blue-400/40 to-cyan-300/40 dark:from-blue-600/30 dark:to-cyan-500/30" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] top-1/3 -right-32 bg-gradient-to-br from-purple-400/40 to-pink-300/40 dark:from-purple-600/30 dark:to-pink-500/30" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bottom-0 left-1/4 bg-gradient-to-br from-indigo-400/40 to-blue-300/40 dark:from-indigo-600/30 dark:to-blue-500/30" delay={4} />
        <FloatingOrb className="w-[350px] h-[350px] top-1/2 left-1/2 bg-gradient-to-br from-cyan-400/30 to-teal-300/30 dark:from-cyan-600/20 dark:to-teal-500/20" delay={1} />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)"/%3E%3C/svg%3E")' }} />
      </div>

      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 mx-4 mt-4">
        <GlassCard className="rounded-2xl" hover={false}>
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 font-bold text-xl group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                SDLC.dev
              </span>
            </a>
            <nav className="flex items-center gap-6">
              <a href="/dashboard" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/pricing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Pricing
              </a>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25">
                Sign In
              </Button>
            </nav>
          </div>
        </GlassCard>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20 relative">
        {/* Hero Section */}
        {status === 'idle' && (
          <div className="text-center mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8">
              <GlassCard className="rounded-full px-5 py-2.5" hover={false}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <Github className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Free for public repositories
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">GitHub Repo</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Instant Spec
                </span>
                {/* Animated underline */}
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-xl" />
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Transform any GitHub repository into comprehensive documentation instantly.
              Architecture diagrams, tech stack analysis, and more.
            </p>
          </div>
        )}

        {/* Input Section */}
        <div className={`max-w-2xl mx-auto ${status !== 'idle' ? 'mb-12' : 'mb-20'}`}>
          <GlassCard className="p-8">
            <RepoUrlInput
              value={repoUrl}
              onChange={setRepoUrl}
              onSubmit={analyzeRepo}
              disabled={status === 'analyzing'}
              error={status === 'error' && error ? null : null}
            />

            <div className="mt-6 flex gap-3">
              {status === 'analyzing' ? (
                <Button
                  variant="destructive"
                  onClick={cancelAnalysis}
                  className="flex-1 h-14 text-base rounded-2xl"
                >
                  Cancel Analysis
                </Button>
              ) : (
                <Button
                  onClick={analyzeRepo}
                  disabled={!repoUrl.trim()}
                  className="flex-1 h-14 text-base rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Specification
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Progress Section */}
        {status === 'analyzing' && (
          <div className="max-w-xl mx-auto mb-16">
            <GlassCard className="p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analyzing Repository</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">This usually takes 15-30 seconds</p>
              </div>
              <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} error={error} />
            </GlassCard>
          </div>
        )}

        {/* Error Section */}
        {status === 'error' && error && (
          <div className="max-w-xl mx-auto mb-16">
            <GlassCard className="p-10 border-red-500/20 bg-red-500/5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Analysis Failed</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <Button
                  onClick={resetState}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Try Again
                </Button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Spec Viewer */}
        {(markdown || status === 'complete') && (
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-0 overflow-hidden" hover={false}>
              <div className="p-8">
                <SpecViewer spec={spec} markdown={markdown} shareUrl={shareUrl || undefined} isStreaming={isStreaming} />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Features Section */}
        {status === 'idle' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
              What You Get
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Instant Analysis',
                  description: 'Get a comprehensive spec in under 30 seconds. No waiting, no signup required.',
                  gradient: 'from-amber-500 to-orange-500',
                },
                {
                  icon: FileText,
                  title: 'Complete Documentation',
                  description: 'Tech stack, architecture diagrams, API docs, and setup instructions all in one place.',
                  gradient: 'from-blue-500 to-cyan-500',
                },
                {
                  icon: Share2,
                  title: 'Share Anywhere',
                  description: 'Copy markdown, download, or share a link. Perfect for onboarding new team members.',
                  gradient: 'from-purple-500 to-pink-500',
                },
              ].map((feature, index) => (
                <GlassCard key={index} className="p-8 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* Example repos */}
            <div className="mt-16 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Try with popular repositories
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['facebook/react', 'vercel/next.js', 'supabase/supabase', 'anthropics/anthropic-sdk-python'].map((repo) => (
                  <button
                    key={repo}
                    onClick={() => setRepoUrl(repo)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 hover:bg-white/80 dark:hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:scale-105"
                  >
                    {repo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 pb-8">
        <div className="container mx-auto px-4">
          <GlassCard className="rounded-2xl p-8" hover={false}>
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              <p>
                Built with ❤️ by{' '}
                <a href="https://sdlc.dev" className="text-blue-500 hover:text-blue-600 transition-colors">
                  SDLC.dev
                </a>
                {' '}| Powered by Claude AI
              </p>
            </div>
          </GlassCard>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -20px) scale(1.05);
          }
          50% {
            transform: translate(-5px, 10px) scale(0.95);
          }
          75% {
            transform: translate(-15px, -10px) scale(1.02);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
