import React from 'react';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  unlockedStep: number;
  onStepClick: (stepNumber: number) => void;
}

export const NavStepper: React.FC<StepperProps> = ({
  currentStep,
  unlockedStep,
  onStepClick,
}) => {
  const steps: Step[] = [
    { number: 1, label: 'Input' },
    { number: 2, label: 'Klärung' },
    { number: 3, label: 'Hardware' },
    { number: 4, label: 'Schaltplan' },
    { number: 5, label: 'Quellcode & Export' },
  ];

  return (
    <div className="flex flex-row gap-4 mb-6">
      <nav
        aria-label="Projektfortschritt"
        className="flex w-full flex-row flex-nowrap gap-2 overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0"
      >
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep && step.number <= unlockedStep;
          const isLocked = step.number > unlockedStep;

          return (
            <div key={step.number} className="flex flex-row items-center gap-3">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onStepClick(step.number)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all border
                  ${
                    isActive
                      ? 'bg-orange-50/70 border-[#C46A2B] text-[#1E2430] font-semibold shadow-sm'
                      : isDone
                        ? 'border-transparent text-[#1E2430]/90 hover:bg-gray-100/80 cursor-pointer font-medium'
                        : 'border-transparent text-[#5A6172]/50 cursor-not-allowed opacity-50'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs border transition-colors
                    ${
                      isActive
                        ? 'border-[#C46A2B] text-[#C46A2B] bg-white font-bold'
                        : isDone
                          ? 'bg-[#1E2430] border-[#1E2430] text-white font-bold'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                >
                  {isDone ? '✓' : step.number}
                </div>
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </nav>
    </div>
  );
};