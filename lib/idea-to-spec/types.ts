// Types for Idea to Spec Wizard

export type DiagramType = 'mindmap' | 'journey' | 'usecase' | 'architecture' | 'c4' | 'sequence' | 'erd' | 'flowchart';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface DiagramState {
  dsl: string;
  generated: boolean;
  error?: string;
}

export interface WizardState {
  currentStep: WizardStep;
  idea: string;
  diagrams: Record<DiagramType, DiagramState>;
  isGenerating: boolean;
  generatingType: DiagramType | null;
  error: string | null;
}

export interface WizardContextType {
  state: WizardState;
  setIdea: (idea: string) => void;
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateDiagram: (type: DiagramType, dsl: string) => void;
  setDiagramError: (type: DiagramType, error: string) => void;
  setGenerating: (isGenerating: boolean, type?: DiagramType | null) => void;
  setError: (error: string | null) => void;
  resetWizard: () => void;
  canProceed: () => boolean;
}

export interface StepConfig {
  id: WizardStep;
  name: string;
  description: string;
  icon: string;
  diagrams: DiagramType[];
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 1,
    name: 'Spark',
    description: 'Capture the idea',
    icon: '✦',
    diagrams: [],
  },
  {
    id: 2,
    name: 'Expand',
    description: 'AI-guided exploration',
    icon: '◆',
    diagrams: ['mindmap'],
  },
  {
    id: 3,
    name: 'Structure',
    description: 'Organize & connect',
    icon: '⬡',
    diagrams: ['usecase', 'journey'],
  },
  {
    id: 4,
    name: 'Architect',
    description: 'System design',
    icon: '◇',
    diagrams: ['architecture', 'c4', 'sequence'],
  },
  {
    id: 5,
    name: 'Spec',
    description: 'Export & share',
    icon: '○',
    diagrams: ['erd', 'flowchart'],
  },
];

export const DIAGRAM_LABELS: Record<DiagramType, string> = {
  mindmap: 'Requirements Mindmap',
  journey: 'User Journey',
  usecase: 'Use Case Diagram',
  architecture: 'System Architecture',
  c4: 'C4 Container Diagram',
  sequence: 'Sequence Diagram',
  erd: 'Database Schema',
  flowchart: 'Process Flow',
};

export const DIAGRAM_ICONS: Record<DiagramType, string> = {
  mindmap: '🧠',
  journey: '🚶',
  usecase: '👤',
  architecture: '🏗️',
  c4: '📦',
  sequence: '↔️',
  erd: '🗄️',
  flowchart: '📊',
};

// DDflow type mapping
export const DDFLOW_TYPE_MAP: Record<DiagramType, string> = {
  mindmap: 'mindmap',
  journey: 'journey',
  usecase: 'usecase',
  architecture: 'architecture',
  c4: 'c4',
  sequence: 'sequence',
  erd: 'erd',
  flowchart: 'flowchart',
};
