'use client';

import { useEffect, useCallback } from 'react';
import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { DiagramViewer } from '../diagram-viewer';

export function ExpandStep() {
  const { state, updateDiagram, setGenerating, setDiagramError } = useWizard();
  const { idea, diagrams, isGenerating, generatingType } = state;
  const mindmapData = diagrams.mindmap;

  const generateMindmap = useCallback(async () => {
    if (mindmapData.generated || isGenerating) return;

    setGenerating(true, 'mindmap');

    try {
      const response = await fetch('/api/idea-to-spec/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          diagramType: 'mindmap',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullDsl = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullDsl += data.text;
                updateDiagram('mindmap', fullDsl);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (error) {
      console.error('Mindmap generation error:', error);
      setDiagramError('mindmap', error instanceof Error ? error.message : 'Failed to generate mindmap');
    } finally {
      setGenerating(false, null);
    }
  }, [idea, mindmapData.generated, isGenerating, setGenerating, updateDiagram, setDiagramError]);

  // Only auto-generate if not already generated AND no error (to prevent retry loops)
  useEffect(() => {
    if (!mindmapData.generated && !mindmapData.error && !isGenerating && idea) {
      generateMindmap();
    }
  }, [mindmapData.generated, mindmapData.error, isGenerating, idea, generateMindmap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">◆</span>
          <div>
            <h2 className="text-xl font-semibold text-white">AI-Guided Exploration</h2>
            <p className="text-sm text-white/60">
              Expanding your idea into functional and technical requirements
            </p>
          </div>
        </div>

        {/* Idea summary */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
          <p className="text-sm text-white/40 mb-1">Your Idea:</p>
          <p className="text-white/80 text-sm line-clamp-3">{idea}</p>
        </div>
      </div>

      {/* Mindmap Viewer */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <DiagramViewer
          type="mindmap"
          dsl={mindmapData.dsl}
          isStreaming={isGenerating && generatingType === 'mindmap'}
          onDslChange={(newDsl) => updateDiagram('mindmap', newDsl)}
          showEditor={mindmapData.generated}
        />
      </div>

      {/* Error state */}
      {mindmapData.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{mindmapData.error}</p>
          <button
            onClick={() => {
              setDiagramError('mindmap', '');
              generateMindmap();
            }}
            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm transition-all"
          >
            Retry Generation
          </button>
        </div>
      )}

      {/* Tips */}
      {mindmapData.generated && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <span className="text-green-400 text-lg">✓</span>
          <div className="text-sm text-green-200/80">
            <strong className="text-green-300">Requirements mapped!</strong> Review the mindmap above. You can edit the DSL directly if needed. Click &quot;Continue&quot; to proceed to user journey mapping.
          </div>
        </div>
      )}
    </div>
  );
}
