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

export const Stepper: React.FC<StepperProps> = ({
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
    <div className="flex flex-col gap-2">
      <div className="mb-6 border-b border-[#D9D3C7] pb-4">
        <h1 className="font-sans text-xl font-bold tracking-tight text-[#1E2430]">
          Draft<span className="text-[#C46A2B]">2</span>Device
        </h1>
        <p className="text-xs font-mono text-[#5A6172] mt-1">Skizze → Code</p>
      </div>
      <nav aria-label="Projektfortschritt" className="flex flex-col gap-1">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep && step.number <= unlockedStep;
          const isLocked = step.number > unlockedStep;

          return (
            <button
              key={step.number}
              type="button"
              disabled={isLocked}
              onClick={() => onStepClick(step.number)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all border-l-4
                ${isActive 
                  ? 'bg-orange-50/60 border-[#C46A2B] text-[#1E2430] font-semibold' 
                  : isDone 
                    ? 'border-transparent text-[#1E2430]/80 hover:bg-gray-100' 
                    : 'border-transparent text-[#5A6172]/50 cursor-not-allowed opacity-50'
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border
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
          );
        })}
      </nav>
    </div>
  );
};