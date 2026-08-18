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
    { number: 4, label: 'Struktur' },
    { number: 5, label: 'Quellcode' },
    { number: 6, label: 'Ergebnis' },
  ];

  return (
    <div className="flex flex-row gap-4 mb-6 ">
      <nav aria-label="Projektfortschritt" className="flex
    w-full
    flex-row
    flex-nowrap
    gap-2
    overflow-block
    pb-2

    lg:flex-row
    lg:overflow-x-visible
    lg:pb-0

">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep && step.number <= unlockedStep;
          const isLocked = step.number > unlockedStep;

          return (
            <div className="flex flex-row items-center gap-3">
            <button
              key={step.number}
              type="button"
              disabled={isLocked}
              onClick={() => onStepClick(step.number)}
              className={`flex items-center menu-horizontal gap-1 px-2 py-2 rounded-lg text-left text-sm font-s border-l-3
                ${isActive 
                  ? 'bg-orange-50/60 border-[#C46A2B] text-[#1E2430] font-semibold' 
                  : isDone 
                    ? 'border-transparent text-[#1E2430]/80 hover:bg-gray-100' 
                    : 'border-transparent text-[#5A6172]/50 cursor-not-allowed opacity-50'
                }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-xs border
                ${isActive 
                  ? 'border-[#C46A2B] text-[#C46A2B] bg-white' 
                  : isDone 
                    ? 'bg-[#1E2430] border-[#1E2430] text-[#FAF8F4]' 
                    : 'border-gray-300 bg-white'
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