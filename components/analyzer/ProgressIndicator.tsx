'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { AnalysisStep } from '@/types/analyzer';

interface ProgressStep {
  step: AnalysisStep;
  label: string;
}

const STEPS: ProgressStep[] = [
  { step: 'fetching_metadata', label: 'Fetching repository metadata' },
  { step: 'analyzing_structure', label: 'Analyzing directory structure' },
  { step: 'reading_files', label: 'Reading key configuration files' },
  { step: 'analyzing_architecture', label: 'Analyzing architecture patterns' },
  { step: 'generating_spec', label: 'Generating specification' },
];

interface ProgressIndicatorProps {
  currentStep: AnalysisStep | null;
  completedSteps: AnalysisStep[];
  error?: string | null;
}

export function ProgressIndicator({ currentStep, completedSteps, error }: ProgressIndicatorProps) {
  const getStepStatus = (step: AnalysisStep): 'completed' | 'current' | 'pending' | 'error' => {
    if (error && step === currentStep) return 'error';
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const completedCount = completedSteps.length;
  const progressPercent = (completedCount / STEPS.length) * 100 + (currentStep && !completedSteps.includes(currentStep) ? (1 / STEPS.length) * 50 : 0);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {STEPS.map((stepInfo, index) => {
          const status = getStepStatus(stepInfo.step);

          return (
            <div
              key={stepInfo.step}
              className={`
                flex items-center gap-4 p-3 rounded-xl transition-all duration-500
                ${status === 'current' ? 'bg-blue-500/10 dark:bg-blue-500/5' : ''}
                ${status === 'completed' ? 'opacity-70' : ''}
              `}
            >
              <div className="flex-shrink-0 relative">
                {status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
                {status === 'current' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                )}

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      absolute left-1/2 top-full w-0.5 h-4 -translate-x-1/2
                      ${status === 'completed' ? 'bg-gradient-to-b from-green-400 to-green-400/0' : 'bg-slate-200 dark:bg-white/10'}
                    `}
                  />
                )}
              </div>

              <span
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${status === 'completed' ? 'text-green-600 dark:text-green-400' : ''}
                  ${status === 'current' ? 'text-blue-600 dark:text-blue-400' : ''}
                  ${status === 'pending' ? 'text-slate-400 dark:text-slate-500' : ''}
                  ${status === 'error' ? 'text-red-500 dark:text-red-400' : ''}
                `}
              >
                {stepInfo.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className={`
              h-full transition-all duration-700 ease-out rounded-full
              ${error ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'}
            `}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {error ? 'Failed' : completedSteps.length === STEPS.length ? 'Complete!' : `Step ${completedCount + 1} of ${STEPS.length}`}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}
