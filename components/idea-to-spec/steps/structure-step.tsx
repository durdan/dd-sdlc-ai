'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { DiagramViewer } from '../diagram-viewer';
import { DiagramType } from '@/lib/idea-to-spec/types';

export function StructureStep() {
  const { state, updateDiagram, setGenerating, setDiagramError } = useWizard();
  const { idea, diagrams, isGenerating, generatingType } = state;
  const usecaseData = diagrams.usecase;
  const journeyData = diagrams.journey;
  const mindmapDsl = diagrams.mindmap.dsl;
  const [currentGenerating, setCurrentGenerating] = useState<DiagramType | null>(null);

  const generateDiagram = useCallback(async (diagramType: DiagramType, context?: string) => {
    const diagramData = diagrams[diagramType];
    if (diagramData.generated || isGenerating) return;

    setGenerating(true, diagramType);
    setCurrentGenerating(diagramType);

    try {
      const response = await fetch('/api/idea-to-spec/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          diagramType,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${diagramType}`);
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
                updateDiagram(diagramType, fullDsl);
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
      console.error(`${diagramType} generation error:`, error);
      setDiagramError(diagramType, error instanceof Error ? error.message : `Failed to generate ${diagramType}`);
    } finally {
      setGenerating(false, null);
      setCurrentGenerating(null);
    }
  }, [idea, diagrams, isGenerating, setGenerating, updateDiagram, setDiagramError]);

  // Generate usecase first, then journey
  // Only auto-generate if not already generated AND no error (to prevent retry loops)
  useEffect(() => {
    if (!isGenerating && idea) {
      if (!usecaseData.generated && !usecaseData.error) {
        generateDiagram('usecase', mindmapDsl);
      } else if (usecaseData.generated && !journeyData.generated && !journeyData.error) {
        generateDiagram('journey', mindmapDsl);
      }
    }
  }, [usecaseData.generated, usecaseData.error, journeyData.generated, journeyData.error, isGenerating, idea, mindmapDsl, generateDiagram]);

  const allGenerated = usecaseData.generated && journeyData.generated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⬡</span>
          <div>
            <h2 className="text-xl font-semibold text-white">Organize & Connect</h2>
            <p className="text-sm text-white/60">
              Mapping use cases and user journeys through your system
            </p>
          </div>
        </div>

        {/* Context from previous step */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
          <p className="text-sm text-white/40 mb-1">Building on your requirements:</p>
          <p className="text-white/60 text-sm">
            Using the mindmap structure to create use cases and user flows
          </p>
        </div>
      </div>

      {/* Use Case Viewer */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <DiagramViewer
          type="usecase"
          dsl={usecaseData.dsl}
          isStreaming={currentGenerating === 'usecase'}
          onDslChange={(newDsl) => updateDiagram('usecase', newDsl)}
          showEditor={usecaseData.generated}
        />

        {/* Error state for usecase */}
        {usecaseData.error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{usecaseData.error}</p>
            <button
              onClick={() => {
                setDiagramError('usecase', '');
                generateDiagram('usecase', mindmapDsl);
              }}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm transition-all"
            >
              Retry Generation
            </button>
          </div>
        )}
      </div>

      {/* Journey Viewer */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <DiagramViewer
          type="journey"
          dsl={journeyData.dsl}
          isStreaming={currentGenerating === 'journey'}
          onDslChange={(newDsl) => updateDiagram('journey', newDsl)}
          showEditor={journeyData.generated}
        />

        {/* Error state for journey */}
        {journeyData.error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{journeyData.error}</p>
            <button
              onClick={() => {
                setDiagramError('journey', '');
                generateDiagram('journey', mindmapDsl);
              }}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm transition-all"
            >
              Retry Generation
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      {allGenerated && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <span className="text-green-400 text-lg">✓</span>
          <div className="text-sm text-green-200/80">
            <strong className="text-green-300">Use cases and journey mapped!</strong> Review the diagrams above. You can edit the DSL directly if needed. Click &quot;Continue&quot; to proceed to architecture design.
          </div>
        </div>
      )}
    </div>
  );
}
