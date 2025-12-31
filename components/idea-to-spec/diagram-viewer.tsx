'use client';

import { useState, useEffect, ComponentType, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { DiagramType, DDFLOW_TYPE_MAP, DIAGRAM_LABELS, DIAGRAM_ICONS } from '@/lib/idea-to-spec/types';
import type { DiagramType as DDFlowDiagramType, ThemeMode } from 'ddflow';

interface UniversalDiagramProps {
  type: DDFlowDiagramType;
  source?: string;
  data?: unknown;
  theme?: ThemeMode;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

// Error Boundary for DDflow component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DiagramErrorBoundary extends Component<{ children: ReactNode; onError: (error: string) => void }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; onError: (error: string) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('DDflow rendering error:', error);
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-center p-8">
          <div>
            <span className="text-4xl mb-3 block">⚠️</span>
            <p className="text-red-400 mb-2">Diagram rendering failed</p>
            <p className="text-sm text-white/50">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamic import for DDflow (client-side only)
const UniversalDiagram = dynamic<UniversalDiagramProps>(
  () => import('ddflow').then((mod) => mod.UniversalDiagram as ComponentType<UniversalDiagramProps>),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-sm text-white/50">Loading diagram...</span>
        </div>
      </div>
    ),
  }
);

function DiagramSkeleton() {
  return (
    <div className="w-full h-[200px] sm:h-[250px] bg-slate-900/50 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-xs sm:text-sm text-white/50">Loading...</span>
      </div>
    </div>
  );
}

// Fullscreen Modal Component - renders via portal
function FullscreenModal({
  isOpen,
  onClose,
  type,
  dsl,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: DiagramType;
  dsl: string;
}) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', handleResize);
    };
  }, [onClose]);

  if (!isOpen || !portalTarget) return null;

  const diagramWidth = windowSize.width - 32;
  const diagramHeight = windowSize.height - 100;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950">
      {/* Header */}
      <div className="h-12 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">{DIAGRAM_ICONS[type]}</span>
          <h3 className="font-semibold text-white text-sm">{DIAGRAM_LABELS[type]}</h3>
          <span className="text-xs text-white/40 hidden sm:inline">• Drag to pan • Scroll to zoom</span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
        >
          <span>Close</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Diagram Area - Full viewport */}
      <div
        className="w-full overflow-auto bg-slate-950"
        style={{ height: windowSize.height - 48 }}
      >
        <DiagramErrorBoundary onError={() => {}}>
          <UniversalDiagram
            type={DDFLOW_TYPE_MAP[type] as DDFlowDiagramType}
            source={dsl}
            theme="dark"
            width={diagramWidth}
            height={diagramHeight}
          />
        </DiagramErrorBoundary>
      </div>
    </div>
  );

  return createPortal(modalContent, portalTarget);
}

interface DiagramViewerProps {
  type: DiagramType;
  dsl: string;
  isStreaming?: boolean;
  onDslChange?: (newDsl: string) => void;
  showEditor?: boolean;
}

