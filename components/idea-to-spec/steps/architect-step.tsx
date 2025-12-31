'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { DiagramViewer } from '../diagram-viewer';
import { DiagramType } from '@/lib/idea-to-spec/types';

type ArchitectDiagram = 'architecture' | 'c4' | 'sequence';

export function ArchitectStep() {
  const { state, updateDiagram, setGenerating, setDiagramError } = useWizard();
  const { idea, diagrams, isGenerating, generatingType } = state;
  const [activeTab, setActiveTab] = useState<ArchitectDiagram>('architecture');

  const architectureData = diagrams.architecture;
  const c4Data = diagrams.c4;
  const sequenceData = diagrams.sequence;

  // Get context from previous steps
  const context = [diagrams.mindmap.dsl, diagrams.usecase?.dsl, diagrams.journey.dsl].filter(Boolean).join('\n\n');

  const generateDiagram = useCallback(async (type: DiagramType) => {
    const diagramData = diagrams[type];
    if (diagramData.generated || isGenerating) return;

    setGenerating(true, type);

    try {
      const response = await fetch('/api/idea-to-spec/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          diagramType: type,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type} diagram`);
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
                updateDiagram(type, fullDsl);
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
      console.error(`${type} generation error:`, error);
      setDiagramError(type, error instanceof Error ? error.message : `Failed to generate ${type}`);
    } finally {
      setGenerating(false, null);
    }
  }, [idea, context, diagrams, isGenerating, setGenerating, updateDiagram, setDiagramError]);

  // Auto-generate: architecture -> c4 -> sequence
  // Only auto-generate if not already generated AND no error (to prevent retry loops)
  useEffect(() => {
    if (!isGenerating && idea) {
      if (!architectureData.generated && !architectureData.error) {
        generateDiagram('architecture');
      } else if (architectureData.generated && !c4Data.generated && !c4Data.error) {
        generateDiagram('c4');
      } else if (architectureData.generated && c4Data.generated && !sequenceData.generated && !sequenceData.error) {
        generateDiagram('sequence');
      }
    }
  }, [architectureData.generated, architectureData.error, c4Data.generated, c4Data.error, sequenceData.generated, sequenceData.error, isGenerating, idea, generateDiagram]);

  const tabs: { id: ArchitectDiagram; label: string; icon: string }[] = [
    { id: 'architecture', label: 'Architecture', icon: '🏗️' },
    { id: 'c4', label: 'C4 Container', icon: '📦' },
    { id: 'sequence', label: 'Sequence', icon: '↔️' },
  ];

  const getCurrentData = (tabId: ArchitectDiagram) => {
    switch (tabId) {
      case 'architecture': return architectureData;
      case 'c4': return c4Data;
      case 'sequence': return sequenceData;
    }
  };

  const currentData = getCurrentData(activeTab);
  const isCurrentGenerating = isGenerating && generatingType === activeTab;
  const allGenerated = architectureData.generated && c4Data.generated && sequenceData.generated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">◇</span>
          <div>
            <h2 className="text-xl font-semibold text-white">System Design</h2>
            <p className="text-sm text-white/60">
              Designing the technical architecture and service interactions
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${architectureData.generated ? 'bg-green-500' : isGenerating && generatingType === 'architecture' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-xs ${architectureData.generated ? 'text-green-400' : 'text-white/50'}`}>Architecture</span>
          </div>
          <div className="w-6 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${c4Data.generated ? 'bg-green-500' : isGenerating && generatingType === 'c4' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-xs ${c4Data.generated ? 'text-green-400' : 'text-white/50'}`}>C4</span>
          </div>
          <div className="w-6 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${sequenceData.generated ? 'bg-green-500' : isGenerating && generatingType === 'sequence' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-xs ${sequenceData.generated ? 'text-green-400' : 'text-white/50'}`}>Sequence</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const tabData = getCurrentData(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400'
                  : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tabData.generated && <span className="text-green-400">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Diagram Viewer */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <DiagramViewer
          type={activeTab}
          dsl={currentData.dsl}
          isStreaming={isCurrentGenerating}
          onDslChange={(newDsl) => updateDiagram(activeTab, newDsl)}
          showEditor={currentData.generated}
        />
      </div>

      {/* Error state */}
      {currentData.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{currentData.error}</p>
          <button
            onClick={() => {
              setDiagramError(activeTab, '');
              generateDiagram(activeTab);
            }}
            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm transition-all"
          >
            Retry Generation
          </button>
        </div>
      )}

      {/* Tips */}
      {allGenerated && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <span className="text-green-400 text-lg">✓</span>
          <div className="text-sm text-green-200/80">
            <strong className="text-green-300">System architecture complete!</strong> Architecture, C4 container, and sequence diagrams are ready. Proceed to generate the database schema and process flowchart.
          </div>
        </div>
      )}
    </div>
  );
}
