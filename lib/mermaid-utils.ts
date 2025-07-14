// Mermaid utilities for Next.js
"use client"

let mermaidInstance: any = null;
let isInitialized = false;

export async function getMermaid() {
  if (!mermaidInstance) {
    try {
      // Dynamic import with better error handling
      const mermaidModule = await import('mermaid');
      mermaidInstance = mermaidModule.default;
      
      if (!isInitialized) {
        mermaidInstance.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          suppressErrorRendering: false,
          deterministicIds: false,
          maxTextSize: 50000,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
          },
          sequence: {
            useMaxWidth: true,
          },
          journey: {
            useMaxWidth: true,
          },
          timeline: {
            useMaxWidth: true,
          },
          gitgraph: {
            useMaxWidth: true,
          },
        });
        isInitialized = true;
        console.log('✅ Mermaid initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load Mermaid:', error);
      throw new Error(`Failed to load Mermaid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return mermaidInstance;
}

export async function renderMermaidDiagram(
  content: string, 
  containerId?: string
): Promise<{ svg: string; id: string }> {
  try {
    const mermaid = await getMermaid();
    
    // Generate unique ID
    const diagramId = containerId || `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate content
    if (!content || content.trim() === '') {
      throw new Error('Empty diagram content');
    }
    
    // Clean and validate Mermaid syntax
    const cleanContent = content.trim();
    
    // Render the diagram
    const result = await mermaid.render(diagramId, cleanContent);
    
    console.log(`✅ Mermaid diagram rendered: ${diagramId}`);
    return {
      svg: result.svg,
      id: diagramId
    };
    
  } catch (error) {
    console.error('❌ Mermaid render error:', error);
    throw new Error(`Mermaid render failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function createErrorDiagram(errorMessage: string): string {
  return `
    <div class="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
      <div class="text-center p-6">
        <h3 class="text-lg font-medium text-red-700 mb-2">Diagram Render Error</h3>
        <p class="text-red-600 text-sm">${errorMessage}</p>
        <p class="text-red-500 text-xs mt-2">Please check the diagram syntax and try again.</p>
      </div>
    </div>
  `;
}

export function createEmptyDiagram(message: string = 'No diagram available'): string {
  return `
    <div class="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div class="text-center p-6">
        <h3 class="text-lg font-medium text-gray-700 mb-2">No Diagram</h3>
        <p class="text-gray-500">${message}</p>
      </div>
    </div>
  `;
}

// Utility to check if content is valid Mermaid syntax
export function isValidMermaidContent(content: string): boolean {
  if (!content || content.trim() === '') return false;
  
  const trimmed = content.trim();
  const mermaidKeywords = [
    'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 
    'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie',
    'gitgraph', 'mindmap', 'timeline', 'sankey'
  ];
  
  return mermaidKeywords.some(keyword => 
    trimmed.toLowerCase().startsWith(keyword.toLowerCase())
  );
} 