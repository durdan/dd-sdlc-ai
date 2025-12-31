'use client';

import { useWizard } from '@/lib/idea-to-spec/wizard-context';
import { WIZARD_STEPS, WizardStep } from '@/lib/idea-to-spec/types';

export function WizardStepIndicator() {
  const { state, setStep } = useWizard();
  const { currentStep } = state;

  const handleStepClick = (stepId: WizardStep) => {
    // Can only go back to completed steps or stay on current
    if (stepId <= currentStep) {
      setStep(stepId);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = step.id <= currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  relative flex flex-col items-center px-6 py-4 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-b from-orange-500/20 to-orange-600/10 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20'
                    : isCompleted
                    ? 'bg-white/5 border border-white/20 hover:bg-white/10 cursor-pointer'
                    : 'bg-white/[0.02] border border-white/10 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {/* Icon */}
                <span className={`
                  text-2xl mb-2 transition-transform duration-300
                  ${isActive ? 'text-orange-400 scale-110' : isCompleted ? 'text-white/80' : 'text-white/40'}
                `}>
                  {isCompleted ? '✓' : step.icon}
                </span>

                {/* Name */}
                <span className={`
                  text-sm font-semibold
                  ${isActive ? 'text-orange-400' : isCompleted ? 'text-white' : 'text-white/50'}
                `}>
                  {step.name}
                </span>

                {/* Description */}
                <span className={`
                  text-xs mt-1
                  ${isActive ? 'text-orange-300/70' : 'text-white/40'}
                `}>
                  {step.description}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-1
                  ${currentStep > step.id ? 'bg-orange-500/50' : 'bg-white/10'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        {/* Current step display */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-3xl text-orange-400">
            {WIZARD_STEPS.find(s => s.id === currentStep)?.icon}
          </span>
          <div>
            <h2 className="text-lg font-semibold text-orange-400">
              {WIZARD_STEPS.find(s => s.id === currentStep)?.name}
            </h2>
            <p className="text-sm text-white/60">
              {WIZARD_STEPS.find(s => s.id === currentStep)?.description}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {WIZARD_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              disabled={step.id > currentStep}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${currentStep === step.id
                  ? 'bg-orange-500 scale-125'
                  : currentStep > step.id
                  ? 'bg-orange-500/50 hover:bg-orange-500/70'
                  : 'bg-white/20'
                }
              `}
              aria-label={`Go to ${step.name}`}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-white/40 mt-3">
          Step {currentStep} of {WIZARD_STEPS.length}
        </p>
      </div>
    </div>
  );
}
