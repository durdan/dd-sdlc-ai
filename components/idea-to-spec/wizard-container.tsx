'use client';

import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { WizardStepIndicator } from './wizard-step-indicator';
import { SparkStep } from './steps/spark-step';
import { ExpandStep } from './steps/expand-step';
import { StructureStep } from './steps/structure-step';
import { ArchitectStep } from './steps/architect-step';
import { SpecStep } from './steps/spec-step';

export function WizardContainer() {
  const { state, nextStep, prevStep, canProceed, resetWizard } = useWizard();
  const { currentStep, isGenerating } = state;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <SparkStep />;
      case 2:
        return <ExpandStep />;
      case 3:
        return <StructureStep />;
      case 4:
        return <ArchitectStep />;
      case 5:
        return <SpecStep />;
      default:
        return <SparkStep />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <WizardStepIndicator />

      {/* Current Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              disabled={isGenerating}
              className="px-5 py-2.5 text-sm bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white/80 hover:text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
          )}
          <button
            onClick={resetWizard}
            disabled={isGenerating}
            className="px-4 py-2.5 text-sm text-white/50 hover:text-red-400 transition-all disabled:opacity-50"
          >
            Start Over
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 5 ? (
            isGenerating ? (
              <div className="px-6 py-2.5 text-sm bg-gradient-to-r from-orange-500/70 to-amber-500/70 rounded-xl text-white font-semibold flex items-center gap-2 min-w-[140px] justify-center">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </div>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-2.5 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white font-semibold shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none min-w-[140px]"
              >
                Continue →
              </button>
            )
          ) : (
            <button
              disabled={!canProceed()}
              className="px-6 py-2.5 text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white font-semibold shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Specification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