export function DiagramViewer({
  type,
  dsl,
  isStreaming = false,
  onDslChange,
  showEditor = false,
}: DiagramViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDsl, setEditedDsl] = useState(dsl);
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditedDsl(dsl);
  }, [dsl]);

  const handleApplyEdit = () => {
    if (onDslChange) {
      onDslChange(editedDsl);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedDsl(dsl);
    setIsEditing(false);
  };

  const handleCopyDsl = () => {
    navigator.clipboard.writeText(dsl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return <DiagramSkeleton />;
  }

  // Streaming preview - Show animated loading indicator
  if (isStreaming) {
    return (
      <div className="w-full">
        <div className="bg-slate-900/80 border border-orange-500/30 rounded-xl overflow-hidden">
          {/* Animated header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xl">{DIAGRAM_ICONS[type]}</span>
              <span className="text-sm font-medium text-white">{DIAGRAM_LABELS[type]}</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400">
              {/* Animated spinning arrows */}
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-medium">Generating...</span>
            </div>
          </div>

          {/* Main animation area */}
          <div className="h-[200px] sm:h-[280px] flex items-center justify-center relative overflow-hidden">
            {/* Background animated grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(251,146,60,0.3) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }} />
            </div>

            {/* Central animated diagram preview */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              {/* Animated connecting nodes */}
              <div className="relative w-48 h-32">
                {/* Pulsing nodes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-8 bg-orange-500/20 border border-orange-500/50 rounded-lg animate-pulse" />
                <div className="absolute bottom-0 left-4 w-10 h-7 bg-blue-500/20 border border-blue-500/50 rounded-lg animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="absolute bottom-0 right-4 w-10 h-7 bg-green-500/20 border border-green-500/50 rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />

                {/* Animated connecting lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 128">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.2">
                        <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.8">
                        <animate attributeName="stop-opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.2">
                        <animate attributeName="stop-opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>
                  </defs>
                  <path d="M 96 32 L 40 96" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.5s" repeatCount="indefinite" />
                  </path>
                  <path d="M 96 32 L 152 96" stroke="url(#lineGradient)" strokeWidth="2" fill="none" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.5s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>

              {/* Status text */}
              <div className="text-center">
                <p className="text-white/70 text-sm font-medium">Building {DIAGRAM_LABELS[type]}</p>
                <p className="text-white/40 text-xs mt-1">AI is designing your system architecture...</p>
              </div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ top: '20%', left: '30%', animationDuration: '2s' }} />
              <div className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ top: '60%', left: '70%', animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className="absolute w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" style={{ top: '40%', left: '20%', animationDuration: '3s', animationDelay: '1s' }} />
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="h-1 bg-black/50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // No DSL yet
  if (!dsl) {
    return (
      <div className="w-full h-[200px] sm:h-[250px] bg-slate-900/50 border border-white/10 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl sm:text-4xl mb-3 block">{DIAGRAM_ICONS[type]}</span>
          <p className="text-white/50 text-sm">{DIAGRAM_LABELS[type]}</p>
          <p className="text-xs text-white/30 mt-1">Not generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Fullscreen Modal */}
      <FullscreenModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        type={type}
        dsl={dsl}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{DIAGRAM_ICONS[type]}</span>
          <h3 className="font-semibold text-white text-sm">{DIAGRAM_LABELS[type]}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View Diagram Button - Primary action */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            View Diagram
          </button>
          <button
            onClick={handleCopyDsl}
            className="px-2.5 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {showEditor && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1.5 text-xs border rounded-lg transition-all ${
                isEditing
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {/* Editor mode */}
      {isEditing && showEditor ? (
        <div className="space-y-3">
          <textarea
            value={editedDsl}
            onChange={(e) => setEditedDsl(e.target.value)}
            className="w-full h-[200px] sm:h-[300px] bg-black border border-white/20 rounded-xl p-3 font-mono text-xs sm:text-sm text-green-400 focus:outline-none focus:border-orange-500/50 resize-none"
            spellCheck={false}
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyEdit}
              className="px-3 py-2 text-xs bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-all"
            >
              Apply Changes
            </button>
          </div>
        </div>
      ) : (
        /* Inline Diagram Preview - Click to open fullscreen */
        <div
          onClick={() => setIsFullscreen(true)}
          className="relative w-full bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/30 transition-all group"
        >
          {error ? (
            <div className="p-6 text-center">
              <span className="text-3xl mb-3 block">⚠️</span>
              <p className="text-red-400 mb-2 text-sm">Failed to render diagram</p>
              <p className="text-xs text-white/50">{error}</p>
            </div>
          ) : (
            <>
              {/* Inline Diagram Render */}
              <div className="w-full h-[200px] sm:h-[280px] overflow-hidden">
                <DiagramErrorBoundary onError={setError}>
                  <UniversalDiagram
                    type={DDFLOW_TYPE_MAP[type] as DDFlowDiagramType}
                    source={dsl}
                    theme="dark"
                    width={600}
                    height={260}
                  />
                </DiagramErrorBoundary>
              </div>

              {/* Expand hint overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex items-end justify-center pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/90 rounded-lg text-white text-xs font-medium shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Click to expand
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
