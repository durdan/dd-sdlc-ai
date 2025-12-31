'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { WizardState, WizardContextType, WizardStep, DiagramType, WIZARD_STEPS } from './types';

const STORAGE_KEY = 'sdlc_idea_to_spec_wizard';

const initialDiagramState = {
  dsl: '',
  generated: false,
};

const initialState: WizardState = {
  currentStep: 1,
  idea: '',
  diagrams: {
    mindmap: { ...initialDiagramState },
    journey: { ...initialDiagramState },
    usecase: { ...initialDiagramState },
    architecture: { ...initialDiagramState },
    c4: { ...initialDiagramState },
    sequence: { ...initialDiagramState },
    erd: { ...initialDiagramState },
    flowchart: { ...initialDiagramState },
  },
  isGenerating: false,
  generatingType: null,
  error: null,
};

type WizardAction =
  | { type: 'SET_IDEA'; payload: string }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'UPDATE_DIAGRAM'; payload: { type: DiagramType; dsl: string } }
  | { type: 'SET_DIAGRAM_ERROR'; payload: { type: DiagramType; error: string } }
  | { type: 'SET_GENERATING'; payload: { isGenerating: boolean; type?: DiagramType | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; payload: WizardState };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_IDEA':
      return { ...state, idea: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_DIAGRAM':
      return {
        ...state,
        diagrams: {
          ...state.diagrams,
          [action.payload.type]: {
            dsl: action.payload.dsl,
            generated: true,
            error: undefined,
          },
        },
      };
    case 'SET_DIAGRAM_ERROR':
      return {
        ...state,
        diagrams: {
          ...state.diagrams,
          [action.payload.type]: {
            ...state.diagrams[action.payload.type],
            error: action.payload.error,
          },
        },
      };
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload.isGenerating,
        generatingType: action.payload.type ?? null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Reset transient states to avoid stuck UI
          dispatch({
            type: 'LOAD_STATE',
            payload: {
              ...parsed,
              isGenerating: false,
              generatingType: null,
              error: null,
            },
          });
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  }, []);

  // Save to localStorage on state changes (exclude transient states)
  useEffect(() => {
    if (typeof window !== 'undefined' && state.idea) {
      const stateToSave = {
        ...state,
        isGenerating: false,
        generatingType: null,
        error: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [state]);

  const setIdea = useCallback((idea: string) => {
    dispatch({ type: 'SET_IDEA', payload: idea });
  }, []);

  const setStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < 5) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

  const updateDiagram = useCallback((type: DiagramType, dsl: string) => {
    dispatch({ type: 'UPDATE_DIAGRAM', payload: { type, dsl } });
  }, []);

  const setDiagramError = useCallback((type: DiagramType, error: string) => {
    dispatch({ type: 'SET_DIAGRAM_ERROR', payload: { type, error } });
  }, []);

  const setGenerating = useCallback((isGenerating: boolean, type?: DiagramType | null) => {
    dispatch({ type: 'SET_GENERATING', payload: { isGenerating, type } });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const canProceed = useCallback(() => {
    const currentStepConfig = WIZARD_STEPS.find(s => s.id === state.currentStep);
    if (!currentStepConfig) return false;

    // Step 1: Need idea
    if (state.currentStep === 1) {
      return state.idea.trim().length > 0;
    }

    // Other steps: Need all diagrams for this step to be generated
    return currentStepConfig.diagrams.every(d => state.diagrams[d].generated);
  }, [state.currentStep, state.idea, state.diagrams]);

  const value: WizardContextType = {
    state,
    setIdea,
    setStep,
    nextStep,
    prevStep,
    updateDiagram,
    setDiagramError,
    setGenerating,
    setError,
    resetWizard,
    canProceed,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
