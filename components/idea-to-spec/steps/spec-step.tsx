'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { DiagramViewer } from '../diagram-viewer';
import { DiagramType, DIAGRAM_LABELS, DIAGRAM_ICONS } from '@/lib/idea-to-spec/types';

type SpecDiagram = 'erd' | 'flowchart';

export function SpecStep() {
  const { state, updateDiagram, setGenerating, setDiagramError } = useWizard();
  const { idea, diagrams, isGenerating, generatingType } = state;
  const [activeTab, setActiveTab] = useState<SpecDiagram>('erd');

  const erdData = diagrams.erd;
  const flowchartData = diagrams.flowchart;

  // Get context from all previous steps
  const context = [
    diagrams.mindmap.dsl,
    diagrams.journey.dsl,
    diagrams.architecture.dsl,
    diagrams.sequence.dsl,
  ].filter(Boolean).join('\n\n');

  const generateDiagram = useCallback(async (type: DiagramType) => {
    const diagramData = type === 'erd' ? erdData : flowchartData;
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
  }, [idea, context, erdData, flowchartData, isGenerating, setGenerating, updateDiagram, setDiagramError]);

  // Auto-generate ERD first, then flowchart
  // Only auto-generate if not already generated AND no error (to prevent retry loops)
  useEffect(() => {
    if (!erdData.generated && !erdData.error && !isGenerating && idea) {
      generateDiagram('erd');
    } else if (erdData.generated && !flowchartData.generated && !flowchartData.error && !isGenerating) {
      generateDiagram('flowchart');
    }
  }, [erdData.generated, erdData.error, flowchartData.generated, flowchartData.error, isGenerating, idea, generateDiagram]);

  const tabs: { id: SpecDiagram; label: string; icon: string }[] = [
    { id: 'erd', label: DIAGRAM_LABELS.erd, icon: DIAGRAM_ICONS.erd },
    { id: 'flowchart', label: DIAGRAM_LABELS.flowchart, icon: DIAGRAM_ICONS.flowchart },
  ];

  const currentData = activeTab === 'erd' ? erdData : flowchartData;
  const isCurrentGenerating = isGenerating && generatingType === activeTab;

  const handleExportAll = () => {
    const spec = {
      idea,
      generatedAt: new Date().toISOString(),
      diagrams: {
        mindmap: diagrams.mindmap.dsl,
        journey: diagrams.journey.dsl,
        architecture: diagrams.architecture.dsl,
        sequence: diagrams.sequence.dsl,
        erd: diagrams.erd.dsl,
        flowchart: diagrams.flowchart.dsl,
      },
    };

    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spec-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allComplete = erdData.generated && flowchartData.generated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">○</span>
            <div>
              <h2 className="text-xl font-semibold text-white">Export & Share</h2>
              <p className="text-sm text-white/60">
                Final specifications: Database schema and process flow
              </p>
            </div>
          </div>

          {allComplete && (
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white text-sm font-medium shadow-lg shadow-green-500/25 transition-all"
            >
              Export All Diagrams
            </button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${erdData.generated ? 'bg-green-500' : isGenerating && generatingType === 'erd' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-sm ${erdData.generated ? 'text-green-400' : 'text-white/50'}`}>Database Schema</span>
          </div>
          <div className="w-8 h-0.5 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${flowchartData.generated ? 'bg-green-500' : isGenerating && generatingType === 'flowchart' ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
            <span className={`text-sm ${flowchartData.generated ? 'text-green-400' : 'text-white/50'}`}>Process Flow</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const tabData = tab.id === 'erd' ? erdData : flowchartData;
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

      {/* Completion Summary */}
      {allComplete && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">Specification Complete!</h3>
              <p className="text-sm text-green-200/80 mb-4">
                You&apos;ve successfully generated a complete technical specification including:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(DIAGRAM_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-green-400">✓</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/50 mt-4">
                Click &quot;Export All Diagrams&quot; to download the complete specification as JSON.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
