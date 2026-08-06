import { useState } from 'react';

import { AppShell } from './app/AppShell';
import { Stepper } from './app/Stepper';
import { useAppStore } from './app/store';

import { StartPage } from './features/startpage';
import { Step1Input } from './features/step1-input/Step1Input';
import { Step2Klaerung } from './features/step2-klaerung/Step2Klaerung';
import { Step3Hardware } from './features/step3-hardware/Step3Hardware';
import { Step4Struktur } from './features/step4-struktur/Step4Struktur';
import { Step5Quellcode } from './features/step5-quellcode/Step5Quellcode';
import { Step6Ergebnis } from './features/step6-ergebnis/Step6Ergebnis';

import { Button } from './components/ui/button';

type CreateProjectResponse = {
  project_id: number;
};

export default function AppShowcase() {
  const { currentStep, maxStepReached, setCurrentStep } = useAppStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function handleStart() {
    setIsStarting(true);
    setStartError(null);

    try {
      const response = await fetch('/projects', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Das Projekt konnte nicht erstellt werden. Status: ${response.status}`,
        );
      }

      const data: CreateProjectResponse = await response.json();

      console.log('Projekt-ID:', data.project_id);

      sessionStorage.setItem('projectId', String(data.project_id));

      setHasStarted(true);
    } catch (error) {
      console.error(error);

      setStartError(
        error instanceof Error
          ? error.message
          : 'Das Projekt konnte nicht erstellt werden.',
      );
    } finally {
      setIsStarting(false);
    }
  }

  if (!hasStarted) {
    return (
      <StartPage
        onStart={handleStart}
        isLoading={isStarting}
        error={startError}
      />
    );
  }

  return (
    <AppShell
      navigation={
        <Stepper
          currentStep={currentStep}
          unlockedStep={maxStepReached}
          onStepClick={setCurrentStep}
        />
      }
    >
      <div className="pb-6">
        {currentStep === 1 && <Step1Input />}
        {currentStep === 2 && <Step2Klaerung />}
        {currentStep === 3 && <Step3Hardware />}
        {currentStep === 4 && <Step4Struktur />}
        {currentStep === 5 && <Step5Quellcode />}
        {currentStep === 6 && <Step6Ergebnis />}
      </div>

      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={() => {
            if (currentStep < 6) {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={currentStep >= 6}
        >
          {currentStep < 6
            ? `Weiter zu Schritt ${currentStep + 1}`
            : 'Fertig'}
        </Button>
      </div>
    </AppShell>
  );
}